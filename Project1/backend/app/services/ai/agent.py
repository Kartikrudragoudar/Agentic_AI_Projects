"""
agent.py
========
BankingSupportAgent built with LangChain (ChatGroq) + LangGraph (stateful graph).

Graph flow:
  START
    ↓
  detect_intent_node  ← detects bank, service, escalation, calculator need
    ↓ (if automatable)       ↓ (otherwise)
  calculator_node       llm_node
         ↓                    ↓
       llm_node          escalation_node (if escalate=True)
                               ↓
                              END
"""

from __future__ import annotations

from typing import TypedDict, Optional, Annotated, List
import operator
import re

from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

from langgraph.graph import StateGraph, END

from backend.app.core.config import settings
from backend.app.services.bank_directory import (
    BANK_DIRECTORY,
    detect_bank,
    detect_service,
    detect_automatable_service,
    detect_escalation,
    calculate_emi,
    calculate_fd_maturity,
)
from loguru import logger


# ─── Agent State ─────────────────────────────────────────────────────────────

class AgentState(TypedDict):
    """Stateful context passed between LangGraph nodes."""
    messages: Annotated[List[BaseMessage], operator.add]
    session_id: str
    selected_bank: Optional[str]        # Bank chosen in UI dropdown
    detected_bank: Optional[str]        # Bank detected from message text
    detected_service: Optional[str]     # Service detected from message text
    detected_auto_service: Optional[str]  # EMI/FD calculator detected
    escalate: bool                       # True if escalation keywords found
    calculator_result: Optional[dict]    # EMI or FD result dict
    language_code: str                   # Target language for response (IndicTrans2 code)
    final_response: str                  # Final agent response text


# ─── In-memory session store ─────────────────────────────────────────────────

_session_store: dict[str, ChatMessageHistory] = {}


def _get_session_history(session_id: str) -> ChatMessageHistory:
    """Return (or create) a ChatMessageHistory for a given session."""
    if session_id not in _session_store:
        _session_store[session_id] = ChatMessageHistory()
    return _session_store[session_id]


# ─── LLM Setup ───────────────────────────────────────────────────────────────

def _build_llm() -> ChatGroq:
    """Initialize ChatGroq LLM."""
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,
        model=settings.GROQ_MODEL,
        temperature=0.3,
        max_tokens=1024,
    )


# ─── System Prompt ───────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a professional, empathetic AI banking support agent for Indian banks.
You help customers with:
- Account balance inquiries
- Lost/stolen card reporting
- Mini statement requests
- Fund transfer guidance
- EMI and Fixed Deposit calculations
- General banking queries

Guidelines:
1. Always be polite, patient, and professional.
2. Provide step-by-step instructions when asked about banking procedures.
3. If the customer's bank is detected, personalize your response with that bank's specific information.
4. For financial calculations, display clear breakdowns.
5. Never ask for sensitive information like passwords, full card numbers, or OTPs.
6. If a customer seems distressed about fraud, acknowledge their concern and guide them to official channels.
7. Respond in a clear, concise manner suitable for all age groups.
8. If you don't know something specific, direct the customer to the official helpline.

Bank Context: {bank_context}
Service Context: {service_context}
Calculator Result: {calculator_result}
"""

# ─── Graph Nodes ─────────────────────────────────────────────────────────────

def detect_intent_node(state: AgentState) -> AgentState:
    """
    Node 1: Analyze the latest user message to detect:
      - Which bank is mentioned (or use selected_bank from UI)
      - Which service is being requested
      - Whether escalation is needed
      - Whether an automatable calculator service is needed
    """
    last_message = state["messages"][-1]
    text = last_message.content if hasattr(last_message, "content") else str(last_message)

    detected_bank = detect_bank(text) or state.get("selected_bank")
    detected_service = detect_service(text)
    detected_auto_service = detect_automatable_service(text)
    should_escalate = detect_escalation(text)

    logger.info(
        f"Intent detected — bank: {detected_bank}, service: {detected_service}, "
        f"auto_service: {detected_auto_service}, escalate: {should_escalate}"
    )

    return {
        **state,
        "detected_bank": detected_bank,
        "detected_service": detected_service,
        "detected_auto_service": detected_auto_service,
        "escalate": should_escalate,
    }


def calculator_node(state: AgentState) -> AgentState:
    """
    Node 2 (conditional): Run EMI or FD calculator if detected.
    Tries to extract numeric values from the latest message.
    """
    text = state["messages"][-1].content
    auto_service = state.get("detected_auto_service")
    result = None

    try:
        # Extract numbers (handles commas and decimals, ensures at least one digit)
        # Regex: optional digits/commas, then at least one digit, then optional digits/commas/decimals
        numbers = [float(n.replace(",", "")) for n in re.findall(r"[\d,]*\d+[\d,]*\.?\d*", text)]

        if auto_service == "emi_calculator" and len(numbers) >= 3:
            principal, rate, tenure = numbers[0], numbers[1], int(numbers[2])
            result = calculate_emi(principal, rate, tenure)
            logger.info(f"EMI calculated: {result}")

        elif auto_service == "fd_calculator" and len(numbers) >= 3:
            principal, rate, tenure = numbers[0], numbers[1], numbers[2]
            result = calculate_fd_maturity(principal, rate, tenure)
            logger.info(f"FD calculated: {result}")

    except Exception as e:
        logger.warning(f"Calculator extraction failed: {e}")

    return {**state, "calculator_result": result}


def llm_node(state: AgentState) -> AgentState:
    """
    Node 3: Build context and invoke ChatGroq LLM to generate a response.
    Uses LangChain prompt + conversation history.
    """
    llm = _build_llm()

    # Build bank context string
    bank_key = state.get("detected_bank") or state.get("selected_bank")
    bank_info = BANK_DIRECTORY.get(bank_key, {}) if bank_key else {}
    service_key = state.get("detected_service")

    bank_context = "No specific bank detected."
    if bank_info:
        bank_context = (
            f"Bank: {bank_info.get('full_name', bank_key)}\n"
            f"Helpline: {', '.join(bank_info.get('helpline', []))}\n"
            f"Website: {bank_info.get('website', 'N/A')}\n"
            f"App: {', '.join(bank_info.get('mobile_app', []))}"
        )

    service_context = "No specific service detected."
    if service_key and bank_info.get("services", {}).get(service_key):
        svc = bank_info["services"][service_key]
        instructions = "\n".join(
            f"  {i+1}. {step}" for i, step in enumerate(svc.get("instructions", []))
        )
        service_context = f"Service: {svc['description']}\nInstructions:\n{instructions}"

    calc_result = state.get("calculator_result")
    calculator_str = "No calculator used."
    if calc_result:
        calculator_str = "\n".join(f"  {k}: {v}" for k, v in calc_result.items())

    # Build prompt
    prompt = ChatPromptTemplate.from_messages([
        ("system", SYSTEM_PROMPT),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ])

    chain = prompt | llm

    # Fetch history
    history = _get_session_history(state["session_id"])

    chain_with_history = RunnableWithMessageHistory(
        chain,
        lambda sid: _get_session_history(sid),
        input_messages_key="input",
        history_messages_key="history",
    )

    user_input = state["messages"][-1].content

    response = chain_with_history.invoke(
        {
            "input": user_input,
            "bank_context": bank_context,
            "service_context": service_context,
            "calculator_result": calculator_str,
        },
        config={"configurable": {"session_id": state["session_id"]}},
    )

    response_text = response.content if hasattr(response, "content") else str(response)
    logger.info(f"LLM response generated ({len(response_text)} chars)")

    return {
        **state,
        "messages": state["messages"] + [AIMessage(content=response_text)],
        "final_response": response_text,
    }


def escalation_node(state: AgentState) -> AgentState:
    """
    Node 4 (conditional): Append RBI Ombudsman advisory to the response
    if escalation was flagged.
    """
    advisory = (
        "\n\n⚠️ **Important Advisory:**\n"
        "If you believe you are a victim of banking fraud or unauthorized transactions, "
        "please immediately:\n"
        "1. Call your bank's 24x7 helpline to block your account/card.\n"
        "2. File a complaint with the **RBI Banking Ombudsman**: "
        "https://cms.rbi.org.in\n"
        "3. Call RBI Helpline: **14448** (toll-free)\n"
        "4. File a cybercrime complaint at: https://cybercrime.gov.in\n"
        "Your bank is liable to refund unauthorized transactions reported within 3 days."
    )

    updated_response = state.get("final_response", "") + advisory

    logger.info("Escalation advisory appended to response.")

    return {
        **state,
        "final_response": updated_response,
        "messages": state["messages"][:-1] + [AIMessage(content=updated_response)],
    }


# ─── Conditional Edge Routing ─────────────────────────────────────────────────

def route_after_intent(state: AgentState) -> str:
    """Route to calculator_node if automatable service detected, else llm_node."""
    if state.get("detected_auto_service"):
        return "calculator_node"
    return "llm_node"


def route_after_llm(state: AgentState) -> str:
    """Route to escalation_node if escalation flagged, else END."""
    if state.get("escalate"):
        return "escalation_node"
    return END


# ─── Build LangGraph ─────────────────────────────────────────────────────────

def _build_graph():
    """Compile the LangGraph StateGraph."""
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("detect_intent_node", detect_intent_node)
    workflow.add_node("calculator_node", calculator_node)
    workflow.add_node("llm_node", llm_node)
    workflow.add_node("escalation_node", escalation_node)

    # Set entry point
    workflow.set_entry_point("detect_intent_node")

    # Edges
    workflow.add_conditional_edges("detect_intent_node", route_after_intent)
    workflow.add_edge("calculator_node", "llm_node")
    workflow.add_conditional_edges("llm_node", route_after_llm)
    workflow.add_edge("escalation_node", END)

    return workflow.compile()


# ─── BankingSupportAgent Class ───────────────────────────────────────────────

class BankingSupportAgent:
    """
    High-level interface for the Banking Support AI Agent.

    Wraps the compiled LangGraph and provides a simple chat() method.
    """

    def __init__(self):
        self.graph = _build_graph()
        logger.info("BankingSupportAgent initialized with LangGraph.")

    def chat(
        self,
        message: str,
        session_id: str,
        selected_bank: Optional[str] = None,
        language_code: str = "eng_Latn",
    ) -> dict:
        """
        Process a user message and return an AI response.

        Args:
            message: User's input text (in English, post-translation).
            session_id: Unique session identifier for conversation memory.
            selected_bank: Bank selected in the UI dropdown (optional).
            language_code: IndicTrans2 code of the user's preferred language.

        Returns:
            dict with:
                - response (str): AI response text.
                - bank (str | None): Detected or selected bank.
                - service (str | None): Detected service.
                - escalate (bool): Whether escalation was flagged.
                - calculator_result (dict | None): Calculator result if any.
        """
        initial_state: AgentState = {
            "messages": [HumanMessage(content=message)],
            "session_id": session_id,
            "selected_bank": selected_bank,
            "detected_bank": None,
            "detected_service": None,
            "detected_auto_service": None,
            "escalate": False,
            "calculator_result": None,
            "language_code": language_code,
            "final_response": "",
        }

        try:
            final_state = self.graph.invoke(initial_state)
        except Exception as e:
            logger.error(f"Agent graph error: {e}")
            return {
                "response": "I'm sorry, I encountered an error processing your request. Please try again or call your bank's helpline.",
                "bank": selected_bank,
                "service": None,
                "escalate": False,
                "calculator_result": None,
            }

        return {
            "response": final_state.get("final_response", ""),
            "bank": final_state.get("detected_bank") or selected_bank,
            "service": final_state.get("detected_service"),
            "escalate": final_state.get("escalate", False),
            "calculator_result": final_state.get("calculator_result"),
        }


# Singleton agent instance
_agent_instance: Optional[BankingSupportAgent] = None


def get_agent() -> BankingSupportAgent:
    """Return (or create) the singleton BankingSupportAgent instance."""
    global _agent_instance
    if _agent_instance is None:
        _agent_instance = BankingSupportAgent()
    return _agent_instance

# 🏦 Universal Banking AI Support Agent

An advanced, multi-lingual, voice-enabled AI Customer Support Agent designed specifically for major Indian banks. This project integrates state-of-the-art LLMs, local Speech-to-Text (STT), and neural machine translation to provide a seamless banking experience.

![Banking AI Dashboard](https://images.unsplash.com/photo-1550565118-3a14e8d0386f?q=80&w=1470&auto=format&fit=crop) *(Placeholder for Banner)*

---

## 🌟 Key Features

- **🤖 Multi-Bank Support**: Instant access to helpline, website, and app information for SBI, HDFC, ICICI, Axis, Kotak, PNB, and BoB.
- **🎤 Voice-First Interface**: Hold-to-speak voice input powered by **OpenAI Whisper** for local, privacy-focused transcription.
- **🇮🇳 Regional Languages**: Real-time translation supporting Hindi, Tamil, Telugu, and more via **IndicTrans2 (AI4Bharat)**.
- **📊 Real-time Calculators**: Built-in EMI and Fixed Deposit (FD) calculators directly within the chat.
- **🛡️ Secure & Private**: JWT-based authentication and a local-first approach to voice processing.
- **⚠️ Consumer Protection**: Automatic detection of fraud/escalation keywords with direct links to the **RBI Ombudsman**.

---

## 🛠️ Tech Stack

### Backend (Python)
- **Framework**: FastAPI (Asynchronous high-performance API)
- **AI Agent**: LangGraph & LangChain (Stateful conversation orchestration)
- **LLM**: Groq (Llama-3.3-70B) for ultra-fast, intelligent responses
- **Speech**: OpenAI Whisper (Local STT)
- **Translation**: IndicTrans2 (Regional language support)
- **Database**: SQLAlchemy (SQLite for development)

### Frontend (React)
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (Glassmorphism & premium dark mode)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 📁 Project Structure

```text
.
├── backend/                # FastAPI Application
│   ├── app/
│   │   ├── api/            # API Routes (Chat, Voice, Auth, Health)
│   │   ├── core/           # Security & Configuration
│   │   └── services/       
│   │       ├── ai/         # LangGraph Agent Logic
│   │       ├── voice/      # Whisper & Translation Services
│   │       └── bank_directory.py # Central Bank Knowledge Base
├── frontend/               # React Application
│   ├── src/
│   │   ├── api/            # Axios API client
│   │   ├── components/     # UI Components (Sidebar, Chat, Voice)
│   │   ├── hooks/          # Custom Hooks (useChat, useVoice)
│   │   └── App.jsx         # Main layout
├── .env                    # Environment variables (API keys)
├── requirements.txt        # Backend dependencies
└── README.md               # You are here
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- [Groq API Key](https://console.groq.com/)

### 1. Setup Backend
```bash
# Clone the repository and navigate root
cd Banking-AI-Support-Agent

# Install dependencies (using uv or pip)
pip install -r requirements.txt

# Configure Environment
cp .env.template .env
# Edit .env and add your GROQ_API_KEY
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

### 3. Run the Servers
**Terminal 1 (Backend):**
```bash
uvicorn backend.app.main:app --reload
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

Visit `http://localhost:5173` to start chatting!

---

## 🏗️ Architecture Flow

1. **User Input**: Text or Voice (via MediaRecorder API).
2. **Translation**: If input is in a regional language, it's translated to English via **IndicTrans2**.
3. **Agent Logic**: The **LangGraph** agent analyzes the intent (bank detection, service inquiry, or calculator trigger).
4. **Calculations**: If a loan or deposit is mentioned, the **Calculator Node** extracts figures and computes results.
5. **LLM Generation**: **Groq** generates a professional banking response using the gathered context.
6. **Output**: The response is translated back to the user's selected language and displayed in the premium UI.

---

## 📜 License
Personal Project - Created for educational and demonstration purposes.

---

## 👨‍💻 Author
**Kartik Rudragoudar**
[GitHub](https://github.com/Kartikrudragoudar) | [LinkedIn](https://linkedin.com/in/kartik-rudragoudar)

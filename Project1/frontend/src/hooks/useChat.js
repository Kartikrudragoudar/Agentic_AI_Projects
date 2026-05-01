import { useState, useCallback, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { sendChatMessage } from '../api/bankingApi'
import toast from 'react-hot-toast'

/**
 * useChat — manages chat state and message sending logic.
 *
 * Returns:
 *   messages, isLoading, sessionId, sendMessage, clearChat
 */
export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: '🏦 **Welcome to Banking AI Support!**\n\nI can help you with balance checks, card issues, fund transfers, EMI calculations, and more for SBI, HDFC, ICICI, Axis, Kotak, PNB, and Bank of Baroda.\n\nHow can I assist you today?',
      timestamp: new Date(),
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const sessionId = useRef(uuidv4())

  const sendMessage = useCallback(async (text, selectedBank, languageCode = 'eng_Latn') => {
    if (!text.trim() || isLoading) return

    const userMsg = {
      id: uuidv4(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])
    setIsLoading(true)

    try {
      const data = await sendChatMessage(text.trim(), sessionId.current, selectedBank, languageCode)

      const botMsg = {
        id: uuidv4(),
        role: 'bot',
        text: data.response,
        timestamp: new Date(),
        bank: data.bank,
        service: data.service,
        escalate: data.escalate,
        calculatorResult: data.calculator_result,
      }
      setMessages(prev => [...prev, botMsg])

      if (data.escalate) {
        toast.error('⚠️ Fraud/Escalation detected — RBI advisory appended.', { duration: 5000 })
      }

      return data
    } catch (err) {
      const errMsg = err?.response?.data?.detail || 'Connection error. Please check your backend is running.'
      toast.error(errMsg)
      setMessages(prev => [
        ...prev,
        {
          id: uuidv4(),
          role: 'bot',
          text: '❌ ' + errMsg,
          timestamp: new Date(),
          isError: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }, [isLoading])

  const clearChat = useCallback(() => {
    sessionId.current = uuidv4()
    setMessages([{
      id: 'welcome',
      role: 'bot',
      text: '🏦 **New session started!**\n\nHow can I help you today?',
      timestamp: new Date(),
    }])
    toast.success('Chat cleared — new session started')
  }, [])

  return { messages, isLoading, sessionId: sessionId.current, sendMessage, clearChat }
}

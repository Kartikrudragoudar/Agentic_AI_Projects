import React, { useRef, useEffect, useState } from 'react'
import { Send, Trash2, Bot } from 'lucide-react'
import MessageBubble from './MessageBubble'
import VoiceRecorder from './VoiceRecorder'
import EscalationAlert from './EscalationAlert'
import CalculatorResult from './CalculatorResult'

/**
 * ChatWindow — scrollable chat area + input bar.
 *
 * Props:
 *   messages, isLoading, onSendMessage
 *   isRecording, isTranscribing, onVoiceStart, onVoiceStop
 *   onClear
 */
export default function ChatWindow({
  messages,
  isLoading,
  onSendMessage,
  isRecording,
  isTranscribing,
  onVoiceStart,
  onVoiceStop,
  onClear,
}) {
  const [inputText, setInputText] = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSend = () => {
    const text = inputText.trim()
    if (!text || isLoading) return
    onSendMessage(text)
    setInputText('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleVoiceStop = async () => {
    const text = await onVoiceStop()
    if (text) setInputText(text)
  }

  // Find last bot message for escalation / calculator display
  const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot')

  return (
    <div className="flex-1 flex flex-col min-h-0">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 msg-enter pl-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #003087, #1e4580)' }}>
              <span className="text-sm">🏦</span>
            </div>
            <div className="glass-dark rounded-2xl rounded-bl-md px-4 py-3 border-l-2 border-gold-500">
              <div className="flex gap-1.5 items-center h-4">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Escalation Alert */}
      {lastBotMsg?.escalate && <EscalationAlert />}

      {/* Calculator Result */}
      {lastBotMsg?.calculatorResult && <CalculatorResult result={lastBotMsg.calculatorResult} />}

      {/* Input Bar */}
      <div className="px-3 pb-3 pt-2 border-t border-white/5">
        <div className="flex items-end gap-2">
          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              id="chat-input"
              rows={1}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type your banking query... (Enter to send)"
              className="input-field w-full px-4 py-3 pr-12 text-sm resize-none leading-relaxed"
              style={{ minHeight: '46px', maxHeight: '120px' }}
              aria-label="Chat input"
            />
          </div>

          {/* Voice Button */}
          <VoiceRecorder
            isRecording={isRecording}
            isTranscribing={isTranscribing}
            onStart={onVoiceStart}
            onStop={handleVoiceStop}
          />

          {/* Send Button */}
          <button
            id="send-message-btn"
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            aria-label="Send message"
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              inputText.trim() && !isLoading
                ? 'btn-gold'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>

          {/* Clear Button */}
          <button
            id="clear-chat-btn"
            onClick={onClear}
            aria-label="Clear chat"
            title="Clear chat"
            className="w-10 h-10 rounded-full flex items-center justify-center
                       bg-white/5 hover:bg-red-500/20 text-slate-500 hover:text-red-400
                       border border-white/5 transition-all duration-200"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}

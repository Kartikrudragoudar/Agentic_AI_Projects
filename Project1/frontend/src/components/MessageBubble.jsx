import React from 'react'

/**
 * MessageBubble — renders a single chat message (user or bot).
 * Bot messages support basic markdown (bold, code, bullet lists, numbered lists).
 */
export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  const formatBotText = (text) => {
    if (!text) return null
    return text
      .split('\n')
      .map((line, i) => {
        // Bold **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={j} className="font-semibold text-gold-400">{part.slice(2, -2)}</strong>
          }
          return part
        })

        // Numbered list
        if (/^\d+\./.test(line.trim())) {
          return (
            <div key={i} className="flex gap-2 my-0.5">
              <span className="text-gold-500 font-medium shrink-0">{line.match(/^\d+/)[0]}.</span>
              <span>{parts.slice(1)}</span>
            </div>
          )
        }

        // Bullet list
        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
          return (
            <div key={i} className="flex gap-2 my-0.5">
              <span className="text-gold-500 shrink-0 mt-1">•</span>
              <span>{parts.slice(1)}</span>
            </div>
          )
        }

        // Warning line
        if (line.trim().startsWith('⚠️')) {
          return <div key={i} className="text-yellow-400 font-medium mt-2">{parts}</div>
        }

        // Empty line
        if (!line.trim()) return <div key={i} className="h-2" />

        return <div key={i}>{parts}</div>
      })
  }

  return (
    <div className={`flex msg-enter ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Bot avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-2 mt-1"
          style={{ background: 'linear-gradient(135deg, #003087, #1e4580)' }}>
          <span className="text-sm">🏦</span>
        </div>
      )}

      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-navy-700 to-navy-900 text-white rounded-br-md border border-navy-600'
            : 'glass-dark text-slate-100 rounded-bl-md border-l-2 border-gold-500'
        } ${message.isError ? 'border-red-500/50' : ''}`}
      >
        {isUser
          ? <p className="whitespace-pre-wrap">{message.text}</p>
          : <div className="space-y-0.5">{formatBotText(message.text)}</div>
        }
        <p className={`text-xs mt-1.5 ${isUser ? 'text-navy-300 text-right' : 'text-slate-500'}`}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 ml-2 mt-1"
          style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}>
          <span className="text-sm font-bold text-navy-900">U</span>
        </div>
      )}
    </div>
  )
}

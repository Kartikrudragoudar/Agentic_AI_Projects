import React, { useState } from 'react'
import { useChat } from './hooks/useChat'
import { useVoice } from './hooks/useVoice'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import BankSelector from './components/BankSelector'
import LanguageSelector from './components/LanguageSelector'

/**
 * App — Root component of the Banking AI Support Agent.
 * Manages the layout and shared state between Sidebar, Header, and ChatWindow.
 */
function App() {
  const [selectedBank, setSelectedBank] = useState(null)
  const [selectedLang, setSelectedLang] = useState('eng_Latn')
  
  const { messages, isLoading, sendMessage, clearChat } = useChat()
  const { 
    isRecording, 
    isTranscribing, 
    startRecording, 
    stopRecording 
  } = useVoice()

  const handleSendMessage = (text) => {
    sendMessage(text, selectedBank, selectedLang)
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0f1e] text-slate-100 overflow-hidden font-sans">
      
      {/* Sidebar (Calculators + Quick Actions) */}
      <Sidebar 
        onQuickAction={handleSendMessage} 
        selectedBank={selectedBank} 
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 glass border-l border-white/5">
        
        {/* Header */}
        <header className="h-16 shrink-0 flex items-center justify-between px-6 border-b border-white/5 bg-navy-900/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
              <span className="text-2xl">🏦</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Banking AI</h1>
              <p className="text-[10px] text-gold-400 uppercase tracking-widest font-semibold">Universal Support Agent</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <BankSelector 
              selectedBank={selectedBank} 
              onBankChange={setSelectedBank} 
            />
            <div className="h-6 w-px bg-white/10 hidden sm:block" />
            <LanguageSelector 
              selectedLang={selectedLang} 
              onLangChange={setSelectedLang} 
            />
          </div>
        </header>

        {/* Chat Interface */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          isRecording={isRecording}
          isTranscribing={isTranscribing}
          onVoiceStart={startRecording}
          onVoiceStop={() => stopRecording(selectedLang)}
          onClear={clearChat}
        />
      </main>
    </div>
  )
}

export default App

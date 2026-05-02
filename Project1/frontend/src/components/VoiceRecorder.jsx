import React from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'

/**
 * VoiceRecorder — hold-to-speak mic button using MediaRecorder API.
 *
 * Props:
 *   isRecording    — bool
 *   isTranscribing — bool
 *   onStart        — fn called when user presses down
 *   onStop         — fn called when user releases (returns transcribed text)
 */
export default function VoiceRecorder({ isRecording, isTranscribing, onStart, onStop }) {
  const handlePointerDown = (e) => {
    e.preventDefault()
    onStart()
  }

  const handlePointerUp = (e) => {
    e.preventDefault()
    onStop()
  }

  return (
    <button
      id="voice-recorder-btn"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}   // auto-stop if pointer leaves button
      disabled={isTranscribing}
      aria-label={isRecording ? 'Release to send voice message' : 'Hold to record voice message'}
      title={isRecording ? 'Release to send' : 'Hold to speak'}
      className={`
        relative w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200 select-none touch-none
        ${isTranscribing
          ? 'bg-slate-700 cursor-wait'
          : isRecording
            ? 'bg-red-500 mic-pulse scale-110 cursor-pointer'
            : 'bg-gradient-to-br from-navy-700 to-navy-900 hover:from-gold-600 hover:to-gold-700 cursor-pointer border border-white/10'
        }
      `}
    >
      {isTranscribing
        ? <Loader2 size={20} className="text-gold-400 animate-spin" />
        : isRecording
          ? <MicOff size={20} className="text-white" />
          : <Mic size={20} className="text-gold-400" />
      }
    </button>
  )
}

import { useState, useRef, useCallback } from 'react'
import { transcribeAudio } from '../api/bankingApi'
import toast from 'react-hot-toast'

/**
 * useVoice — manages audio recording (MediaRecorder API) + transcription.
 *
 * Returns:
 *   isRecording, isTranscribing, startRecording, stopRecording, transcribedText, clearTranscription
 */
export function useVoice() {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [transcribedText, setTranscribedText] = useState('')

  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const startRecording = useCallback(async () => {
    if (isRecording) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []

      const options = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? { mimeType: 'audio/webm;codecs=opus' }
        : {}

      const mediaRecorder = new MediaRecorder(stream, options)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      mediaRecorder.start(250)  // collect every 250ms
      setIsRecording(true)
      toast('🎙️ Recording... Release to send', { icon: '🎤', duration: 99999, id: 'recording' })
    } catch (err) {
      toast.error('Microphone access denied. Please allow microphone permissions.')
    }
  }, [isRecording])

  const stopRecording = useCallback(async (languageCode = 'eng_Latn') => {
    if (!isRecording || !mediaRecorderRef.current) return

    toast.dismiss('recording')
    setIsRecording(false)

    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        const mimeType = mediaRecorderRef.current.mimeType || 'audio/webm'
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        // Stop all tracks
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())

        if (audioBlob.size < 1000) {
          toast.error('Recording too short. Hold the mic button longer.')
          resolve('')
          return
        }

        setIsTranscribing(true)
        try {
          const result = await transcribeAudio(audioBlob, 'eng_Latn')
          const text = result.translated_text || result.original_text || ''
          setTranscribedText(text)
          toast.success(`Transcribed (${result.detected_language})`)
          resolve(text)
        } catch (err) {
          toast.error('Transcription failed. Make sure the backend is running.')
          resolve('')
        } finally {
          setIsTranscribing(false)
        }
      }

      mediaRecorderRef.current.stop()
    })
  }, [isRecording])

  const clearTranscription = useCallback(() => {
    setTranscribedText('')
  }, [])

  return {
    isRecording,
    isTranscribing,
    transcribedText,
    startRecording,
    stopRecording,
    clearTranscription,
  }
}

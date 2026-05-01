import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

/**
 * Send a chat message to the banking AI agent.
 * @param {string} message
 * @param {string} sessionId
 * @param {string|null} selectedBank
 * @param {string} languageCode
 */
export const sendChatMessage = async (message, sessionId, selectedBank, languageCode = 'eng_Latn') => {
  const res = await api.post('/chat/', {
    message,
    session_id: sessionId,
    selected_bank: selectedBank || null,
    language_code: languageCode,
  })
  return res.data
}

/**
 * Transcribe audio blob + translate to target language.
 * @param {Blob} audioBlob
 * @param {string} targetLanguage  IndicTrans2 code
 */
export const transcribeAudio = async (audioBlob, targetLanguage = 'eng_Latn') => {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.webm')
  formData.append('target_language', targetLanguage)
  const res = await axios.post('/api/v1/voice/transcribe/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  })
  return res.data
}

/**
 * Translate text between two IndicTrans2 language codes.
 * @param {string} text
 * @param {string} sourceLang
 * @param {string} targetLang
 */
export const translateText = async (text, sourceLang, targetLang) => {
  const res = await api.post('/voice/translate/', { text, source_lang: sourceLang, target_lang: targetLang })
  return res.data
}

/**
 * Register a new user.
 */
export const registerUser = async (username, email, password, fullName) => {
  const res = await api.post('/auth/register', { username, email, password, full_name: fullName })
  return res.data
}

/**
 * Login and receive JWT token.
 */
export const loginUser = async (username, password) => {
  const formData = new FormData()
  formData.append('username', username)
  formData.append('password', password)
  const res = await axios.post('/api/v1/auth/login', formData)
  return res.data
}

/**
 * Fetch health status.
 */
export const checkHealth = async () => {
  const res = await api.get('/health')
  return res.data
}

import React from 'react'
import { Globe } from 'lucide-react'

const LANGUAGES = [
  { code: 'eng_Latn', name: 'English' },
  { code: 'hin_Deva', name: 'हिंदी (Hindi)' },
  { code: 'tam_Taml', name: 'தமிழ் (Tamil)' },
  { code: 'tel_Telu', name: 'తెలుగు (Telugu)' },
  { code: 'ben_Beng', name: 'বাংলা (Bengali)' },
  { code: 'mar_Deva', name: 'मराठी (Marathi)' },
  { code: 'guj_Gujr', name: 'ગુજરાતી (Gujarati)' },
  { code: 'kan_Knda', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'mal_Mlym', name: 'മലയാളം (Malayalam)' },
  { code: 'pan_Guru', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ory_Orya', name: 'ଓଡ଼ିଆ (Odia)' },
]

/**
 * LanguageSelector — dropdown for 11 Indian languages.
 */
export default function LanguageSelector({ selectedLang, onLangChange }) {
  return (
    <div className="flex items-center gap-2">
      <Globe className="text-gold-500 shrink-0" size={16} />
      <select
        id="language-selector"
        value={selectedLang}
        onChange={e => onLangChange(e.target.value)}
        className="input-field flex-1 text-sm px-3 py-2 cursor-pointer"
        aria-label="Select Language"
      >
        {LANGUAGES.map(l => (
          <option key={l.code} value={l.code}>{l.name}</option>
        ))}
      </select>
    </div>
  )
}

import React from 'react'
import { AlertTriangle, ExternalLink } from 'lucide-react'

/**
 * EscalationAlert — yellow RBI Ombudsman warning card.
 * Shown when the AI detects fraud / escalation keywords.
 */
export default function EscalationAlert() {
  return (
    <div className="mx-3 mb-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 animate-fade-in">
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-yellow-400 shrink-0 mt-0.5" size={18} />
        <div className="flex-1 min-w-0">
          <p className="text-yellow-300 font-semibold text-sm">Escalation Detected</p>
          <p className="text-yellow-200/80 text-xs mt-1 leading-relaxed">
            If you're facing fraud or unauthorized transactions, report immediately to:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            <a
              href="https://cms.rbi.org.in"
              target="_blank"
              rel="noopener noreferrer"
              id="rbi-ombudsman-link"
              className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30
                         text-yellow-300 rounded-lg px-2.5 py-1.5 transition-colors border border-yellow-500/30"
            >
              <ExternalLink size={11} />
              RBI Ombudsman
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              id="cybercrime-link"
              className="inline-flex items-center gap-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30
                         text-yellow-300 rounded-lg px-2.5 py-1.5 transition-colors border border-yellow-500/30"
            >
              <ExternalLink size={11} />
              Cybercrime Portal
            </a>
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-500/20
                             text-yellow-300 rounded-lg px-2.5 py-1.5 border border-yellow-500/30">
              📞 14448 (RBI)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

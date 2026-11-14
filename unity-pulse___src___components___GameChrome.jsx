import React from 'react'
import './GameChrome.css'

export default function GameChrome({ copy, lang, pulse, onLanguageToggle, hint }) {
  return (
    <div className="game-chrome">
      <button className="language-toggle game-chrome__lang" onClick={onLanguageToggle} type="button">
        <span>{copy.switchLabel}</span>
        <strong>{lang === 'ru' ? 'KZ' : 'RU'}</strong>
      </button>

      <div className="game-chrome__pulse">
        <div className="game-chrome__pulse-head">
          <span className="game-chrome__pulse-label">{copy.pulseLabel}</span>
          {typeof pulse === 'number' && (
            <span className="game-chrome__pulse-value" style={{ color: pulse === 100 ? '#35D08B' : undefined }}>
              {pulse}%
            </span>
          )}
        </div>
        {typeof pulse === 'number' && (
          <div className="game-chrome__pulse-track">
            <div className="game-chrome__pulse-fill" style={{ width: `${pulse}%` }} />
          </div>
        )}
        {hint && <p className="game-chrome__pulse-hint">{hint}</p>}
      </div>
    </div>
  )
}


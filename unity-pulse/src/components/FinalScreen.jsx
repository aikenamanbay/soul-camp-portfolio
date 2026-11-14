import React, { useEffect, useState } from 'react'
import GameChrome from './GameChrome'
import './FinalScreen.css'

export default function FinalScreen({ copy, lang, player, pulse = 100, onLanguageToggle, onRestart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`final ${visible ? 'final--visible' : ''}`}>
      <GameChrome copy={copy} lang={lang} pulse={pulse} onLanguageToggle={onLanguageToggle} />

      <div className="final__content">
        <div className="final__town" aria-hidden="true">
          <div className="final__flag" />
          <div className="final__tower final__tower--left" />
          <div className="final__tower final__tower--center" />
          <div className="final__tower final__tower--right" />
          <img className="final__student" src={player?.skin} alt="" />
        </div>

        <h1 className="final__title">{copy.finalTitle}</h1>

        <p className="final__sub">{player?.name}, {copy.finalSub}</p>

        <div className="final__facts">
          {copy.finalFacts.map((fact, index) => (
            <div className="final__fact" key={fact}>
              <div className="final__fact-icon">0{index + 1}</div>
              <div className="final__fact-text">{fact}</div>
            </div>
          ))}
        </div>

        <p className="final__message">{copy.finalMessage}</p>

        <button className="final__btn" onClick={onRestart}>
          {copy.restart}
        </button>
      </div>
    </div>
  )
}

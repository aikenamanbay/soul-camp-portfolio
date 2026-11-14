import React, { useEffect, useState } from 'react'
import './IntroScreen.css'

export default function IntroScreen({ copy, lang, player, onLanguageToggle, onStart }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className={`intro ${visible ? 'intro--visible' : ''}`}>
      <div className="intro__sky" />

      <button className="language-toggle intro__language" onClick={onLanguageToggle}>
        <span>{copy.switchLabel}</span>
        <strong>{lang === 'ru' ? 'KZ' : 'RU'}</strong>
      </button>

      <div className="intro__content">
        <div className="intro__town" aria-hidden="true">
          <div className="pixel-sun" />
          <div className="pixel-building pixel-building--museum">
            <span />
            <span />
            <span />
          </div>
          <div className="pixel-building pixel-building--stories">
            <span />
            <span />
            <span />
          </div>
          <div className="pixel-building pixel-building--digital">
            <span />
            <span />
            <span />
          </div>
          <img className="pixel-student" src={player?.skin} alt="" />
        </div>

        <h1 className="intro__title">
          <span className="intro__title-unity">Unity</span>
          <span className="intro__title-pulse"> Pulse</span>
        </h1>

        <p className="intro__tagline">{copy.introTagline}</p>

        <p className="intro__desc">{copy.introDesc}</p>
        <p className="intro__goal">{copy.introGoal}</p>

        <div className="intro__levels">
          <div className="intro__level-badge">01 / {lang === 'ru' ? 'Музей' : 'Музей'}</div>
          <div className="intro__level-badge">02 / {lang === 'ru' ? '6 историй' : '6 оқиға'}</div>
          <div className="intro__level-badge">03 / {lang === 'ru' ? 'Диджитал мир' : 'Цифрлық әлем'}</div>
        </div>

        <button className="intro__btn" onClick={onStart}>
          {copy.start}
          <span className="intro__btn-arrow">→</span>
        </button>

        <p className="intro__credit">
          {copy.credit}
        </p>
      </div>
    </div>
  )
}

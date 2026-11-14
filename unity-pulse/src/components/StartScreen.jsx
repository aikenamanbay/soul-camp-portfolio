import React, { useState } from 'react'
import { PLAYER_SKINS } from '../data/levels'
import GameChrome from './GameChrome'
import './StartScreen.css'

export default function StartScreen({ copy, lang, initialPlayer, onLanguageToggle, onStart }) {
  const [name, setName] = useState(initialPlayer?.name || '')
  const [gender, setGender] = useState(initialPlayer?.gender || 'boy')
  const trimmedName = name.trim()

  function handleSubmit(event) {
    event.preventDefault()
    if (!trimmedName) return
    onStart({
      name: trimmedName,
      gender,
      skin: PLAYER_SKINS[gender],
    })
  }

  return (
    <div className="start-screen">
      <GameChrome copy={copy} lang={lang} pulse={0} onLanguageToggle={onLanguageToggle} />

      <form className="start-screen__panel" onSubmit={handleSubmit}>
        <h1 className="start-screen__title">
          <span>Unity</span> Town
        </h1>

        <label className="start-screen__field">
          <span>{copy.nameLabel}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={copy.namePlaceholder}
            maxLength={18}
            autoComplete="name"
          />
        </label>

        <div className="start-screen__gender">
          <span>{copy.genderLabel}</span>
          <div className="start-screen__gender-options">
            <button
              className={`start-screen__gender-btn ${gender === 'boy' ? 'start-screen__gender-btn--active' : ''}`}
              onClick={() => setGender('boy')}
              type="button"
              aria-pressed={gender === 'boy'}
            >
              <img src={PLAYER_SKINS.boy} alt={copy.boy} />
              <span>{copy.boy}</span>
            </button>
            <button
              className={`start-screen__gender-btn ${gender === 'girl' ? 'start-screen__gender-btn--active' : ''}`}
              onClick={() => setGender('girl')}
              type="button"
              aria-pressed={gender === 'girl'}
            >
              <img src={PLAYER_SKINS.girl} alt={copy.girl} />
              <span>{copy.girl}</span>
            </button>
          </div>
        </div>

        <button className="start-screen__start" disabled={!trimmedName} type="submit">
          {copy.start}
        </button>
      </form>
    </div>
  )
}

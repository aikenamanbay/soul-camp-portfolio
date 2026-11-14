import React, { useState } from 'react'
import { PLAYER_SKINS } from '../data/levels'
import './OnboardingScreen.css'

export default function OnboardingScreen({ copy, lang, onLanguageToggle, onRegister }) {
  const [name, setName] = useState('')
  const [gender, setGender] = useState('boy')
  const trimmedName = name.trim()

  function handleSubmit(event) {
    event.preventDefault()
    if (!trimmedName) return
    onRegister({
      name: trimmedName,
      gender,
      skin: PLAYER_SKINS[gender],
    })
  }

  return (
    <div className="onboarding">
      <button className="language-toggle onboarding__language" onClick={onLanguageToggle} type="button">
        <span>{copy.switchLabel}</span>
        <strong>{lang === 'ru' ? 'KZ' : 'RU'}</strong>
      </button>

      <form className="onboarding__panel" onSubmit={handleSubmit}>
        <div className="onboarding__preview" aria-hidden="true">
          <img className="onboarding__skin" src={PLAYER_SKINS[gender]} alt="" />
          <div className="onboarding__nameplate">{trimmedName || copy.profileLabel}</div>
        </div>

        <div className="onboarding__content">
          <h1 className="onboarding__title">{copy.registerTitle}</h1>
          <p className="onboarding__subtitle">{copy.registerSubtitle}</p>

          <label className="onboarding__field">
            <span>{copy.nameLabel}</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={copy.namePlaceholder}
              maxLength={18}
            />
          </label>

          <div className="onboarding__gender-group">
            <span>{copy.genderLabel}</span>
            <div className="onboarding__gender-options">
              <button
                className={`onboarding__gender ${gender === 'boy' ? 'onboarding__gender--active' : ''}`}
                onClick={() => setGender('boy')}
                type="button"
              >
                {copy.boy}
              </button>
              <button
                className={`onboarding__gender ${gender === 'girl' ? 'onboarding__gender--active' : ''}`}
                onClick={() => setGender('girl')}
                type="button"
              >
                {copy.girl}
              </button>
            </div>
          </div>

          <button className="onboarding__submit" disabled={!trimmedName} type="submit">
            {copy.savePlayer} →
          </button>
        </div>
      </form>
    </div>
  )
}

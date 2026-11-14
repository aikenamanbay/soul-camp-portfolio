import React, { useState } from 'react'
import { COPY, PLAYER_SKINS } from './data/levels'
import StartScreen from './components/StartScreen'
import MapScreen from './components/MapScreen'
import LevelScreen from './components/LevelScreen'
import FinalScreen from './components/FinalScreen'
import './App.css'

const savedPlayer = (() => {
  try {
    const parsed = JSON.parse(localStorage.getItem('unity-pulse-player'))
    if (!parsed?.name || !parsed?.gender) return null
    return {
      ...parsed,
      skin: PLAYER_SKINS[parsed.gender] || PLAYER_SKINS.boy,
    }
  } catch {
    return null
  }
})()

// screens: 'start' | 'map' | 'level' | 'final'

export default function App() {
  const [screen, setScreen] = useState('start')
  const [levelsDone, setLevelsDone] = useState([false, false, false])
  const [pulse, setPulse] = useState(0)
  const [activeLevel, setActiveLevel] = useState(null)
  const [lang, setLang] = useState('ru')
  const [player, setPlayer] = useState(savedPlayer)
  const [mapPosition, setMapPosition] = useState(null)
  const copy = COPY[lang]

  function toggleLang() {
    setLang((current) => (current === 'ru' ? 'kz' : 'ru'))
  }

  function handleStart(nextPlayer) {
    setPlayer(nextPlayer)
    localStorage.setItem('unity-pulse-player', JSON.stringify(nextPlayer))
    setScreen('map')
  }

  function handleSelectLevel(idx) {
    setActiveLevel(idx)
    setScreen('level')
  }

  function handleLevelComplete(gained) {
    const newDone = [...levelsDone]
    newDone[activeLevel] = true
    setLevelsDone(newDone)
    const newPulse = Math.min(100, pulse + gained)
    setPulse(newPulse)

    const allDone = newDone.every(Boolean)
    if (allDone) {
      setPulse(100)
      setScreen('final')
    } else {
      setScreen('map')
    }
  }

  function handleRestart() {
    setScreen('start')
    setLevelsDone([false, false, false])
    setPulse(0)
    setActiveLevel(null)
    setMapPosition(null)
  }

  return (
    <div className="app">
      {screen === 'start' && (
        <StartScreen
          copy={copy}
          lang={lang}
          initialPlayer={player}
          onLanguageToggle={toggleLang}
          onStart={handleStart}
        />
      )}
      {screen === 'map' && player && (
        <MapScreen
          copy={copy}
          lang={lang}
          player={player}
          pulse={pulse}
          levelsDone={levelsDone}
          savedPosition={mapPosition}
          onPositionChange={setMapPosition}
          onLanguageToggle={toggleLang}
          onSelectLevel={handleSelectLevel}
        />
      )}
      {screen === 'level' && activeLevel !== null && (
        <LevelScreen
          copy={copy}
          lang={lang}
          player={player}
          levelIndex={activeLevel}
          pulse={pulse}
          onLanguageToggle={toggleLang}
          onComplete={handleLevelComplete}
          onBack={() => setScreen('map')}
        />
      )}
      {screen === 'final' && (
        <FinalScreen
          copy={copy}
          lang={lang}
          player={player}
          pulse={pulse}
          onLanguageToggle={toggleLang}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

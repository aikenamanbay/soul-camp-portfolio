import React, { useEffect, useState } from 'react'
import { LEVELS } from '../data/levels'
import GameChrome from './GameChrome'
import './LevelScreen.css'

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll('ё', 'е')
    .replace(/[.,!?;:()[\]"']/g, '')
}

export default function LevelScreen({ copy, lang, player, levelIndex, pulse, onLanguageToggle, onComplete, onBack }) {
  const level = LEVELS[levelIndex]
  const [qIndex, setQIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [openAnswer, setOpenAnswer] = useState('')
  const [result, setResult] = useState(null)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(null)
  const [briefingSeen, setBriefingSeen] = useState(!level.briefing)
  const [selectedTerm, setSelectedTerm] = useState(null)
  const [matchedTerms, setMatchedTerms] = useState([])
  const [wrongDefinition, setWrongDefinition] = useState(null)

  const question = level.questions[qIndex]
  const total = level.questions.length
  const answered = result !== null
  const isLast = qIndex === total - 1
  const progressPct = Math.round(((qIndex + 1) / total) * 100)
  const isTimed = question.type === 'timed'
  const isOpen = question.type === 'open'
  const isMatching = question.type === 'matching'
  const matchingPairs = isMatching ? question.pairs[lang] : []
  const definitionOrder = [2, 4, 0, 5, 1, 3].filter((index) => index < matchingPairs.length)
  const matchedCount = matchedTerms.length

  useEffect(() => {
    setSelected(null)
    setOpenAnswer('')
    setResult(null)
    setTimeLeft(question.type === 'timed' ? question.timeLimit : null)
    setSelectedTerm(null)
    setMatchedTerms([])
    setWrongDefinition(null)
  }, [qIndex, question])

  useEffect(() => {
    if (!isTimed || answered || timeLeft === null) return undefined
    if (timeLeft <= 0) {
      setResult({ isCorrect: false, feedback: copy.timeoutFeedback, timeout: true })
      return undefined
    }

    const timer = setTimeout(() => {
      setTimeLeft((value) => (value === null ? value : value - 1))
    }, 1000)

    return () => clearTimeout(timer)
  }, [answered, copy.timeoutFeedback, isTimed, timeLeft])

  function markResult(isCorrect, feedback) {
    setResult({ isCorrect, feedback })
    if (isCorrect) setScore((current) => current + 1)
  }

  function handleSelect(idx) {
    if (answered) return
    setSelected(idx)
    markResult(idx === question.correct, question.feedback[lang])
  }

  function handleOpenSubmit(event) {
    event.preventDefault()
    if (answered || !openAnswer.trim()) return
    const normalized = normalizeAnswer(openAnswer)
    const accepted = question.answer[lang].some((answer) => normalized.includes(normalizeAnswer(answer)))
    markResult(accepted, accepted ? question.feedback[lang] : copy.openWrongFeedback)
  }

  function handleDefinitionClick(definitionIndex) {
    if (answered || selectedTerm === null || matchedTerms.includes(selectedTerm)) return

    if (definitionIndex === selectedTerm) {
      const nextMatched = [...matchedTerms, selectedTerm]
      setMatchedTerms(nextMatched)
      setSelectedTerm(null)
      setWrongDefinition(null)
      if (nextMatched.length === matchingPairs.length) {
        markResult(true, question.feedback[lang])
      }
    } else {
      setWrongDefinition(definitionIndex)
      setTimeout(() => setWrongDefinition(null), 450)
    }
  }

  function handleNext() {
    if (isLast) {
      onComplete(Math.round((score / total) * level.pulse))
    } else {
      setQIndex((i) => i + 1)
    }
  }

  if (!briefingSeen) {
    return (
      <div className={`level-screen ${level.type === 'digital' ? 'level-screen--digital' : ''}`}>
        <GameChrome copy={copy} lang={lang} pulse={pulse} onLanguageToggle={onLanguageToggle} />
        <div className="level-screen__inner">
          <button className="level-screen__back" onClick={onBack}>
            ← {copy.back}
          </button>

          <div className="level-screen__briefing">
            <div className="level-screen__level-tag" style={{ color: level.color, borderColor: level.color + '40' }}>
              {level.subtitle[lang]} · {level.title[lang]}
            </div>
            <h1>{copy.briefingTitle}</h1>
            <p>{copy.briefingText}</p>

            <div className="level-screen__terms">
              {level.briefing[lang].map((item) => (
                <div className="term-card" key={item.term}>
                  <strong>{item.term}</strong>
                  <span>{item.definition}</span>
                </div>
              ))}
            </div>

            <button
              className="level-screen__next-btn"
              style={{ background: level.color }}
              onClick={() => setBriefingSeen(true)}
            >
              {copy.briefingStart} →
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`level-screen ${level.type === 'digital' ? 'level-screen--digital' : ''}`}>
      <GameChrome copy={copy} lang={lang} pulse={pulse} onLanguageToggle={onLanguageToggle} />
      <div className="level-screen__inner">
        <button className="level-screen__back" onClick={onBack}>
          ← {copy.back}
        </button>

        <div className="level-screen__header">
          <div className="level-screen__level-tag" style={{ color: level.color, borderColor: level.color + '40' }}>
            {level.subtitle[lang]} · {copy.activityTypes[question.type]}
          </div>
          <p className="level-screen__location">{level.location[lang]}</p>
          <div className="level-screen__player-chip">
            <img src={player?.skin} alt="" />
            <span>{player?.name}</span>
          </div>
          <div className="level-screen__progress-row">
            <span className="level-screen__progress-text">
              {qIndex + 1} / {total}
            </span>
            <div className="level-screen__progress-track">
              <div
                className="level-screen__progress-fill"
                style={{ width: `${progressPct}%`, background: level.color }}
              />
            </div>
            {isTimed && (
              <span className={`level-screen__timer ${timeLeft <= 4 && !answered ? 'level-screen__timer--danger' : ''}`}>
                {copy.timerLabel}: {timeLeft}
              </span>
            )}
          </div>
        </div>

        <div className="level-screen__question-card">
          {question.person && (
            <div className="level-screen__person">
              <img className="level-screen__person-avatar" src={question.skin} alt="" />
              <span>{question.person[lang]}</span>
            </div>
          )}
          <p className="level-screen__question-text">{question.text[lang]}</p>
          {question.hint && (
            <p className="level-screen__hint">{copy.hint}: {question.hint[lang]}</p>
          )}
        </div>

        {!isOpen && !isMatching && (
          <div className="level-screen__options">
            {question.options[lang].map((opt, i) => {
              let className = 'option-btn'
              if (answered) {
                if (i === question.correct) className += ' option-btn--correct'
                else if (i === selected) className += ' option-btn--wrong'
                else className += ' option-btn--dim'
              }
              return (
                <button
                  key={i}
                  className={className}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                >
                  <span className="option-btn__letter">
                    {['А', 'Б', 'В', 'Г'][i]}
                  </span>
                  <span className="option-btn__text">{opt}</span>
                </button>
              )
            })}
          </div>
        )}

        {isOpen && (
          <form className="level-screen__open-form" onSubmit={handleOpenSubmit}>
            <input
              value={openAnswer}
              onChange={(event) => setOpenAnswer(event.target.value)}
              placeholder={copy.answerPlaceholder}
              disabled={answered}
            />
            <button type="submit" disabled={answered || !openAnswer.trim()}>
              {copy.checkAnswer}
            </button>
          </form>
        )}

        {isMatching && (
          <div className="matching-game">
            <div className="matching-game__column">
              <h2>{lang === 'ru' ? 'Термины' : 'Терминдер'}</h2>
              {matchingPairs.map((pair, index) => (
                <button
                  key={pair.term}
                  className={`matching-card ${selectedTerm === index ? 'matching-card--active' : ''} ${matchedTerms.includes(index) ? 'matching-card--matched' : ''}`}
                  onClick={() => !matchedTerms.includes(index) && setSelectedTerm(index)}
                  disabled={matchedTerms.includes(index) || answered}
                  type="button"
                >
                  {pair.term}
                </button>
              ))}
            </div>

            <div className="matching-game__column">
              <h2>{lang === 'ru' ? 'Значения' : 'Мағыналары'}</h2>
              {definitionOrder.map((index) => {
                const pair = matchingPairs[index]
                return (
                  <button
                    key={pair.definition}
                    className={`matching-card matching-card--definition ${matchedTerms.includes(index) ? 'matching-card--matched' : ''} ${wrongDefinition === index ? 'matching-card--wrong' : ''}`}
                    onClick={() => handleDefinitionClick(index)}
                    disabled={matchedTerms.includes(index) || answered}
                    type="button"
                  >
                    {pair.definition}
                  </button>
                )
              })}
            </div>

            <div className="matching-game__meter">
              {matchedCount} / {matchingPairs.length}
            </div>
          </div>
        )}

        {answered && (
          <div
            className={`level-screen__feedback ${
              result.isCorrect
                ? 'level-screen__feedback--correct'
                : 'level-screen__feedback--wrong'
            }`}
          >
            <span className="level-screen__feedback-icon">
              {result.isCorrect ? '✓' : '✗'}
            </span>
            {result.feedback}
          </div>
        )}

        {answered && (
          <button
            className="level-screen__next-btn"
            style={{ background: level.color }}
            onClick={handleNext}
          >
            {isLast ? `${copy.finish} →` : `${copy.next} →`}
          </button>
        )}
      </div>
    </div>
  )
}

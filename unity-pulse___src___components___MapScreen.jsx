import React, { useEffect, useMemo, useRef, useState } from 'react'
import { LEVELS } from '../data/levels'
import GameChrome from './GameChrome'
import { useMapSize } from '../hooks/useMapSize'
import './MapScreen.css'

const START_BASE = { x: 340, y: 318 }

// Координаты зданий и окошек входа
const BUILDINGS_BASE = [
  {
    levelIndex: 0,
    type: 'museum',
    block: { x: 50, y: 114, width: 148, height: 92 },
    marker: { x: 100, y: 450, width: 148, height: 65 },
    door: { x: 200, y: 540, width: 50, height: 50 },
  },
  {
    levelIndex: 1,
    type: 'stories',
    block: { x: 315, y: 94, width: 170, height: 98 },
    marker: { x: 640, y: 430, width: 178, height: 70 },
    door: { x: 700, y: 530, width: 50, height: 50 },
  },
  {
    levelIndex: 2,
    type: 'digital',
    block: { x: 600, y: 86, width: 150, height: 108 },
    marker: { x: 1220, y: 430, width: 158, height: 75 },
    door: { x: 1270, y: 550, width: 50, height: 50 },
  },
]

// Маршруты жителей и КОТОВ (коты со скоростью 0)
const BASE_NPCS = [
  // Люди (большие, ходят)
  { id: 1, skin: '/skins/icon2.png', startX: 120, startY: 400, minX: 50, maxX: 1200, speed: 0.6, dir: 1, axis: 'x' },
  { id: 2, skin: '/skins/icon4.png', startX: 800, startY: 480, minY: 350, maxY: 650, speed: 0.5, dir: -1, axis: 'y' },
  { id: 3, skin: '/skins/icon3.png', startX: 100, startY: 65, minX: 150, maxX: 700, speed: 0.7, dir: 1, axis: 'x' },
  { id: 4, skin: '/skins/icon4.png', startX: 1200, startY: 490, minX: 1100, maxX: 1350, speed: 0.4, dir: -1, axis: 'x' },
  
  // Коты (маленькие, скорость 0 - стоят на месте)
  { id: 5, isCat: true, skin: '/skins/cat1.png', startX: 100, startY: 65, speed: 0, dir: 1, axis: 'x' },
  { id: 6, isCat: true, skin: '/skins/cat2.png', startX: 650, startY: 300, speed: 0, dir: -1, axis: 'x' },
  { id: 7, isCat: true, skin: '/skins/cat3.png', startX: 600, startY: 400, speed: 0, dir: 1, axis: 'x' },
]

function scaleBuilding(building, scaleRect) {
  return {
    levelIndex: building.levelIndex,
    type: building.type,
    block: scaleRect(building.block),
    door: scaleRect(building.door),
    marker: scaleRect(building.marker),
  }
}

function expandRect(rect, padding) {
  return {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  }
}

function pulseHint(copy, pulse) {
  if (pulse === 0) return copy.pulseHints[0]
  if (pulse > 0 && pulse < 66) return copy.pulseHints[1]
  if (pulse >= 66 && pulse < 100) return copy.pulseHints[2]
  return copy.pulseHints[3]
}

function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

export default function MapScreen({
  copy,
  lang,
  player,
  pulse,
  levelsDone,
  savedPosition,
  onPositionChange,
  onLanguageToggle,
  onSelectLevel,
}) {
  const mapSize = useMapSize()
  const { width, height, player: playerSize, scaleRect } = mapSize

  const buildings = useMemo(() => BUILDINGS_BASE.map((b) => scaleBuilding(b, scaleRect)), [scaleRect])
  const startPos = useMemo(() => {
    if (savedPosition) return savedPosition
    return scaleRect({ ...START_BASE, width: 0, height: 0 })
  }, [savedPosition, width, height, scaleRect])

  const [position, setPosition] = useState(startPos)
  const [npcs, setNpcs] = useState([])
  const keysRef = useRef(new Set())

  // Инициализация позиций NPC с учетом масштабирования
  useEffect(() => {
    setNpcs(BASE_NPCS.map(npc => ({
      ...npc,
      x: npc.startX * mapSize.scale,
      y: npc.startY * mapSize.scale,
      minX: npc.minX ? npc.minX * mapSize.scale : undefined,
      maxX: npc.maxX ? npc.maxX * mapSize.scale : undefined,
      minY: npc.minY ? npc.minY * mapSize.scale : undefined,
      maxY: npc.maxY ? npc.maxY * mapSize.scale : undefined,
    })))
  }, [mapSize.scale])

  useEffect(() => {
    if (!savedPosition) {
      setPosition(scaleRect({ ...START_BASE, width: 0, height: 0 }))
    }
  }, [scaleRect, savedPosition])

  function clampPosition(pos) {
    return {
      x: Math.max(16, Math.min(width - playerSize.width - 16, pos.x)),
      y: Math.max(72, Math.min(height - playerSize.height - 16, pos.y)),
    }
  }

  function isBlocked(pos) {
    const playerBox = { ...pos, ...playerSize }
    return buildings.some((building) => rectsOverlap(playerBox, building.block))
  }

  function getActiveBuilding(pos) {
    const playerBox = { ...pos, ...playerSize }
    const pad = 14 * mapSize.scale
    return buildings.find((building) => rectsOverlap(playerBox, expandRect(building.door, pad)))
  }

  const activeBuilding = getActiveBuilding(position)
  const activeLevel = activeBuilding ? LEVELS[activeBuilding.levelIndex] : null
  const activeLocked = activeBuilding ? activeBuilding.levelIndex > 0 && !levelsDone[activeBuilding.levelIndex - 1] : false

  const buildingState = useMemo(() => {
    return buildings.map((building) => ({
      ...building,
      level: LEVELS[building.levelIndex],
      done: levelsDone[building.levelIndex],
      locked: building.levelIndex > 0 && !levelsDone[building.levelIndex - 1],
    }))
  }, [buildings, levelsDone])

  useEffect(() => {
    onPositionChange(position)
  }, [onPositionChange, position])

  useEffect(() => {
    function keyDown(event) {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault()
        keysRef.current.add(event.key)
      }

      if ((event.key === 'Enter' || event.key === ' ') && activeBuilding && !activeLocked) {
        event.preventDefault()
        onSelectLevel(activeBuilding.levelIndex)
      }
    }

    function keyUp(event) {
      keysRef.current.delete(event.key)
    }

    window.addEventListener('keydown', keyDown)
    window.addEventListener('keyup', keyUp)
    return () => {
      window.removeEventListener('keydown', keyDown)
      window.removeEventListener('keyup', keyUp)
    }
  }, [activeBuilding, activeLocked, onSelectLevel])

  useEffect(() => {
    let frame
    let last = performance.now()

    function tick(now) {
      const delta = Math.min(32, now - last) / 16.67
      last = now
      
      // Движение главного игрока
      const speed = 3.1 * mapSize.scale * delta
      setPosition((current) => {
        let dx = 0
        let dy = 0
        if (keysRef.current.has('ArrowUp')) dy -= speed
        if (keysRef.current.has('ArrowDown')) dy += speed
        if (keysRef.current.has('ArrowLeft')) dx -= speed
        if (keysRef.current.has('ArrowRight')) dx += speed
        if (dx === 0 && dy === 0) return current

        const normalized = dx !== 0 && dy !== 0 ? 0.72 : 1
        const nextX = clampPosition({ x: current.x + dx * normalized, y: current.y })
        const nextY = clampPosition({ x: nextX.x, y: current.y + dy * normalized })

        if (!isBlocked(nextY)) return nextY
        if (!isBlocked(nextX)) return nextX

        const yOnly = clampPosition({ x: current.x, y: current.y + dy * normalized })
        if (!isBlocked(yOnly)) return yOnly
        return current
      })

      // Движение NPC и котов по осям X и Y
      setNpcs((currentNpcs) => currentNpcs.map(npc => {
        let nextX = npc.x
        let nextY = npc.y
        let nextDir = npc.dir

        if (npc.speed > 0) {
          if (npc.axis === 'y') {
            nextY = npc.y + npc.speed * npc.dir * mapSize.scale * delta
            if (npc.maxY !== undefined && nextY > npc.maxY) {
              nextY = npc.maxY
              nextDir = -1
            } else if (npc.minY !== undefined && nextY < npc.minY) {
              nextY = npc.minY
              nextDir = 1
            }
          } else {
            nextX = npc.x + npc.speed * npc.dir * mapSize.scale * delta
            if (npc.maxX !== undefined && nextX > npc.maxX) {
              nextX = npc.maxX
              nextDir = -1
            } else if (npc.minX !== undefined && nextX < npc.minX) {
              nextX = npc.minX
              nextDir = 1
            }
          }
        }

        return { ...npc, x: nextX, y: nextY, dir: nextDir }
      }))

      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [width, height, mapSize.scale, buildings, playerSize.width, playerSize.height])

  return (
    <div className="map map--fullscreen">
      <GameChrome
        copy={copy}
        lang={lang}
        pulse={pulse}
        hint={pulseHint(copy, pulse)}
        onLanguageToggle={onLanguageToggle}
      />

      <div
        className="city-map"
        style={{ width, height }}
      >
        {buildingState.map((building) => (
          <button
            key={building.level.id}
            className={`city-building city-building--${building.type} ${building.done ? 'city-building--done' : ''} ${building.locked ? 'city-building--locked' : ''}`}
            style={{
              left: building.marker.x,
              top: building.marker.y,
              width: building.marker.width,
              height: building.marker.height,
            }}
            onClick={() => !building.locked && onSelectLevel(building.levelIndex)}
            type="button"
          >
            <span className="city-building__label">{building.level.title[lang]}</span>
            <span className="city-building__status">
              {building.done ? `✓ ${copy.done}` : building.locked ? copy.locked : copy.enterHint}
            </span>
          </button>
        ))}

        {buildingState.map((building) => (
          <div
            key={`${building.level.id}-door`}
            className={`city-map__door ${activeBuilding?.levelIndex === building.levelIndex ? 'city-map__door--active' : ''}`}
            style={{
              left: building.door.x,
              top: building.door.y,
              width: building.door.width,
              height: building.door.height,
            }}
          />
        ))}

        {/* Рендер бродячих персонажей и стоящих котов */}
        {npcs.map(npc => (
          <div
            key={npc.id}
            className={`city-npc ${npc.dir === -1 && npc.axis === 'x' ? 'city-npc--flip' : ''}`}
            style={{
              left: npc.x,
              top: npc.y,
              // Если это кот, делаем его размер 0.45, людей оставляем большими (1.1)
              width: playerSize.width * (npc.isCat ? 0.45 : 1.1),
              height: playerSize.height * (npc.isCat ? 0.45 : 1.1),
            }}
          >
            <img src={npc.skin} alt="" />
          </div>
        ))}

        <div
          className="city-player"
          style={{
            left: position.x,
            top: position.y,
            width: playerSize.width,
            height: playerSize.height,
          }}
        >
          <span className="city-player__name">{player?.name}</span>
          <img src={player?.skin} alt="" />
        </div>
      </div>

      <div className="map__hint-bar">
        <p>{copy.moveHint}</p>
        {activeLevel && (
          <strong style={{ color: activeLocked ? '#e24b4a' : activeLevel.color }}>
            {activeLocked ? copy.locked : `${copy.enterHint}: ${activeLevel.title[lang]}`}
          </strong>
        )}
      </div>
    </div>
  )
}
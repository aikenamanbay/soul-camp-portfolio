import React, { useState } from 'react';
import { Stage, Sprite, useTick } from '@pixi/react';
import useKeyboard from '../hooks/useKeyboard';

// Внутренний компонент для Игрока
function Player({ skin }) {
  const [position, setPosition] = useState({ x: 400, y: 300 });
  const keys = useKeyboard();
  const speed = 5;

  // useTick — это игровой цикл PixiJS, он обновляется 60 раз в секунду
  useTick(() => {
    let dx = 0;
    let dy = 0;

    if (keys.w || keys.ArrowUp) dy -= speed;
    if (keys.s || keys.ArrowDown) dy += speed;
    if (keys.a || keys.ArrowLeft) dx -= speed;
    if (keys.d || keys.ArrowRight) dx += speed;

    if (dx !== 0 || dy !== 0) {
      setPosition((prev) => ({
        x: prev.x + dx,
        y: prev.y + dy,
      }));
    }
  });

  return (
    <Sprite
      image={skin || "https://pixijs.com/assets/bunny.png"} // Временно поставим кролика, если нет картинки
      x={position.x}
      y={position.y}
      anchor={0.5} // Центрируем спрайт
      scale={2} // Увеличиваем размер
    />
  );
}

// Главный компонент карты
export default function UnityCity({ player }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
      {/* Stage — это наш холст, где происходит игра */}
      <Stage width={800} height={600} options={{ backgroundColor: 0x87CEEB }}>
        <Player skin={player?.skin} />
      </Stage>
    </div>
  );
}
"use client";

import { useRef, useEffect, useState } from "react";

export default function ShootingGame() {
  const shootSound = useRef(null);
  const hitSound = useRef(null);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const player = { x: 200, y: 360, width: 30, height: 30 };
  const bullets = useRef([]);
  const enemies = useRef([]);
  const keys = useRef({});

  useEffect(() => {
    shootSound.current = new Audio("/sounds/shoot.wav");
    hitSound.current = new Audio("/sounds/hit.wav");
  }, []);

  const playHitSound = () => {
    if (hitSound.current) {
      hitSound.current.currentTime = 0;
      hitSound.current.play();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let animationFrameId;

    const spawnEnemy = () => {
      enemies.current.push({
        x: Math.random() * 370,
        y: -20,
        width: 30,
        height: 30,
        speed: 2 + Math.random() * 2,
      });
    };

    const handleKeyDown = (e) => (keys.current[e.key] = true);
    const handleKeyUp = (e) => (keys.current[e.key] = false);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    let lastSpawn = Date.now();

    const gameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move player with mouse
      canvas.onmousemove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        player.x = Math.max(
          0,
          Math.min(mouseX - player.width / 2, canvas.width - player.width)
        );
      };

      const shoot = () => {
        bullets.current.push({ x: player.x + 12, y: player.y, speed: 5 });
        shootSound.current?.play();
      };

      // Shoot with mouse click
      canvas.onclick = () => {
        shoot();
      };

      // Draw player
      ctx.fillStyle = "lightgreen";
      ctx.fillRect(player.x, player.y, player.width, player.height);

      // Update and draw bullets
      bullets.current = bullets.current.filter((b) => b.y > -10);
      bullets.current.forEach((b) => {
        b.y -= b.speed;
        ctx.fillStyle = "blue";
        ctx.fillRect(b.x, b.y, 6, 10);
      });

      // Spawn enemies
      if (Date.now() - lastSpawn > 500) {
        spawnEnemy();
        lastSpawn = Date.now();
      }

      // Update and draw enemies
      enemies.current = enemies.current.filter((e) => e.y < canvas.height);
      enemies.current.forEach((e) => {
        e.y += e.speed;
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(e.x, e.y, e.width, e.height);

        // Collision with player
        if (
          e.x < player.x + player.width &&
          e.x + e.width > player.x &&
          e.y < player.y + player.height &&
          e.y + e.height > player.y
        ) {
          setGameOver(true);
        }
      });

      // Bullet and enemy collision
      bullets.current.forEach((b, bi) => {
        enemies.current.forEach((e, ei) => {
          if (
            b.x < e.x + e.width &&
            b.x + 6 > e.x &&
            b.y < e.y + e.height &&
            b.y + 10 > e.y
          ) {
            bullets.current.splice(bi, 1);
            enemies.current.splice(ei, 1);

            if (hitSound.current) {
              hitSound.current.currentTime = 0;
              hitSound.current.play();
            }

            setScore((s) => s + 1);
          }
        });
      });

      if (!gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop);
      } else {
        ctx.fillStyle = "black";
        ctx.font = "24px sans-serif";
        ctx.fillText("Game Over", 120, 200);
        ctx.fillText("Score: " + score, 130, 240);
      }
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameOver]);

  const restart = () => {
    bullets.current = [];
    enemies.current = [];
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 font-sriracha">
      <h1 className="text-2xl text-black font-bold mb-4">Shooting Game 🚀</h1>
      <canvas
        ref={canvasRef}
        width={400}
        height={400}
        className="border-4 border-black bg-white"
      />
      <div className="mt-4 text-lg text-black">
        <p>Score: {score}</p>
        {gameOver && (
          <button
            onClick={restart}
            className="mt-3 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Restart
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-gray-600">
        ใช้เมาส์เพื่อเลื่อนปืน คลิกเพื่อยิง
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-3 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
      >
        Go Back
      </button>
    </div>
  );
}

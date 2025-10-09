"use client";

import React, { useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export function AsteroidsUI() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<() => void>();

  const startGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const state = {
      ship: { x: canvas.width / 2, y: canvas.height / 2, angle: 0, velocity: { x: 0, y: 0 }, radius: 15 },
      bullets: [] as { x: number, y: number, angle: number, life: number }[],
      asteroids: [] as { x: number, y: number, radius: number, velocity: { x: number, y: number } }[],
      keys: { ArrowUp: false, ArrowLeft: false, ArrowRight: false, Space: false },
      score: 0,
      gameOver: false,
    };

    const SHIP_THRUST = 0.1;
    const SHIP_TURN_SPEED = 0.1;
    const FRICTION = 0.99;
    const BULLET_SPEED = 5;
    const BULLET_LIFE = 60;
    const ASTEROID_SPEED = 1;
    const ASTEROID_COUNT = 3;

    // Initialize Asteroids
    for (let i = 0; i < ASTEROID_COUNT; i++) {
        state.asteroids.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 30,
            velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
        });
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key.startsWith('Arrow')) e.preventDefault();
      if (e.key === ' ') state.keys.Space = true;
      if (state.keys.hasOwnProperty(e.key)) state.keys[e.key as keyof typeof state.keys] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ') state.keys.Space = false;
      if (state.keys.hasOwnProperty(e.key)) state.keys[e.key as keyof typeof state.keys] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    function update() {
      if (state.gameOver || !canvas || !ctx) return;

      const { ship, bullets, asteroids, keys } = state;
      
      // Update ship
      if (keys.ArrowUp) {
        ship.velocity.x += Math.cos(ship.angle) * SHIP_THRUST;
        ship.velocity.y += Math.sin(ship.angle) * SHIP_THRUST;
      }
      if (keys.ArrowLeft) ship.angle -= SHIP_TURN_SPEED;
      if (keys.ArrowRight) ship.angle += SHIP_TURN_SPEED;

      ship.velocity.x *= FRICTION;
      ship.velocity.y *= FRICTION;
      ship.x += ship.velocity.x;
      ship.y += ship.velocity.y;

      // Screen wrap
      if (ship.x < 0) ship.x = canvas.width;
      if (ship.x > canvas.width) ship.x = 0;
      if (ship.y < 0) ship.y = canvas.height;
      if (ship.y > canvas.height) ship.y = 0;

      // Shoot
      if (keys.Space) {
        bullets.push({ x: ship.x, y: ship.y, angle: ship.angle, life: BULLET_LIFE });
        keys.Space = false; // Prevent holding space
      }

      // Update bullets
      state.bullets = bullets.filter(b => b.life > 0).map(b => {
        b.x += Math.cos(b.angle) * BULLET_SPEED;
        b.y += Math.sin(b.angle) * BULLET_SPEED;
        b.life--;
        // Screen wrap for bullets
        if (b.x < 0) b.x = canvas.width;
        if (b.x > canvas.width) b.x = 0;
        if (b.y < 0) b.y = canvas.height;
        if (b.y > canvas.height) b.y = 0;
        return b;
      });

      // Update asteroids and check collisions
      const newAsteroids: typeof asteroids = [];
      asteroids.forEach(a => {
        a.x += a.velocity.x * ASTEROID_SPEED;
        a.y += a.velocity.y * ASTEROID_SPEED;
        
        if (a.x < 0) a.x = canvas.width;
        if (a.x > canvas.width) a.x = 0;
        if (a.y < 0) a.y = canvas.height;
        if (a.y > canvas.height) a.y = 0;

        let hit = false;
        state.bullets = bullets.filter(b => {
            const dist = Math.hypot(a.x - b.x, a.y - b.y);
            if(dist < a.radius) {
                hit = true;
                return false; // remove bullet
            }
            return true;
        });

        if(hit){
            state.score += 10;
            if(a.radius > 15) {
                newAsteroids.push({ ...a, radius: a.radius / 2, velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }});
                newAsteroids.push({ ...a, radius: a.radius / 2, velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }});
            }
        } else {
            newAsteroids.push(a);
        }

        // Ship-asteroid collision
        const dist = Math.hypot(a.x - ship.x, a.y - ship.y);
        if(dist < a.radius + ship.radius) {
            state.gameOver = true;
        }
      });
      state.asteroids = newAsteroids;
      
      if(state.asteroids.length === 0){
          // next level
          for (let i = 0; i < ASTEROID_COUNT + Math.floor(state.score/100) ; i++) {
              state.asteroids.push({
                  x: Math.random() * canvas.width,
                  y: Math.random() * canvas.height,
                  radius: 30,
                  velocity: { x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 }
              });
          }
      }
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw ship
      ctx.save();
      ctx.translate(state.ship.x, state.ship.y);
      ctx.rotate(state.ship.angle);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -10);
      ctx.lineTo(-10, 10);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Draw bullets
      ctx.fillStyle = '#fff';
      state.bullets.forEach(b => ctx.fillRect(b.x, b.y, 2, 2));

      // Draw asteroids
      ctx.strokeStyle = '#fff';
      state.asteroids.forEach(a => {
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        ctx.stroke();
      });
      
      // Draw score
      ctx.fillStyle = '#fff';
      ctx.font = '20px Arial';
      ctx.fillText(`Score: ${state.score}`, 10, 30);
      
      if(state.gameOver){
          ctx.font = '50px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
      }
    }

    function loop() {
      update();
      draw();
      animationFrameId = requestAnimationFrame(loop);
    }
    
    loop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    gameLoopRef.current = startGame();
    return () => gameLoopRef.current?.();
  }, [startGame]);

  return (
    <Card className="shadow-2xl overflow-hidden">
        <CardContent className="p-2 md:p-4 bg-black">
            <canvas ref={canvasRef} width="800" height="600" className="w-full h-auto rounded-lg"></canvas>
        </CardContent>
        <CardFooter className="bg-black pt-4">
            <Button onClick={startGame} className="w-full"><RotateCcw className="mr-2"/>Restart Game</Button>
        </CardFooter>
    </Card>
  );
}

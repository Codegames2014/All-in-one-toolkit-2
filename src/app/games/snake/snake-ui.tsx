"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 15, y: 15 };
const GAME_SPEED = 150;

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Coord = { x: number; y: number };

export function SnakeUI() {
  const [snake, setSnake] = useState<Coord[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coord>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  const resetGame = useCallback(() => {
    setSnake(INITIAL_SNAKE);
    setFood(INITIAL_FOOD);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
  }, []);

  const generateFood = useCallback(() => {
    let newFood: Coord;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    setFood(newFood);
  }, [snake]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        setDirection(prev => (prev !== 'DOWN' ? 'UP' : prev));
        break;
      case 'ArrowDown':
        setDirection(prev => (prev !== 'UP' ? 'DOWN' : prev));
        break;
      case 'ArrowLeft':
        setDirection(prev => (prev !== 'RIGHT' ? 'LEFT' : prev));
        break;
      case 'ArrowRight':
        setDirection(prev => (prev !== 'LEFT' ? 'RIGHT' : prev));
        break;
    }
  }, []);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (gameOver) {
        toast({
            title: "Game Over!",
            description: `Your final score is ${score}.`,
            variant: "destructive"
        })
        return;
    };

    const gameInterval = setInterval(() => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake];
        let head = { ...newSnake[0] };

        switch (direction) {
          case 'UP': head.y -= 1; break;
          case 'DOWN': head.y += 1; break;
          case 'LEFT': head.x -= 1; break;
          case 'RIGHT': head.x += 1; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
          setGameOver(true);
          return newSnake;
        }

        // Self collision
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return newSnake;
        }

        newSnake.unshift(head);

        // Food collision
        if (head.x === food.x && head.y === food.y) {
            setScore(s => s + 1);
            generateFood();
        } else {
            newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => clearInterval(gameInterval);
  }, [snake, direction, food, gameOver, score, generateFood, toast]);

  return (
    <Card className="shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Snake</CardTitle>
        <div className="bg-muted px-4 py-2 rounded-lg font-bold text-xl">
            Score: {score}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-20 grid-rows-20 aspect-square border-2 border-primary bg-background">
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnake = snake.some(seg => seg.x === x && seg.y === y);
            const isFood = food.x === x && food.y === y;
            return (
              <div
                key={i}
                className={cn(
                  'w-full h-full',
                  isSnake && 'bg-green-500',
                  isFood && 'bg-red-500'
                )}
              />
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetGame} className="w-full">
            <RotateCcw className="mr-2" /> New Game
        </Button>
      </CardFooter>
    </Card>
  );
}

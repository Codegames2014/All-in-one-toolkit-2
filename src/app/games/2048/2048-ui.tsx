"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

type Board = (number | null)[][];
const GRID_SIZE = 4;

const TILE_COLORS: Record<number, string> = {
  2: 'bg-gray-200 text-gray-800',
  4: 'bg-yellow-200 text-gray-800',
  8: 'bg-orange-300 text-white',
  16: 'bg-orange-400 text-white',
  32: 'bg-red-400 text-white',
  64: 'bg-red-500 text-white',
  128: 'bg-yellow-400 text-white',
  256: 'bg-yellow-500 text-white',
  512: 'bg-yellow-600 text-white',
  1024: 'bg-indigo-400 text-white',
  2048: 'bg-indigo-600 text-white',
};

const createEmptyBoard = (): Board => Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));

const addRandomTile = (board: Board): Board => {
  let emptyTiles: { row: number, col: number }[] = [];
  board.forEach((row, r) => {
    row.forEach((_, c) => {
      if (board[r][c] === null) {
        emptyTiles.push({ row: r, col: c });
      }
    });
  });

  if (emptyTiles.length > 0) {
    const { row, col } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  }
  return board;
};

export function Game2048UI() {
  const [board, setBoard] = useState<Board>(createEmptyBoard());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(false);

  const resetGame = useCallback(() => {
    let newBoard = createEmptyBoard();
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
    setWinner(false);
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const slideAndCombine = (row: (number | null)[]): { newRow: (number | null)[], points: number } => {
    const filteredRow = row.filter(tile => tile !== null);
    const newRow = [];
    let points = 0;
    for (let i = 0; i < filteredRow.length; i++) {
      if (i < filteredRow.length - 1 && filteredRow[i] === filteredRow[i + 1]) {
        const newValue = filteredRow[i]! * 2;
        newRow.push(newValue);
        points += newValue;
        if(newValue === 2048) setWinner(true);
        i++;
      } else {
        newRow.push(filteredRow[i]);
      }
    }
    while (newRow.length < GRID_SIZE) {
      newRow.push(null);
    }
    return { newRow, points };
  };

  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    let newBoard = board.map(row => [...row]);
    let totalPoints = 0;
    let moved = false;

    const rotateBoard = (b: Board, times: number): Board => {
      let result = b.map(r => [...r]);
      for (let i = 0; i < times; i++) {
        result = result[0].map((_, colIndex) => result.map(row => row[colIndex]).reverse());
      }
      return result;
    };

    const rotations = { left: 0, right: 2, up: 1, down: 3 };
    const numRotations = rotations[direction];
    
    newBoard = rotateBoard(newBoard, numRotations);

    for (let i = 0; i < GRID_SIZE; i++) {
      const { newRow, points } = slideAndCombine(newBoard[i]);
      if(JSON.stringify(newBoard[i]) !== JSON.stringify(newRow)){
        moved = true;
      }
      newBoard[i] = newRow;
      totalPoints += points;
    }

    newBoard = rotateBoard(newBoard, (4 - numRotations) % 4);

    if (moved) {
        newBoard = addRandomTile(newBoard);
        setBoard(newBoard);
        setScore(s => s + totalPoints);

        // Check for game over
        const hasEmpty = newBoard.some(row => row.some(cell => cell === null));
        if(!hasEmpty){
            let canMove = false;
            for(let r=0; r<GRID_SIZE; r++){
                for(let c=0; c<GRID_SIZE; c++){
                    const val = newBoard[r][c];
                    if((r < GRID_SIZE - 1 && newBoard[r+1][c] === val) || (c < GRID_SIZE-1 && newBoard[r][c+1] === val)) {
                        canMove = true;
                        break;
                    }
                }
                if(canMove) break;
            }
            if(!canMove) setGameOver(true);
        }
    }
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp': move('up'); break;
      case 'ArrowDown': move('down'); break;
      case 'ArrowLeft': move('left'); break;
      case 'ArrowRight': move('right'); break;
    }
  }, [move]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Card className="shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>2048</CardTitle>
        <div className="bg-muted px-4 py-2 rounded-lg font-bold text-xl">
          Score: {score}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-800 p-2 rounded-lg grid grid-cols-4 gap-2 aspect-square">
          {board.map((row, rIdx) => (
            row.map((tile, cIdx) => (
              <div key={`${rIdx}-${cIdx}`} className="bg-gray-700 rounded flex items-center justify-center">
                {tile && (
                  <div className={cn("w-full h-full rounded flex items-center justify-center text-2xl md:text-4xl font-bold", TILE_COLORS[tile] || 'bg-gray-300')}>
                    {tile}
                  </div>
                )}
              </div>
            ))
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={resetGame} className="w-full">
            <RotateCcw className="mr-2" /> New Game
        </Button>
      </CardFooter>
      <Dialog open={gameOver || winner} onOpenChange={(isOpen) => !isOpen && resetGame()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center">
              {winner && <Award className="w-12 h-12 text-yellow-500 mr-4" />}
              {winner ? "You Win!" : "Game Over!"}
            </DialogTitle>
            <DialogDescription className="text-xl text-center py-4">
              Your final score is {score}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={resetGame} className="w-full">Play Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

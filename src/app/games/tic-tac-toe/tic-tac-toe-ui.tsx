"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Award, RotateCcw, X, Circle } from 'lucide-react';

type Player = 'X' | 'O';
type Square = Player | null;

const calculateWinner = (squares: Square[]): Player | null => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

const SquareComponent = ({ value, onClick }: { value: Square, onClick: () => void }) => (
  <Button
    variant="outline"
    className="h-24 w-24 rounded-lg flex items-center justify-center text-6xl font-bold"
    onClick={onClick}
    aria-label={`Square ${value || 'empty'}`}
  >
    {value === 'X' && <X className="h-16 w-16 text-red-500" />}
    {value === 'O' && <Circle className="h-14 w-14 text-blue-500" />}
  </Button>
);

export function TicTacToeUI() {
  const [squares, setSquares] = useState<Square[]>(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState<Player | null>(null);
  const [isDraw, setIsDraw] = useState(false);

  useEffect(() => {
    const calculatedWinner = calculateWinner(squares);
    if (calculatedWinner) {
      setWinner(calculatedWinner);
    } else if (squares.every(Boolean)) {
      setIsDraw(true);
    }
  }, [squares]);

  const handleClick = (i: number) => {
    if (winner || squares[i]) {
      return;
    }
    const newSquares = squares.slice();
    newSquares[i] = xIsNext ? 'X' : 'O';
    setSquares(newSquares);
    setXIsNext(!xIsNext);
  };

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setIsDraw(false);
  };

  let status;
  if (winner) {
    status = (
      <div className="flex items-center justify-center text-2xl font-bold text-primary">
        <Award className="mr-2 h-8 w-8" />
        Winner: {winner}
      </div>
    );
  } else if (isDraw) {
    status = <div className="text-2xl font-bold text-muted-foreground">It's a Draw!</div>;
  } else {
    status = `Next player: ${xIsNext ? 'X' : 'O'}`;
  }

  return (
    <Card className="shadow-2xl">
      <CardContent className="p-6 space-y-6">
        <div className="text-xl font-semibold text-center mb-4">{status}</div>
        <div className="grid grid-cols-3 gap-2">
          {squares.map((square, i) => (
            <SquareComponent key={i} value={square} onClick={() => handleClick(i)} />
          ))}
        </div>
        <Button onClick={resetGame} className="w-full">
          <RotateCcw className="mr-2 h-4 w-4" />
          New Game
        </Button>
      </CardContent>
    </Card>
  );
}
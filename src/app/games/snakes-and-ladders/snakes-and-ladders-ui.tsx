"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw, Dices, User, Bot } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const BOARD_SIZE = 10;
const TOTAL_SQUARES = BOARD_SIZE * BOARD_SIZE;

const SNAKES: Record<number, number> = {
  17: 7, 54: 34, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 99: 78,
};
const LADDERS: Record<number, number> = {
  4: 14, 9: 31, 20: 38, 28: 84, 40: 59, 51: 67, 63: 81, 71: 91,
};

const PlayerPiece = ({ color, isAI }: { color: string, isAI: boolean }) => (
  <div className={cn("w-full h-full rounded-full flex items-center justify-center text-white transition-all duration-300 border-2 border-black/20 shadow-lg", color)}>
    {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
  </div>
);

const GameBoard = ({ players }: { players: Player[] }) => {
  const board = useMemo(() => {
    const squares = Array.from({ length: TOTAL_SQUARES }, (_, i) => TOTAL_SQUARES - i);
    const rows: number[][] = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
      let row = squares.slice(i * BOARD_SIZE, (i + 1) * BOARD_SIZE);
      if (i % 2 !== 0) {
        row.reverse();
      }
      rows.push(row);
    }
    return rows;
  }, []);

  return (
    <div className="relative bg-green-200 dark:bg-green-900 p-2 rounded-lg shadow-lg aspect-square max-w-xl mx-auto border-4 border-yellow-700">
      <div className="grid grid-cols-10 grid-rows-10 w-full h-full">
        {board.flat().map((number) => {
          const isSnakeStart = !!SNAKES[number];
          const isLadderStart = !!LADDERS[number];
          const isEven = (Math.floor((number-1) / 10) + ((number-1)%10)) % 2 === 0;

          return (
            <div
              key={number}
              className={cn(
                "w-full h-full relative border border-black/10 flex items-center justify-center",
                isEven ? "bg-yellow-100 dark:bg-yellow-800" : "bg-yellow-200 dark:bg-yellow-700"
              )}
            >
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{number}</span>
              {isSnakeStart && <div className="absolute text-2xl">🐍</div>}
              {isLadderStart && <div className="absolute text-2xl">🪜</div>}
            </div>
          );
        })}
      </div>
      {players.map(player => {
        const row = BOARD_SIZE - 1 - Math.floor((player.position - 1) / BOARD_SIZE);
        let col = (player.position - 1) % BOARD_SIZE;
        if(row % 2 !== (BOARD_SIZE -1) % 2) {
            col = BOARD_SIZE - 1 - col;
        }

        const playersOnSquare = players.filter(p => p.position === player.position);
        const playerIndexOnSquare = playersOnSquare.findIndex(p => p.id === player.id);

        return (
            <div 
                key={player.id} 
                className="absolute w-[10%] h-[10%] p-1 transition-all duration-500 ease-in-out"
                style={{
                    top: `${row * 10}%`,
                    left: `${col * 10}%`,
                    transform: `translate(${playerIndexOnSquare * 20 - (playersOnSquare.length-1)*10}%, ${playerIndexOnSquare * 20 - (playersOnSquare.length-1)*10}%)`
                }}
            >
                <PlayerPiece color={player.color} isAI={player.isAI}/>
            </div>
        )
      })}
    </div>
  );
};

interface Player {
    id: number;
    name: string;
    position: number;
    color: string;
    isAI: boolean;
}


export function SnakesAndLaddersUI() {
    const [players, setPlayers] = useState<Player[]>([]);
    const [activePlayerIndex, setActivePlayerIndex] = useState(0);
    const [diceValue, setDiceValue] = useState<number>(0);
    const [isRolling, setIsRolling] = useState(false);
    const [winner, setWinner] = useState<Player | null>(null);
    const [status, setStatus] = useState("Player 1's turn to roll!");
    
    const initGame = useCallback(() => {
        setPlayers([
            { id: 1, name: 'Player 1', position: 1, color: 'bg-red-500', isAI: false },
            { id: 2, name: 'AI', position: 1, color: 'bg-blue-500', isAI: true },
        ]);
        setActivePlayerIndex(0);
        setDiceValue(0);
        setWinner(null);
        setStatus("Player 1's turn to roll!");
    }, []);

    useEffect(() => {
        initGame();
    }, [initGame]);

    const activePlayer = players[activePlayerIndex];

    const rollDice = () => {
        if (activePlayer?.isAI || isRolling || winner) return;
        
        setIsRolling(true);
        setTimeout(() => {
            const roll = Math.floor(Math.random() * 6) + 1;
            setDiceValue(roll);
            setIsRolling(false);
            movePlayer(roll);
        }, 500);
    };

    const movePlayer = useCallback((roll: number) => {
        if (!activePlayer) return;

        let newPosition = activePlayer.position + roll;
        if (newPosition > TOTAL_SQUARES) {
            newPosition = activePlayer.position; // Can't move past 100
        }

        setTimeout(() => {
            setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, position: newPosition } : p));
            
            // Check for snakes or ladders
            if (SNAKES[newPosition]) {
                setStatus(`${activePlayer.name} stepped on a snake! 🐍`);
                newPosition = SNAKES[newPosition];
            } else if (LADDERS[newPosition]) {
                setStatus(`${activePlayer.name} found a ladder! 🪜`);
                newPosition = LADDERS[newPosition];
            }

            setTimeout(() => {
                 setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, position: newPosition } : p));
                 if (newPosition === TOTAL_SQUARES) {
                     setWinner(activePlayer);
                     setStatus(`${activePlayer.name} wins! 🎉`);
                 } else {
                     nextTurn(roll);
                 }
            }, 1000);
        }, 500);

    }, [activePlayer]);

    const nextTurn = (roll: number) => {
        if (roll !== 6) {
            setActivePlayerIndex(prev => (prev + 1) % players.length);
        } else {
            setStatus(`${activePlayer.name} rolled a 6 and gets another turn!`);
        }
        setDiceValue(0);
    };
    
    useEffect(() => {
        const currentPlayer = players[activePlayerIndex];
        if(currentPlayer?.isAI && !winner && !isRolling) {
            setStatus("AI is thinking...");
            setTimeout(() => {
                const roll = Math.floor(Math.random() * 6) + 1;
                setDiceValue(roll);
                movePlayer(roll);
            }, 1500);
        } else if(currentPlayer) {
            setStatus(`${currentPlayer.name}'s turn to roll!`);
        }
    }, [activePlayerIndex, players, winner, isRolling, movePlayer]);

    if(players.length === 0) return <div>Loading...</div>;

  return (
    <Card className="shadow-2xl bg-stone-100 dark:bg-gray-900">
      <CardContent className="p-2 md:p-6 flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="flex-shrink-0 w-full lg:w-64 space-y-4 text-center order-2 lg:order-1">
          <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardContent className="p-4">
              <h3 className="text-xl font-bold mb-2">Game Status</h3>
              <p className="text-lg font-semibold capitalize">{status}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardContent className="p-4 flex flex-col items-center gap-4">
              <h3 className="text-xl font-bold">Dice</h3>
                <Button onClick={rollDice} disabled={isRolling || activePlayer?.isAI || winner} size="lg" className="w-24 h-24 text-6xl font-bold text-white shadow-lg bg-red-600 hover:bg-red-700">
                    {isRolling ? <Dices className="animate-spin"/> : diceValue || <Dices />}
                </Button>
               <p className="text-sm text-muted-foreground">Turn: <span className="font-bold text-lg capitalize">{activePlayer.name}</span></p>
            </CardContent>
          </Card>

          <Button onClick={initGame} variant="secondary" className="w-full">
            <RotateCcw className="mr-2" /> New Game
          </Button>
        </div>

        <div className="order-1 lg:order-2 w-full max-w-xl">
            <GameBoard players={players} />
        </div>
        
        <Dialog open={!!winner} onOpenChange={(isOpen) => !isOpen && setWinner(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center">
                        <Award className="w-12 h-12 text-yellow-500 mr-4" />
                        Game Over!
                    </DialogTitle>
                    <DialogDescription className="text-xl text-center py-4 capitalize">
                        <span className="font-bold">{winner?.name}</span> wins the game!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button onClick={initGame} className="w-full">Play Again</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

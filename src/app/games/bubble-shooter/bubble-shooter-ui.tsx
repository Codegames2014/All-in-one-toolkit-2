"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const BUBBLE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#8b5cf6'];
const BUBBLE_DIAMETER = 40;
const ROWS = 12;
const COLS = 13;
const BUBBLE_RADIUS = BUBBLE_DIAMETER / 2;

type Bubble = {
  id: number;
  color: string;
  row: number;
  col: number;
};

type FloatingBubble = Bubble & {
    dx: number;
    dy: number;
}

export function BubbleShooterUI() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shooterBubble, setShooterBubble] = useState<Bubble | null>(null);
  const [nextBubble, setNextBubble] = useState<Bubble | null>(null);
  const [floatingBubble, setFloatingBubble] = useState<FloatingBubble | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const gameBoardRef = useRef<HTMLDivElement>(null);
  let idCounter = useRef(0);
  
  const getGridPos = (row: number, col: number) => {
      const x = col * BUBBLE_DIAMETER + (row % 2 ? BUBBLE_RADIUS : 0);
      const y = row * (BUBBLE_DIAMETER - 6);
      return {x, y};
  }

  const initGame = useCallback(() => {
    let newBubbles: Bubble[] = [];
    idCounter.current = 0;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < COLS - (row % 2); col++) {
        newBubbles.push({
          id: idCounter.current++,
          color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
          row,
          col,
        });
      }
    }
    setBubbles(newBubbles);
    setShooterBubble({ id: idCounter.current++, color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)], row: ROWS, col: Math.floor(COLS/2), });
    setNextBubble({ id: idCounter.current++, color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)], row: -1, col: -1, });
    setFloatingBubble(null);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const handleShoot = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!gameBoardRef.current || !shooterBubble || floatingBubble || gameOver) return;

    const boardRect = gameBoardRef.current.getBoundingClientRect();
    const shooterPos = getGridPos(ROWS, Math.floor(COLS/2));

    const angle = Math.atan2(e.clientY - (boardRect.top + shooterPos.y), e.clientX - (boardRect.left + shooterPos.x + BUBBLE_RADIUS));
    
    if (angle > -0.2 || angle < -Math.PI + 0.2) return;

    setFloatingBubble({
        ...shooterBubble,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,
    });
    setShooterBubble(null);
  };
  
  useEffect(() => {
    if (!floatingBubble) return;

    const animate = () => {
        let newFloatingBubble: FloatingBubble | null = {...floatingBubble};
        const {x: currentX, y: currentY} = getGridPos(newFloatingBubble.row, newFloatingBubble.col);
        let newX = currentX + newFloatingBubble.dx;
        let newY = currentY + newFloatingBubble.dy;

        // Wall bounce
        if (newX < 0 || newX > (COLS * BUBBLE_DIAMETER) - BUBBLE_DIAMETER) {
            newFloatingBubble.dx *= -1;
            newX += newFloatingBubble.dx;
        }
        
        // Collision with top
        if (newY < 0) {
            placeBubble(newFloatingBubble);
            return;
        }

        // Collision with other bubbles
        for (const bubble of bubbles) {
            const {x: bubbleX, y: bubbleY} = getGridPos(bubble.row, bubble.col);
            const dist = Math.hypot(newX - bubbleX, newY - bubbleY);
            if (dist < BUBBLE_DIAMETER) {
                placeBubble(newFloatingBubble);
                return;
            }
        }
        
        const newRow = newFloatingBubble.row + (newFloatingBubble.dy / (BUBBLE_DIAMETER-6));
        const newCol = newFloatingBubble.col + (newFloatingBubble.dx / (BUBBLE_DIAMETER - (newFloatingBubble.row % 2 ? 0 : BUBBLE_RADIUS)));

        newFloatingBubble.row = newRow;
        newFloatingBubble.col = newCol;

        setFloatingBubble(newFloatingBubble);
    };

    const intervalId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(intervalId);

  }, [floatingBubble, bubbles]);

  const placeBubble = (landedBubble: FloatingBubble) => {
    setFloatingBubble(null);

    const targetRow = Math.round(landedBubble.row);
    const targetCol = Math.round(landedBubble.col + (targetRow % 2 ? -0.5 : 0));

    const newBubble: Bubble = { ...landedBubble, row: targetRow, col: Math.max(0, Math.min(targetCol, COLS - (targetRow % 2) - 1)) };
    
    setBubbles(prevBubbles => {
        const newBubbles = [...prevBubbles, newBubble];
        
        const matches = findMatches(newBubble, newBubbles);
        
        if (matches.length >= 3) {
            let filteredBubbles = newBubbles.filter(b => !matches.find(m => m.id === b.id));
            const floating = findFloating(filteredBubbles);
            filteredBubbles = filteredBubbles.filter(b => !floating.find(f => f.id === b.id));
            
            setScore(s => s + matches.length * 10 + floating.length * 20);
            return filteredBubbles;
        }
        
        if (newBubble.row >= ROWS-1) setGameOver(true);

        return newBubbles;
    });

    setShooterBubble(nextBubble ? {...nextBubble, row: ROWS, col: Math.floor(COLS/2), id: idCounter.current++} : null);
    setNextBubble({ id: idCounter.current++, color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)], row: -1, col: -1, });
  };
  
  const getNeighbors = (bubble: Bubble, allBubbles: Bubble[]) => {
      const neighbors = [];
      const parity = bubble.row % 2;
      const directions = [
          {dr: -1, dc: 0}, {dr: -1, dc: -1 + parity},
          {dr: 0, dc: -1}, {dr: 0, dc: 1},
          {dr: 1, dc: 0}, {dr: 1, dc: -1 + parity}
      ];
      for(const dir of directions) {
          const neighbor = allBubbles.find(b => b.row === bubble.row + dir.dr && b.col === bubble.col + dir.dc);
          if (neighbor) neighbors.push(neighbor);
      }
      return neighbors;
  }

  const findMatches = (startBubble: Bubble, allBubbles: Bubble[]) => {
      const matches: Bubble[] = [];
      const q = [startBubble];
      const visited = new Set([startBubble.id]);

      while(q.length > 0) {
          const current = q.shift()!;
          if (current.color === startBubble.color) {
              matches.push(current);
              const neighbors = getNeighbors(current, allBubbles);
              for (const neighbor of neighbors) {
                  if (!visited.has(neighbor.id)) {
                      visited.add(neighbor.id);
                      q.push(neighbor);
                  }
              }
          }
      }
      return matches;
  }

  const findFloating = (allBubbles: Bubble[]) => {
      const connected = new Set<number>();
      const q = allBubbles.filter(b => b.row === 0);
      q.forEach(b => connected.add(b.id));

      let head = 0;
      while(head < q.length) {
          const current = q[head++];
          const neighbors = getNeighbors(current, allBubbles);
          for(const neighbor of neighbors) {
              if(!connected.has(neighbor.id)){
                  connected.add(neighbor.id);
                  q.push(neighbor);
              }
          }
      }
      return allBubbles.filter(b => !connected.has(b.id));
  }


  return (
    <Card className="shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bubble Shooter</CardTitle>
        <div className="bg-muted px-4 py-2 rounded-lg font-bold text-xl">
          Score: {score}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={gameBoardRef} 
          className="relative bg-gray-800 rounded-lg overflow-hidden cursor-pointer" 
          style={{ width: COLS * BUBBLE_DIAMETER, height: (ROWS) * (BUBBLE_DIAMETER-6) + BUBBLE_DIAMETER }} 
          onClick={handleShoot}
        >
            {bubbles.map(bubble => {
                const {x, y} = getGridPos(bubble.row, bubble.col);
                 return <div key={bubble.id} className="absolute rounded-full" style={{
                     left: x,
                     top: y,
                     width: BUBBLE_DIAMETER,
                     height: BUBBLE_DIAMETER,
                     backgroundColor: bubble.color,
                     border: '2px solid black'
                 }}/>
            })}
             {floatingBubble && (() => {
                 const {x, y} = getGridPos(floatingBubble.row, floatingBubble.col);
                 return <div className="absolute rounded-full" style={{
                     left: x,
                     top: y,
                     width: BUBBLE_DIAMETER,
                     height: BUBBLE_DIAMETER,
                     backgroundColor: floatingBubble.color,
                     border: '2px solid white'
                 }}/>
             })()}
             {shooterBubble && (() => {
                 const {x, y} = getGridPos(shooterBubble.row, shooterBubble.col);
                 return <div className="absolute rounded-full" style={{
                     left: x,
                     top: y,
                     width: BUBBLE_DIAMETER,
                     height: BUBBLE_DIAMETER,
                     backgroundColor: shooterBubble.color,
                     border: '2px solid white'
                 }}/>
             })()}

             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[30px] border-b-white"/>
        </div>
        <div className="flex justify-center items-center gap-4 mt-4">
            <p>Next:</p>
            {nextBubble && <div className="rounded-full" style={{
                width: BUBBLE_DIAMETER/1.5,
                height: BUBBLE_DIAMETER/1.5,
                backgroundColor: nextBubble.color,
                border: '2px solid black'
            }}/>}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={initGame} className="w-full">
            <RotateCcw className="mr-2" /> New Game
        </Button>
      </CardFooter>
      <Dialog open={gameOver} onOpenChange={(isOpen) => !isOpen && initGame()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center text-center">
              Game Over!
            </DialogTitle>
            <DialogDescription className="text-xl text-center py-4">
              Your final score is {score}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={initGame} className="w-full">Play Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

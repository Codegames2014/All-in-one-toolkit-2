
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw, Dices } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

type PlayerColor = 'red' | 'green' | 'yellow' | 'blue';
const COLORS: PlayerColor[] = ['red', 'green', 'yellow', 'blue'];

const PATH_START: Record<PlayerColor, number> = { red: 1, green: 14, yellow: 27, blue: 40 };
const HOME_ENTRANCE: Record<PlayerColor, number> = { red: 51, green: 12, yellow: 25, blue: 38 };

const SAFE_SPOTS = [1, 9, 14, 22, 27, 35, 40, 48];

const TOTAL_PATH_SQUARES = 52;

interface Token {
  id: number;
  color: PlayerColor;
  position: 'base' | number; // 'base' or path index 1-52, or home path index 101-106
  state: 'base' | 'active' | 'home';
}

const colorClasses = {
    red: { bg: 'bg-red-500', text: 'text-red-500', border: 'border-red-700', fill: 'fill-red-500' },
    green: { bg: 'bg-green-500', text: 'text-green-500', border: 'border-green-700', fill: 'fill-green-500' },
    yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500', border: 'border-yellow-700', fill: 'fill-yellow-500' },
    blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-700', fill: 'fill-blue-500' },
};


// Mapping of board index (0-224) to path index (1-52)
const boardToPathMap = new Map<number, number>([
    [91, 1], [92, 2], [93, 3], [94, 4], [95, 5],
    [80, 6], [65, 7], [50, 8], [35, 9], [20, 10], [5, 11],
    [6, 12],
    [7, 13], [22, 14], [37, 15], [52, 16], [67, 17], [82, 18],
    [97, 19], [98, 20], [99, 21], [100, 22], [101, 23], [116, 24],
    [117, 25],
    [132, 26], [147, 27], [162, 28], [177, 29], [192, 30], [207, 31],
    [219, 32], [218, 33], [217, 34], [216, 35], [215, 36], [200, 37],
    [185, 38],
    [170, 39], [155, 40], [140, 41], [125, 42], [110, 43], [109, 44],
    [108, 45], [107, 46], [106, 47], [105, 48], [90, 49], [75, 50],
    [60, 51], [45, 52]
]);

const correctBoardToPathMap = new Map<number, number>();
const pathCoords = [
    [6, 1], [6, 2], [6, 3], [6, 4], [6, 5],
    [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6],
    [0, 7],
    [0, 8], [1, 8], [2, 8], [3, 8], [4, 8], [5, 8],
    [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14],
    [7, 14],
    [8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9],
    [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8],
    [14, 7],
    [14, 6], [13, 6], [12, 6], [11, 6], [10, 6], [9, 6],
    [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0],
    [7, 0],
];
pathCoords.forEach(([row, col], index) => {
    correctBoardToPathMap.set(row * 15 + col, index + 1);
});


const pathToBoardMap = new Map<number, number>(Array.from(correctBoardToPathMap.entries()).map(([k, v]) => [v, k]));

const homePathMap: Record<PlayerColor, number[]> = {
    red:    [7*15+1, 7*15+2, 7*15+3, 7*15+4, 7*15+5, 7*15+6],
    green:  [1*15+7, 2*15+7, 3*15+7, 4*15+7, 5*15+7, 6*15+7],
    yellow: [7*15+13, 7*15+12, 7*15+11, 7*15+10, 7*15+9, 7*15+8],
    blue:   [13*15+7, 12*15+7, 11*15+7, 10*15+7, 9*15+7, 8*15+7],
};

const yardMap: Record<PlayerColor, {outer: number[], inner: number[]}> = {
    red: {
        outer: [0, 1*15, 2*15, 3*15, 4*15, 5*15, 5*15+1, 5*15+2, 5*15+3, 5*15+4, 5*15+5, 4*15+5, 3*15+5, 2*15+5, 1*15+5, 5],
        inner: [1*15+1, 1*15+2, 1*15+3, 1*15+4, 2*15+1, 2*15+2, 2*15+3, 2*15+4, 3*15+1, 3*15+2, 3*15+3, 3*15+4, 4*15+1, 4*15+2, 4*15+3, 4*15+4]
    },
    green: {
        outer: [9, 1*15+9, 2*15+9, 3*15+9, 4*15+9, 5*15+9, 5*15+10, 5*15+11, 5*15+12, 5*15+13, 5*15+14, 4*15+14, 3*15+14, 2*15+14, 1*15+14, 14],
        inner: [1*15+10, 1*15+11, 1*15+12, 1*15+13, 2*15+10, 2*15+11, 2*15+12, 2*15+13, 3*15+10, 3*15+11, 3*15+12, 3*15+13, 4*15+10, 4*15+11, 4*15+12, 4*15+13]
    },
    blue: {
        outer: [9*15, 9*15+1, 9*15+2, 9*15+3, 9*15+4, 9*15+5, 10*15+5, 11*15+5, 12*15+5, 13*15+5, 14*15+5, 14*15+4, 14*15+3, 14*15+2, 14*15+1, 14*15],
        inner: [10*15+1, 10*15+2, 10*15+3, 10*15+4, 11*15+1, 11*15+2, 11*15+3, 11*15+4, 12*15+1, 12*15+2, 12*15+3, 12*15+4, 13*15+1, 13*15+2, 13*15+3, 13*15+4]
    },
    yellow: {
        outer: [9*15+9, 9*15+10, 9*15+11, 9*15+12, 9*15+13, 9*15+14, 10*15+14, 11*15+14, 12*15+14, 13*15+14, 14*15+14, 14*15+13, 14*15+12, 14*15+11, 14*15+10, 14*15+9],
        inner: [10*15+10, 10*15+11, 10*15+12, 10*15+13, 11*15+10, 11*15+11, 11*15+12, 11*15+13, 12*15+10, 12*15+11, 12*15+12, 12*15+13, 13*15+10, 13*15+11, 13*15+12, 13*15+13]
    }
}

const yardTokenPositions: Record<PlayerColor, number[]> = {
    red:    [2*15+2, 2*15+3, 3*15+2, 3*15+3],
    green:  [2*15+11, 2*15+12, 3*15+11, 3*15+12],
    yellow: [11*15+11, 11*15+12, 12*15+11, 12*15+12],
    blue:   [11*15+2, 11*15+3, 12*15+2, 12*15+3],
};

const LudoBoard = ({ tokens, onTokenClick, movableTokens }: { tokens: Token[], onTokenClick: (token: Token) => void, movableTokens: number[] }) => {

    const renderToken = (token: Token) => {
        const isMovable = movableTokens.includes(token.id);
        
        return (
            <div 
                key={token.id}
                className={cn(
                    "w-full h-full rounded-full flex items-center justify-center text-white font-bold cursor-pointer transition-all duration-300 border-2 border-black/20 shadow-[inset_0_-2px_4px_rgba(0,0,0,0.4),0_2px_4px_rgba(255,255,255,0.4)]",
                    isMovable && "animate-bounce ring-4 ring-white ring-offset-2 ring-offset-black",
                    colorClasses[token.color].bg
                )}
                onClick={() => isMovable && onTokenClick(token)}
            >
                <div className='w-1/2 h-1/2 rounded-full bg-white/30'/>
            </div>
        )
    };
    
    const getBoardPosition = (token: Token): number => {
        if(token.state === 'base') {
            const baseTokens = tokens.filter(t => t.color === token.color && t.state === 'base');
            const tokenIndex = baseTokens.findIndex(t => t.id === token.id);
            return yardTokenPositions[token.color][tokenIndex];
        }
        if((token.position as number) > 100) { // Home path
            const homePathIndex = (token.position as number) - 101;
            return homePathMap[token.color][homePathIndex];
        }
        return pathToBoardMap.get(token.position as number)!;
    }

    return (
        <div className="relative bg-stone-200 p-2 rounded-lg shadow-lg aspect-square max-w-xl mx-auto border-4 border-gray-800">
            {/* Board Grid */}
            <div className="grid grid-cols-15 grid-rows-15 w-full h-full">
                {Array.from({ length: 225 }).map((_, i) => {
                    let bgColor = 'bg-transparent';
                    
                    const isRedYard = (i % 15 < 6) && (Math.floor(i/15) < 6);
                    const isGreenYard = (i % 15 > 8) && (Math.floor(i/15) < 6);
                    const isBlueYard = (i % 15 < 6) && (Math.floor(i/15) > 8);
                    const isYellowYard = (i % 15 > 8) && (Math.floor(i/15) > 8);
                    
                    if(isRedYard) bgColor = colorClasses.red.bg;
                    if(isGreenYard) bgColor = colorClasses.green.bg;
                    if(isBlueYard) bgColor = colorClasses.blue.bg;
                    if(isYellowYard) bgColor = colorClasses.yellow.bg;

                    if(yardMap.red.inner.includes(i)) bgColor = 'bg-white';
                    if(yardMap.green.inner.includes(i)) bgColor = 'bg-white';
                    if(yardMap.blue.inner.includes(i)) bgColor = 'bg-white';
                    if(yardMap.yellow.inner.includes(i)) bgColor = 'bg-white';

                    const centerRow = Math.floor(i / 15);
                    const centerCol = i % 15;
                    if (centerRow >= 6 && centerRow <= 8 && centerCol >= 6 && centerCol <= 8) {
                        if (i === 112) return <div key={i} className="col-span-3 row-span-3">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
                                <polygon points="50,0 0,50 50,50" className={cn(colorClasses.red.fill)} />
                                <polygon points="100,50 50,0 50,50" className={cn(colorClasses.green.fill)} />
                                <polygon points="100,50 50,100 50,50" className={cn(colorClasses.yellow.fill)} />
                                <polygon points="0,50 50,100 50,50" className={cn(colorClasses.blue.fill)} />
                           </svg>
                       </div>;
                       if (centerRow === 6 || centerRow === 8 || centerCol === 6 || centerCol === 8) return null;
                    }


                    const pathIndex = correctBoardToPathMap.get(i);
                    let isPath = !!pathIndex;
                    let isSafe = SAFE_SPOTS.includes(pathIndex!);
                    let isHomePath = false;

                    Object.values(homePathMap).forEach(path => {
                        if (path.includes(i)) {
                            isHomePath = true;
                            if (homePathMap.red.includes(i)) bgColor = colorClasses.red.bg;
                            if (homePathMap.green.includes(i)) bgColor = colorClasses.green.bg;
                            if (homePathMap.yellow.includes(i)) bgColor = colorClasses.yellow.bg;
                            if (homePathMap.blue.includes(i)) bgColor = colorClasses.blue.bg;
                        }
                    });
                    
                    if (isPath && !isHomePath) {
                        bgColor = 'bg-white';
                        if(i === pathToBoardMap.get(PATH_START.red)) bgColor = colorClasses.red.bg;
                        if(i === pathToBoardMap.get(PATH_START.green)) bgColor = colorClasses.green.bg;
                        if(i === pathToBoardMap.get(PATH_START.yellow)) bgColor = colorClasses.yellow.bg;
                        if(i === pathToBoardMap.get(PATH_START.blue)) bgColor = colorClasses.blue.bg;
                    }


                    return (
                        <div key={i} className={cn("w-full h-full relative border border-black/10", bgColor)}>
                           {isSafe && <div className="absolute w-full h-full flex items-center justify-center text-xl text-black/20 font-bold">*</div>}
                           
                        </div>
                    );
                })}

            </div>
            {tokens.map(token => {
                const boardIndex = getBoardPosition(token);
                if (boardIndex === -1 || boardIndex === undefined) return null;
                const row = Math.floor(boardIndex / 15);
                const col = boardIndex % 15;
                const tokensOnSquare = tokens.filter(t => getBoardPosition(t) === boardIndex);
                const tokenIndexOnSquare = tokensOnSquare.findIndex(t => t.id === token.id);

                return (
                    <div 
                        key={token.id} 
                        className="absolute flex items-center justify-center w-[6.66%] h-[6.66%] transition-all duration-500 ease-in-out" 
                        style={{
                            top: `${row * (100/15)}%`, 
                            left: `${col * (100/15)}%`,
                            transform: `translate(${tokenIndexOnSquare * 10}%, ${tokenIndexOnSquare * 10}%)`
                        }}>
                        {renderToken(token)}
                    </div>
                )
            })}
        </div>
    );
};

const Dice = ({ onRoll, value, rolling, color }: { onRoll: () => void, value: number, rolling: boolean, color: PlayerColor }) => (
    <Button onClick={onRoll} disabled={rolling} size="lg" className={cn("w-24 h-24 text-6xl font-bold text-white shadow-lg", colorClasses[color].bg, `hover:${colorClasses[color].bg}/90`)}>
        {rolling ? <Dices className="animate-spin"/> : value || <Dices />}
    </Button>
)

export function LudoUI() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [activePlayerIndex, setActivePlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState<number>(0);
  const [isRolling, setIsRolling] = useState(false);
  const [movableTokens, setMovableTokens] = useState<number[]>([]);
  const [winner, setWinner] = useState<PlayerColor | null>(null);
  const [status, setStatus] = useState("Red's turn to roll!");
  const [turnRolls, setTurnRolls] = useState<number[]>([]);

  const initGame = useCallback(() => {
    let initialTokens: Token[] = [];
    let idCounter = 0;
    for (const color of COLORS) {
      for (let i = 0; i < 4; i++) {
        initialTokens.push({ id: idCounter++, color, position: 'base', state: 'base' });
      }
    }
    setTokens(initialTokens);
    setActivePlayerIndex(0);
    setDiceValue(0);
    setMovableTokens([]);
    setWinner(null);
    setStatus("Red's turn to roll!");
    setTurnRolls([]);
  }, []);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const activePlayer = COLORS[activePlayerIndex];

  const rollDice = () => {
    if(movableTokens.length > 0) {
        setStatus("You must move a token!");
        return;
    }
    if (turnRolls.length >= 3 && turnRolls.every(r => r === 6)) {
        nextTurn();
        return;
    }

    setIsRolling(true);
    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setDiceValue(roll);
      setIsRolling(false);
      findMovableTokens(roll);
      setTurnRolls(prev => [...prev, roll]);
    }, 500);
  };
  
  const findMovableTokens = (roll: number) => {
    const playerTokens = tokens.filter(t => t.color === activePlayer);
    let canMove = false;

    for (const token of playerTokens) {
        if (token.state === 'base') {
            if (roll === 6) canMove = true;
        } else {
             const currentPos = token.position as number;
             const homeEntrance = HOME_ENTRANCE[token.color];
             
             if(currentPos > 100) { // In home path
                 if(currentPos + roll <= 106) canMove = true;
             } else { // On main path
                const pathCrossesBoundary = homeEntrance < PATH_START[token.color];
                let newPos = currentPos + roll;
                if(pathCrossesBoundary && newPos > TOTAL_PATH_SQUARES) {
                    newPos = newPos % TOTAL_PATH_SQUARES;
                }
                if (currentPos <= homeEntrance && newPos > homeEntrance && (!pathCrossesBoundary || (pathCrossesBoundary && currentPos > newPos))) {
                    if (100 + (newPos - homeEntrance) <= 106) canMove = true;
                } else {
                    canMove = true;
                }
             }
        }
    }
    
    if(canMove) {
        const movable = playerTokens.filter(token => {
            if(token.state === 'base') return roll === 6;
            const currentPos = token.position as number;
            const homeEntrance = HOME_ENTRANCE[token.color];
             if(currentPos > 100) { // In home path
                 return currentPos + roll <= 106;
             } else { // On main path
                const pathCrossesBoundary = homeEntrance < PATH_START[token.color];
                let newPos = currentPos + roll;
                if(pathCrossesBoundary && newPos > TOTAL_PATH_SQUARES) {
                    newPos = newPos % TOTAL_PATH_SQUARES;
                }
                if (currentPos <= homeEntrance && newPos > homeEntrance && (!pathCrossesBoundary || (pathCrossesBoundary && currentPos > newPos))) {
                    return 100 + (newPos - homeEntrance) <= 106;
                }
                return true;
             }
        }).map(t => t.id)
        setMovableTokens(movable);
        setStatus("Select a token to move.");
    } else {
        setTimeout(() => nextTurn(roll), 1000);
    }
  }

  const moveToken = (tokenToMove: Token) => {
    if (!movableTokens.includes(tokenToMove.id)) {
        setStatus("This token cannot be moved.");
        return;
    }

    let captured = false;
    setTokens(prevTokens => {
        let newTokens = prevTokens.map(t => ({...t}));
        const tokenIndex = newTokens.findIndex(t => t.id === tokenToMove.id);
        const token = newTokens[tokenIndex];

        if(token.state === 'base' && diceValue === 6) {
            token.position = PATH_START[token.color];
            token.state = 'active';
        } else if (token.state !== 'base') {
            const currentPos = token.position as number;
            const homeEntrance = HOME_ENTRANCE[token.color];
            
            const pathCrossesBoundary = homeEntrance < PATH_START[token.color];
            let newPos = currentPos + diceValue;

            if (currentPos < 100 && pathCrossesBoundary && newPos > TOTAL_PATH_SQUARES) {
                newPos = newPos % TOTAL_PATH_SQUARES;
            }
            
            if (currentPos < 100 && currentPos <= homeEntrance && newPos > homeEntrance && (!pathCrossesBoundary || (pathCrossesBoundary && currentPos > newPos))) {
                token.position = 100 + (newPos - homeEntrance);
            } else {
                token.position = newPos;
            }
            
            if(token.position === 106) token.state = 'home';
            
            const finalPos = token.position;
            if(finalPos < 100 && !SAFE_SPOTS.includes(finalPos as number)) {
                const opponentTokensOnNewPos = newTokens.filter(t => t.position === finalPos && t.color !== token.color);
                if(opponentTokensOnNewPos.length > 0){
                    captured = true;
                    opponentTokensOnNewPos.forEach(ot => {
                        const opponentIndex = newTokens.findIndex(t => t.id === ot.id);
                        newTokens[opponentIndex].position = 'base';
                        newTokens[opponentIndex].state = 'base';
                    })
                }
            }
        }
        
        const playerTokens = newTokens.filter(t => t.color === activePlayer);
        if(playerTokens.every(t => t.state === 'home')) {
            setWinner(activePlayer);
        }

        return newTokens;
    });
    
    setMovableTokens([]);
    nextTurn(diceValue, captured);
  };
  
  const nextTurn = (roll?: number, captured?: boolean) => {
    const playerTokens = tokens.filter(t => t.color === activePlayer);
    if(playerTokens.every(t => t.state === 'home')) {
        setWinner(activePlayer);
        setStatus(`Game Over! ${activePlayer} wins!`);
        return;
    }
    
    if (roll !== 6 && !captured) {
      const nextPlayerIndex = (activePlayerIndex + 1) % COLORS.length;
      setActivePlayerIndex(nextPlayerIndex);
      setStatus(`${COLORS[nextPlayerIndex]}'s turn to roll!`);
      setTurnRolls([]);
    } else {
      setStatus(`${activePlayer} gets another turn!`);
    }
    setDiceValue(0);
  };

  return (
    <Card className="shadow-2xl bg-stone-100 dark:bg-gray-900">
      <CardContent className="p-2 md:p-6 flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="flex-shrink-0 w-full lg:w-64 space-y-4 text-center order-2 lg:order-1">
          <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardContent className="p-4">
              <h3 className="text-xl font-bold mb-2">Game Status</h3>
              <p className={cn("text-lg font-semibold capitalize", colorClasses[activePlayer].text)}>{status}</p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80">
            <CardContent className="p-4 flex flex-col items-center gap-4">
              <h3 className="text-xl font-bold">Dice</h3>
              <Dice onRoll={rollDice} value={diceValue} rolling={isRolling} color={activePlayer} />
              <p className="text-sm text-muted-foreground">Current Turn: <span className={cn("font-bold capitalize text-lg", colorClasses[activePlayer].text)}>{activePlayer}</span></p>
            </CardContent>
          </Card>

          <Button onClick={initGame} variant="secondary" className="w-full">
            <RotateCcw className="mr-2" /> New Game
          </Button>
        </div>

        <div className="order-1 lg:order-2 w-full max-w-xl">
            <LudoBoard tokens={tokens} onTokenClick={moveToken} movableTokens={movableTokens} />
        </div>
        
        <Dialog open={!!winner} onOpenChange={(isOpen) => !isOpen && setWinner(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-center text-center">
                        <Award className="w-12 h-12 text-yellow-500 mr-4" />
                        Game Over!
                    </DialogTitle>
                    <DialogDescription className="text-xl text-center py-4 capitalize">
                        <span className={cn("font-bold", colorClasses[winner!].text)}>{winner}</span> wins the game!
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

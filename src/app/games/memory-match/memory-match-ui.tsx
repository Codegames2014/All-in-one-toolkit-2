"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw, BrainCircuit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { icons } from 'lucide-react';

const iconNames = Object.keys(icons) as (keyof typeof icons)[];

const getCardIcons = (pairs = 8) => {
    const selectedIcons: (keyof typeof icons)[] = [];
    while (selectedIcons.length < pairs) {
        const randomIndex = Math.floor(Math.random() * iconNames.length);
        const randomIcon = iconNames[randomIndex];
        if (!selectedIcons.includes(randomIcon)) {
            selectedIcons.push(randomIcon);
        }
    }
    return [...selectedIcons, ...selectedIcons]; // Duplicate for pairs
}


const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

interface CardInfo {
    id: number;
    icon: keyof typeof icons;
    isFlipped: boolean;
    isMatched: boolean;
}

const GameCard = ({ card, onFlip }: { card: CardInfo, onFlip: (id: number) => void }) => {
    const Icon = icons[card.icon];
    return (
        <div 
            className="aspect-square perspective-1000"
            onClick={() => onFlip(card.id)}
        >
            <div 
                className={cn(
                    "relative w-full h-full transform-style-3d transition-transform duration-500",
                    card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
                )}
            >
                {/* Card Back */}
                <div className="absolute w-full h-full backface-hidden flex items-center justify-center bg-primary rounded-lg shadow-lg cursor-pointer">
                    <BrainCircuit className="w-1/2 h-1/2 text-primary-foreground" />
                </div>
                {/* Card Front */}
                <div className={cn(
                    "absolute w-full h-full backface-hidden rotate-y-180 flex items-center justify-center rounded-lg shadow-lg",
                    card.isMatched ? 'bg-green-500' : 'bg-secondary'
                )}>
                    <Icon className={cn("w-1/2 h-1/2", card.isMatched ? 'text-white' : 'text-secondary-foreground')} />
                </div>
            </div>
        </div>
    );
}

export function MemoryMatchUI() {
    const [cards, setCards] = useState<CardInfo[]>([]);
    const [flippedCards, setFlippedCards] = useState<number[]>([]);
    const [moves, setMoves] = useState(0);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = useCallback(() => {
        const icons = getCardIcons(8);
        const shuffledIcons = shuffleArray(icons);
        setCards(shuffledIcons.map((icon, index) => ({
            id: index,
            icon,
            isFlipped: false,
            isMatched: false
        })));
        setFlippedCards([]);
        setMoves(0);
        setGameOver(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const handleFlip = (id: number) => {
        if (flippedCards.length === 2 || cards.find(c => c.id === id)?.isFlipped) {
            return;
        }

        const newFlipped = [...flippedCards, id];
        setFlippedCards(newFlipped);

        setCards(prev => prev.map(card => card.id === id ? { ...card, isFlipped: true } : card));

        if (newFlipped.length === 2) {
            setMoves(prev => prev + 1);
            const [firstId, secondId] = newFlipped;
            const firstCard = cards.find(c => c.id === firstId);
            const secondCard = cards.find(c => c.id === secondId);

            if (firstCard && secondCard && firstCard.icon === secondCard.icon) {
                // It's a match
                setCards(prev => prev.map(card =>
                    card.icon === firstCard.icon ? { ...card, isMatched: true, isFlipped: false } : card
                ));
                setFlippedCards([]);
            } else {
                // Not a match, flip back after a delay
                setTimeout(() => {
                    setCards(prev => prev.map(card =>
                        card.id === firstId || card.id === secondId ? { ...card, isFlipped: false } : card
                    ));
                    setFlippedCards([]);
                }, 1000);
            }
        }
    };
    
    useEffect(() => {
        if (cards.length > 0 && cards.every(c => c.isMatched)) {
            setGameOver(true);
        }
    }, [cards]);

    return (
        <Card className="shadow-2xl">
            <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex justify-between items-center bg-muted p-2 rounded-lg">
                    <div className="text-lg font-bold">Moves: {moves}</div>
                    <Button onClick={initializeGame}><RotateCcw className="mr-2" />New Game</Button>
                </div>
                <div className="grid grid-cols-4 gap-2 md:gap-4">
                    {cards.map(card => (
                        <GameCard key={card.id} card={card} onFlip={handleFlip} />
                    ))}
                </div>
                 <Dialog open={gameOver} onOpenChange={(isOpen) => !isOpen && setGameOver(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-center text-center">
                               <Award className="w-12 h-12 text-yellow-500 mr-4" />
                               You Won!
                            </DialogTitle>
                            <DialogDescription className="text-xl text-center py-4">
                                Great job! You completed the game in {moves} moves.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button onClick={initializeGame} className="w-full">Play Again</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}

// Add custom CSS for the 3D card flip effect
const styles = `
.perspective-1000 { perspective: 1000px; }
.transform-style-3d { transform-style: preserve-3d; }
.rotate-y-180 { transform: rotateY(180deg); }
.backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
`;

const styleSheet = typeof document !== 'undefined' ? document.createElement("style") : null;
if(styleSheet) {
    styleSheet.type = "text/css";
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);
}

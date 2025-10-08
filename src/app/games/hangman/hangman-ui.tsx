"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';


const WORDS = ["firebase", "genkit", "nextjs", "react", "tailwind", "studio", "developer", "javascript", "cloud"];
const ALPHABET = "abcdefghijklmnopqrstuvwxyz".split('');
const MAX_ATTEMPTS = 6;

const HangmanDrawing = ({ wrongGuesses }: { wrongGuesses: number }) => {
    const Head = <div className="w-12 h-12 border-4 border-foreground rounded-full absolute top-[50px] right-[-20px]" />;
    const Body = <div className="w-1 h-24 bg-foreground absolute top-[100px] right-0" />;
    const RightArm = <div className="w-20 h-1 bg-foreground absolute top-[120px] right-[-80px] -rotate-45" />;
    const LeftArm = <div className="w-20 h-1 bg-foreground absolute top-[120px] right-[0px] rotate-45" />;
    const RightLeg = <div className="w-20 h-1 bg-foreground absolute top-[215px] right-[-80px] rotate-[60deg]" />;
    const LeftLeg = <div className="w-20 h-1 bg-foreground absolute top-[215px] right-[0px] -rotate-[60deg]" />;

    const parts = [Head, Body, RightArm, LeftArm, RightLeg, LeftLeg];

    return (
        <div className="relative h-64 w-60 mx-auto mb-4">
            {parts.slice(0, wrongGuesses)}
            <div className="h-12 w-1 bg-foreground absolute top-0 right-0"/>
            <div className="h-1 w-48 bg-foreground ml-20"/>
            <div className="h-64 w-1 bg-foreground ml-20"/>
            <div className="h-1 w-64 bg-foreground"/>
        </div>
    )
}

export function HangmanUI() {
    const [wordToGuess, setWordToGuess] = useState("");
    const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
    
    const newGame = useCallback(() => {
        setWordToGuess(WORDS[Math.floor(Math.random() * WORDS.length)]);
        setGuessedLetters([]);
    }, []);

    useEffect(() => {
        newGame();
    }, [newGame]);

    const wrongGuesses = guessedLetters.filter(letter => !wordToGuess.includes(letter));
    const correctGuesses = guessedLetters.filter(letter => wordToGuess.includes(letter));

    const isLoser = wrongGuesses.length >= MAX_ATTEMPTS;
    const isWinner = wordToGuess.split('').every(letter => correctGuesses.includes(letter)) && wordToGuess !== "";

    const handleGuess = (letter: string) => {
        if (guessedLetters.includes(letter) || isWinner || isLoser) return;
        setGuessedLetters(prev => [...prev, letter]);
    }
    
    return (
        <Card className="shadow-2xl max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Hangman</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
                <HangmanDrawing wrongGuesses={wrongGuesses.length} />
                <div className="flex gap-2 text-4xl font-mono tracking-widest">
                    {wordToGuess.split('').map((letter, index) => (
                        <span key={index} className="border-b-4 w-10 text-center">
                            <span className={cn(
                                "transition-opacity",
                                correctGuesses.includes(letter) || isLoser ? 'opacity-100' : 'opacity-0',
                                isLoser && !correctGuesses.includes(letter) ? 'text-red-500' : 'text-foreground'
                            )}>
                                {letter}
                            </span>
                        </span>
                    ))}
                </div>
                 <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                    {ALPHABET.map(letter => (
                        <Button
                            key={letter}
                            variant="outline"
                            size="icon"
                            className="w-10 h-10 text-lg"
                            disabled={guessedLetters.includes(letter) || isWinner || isLoser}
                            onClick={() => handleGuess(letter)}
                        >
                            {letter}
                        </Button>
                    ))}
                </div>
            </CardContent>
            <CardFooter>
                 <Button onClick={newGame} className="w-full">
                    <RotateCcw className="mr-2" /> New Game
                </Button>
            </CardFooter>
            <Dialog open={isWinner || isLoser} onOpenChange={(isOpen) => !isOpen && newGame()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-center">{isWinner ? "You Won! 🎉" : "Nice Try! 💀"}</DialogTitle>
                        <DialogDescription className="text-xl text-center py-4">
                           The word was: <span className="font-bold text-primary">{wordToGuess}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={newGame} className="w-full">Play Again</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

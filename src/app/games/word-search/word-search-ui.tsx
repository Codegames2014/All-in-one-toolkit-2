"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

const DICTIONARY = ["react", "nextjs", "tailwind", "genkit", "firebase", "studio", "google", "cloud", "puzzle", "search"];
const GRID_SIZE = 12;

// Word search generation logic
const generateGrid = (words: string[]) => {
    let grid = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
    const placedWords: { word: string; positions: { row: number; col: number }[] }[] = [];

    const directions = [
        { dr: 0, dc: 1 },  // horizontal
        { dr: 1, dc: 0 },  // vertical
        { dr: 1, dc: 1 },  // diagonal down-right
        { dr: 1, dc: -1 }, // diagonal down-left
        { dr: 0, dc: -1 }, // horizontal-reverse
        { dr: -1, dc: 0 }, // vertical-reverse
        { dr: -1, dc: -1}, // diagonal up-left
        { dr: -1, dc: 1}, // diagonal up-right
    ];

    for (const word of words) {
        let placed = false;
        let attempts = 0;
        while (!placed && attempts < 100) {
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const row = Math.floor(Math.random() * GRID_SIZE);
            const col = Math.floor(Math.random() * GRID_SIZE);

            if (canPlaceWord(grid, word, row, col, dir)) {
                const positions = [];
                for (let i = 0; i < word.length; i++) {
                    const newRow = row + i * dir.dr;
                    const newCol = col + i * dir.dc;
                    grid[newRow][newCol] = word[i];
                    positions.push({ row: newRow, col: newCol });
                }
                placedWords.push({ word, positions });
                placed = true;
            }
            attempts++;
        }
    }

    // Fill empty cells with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (grid[r][c] === '') {
                grid[r][c] = "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
            }
        }
    }
    return { grid, placedWords };
};

const canPlaceWord = (grid: string[][], word: string, row: number, col: number, dir: { dr: number; dc: number }) => {
    for (let i = 0; i < word.length; i++) {
        const newRow = row + i * dir.dr;
        const newCol = col + i * dir.dc;
        if (newRow < 0 || newRow >= GRID_SIZE || newCol < 0 || newCol >= GRID_SIZE || (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i])) {
            return false;
        }
    }
    return true;
};

export function WordSearchUI() {
    const [grid, setGrid] = useState<string[][]>([]);
    const [words, setWords] = useState<{ word: string; positions: { row: number; col: number }[] }[]>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selection, setSelection] = useState<{ start: { row: number, col: number } | null, end: { row: number, col: number } | null }>({ start: null, end: null });
    const [isSelecting, setIsSelecting] = useState(false);
    const [gameOver, setGameOver] = useState(false);

    const initializeGame = useCallback(() => {
        const selectedWords = DICTIONARY.sort(() => 0.5 - Math.random()).slice(0, 8);
        const { grid, placedWords } = generateGrid(selectedWords);
        setGrid(grid);
        setWords(placedWords);
        setFoundWords([]);
        setSelection({ start: null, end: null });
        setGameOver(false);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);

    const getSelectedCells = useCallback(() => {
        if (!selection.start || !selection.end) return [];
        const cells = [];
        const { start, end } = selection;
        const dr = Math.sign(end.row - start.row);
        const dc = Math.sign(end.col - start.col);
        
        let r = start.row;
        let c = start.col;
        
        // This loop ensures we traverse from start to end correctly
        while(true){
            cells.push({ row: r, col: c });
            if (r === end.row && c === end.col) break;
            r += dr;
            c += dc;
        }
        return cells;
    }, [selection]);
    
    const selectedCells = useMemo(getSelectedCells, [getSelectedCells]);
    
    const handleMouseDown = (row: number, col: number) => {
        setIsSelecting(true);
        setSelection({ start: { row, col }, end: { row, col } });
    };

    const handleMouseOver = (row: number, col: number) => {
        if (isSelecting && selection.start) {
            const { start } = selection;
            const dr = row - start.row;
            const dc = col - start.col;
            // Allow horizontal, vertical, or diagonal selections
            if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
                 setSelection(s => ({ ...s, end: { row, col } }));
            }
        }
    };

    const handleMouseUp = () => {
        if (!isSelecting) return;
        setIsSelecting(false);

        const selectedWord = selectedCells.map(c => grid[c.row][c.col]).join('');
        const reversedSelectedWord = [...selectedWord].reverse().join('');
        
        const matchingWord = words.find(w => w.word === selectedWord || w.word === reversedSelectedWord);

        if (matchingWord && !foundWords.includes(matchingWord.word)) {
             // Add the base word to foundWords, not the reversed one.
            setFoundWords(fw => [...fw, matchingWord.word]);
        }
        
        setSelection({ start: null, end: null });
    };

    useEffect(() => {
        if (words.length > 0 && foundWords.length === words.length) {
            setGameOver(true);
        }
    }, [foundWords, words]);
    
    const foundPositions = useMemo(() => {
        const positions = new Set<string>();
        words.forEach(wordInfo => {
            if (foundWords.includes(wordInfo.word)) {
                wordInfo.positions.forEach(pos => positions.add(`${pos.row}-${pos.col}`));
            }
        });
        return positions;
    }, [foundWords, words]);
    
    if (grid.length === 0) return <div>Loading...</div>;

    return (
        <div className="flex flex-col md:flex-row gap-6 items-start">
            <Card className="flex-grow shadow-2xl">
                <CardContent className="p-2 md:p-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <div className="grid grid-cols-12 gap-0 aspect-square cursor-pointer">
                        {grid.map((row, rIdx) => row.map((cell, cIdx) => {
                            const isSelected = selectedCells.some(c => c.row === rIdx && c.col === cIdx);
                            const isFound = foundPositions.has(`${rIdx}-${cIdx}`);
                            
                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    className={cn(
                                        "flex items-center justify-center aspect-square text-lg md:text-xl font-bold uppercase select-none transition-colors",
                                        isSelected ? "bg-yellow-400 rounded-md" : isFound ? "bg-green-400 text-white" : "bg-muted",
                                        "hover:bg-yellow-200"
                                    )}
                                    onMouseDown={() => handleMouseDown(rIdx, cIdx)}
                                    onMouseOver={() => handleMouseOver(rIdx, cIdx)}
                                >
                                    {cell}
                                </div>
                            );
                        }))}
                    </div>
                </CardContent>
            </Card>
            <Card className="w-full md:w-64">
                <CardHeader>
                    <CardTitle>Find Words</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 grid grid-cols-2 md:grid-cols-1 gap-2">
                        {words.map(({ word }) => (
                            <li key={word} className={cn("text-lg capitalize transition-colors", foundWords.includes(word) ? "line-through text-green-500" : "text-foreground")}>
                                {word}
                            </li>
                        ))}
                    </ul>
                    <Button onClick={initializeGame} className="w-full mt-4"><RotateCcw className="mr-2"/>New Game</Button>
                </CardContent>
            </Card>
             <Dialog open={gameOver} onOpenChange={(isOpen) => !isOpen && initializeGame()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center text-center">
                           <Award className="w-12 h-12 text-yellow-500 mr-4" />
                           You Found Them All!
                        </DialogTitle>
                        <DialogDescription className="text-xl text-center py-4">
                            Great job! You are a true word detective.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={initializeGame} className="w-full">Play Again</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

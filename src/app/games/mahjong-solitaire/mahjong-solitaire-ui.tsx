"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Award, RotateCcw, Shuffle, Lightbulb } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

// Mahjong Unicode characters
const TILE_SET = '🀐🀑🀒🀓🀔🀕🀖🀗🀘🀙🀚🀛🀜🀝🀞🀟🀠🀡🀢🀣🀤🀥🀦🀧🀨🀩🀪🀫🀬🀭'.split('');
const TOTAL_UNIQUE_TILES = TILE_SET.length;
const TOTAL_TILES = 144;
const TOTAL_PAIRS = TOTAL_TILES / 2;

// Classic Turtle layout - 144 tiles
const TURTLE_LAYOUT = [
    // Layer 0 (Bottom)
    {x: 2, y: 0, z: 0}, {x: 4, y: 0, z: 0}, {x: 6, y: 0, z: 0}, {x: 8, y: 0, z: 0}, {x: 10, y: 0, z: 0}, {x: 12, y: 0, z: 0}, {x: 14, y: 0, z: 0}, {x: 16, y: 0, z: 0}, {x: 18, y: 0, z: 0}, {x: 20, y: 0, z: 0}, {x: 22, y: 0, z: 0},
    {x: 2, y: 2, z: 0}, {x: 4, y: 2, z: 0}, {x: 6, y: 2, z: 0}, {x: 8, y: 2, z: 0}, {x: 10, y: 2, z: 0}, {x: 12, y: 2, z: 0}, {x: 14, y: 2, z: 0}, {x: 16, y: 2, z: 0}, {x: 18, y: 2, z: 0}, {x: 20, y: 2, z: 0}, {x: 22, y: 2, z: 0},
    {x: 0, y: 4, z: 0}, {x: 2, y: 4, z: 0}, {x: 4, y: 4, z: 0}, {x: 6, y: 4, z: 0}, {x: 8, y: 4, z: 0}, {x: 10, y: 4, z: 0}, {x: 12, y: 4, z: 0}, {x: 14, y: 4, z: 0}, {x: 16, y: 4, z: 0}, {x: 18, y: 4, z: 0}, {x: 20, y: 4, z: 0}, {x: 22, y: 4, z: 0},
    {x: 2, y: 6, z: 0}, {x: 4, y: 6, z: 0}, {x: 6, y: 6, z: 0}, {x: 8, y: 6, z: 0}, {x: 10, y: 6, z: 0}, {x: 12, y: 6, z: 0}, {x: 14, y: 6, z: 0}, {x: 16, y: 6, z: 0}, {x: 18, y: 6, z: 0}, {x: 20, y: 6, z: 0}, {x: 22, y: 6, z: 0},
    {x: 2, y: 8, z: 0}, {x: 4, y: 8, z: 0}, {x: 6, y: 8, z: 0}, {x: 8, y: 8, z: 0}, {x: 10, y: 8, z: 0}, {x: 12, y: 8, z: 0}, {x: 14, y: 8, z: 0}, {x: 16, y: 8, z: 0}, {x: 18, y: 8, z: 0}, {x: 20, y: 8, z: 0},
    {x: 2, y: 10, z: 0}, {x: 4, y: 10, z: 0}, {x: 6, y: 10, z: 0}, {x: 8, y: 10, z: 0}, {x: 10, y: 10, z: 0}, {x: 12, y: 10, z: 0}, {x: 14, y: 10, z: 0},
    {x: 24, y: 4, z: 0}, {x: 26, y: 4, z: 0},
    // Layer 1
    {x: 4, y: 2, z: 1}, {x: 6, y: 2, z: 1}, {x: 8, y: 2, z: 1}, {x: 10, y: 2, z: 1}, {x: 12, y: 2, z: 1}, {x: 14, y: 2, z: 1},
    {x: 4, y: 4, z: 1}, {x: 6, y: 4, z: 1}, {x: 8, y: 4, z: 1}, {x: 10, y: 4, z: 1}, {x: 12, y: 4, z: 1}, {x: 14, y: 4, z: 1},
    {x: 4, y: 6, z: 1}, {x: 6, y: 6, z: 1}, {x: 8, y: 6, z: 1}, {x: 10, y: 6, z: 1}, {x: 12, y: 6, z: 1}, {x: 14, y: 6, z: 1},
    {x: 4, y: 8, z: 1}, {x: 6, y: 8, z: 1}, {x: 8, y: 8, z: 1}, {x: 10, y: 8, z: 1}, {x: 12, y: 8, z: 1}, {x: 14, y: 8, z: 1},
    // Layer 2
    {x: 6, y: 4, z: 2}, {x: 8, y: 4, z: 2}, {x: 10, y: 4, z: 2}, {x: 12, y: 4, z: 2},
    {x: 6, y: 6, z: 2}, {x: 8, y: 6, z: 2}, {x: 10, y: 6, z: 2}, {x: 12, y: 6, z: 2},
    // Layer 3
    {x: 8, y: 4, z: 3}, {x: 10, y: 4, z: 3},
    {x: 8, y: 6, z: 3}, {x: 10, y: 6, z: 3},
    // Layer 4 (Top)
    {x: 9, y: 5, z: 4}
];

interface Tile {
  id: number;
  symbol: string;
  x: number;
  y: number;
  z: number;
}

const shuffle = (array: any[]) => array.sort(() => Math.random() - 0.5);

export function MahjongSolitaireUI() {
    const [tiles, setTiles] = useState<Tile[]>([]);
    const [selectedTile, setSelectedTile] = useState<Tile | null>(null);
    const [hint, setHint] = useState<number[] | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [gamesStarted, setGamesStarted] = useState(0);

    const isTileBlocked = useCallback((tile: Tile, currentTiles: Tile[]): boolean => {
        const onTop = currentTiles.some(t => t.z > tile.z && Math.abs(t.x - tile.x) < 2 && Math.abs(t.y - tile.y) < 2);
        if (onTop) return true;
        
        const isBlockedOnLeft = currentTiles.some(t => t.z === tile.z && t.x === tile.x - 2 && Math.abs(t.y - tile.y) < 2);
        const isBlockedOnRight = currentTiles.some(t => t.z === tile.z && t.x === tile.x + 2 && Math.abs(t.y - tile.y) < 2);

        return isBlockedOnLeft && isBlockedOnRight;
    }, []);
    
    const findHint = useCallback(() => {
        const openTiles = tiles.filter(t => !isTileBlocked(t, tiles));
        const pairs = new Map<string, Tile[]>();

        for(const tile of openTiles) {
            if(!pairs.has(tile.symbol)) pairs.set(tile.symbol, []);
            pairs.get(tile.symbol)!.push(tile);
        }

        for(const group of pairs.values()){
            if(group.length >= 2){
                setHint([group[0].id, group[1].id]);
                setTimeout(() => setHint(null), 1000);
                return;
            }
        }
        setHint(null);
    }, [tiles, isTileBlocked]);
    
    const initializeGame = useCallback(() => {
        let baseTiles = TILE_SET;
        let allSymbols = [...baseTiles, ...baseTiles, ...baseTiles, ...baseTiles].slice(0, 136); // 34 * 4 = 136
        allSymbols = shuffle(allSymbols);
        
        // Add special tiles
        const specialTiles = ['🀄︎', '🀄︎', '🀄︎', '🀄︎', '發', '發', '發', '發'];
        allSymbols.push(...specialTiles);
        allSymbols = shuffle(allSymbols);

        const newTiles = TURTLE_LAYOUT.map((pos, index) => ({
            id: index,
            symbol: allSymbols[index],
            ...pos
        }));

        setTiles(newTiles);
        setSelectedTile(null);
        setGameOver(false);
        setHint(null);
        setGamesStarted(c => c + 1);
    }, []);

    useEffect(() => {
        initializeGame();
    }, [initializeGame]);
    
    const handleTileClick = (tile: Tile) => {
        if (isTileBlocked(tile, tiles) || tile.id === selectedTile?.id) {
            setSelectedTile(null);
            return;
        };
        setHint(null);

        if (selectedTile) {
            if (selectedTile.symbol === tile.symbol) {
                setTiles(t => t.filter(t => t.id !== selectedTile.id && t.id !== tile.id));
                setSelectedTile(null);
            } else {
                setSelectedTile(tile);
            }
        } else {
            setSelectedTile(tile);
        }
    };
    
    useEffect(() => {
        if(tiles.length === 0 && TOTAL_PAIRS > 0 && gamesStarted > 1) {
            setGameOver(true);
        }
    }, [tiles, gamesStarted]);
    
    const boardWidth = Math.max(...TURTLE_LAYOUT.map(t => t.x)) + 4;
    const boardHeight = Math.max(...TURTLE_LAYOUT.map(t => t.y)) + 4;

    return (
        <Card className="shadow-2xl overflow-auto">
            <CardContent className="p-4 md:p-6 space-y-4">
                 <div className="flex justify-between items-center bg-muted p-2 rounded-lg">
                    <div className="text-lg font-bold">Tiles Left: {tiles.length}</div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={findHint}><Lightbulb className="mr-2"/>Hint</Button>
                        <Button onClick={initializeGame}><RotateCcw className="mr-2"/>New Game</Button>
                    </div>
                </div>
                 <div className="relative mx-auto" style={{ width: `${boardWidth * 12}px`, height: `${boardHeight * 12}px`}}>
                    {tiles.sort((a,b) => a.z - b.z).map(tile => {
                        const isBlocked = isTileBlocked(tile, tiles);
                        return (
                            <div 
                                key={tile.id}
                                className={cn(
                                    "absolute w-8 h-10 rounded text-center text-xl flex items-center justify-center font-sans transition-all duration-200 border-b-2 border-r-2",
                                    "bg-[#fcf7e9] border-[#cec7b6]",
                                    !isBlocked && "cursor-pointer hover:bg-yellow-200",
                                    selectedTile?.id === tile.id && "ring-2 ring-blue-500",
                                    hint?.includes(tile.id) && "animate-pulse ring-2 ring-green-500",
                                    isBlocked && "brightness-[85%]"
                                )}
                                style={{
                                    left: tile.x * 6,
                                    top: tile.y * 6,
                                    zIndex: tile.z * 10 + tile.y,
                                    transform: `translate(${tile.z*2}px, -${tile.z*2}px)`
                                }}
                                onClick={() => handleTileClick(tile)}
                            >
                                {tile.symbol}
                            </div>
                        )
                    })}
                </div>
                 <Dialog open={gameOver} onOpenChange={(isOpen) => !isOpen && setGameOver(false)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="flex items-center justify-center text-center">
                               <Award className="w-12 h-12 text-yellow-500 mr-4" />
                               You Won!
                            </DialogTitle>
                            <DialogDescription className="text-xl text-center py-4">
                                Congratulations, you've cleared the board!
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

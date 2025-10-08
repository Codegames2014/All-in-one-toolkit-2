"use client";

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, X, RotateCcw, HelpCircle, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

// --- Puzzle Definition ---
const categories = {
    nationality: ["Englishman", "Spaniard", "Ukrainian", "Norwegian", "Japanese"],
    houseColor: ["Red", "Green", "Ivory", "Yellow", "Blue"],
    pet: ["Dog", "Snails", "Fox", "Horse", "Zebra"],
    drink: ["Coffee", "Tea", "Milk", "Orange Juice", "Water"],
    cigarette: ["Old Gold", "Kools", "Chesterfields", "Lucky Strike", "Parliaments"],
};

const clues = [
    "The Englishman lives in the red house.",
    "The Spaniard owns the dog.",
    "Coffee is drunk in the green house.",
    "The Ukrainian drinks tea.",
    "The green house is immediately to the right of the ivory house.",
    "The Old Gold smoker owns snails.",
    "Kools are smoked in the yellow house.",
    "Milk is drunk in the middle house.",
    "The Norwegian lives in the first house.",
    "The man who smokes Chesterfields lives in the house next to the man with the fox.",
    "Kools are smoked in the house next to the house where the horse is kept.",
    "The Lucky Strike smoker drinks orange juice.",
    "The Japanese smokes Parliaments.",
    "The Norwegian lives next to the blue house.",
];

const solution = {
    "Englishman": { houseColor: "Red", pet: "Snails", drink: "Milk", cigarette: "Old Gold" },
    "Spaniard": { houseColor: "Ivory", pet: "Dog", drink: "Orange Juice", cigarette: "Lucky Strike" },
    "Ukrainian": { houseColor: "Blue", pet: "Horse", drink: "Tea", cigarette: "Kools" },
    "Norwegian": { houseColor: "Yellow", pet: "Fox", drink: "Water", cigarette: "Chesterfields" },
    "Japanese": { houseColor: "Green", pet: "Zebra", drink: "Coffee", cigarette: "Parliaments" },
};


const categoryTitles = {
    nationality: "Nationality",
    houseColor: "House Color",
    pet: "Pet",
    drink: "Drink",
    cigarette: "Cigarette Brand",
}

type CategoryKey = keyof typeof categories;

const mainCategory: CategoryKey = 'nationality';
const subCategories = Object.keys(categories).filter(k => k !== mainCategory) as CategoryKey[];

export function LogicPuzzleUI() {
    const { toast } = useToast();
    const [gridState, setGridState] = useState(() => createInitialGrid());
    const [isSolved, setIsSolved] = useState(false);

    function createInitialGrid() {
        const grid: Record<string, 'blank' | 'yes' | 'no'> = {};
        for (const cat of subCategories) {
            for (const mainItem of categories[mainCategory]) {
                for (const subItem of categories[cat]) {
                    grid[`${mainItem}-${subItem}`] = 'blank';
                }
            }
        }
        return grid;
    }

    const resetGrid = useCallback(() => {
        setGridState(createInitialGrid());
        setIsSolved(false);
        toast({ title: "Grid Reset", description: "The puzzle has been reset to its initial state." });
    }, [toast]);
    
    const checkSolution = useCallback(() => {
        let correct = true;
        for (const mainItem of categories[mainCategory]) {
            for (const catKey of subCategories) {
                const solvedSubItem = solution[mainItem as keyof typeof solution][catKey as keyof typeof solution.Englishman];
                if (gridState[`${mainItem}-${solvedSubItem}`] !== 'yes') {
                    correct = false;
                    break;
                }
            }
            if(!correct) break;
        }

        if (correct) {
            setIsSolved(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Not Quite Right",
                description: "The solution is not correct yet. Keep trying!",
            });
        }
    }, [gridState, toast]);

    const handleCellClick = (mainItem: string, subItem: string, catKey: CategoryKey) => {
        const key = `${mainItem}-${subItem}`;
        const currentState = gridState[key];
        let nextState: 'blank' | 'yes' | 'no' = 'blank';

        if(currentState === 'blank') nextState = 'yes';
        else if(currentState === 'yes') nextState = 'no';
        else nextState = 'blank';

        const newGridState = { ...gridState };
        newGridState[key] = nextState;

        // Auto-update logic if 'yes' is selected
        if (nextState === 'yes') {
            // Set all other items in the same row/category to 'no'
            for(const otherSubItem of categories[catKey]) {
                if(otherSubItem !== subItem) {
                    newGridState[`${mainItem}-${otherSubItem}`] = 'no';
                }
            }
            // Set all other items in the same column/mainItem to 'no'
            for(const otherMainItem of categories[mainCategory]) {
                if(otherMainItem !== mainItem) {
                    newGridState[`${otherMainItem}-${subItem}`] = 'no';
                }
            }
        }

        setGridState(newGridState);
    };
    
    const mainItems = categories[mainCategory];
    const gridTemplateColumns = `repeat(${subCategories.length * 5 + 1}, minmax(0, 1fr))`;


    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <Card className="lg:w-1/3">
                <CardHeader>
                    <CardTitle>The Zebra Puzzle</CardTitle>
                    <CardDescription>There are five houses...</CardDescription>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-96 pr-4">
                        <p className="mb-4 text-sm text-muted-foreground">The following is a classic logic puzzle. There are five houses in a row. Use the clues below to figure out who owns the zebra and who drinks the water.</p>
                        <ol className="list-decimal list-inside space-y-2 text-sm">
                            {clues.map((clue, i) => <li key={i}>{clue}</li>)}
                        </ol>
                    </ScrollArea>
                    <div className="mt-4 flex flex-wrap gap-2">
                         <Button onClick={resetGrid}><RotateCcw className="mr-2"/>Reset</Button>
                         <Button onClick={checkSolution} variant="secondary"><HelpCircle className="mr-2"/>Check Solution</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="lg:w-2/3 overflow-x-auto">
                 <CardContent className="p-4">
                    <div className="grid gap-0" style={{ gridTemplateColumns }}>
                        {/* Corner Header */}
                        <div className="sticky top-0 left-0 z-10 p-2 font-bold bg-muted border-b border-r">&nbsp;</div>
                        
                        {/* Sub-Category Headers */}
                        {subCategories.map(catKey => (
                             categories[catKey].map(subItem => (
                                <div key={subItem} className="p-2 text-xs font-bold text-center border-b transform -rotate-45" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                                    {subItem}
                                </div>
                            ))
                        ))}

                        {/* Main Grid Content */}
                        {mainItems.map((mainItem, mainIndex) => (
                            <>
                                <div key={mainItem} className="sticky left-0 p-2 font-bold bg-muted border-r">{mainItem}</div>
                                {subCategories.map(catKey => (
                                    categories[catKey].map((subItem, subIndex) => {
                                        const key = `${mainItem}-${subItem}`;
                                        const state = gridState[key];
                                        return (
                                            <div 
                                                key={key} 
                                                className={cn(
                                                    "w-full aspect-square flex items-center justify-center border cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700",
                                                    (mainIndex + 1) % 5 === 0 && mainIndex !== 4 && 'border-b-2 border-b-primary',
                                                    (subIndex + 1) % 5 === 0 && subIndex !== 4 && 'border-r-2 border-r-primary'
                                                )}
                                                onClick={() => handleCellClick(mainItem, subItem, catKey)}
                                            >
                                                {state === 'yes' && <Check className="text-green-500" />}
                                                {state === 'no' && <X className="text-red-500" />}
                                            </div>
                                        )
                                    })
                                ))}
                            </>
                        ))}
                    </div>
                 </CardContent>
            </Card>
             <Dialog open={isSolved} onOpenChange={(isOpen) => !isOpen && setIsSolved(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-center text-center">
                           <Award className="w-12 h-12 text-yellow-500 mr-4" />
                           You Solved It!
                        </DialogTitle>
                        <DialogDescription className="text-xl text-center py-4">
                           Congratulations, you are a master of logic! The Norwegian drinks the water, and the Japanese owns the Zebra.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button onClick={resetGrid} className="w-full">Play Again</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

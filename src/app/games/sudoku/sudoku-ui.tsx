"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { RotateCcw, Lightbulb, CheckCircle, BrainCircuit, Award } from 'lucide-react';

// --- Sudoku Logic ---
const generatePuzzle = (difficulty: 'easy' | 'medium' | 'hard' | 'expert' = 'medium') => {
    let board = Array.from({ length: 9 }, () => Array(9).fill(0));
    
    // Fill the diagonal 3x3 boxes
    const fillDiagonal = () => {
        for (let i = 0; i < 9; i = i + 3) {
            fillBox(i, i);
        }
    };

    const fillBox = (row: number, col: number) => {
        let num;
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                do {
                    num = Math.floor(Math.random() * 9) + 1;
                } while (!isSafeInBox(board, row, col, num));
                board[row + i][col + j] = num;
            }
        }
    };

    const isSafeInBox = (board: number[][], row: number, col: number, num: number) => {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (board[row + i][col + j] === num) {
                    return false;
                }
            }
        }
        return true;
    };
    
    const solve = (b: number[][]): boolean => {
        const find = findEmpty(b);
        if (!find) return true;
        
        let [row, col] = find;
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        
        for (let num of nums) {
            if (isSafe(b, row, col, num)) {
                b[row][col] = num;
                if (solve(b)) return true;
                b[row][col] = 0;
            }
        }
        return false;
    };
    
    fillDiagonal();
    solve(board);

    const puzzle = board.map(row => [...row]);
    
    // Remove numbers to create puzzle
    let attempts = 5;
    if(difficulty === 'easy') attempts = 40;
    if(difficulty === 'medium') attempts = 50;
    if(difficulty === 'hard') attempts = 55;
    if(difficulty === 'expert') attempts = 60;
    
    let removed = 0;
    while (removed < attempts && removed < 64) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            let temp = puzzle[row][col];
            puzzle[row][col] = 0;
            
            // Make sure puzzle still has a unique solution
            let tempPuzzle = puzzle.map(r => [...r]);
            if (countSolutions(tempPuzzle) !== 1) {
                puzzle[row][col] = temp;
            } else {
                removed++;
            }
        }
    }
    
    return { puzzle, solution: board };
};

const countSolutions = (board: number[][]): number => {
    let count = 0;
    const find = findEmpty(board);
    if (!find) return 1;

    let [row, col] = find;
    for (let num = 1; num <= 9; num++) {
        if (isSafe(board, row, col, num)) {
            board[row][col] = num;
            count += countSolutions(board);
            board[row][col] = 0; // backtrack
            if (count > 1) return count; // optimization
        }
    }
    return count;
}


const findEmpty = (board: number[][]): [number, number] | null => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0) return [i, j];
        }
    }
    return null;
};

const isSafe = (board: number[][], row: number, col: number, num: number) => {
    // Check row
    for (let x = 0; x < 9; x++) if (board[row][x] === num) return false;
    // Check col
    for (let x = 0; x < 9; x++) if (board[x][col] === num) return false;
    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (board[i + startRow][j + startCol] === num) return false;
    return true;
};

const shuffle = (array: any[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

// --- Sudoku UI Component ---
export function SudokuUI() {
  const [board, setBoard] = useState<number[][]>([]);
  const [initialBoard, setInitialBoard] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [isFinished, setIsFinished] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const newGame = useCallback((diff: 'easy' | 'medium' | 'hard' | 'expert') => {
    const { puzzle, solution } = generatePuzzle(diff);
    setBoard(puzzle.map(row => [...row]));
    setInitialBoard(puzzle.map(row => [...row]));
    setSolution(solution);
    setSelectedCell(null);
    setIsFinished(false);
    setStatusMessage("New game started. Good luck!");
  }, []);

  useEffect(() => {
    newGame(difficulty);
  }, [newGame, difficulty]);

  const handleCellClick = (row: number, col: number) => {
    if (initialBoard[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberInput = (num: number) => {
    if (selectedCell) {
      const { row, col } = selectedCell;
      const newBoard = board.map(r => [...r]);
      newBoard[row][col] = num;
      setBoard(newBoard);
    }
  };

  const handleErase = () => {
    if (selectedCell) {
        const { row, col } = selectedCell;
        const newBoard = board.map(r => [...r]);
        newBoard[row][col] = 0;
        setBoard(newBoard);
    }
  };

  const checkSolution = () => {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (board[i][j] === 0 || board[i][j] !== solution[i][j]) {
                setStatusMessage("Something is not quite right. Keep trying!");
                return;
            }
        }
    }
    setStatusMessage("Congratulations! You've solved the puzzle!");
    setIsFinished(true);
  };
  
  const showHint = () => {
      if(selectedCell){
          const {row, col} = selectedCell;
          const newBoard = board.map(r => [...r]);
          newBoard[row][col] = solution[row][col];
          setBoard(newBoard);
          setStatusMessage(`Hint applied for cell (${row + 1}, ${col + 1}).`);
      } else {
          setStatusMessage("Select a cell to get a hint.");
      }
  }

  const solvePuzzle = () => {
      setBoard(solution);
      setStatusMessage("Puzzle solved! Try another one.");
      setIsFinished(true);
  }
  
  const getRelatedCells = (row: number, col: number) => {
      const related = new Set<string>();
      // Row and column
      for (let i = 0; i < 9; i++) {
          related.add(`${row}-${i}`);
          related.add(`${i}-${col}`);
      }
      // 3x3 Box
      const startRow = row - row % 3;
      const startCol = col - col % 3;
      for (let i = 0; i < 3; i++) {
          for (let j = 0; j < 3; j++) {
              related.add(`${startRow + i}-${startCol + j}`);
          }
      }
      return related;
  };

  const selectedNumber = selectedCell ? board[selectedCell.row][selectedCell.col] : 0;
  const relatedCells = selectedCell ? getRelatedCells(selectedCell.row, selectedCell.col) : new Set();

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Sudoku</CardTitle>
            <div className="flex items-center gap-2">
                <Label htmlFor="difficulty" className="whitespace-nowrap">Difficulty:</Label>
                <Select value={difficulty} onValueChange={(val) => setDifficulty(val as any)}>
                    <SelectTrigger id="difficulty" className="w-[120px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                        <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-6 space-y-4">
        <div className="grid grid-cols-9 w-full max-w-lg mx-auto border-2 border-gray-700 aspect-square">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isInitial = initialBoard[rowIndex][colIndex] !== 0;
              const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
              const isRelated = relatedCells.has(`${rowIndex}-${colIndex}`);
              const isSameNumber = cell !== 0 && cell === selectedNumber;
              const isError = cell !== 0 && !isSafe(board, rowIndex, colIndex, cell);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={cn(
                    "w-full h-full flex items-center justify-center text-2xl font-bold border border-gray-300 dark:border-gray-600 transition-colors",
                    isInitial ? "text-gray-900 dark:text-gray-200" : "text-blue-600 dark:text-blue-400 cursor-pointer",
                    isRelated && !isSelected && "bg-gray-200 dark:bg-gray-700",
                    isSameNumber && !isSelected && "bg-blue-200 dark:bg-blue-800/50",
                    isSelected && "bg-blue-300 dark:bg-blue-700 ring-2 ring-blue-500 z-10",
                    (colIndex % 3 === 2 && colIndex !== 8) && "border-r-2 border-r-gray-700",
                    (rowIndex % 3 === 2 && rowIndex !== 8) && "border-b-2 border-b-gray-700",
                    isError && !isInitial && "text-red-500"
                  )}
                >
                  {cell !== 0 && cell}
                </div>
              )
            })
          )}
        </div>

        <div className="text-center font-semibold text-muted-foreground min-h-[24px]">
            {statusMessage}
        </div>

        <div className="flex justify-center gap-2">
          {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
            <Button key={num} onClick={() => handleNumberInput(num)} variant="outline" size="icon" className="text-xl">
              {num}
            </Button>
          ))}
          <Button onClick={handleErase} variant="destructive" size="icon">
            Erase
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
            <Button onClick={() => newGame(difficulty)}><RotateCcw className="mr-2" />New Game</Button>
            <Button onClick={showHint} variant="secondary" disabled={!selectedCell || initialBoard[selectedCell.row][selectedCell.col] !== 0}><Lightbulb className="mr-2" />Hint</Button>
            <Button onClick={checkSolution} variant="secondary"><CheckCircle className="mr-2" />Check</Button>
            <Button onClick={solvePuzzle} variant="secondary"><BrainCircuit className="mr-2" />Solve</Button>
        </div>
      </CardContent>

      <Dialog open={isFinished} onOpenChange={(isOpen) => !isOpen && setIsFinished(false)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="flex items-center justify-center text-center">
                   <Award className="w-12 h-12 text-yellow-500 mr-4" />
                   Puzzle Solved!
                </DialogTitle>
                <DialogDescription className="text-xl text-center py-4">
                    Congratulations, you are a Sudoku master!
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={() => newGame(difficulty)} className="w-full">Play Again</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

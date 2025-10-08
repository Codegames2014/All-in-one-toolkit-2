
"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Chess, Square, Piece, Move, PieceSymbol } from 'chess.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { RotateCcw, Crown, Undo, Home, BrainCircuit, Users, Bot, Loader2, Copy, Swords } from 'lucide-react';
import Link from 'next/link';
import { getBestMove } from '@/ai/flows/get-chess-move';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { ref, onValue, set, get, child } from 'firebase/database';


type PieceComponentType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
type PieceColor = 'w' | 'b';

// SVG components for chess pieces
const pieceSVGs: Record<PieceColor, Record<PieceComponentType, string>> = {
  w: {
    p: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
    n: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
    b: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
    r: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
    q: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
    k: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg",
  },
  b: {
    p: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
    n: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
    b: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
    r: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
    q: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
    k: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg",
  },
};

const PieceComponent = ({ piece }: { piece: Piece }) => {
  const src = pieceSVGs[piece.color][piece.type];
  return <img src={src} alt={`${piece.color} ${piece.type}`} className="w-full h-full" />;
};

const SquareComponent = ({
  piece,
  isLight,
  square,
  onClick,
  isSelected,
  isPossibleMove,
}: {
  piece: Piece | null;
  isLight: boolean;
  square: Square;
  onClick: () => void;
  isSelected: boolean;
  isPossibleMove: boolean;
}) => {
  const bgClass = isLight ? 'bg-[#e3c16f]' : 'bg-[#b78962]';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        "w-full h-full flex items-center justify-center relative aspect-square",
        bgClass,
        isSelected && 'bg-yellow-400/70',
        "cursor-pointer"
      )}
    >
      {piece && <PieceComponent piece={piece} />}
      {isPossibleMove && (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn("rounded-full", piece ? "h-full w-full ring-4 ring-yellow-400/50" : "h-1/3 w-1/3 bg-yellow-400/50")}/>
        </div>
      )}
    </div>
  );
};

const useSound = (src: string) => {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    useEffect(() => {
        if (typeof Audio !== "undefined") {
            const newAudio = new Audio(src);
            newAudio.preload = 'auto';
            setAudio(newAudio);
        }
    }, [src]);

    const play = useCallback(() => {
        if(audio) {
            audio.currentTime = 0;
            audio.play().catch(e => console.error("Error playing sound:", e));
        }
    }, [audio]);

    return play;
}

type GameMode = 'playerVsPlayer' | 'playerVsAi' | 'aiVsAi' | 'online';
type PlayerColorOnline = 'w' | 'b' | null;

export function ChessUI() {
  const [game, setGame] = useState(new Chess());
  const [board, setBoard] = useState(game.board());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Move[]>([]);
  const [status, setStatus] = useState("Select a game mode");
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [aiLevel, setAiLevel] = useState(2);
  const [isThinking, setIsThinking] = useState(false);
  const [endGameMessage, setEndGameMessage] = useState<string | null>(null);
  const [onlineGameId, setOnlineGameId] = useState<string>("");
  const [onlinePlayerColor, setOnlinePlayerColor] = useState<PlayerColorOnline>(null);
  const [joinGameId, setJoinGameId] = useState("");

  const { toast } = useToast();
  
  const playMoveSound = useSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
  const playCaptureSound = useSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');
  const playCheckSound = useSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3');
  const playEndGameSound = useSound('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/game-end.mp3');


  const updateGame = useCallback((newGame: Chess, move: Move | null = null) => {
    if (move) {
      if (move.flags.includes('c')) playCaptureSound();
      else playMoveSound();
    }
    
    setGame(newGame);
    setBoard(newGame.board());
    
    let newStatus = '';
    const turn = newGame.turn() === 'w' ? 'White' : 'Black';

    if (newGame.isCheckmate()) {
        newStatus = `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins.`;
        setEndGameMessage(newStatus);
        playEndGameSound();
    } else if (newGame.isDraw()) {
        newStatus = "Draw!";
        setEndGameMessage(newStatus);
        playEndGameSound();
    } else {
        newStatus = `${turn} to move`;
        if (newGame.isCheck()) {
            newStatus += " - Check!";
            if (!move) playCheckSound(); // Play check sound on opponent's move from firebase
        }
    }
    setStatus(newStatus);
  }, [playMoveSound, playCaptureSound, playCheckSound, playEndGameSound]);

   useEffect(() => {
    if (gameMode !== 'online' || !onlineGameId) return;

    const gameRef = ref(db, `games/${onlineGameId}`);
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const data = snapshot.val();
      if (data && data.fen && data.fen !== game.fen()) {
        const newGame = new Chess(data.fen);
        updateGame(newGame);
      }
    });

    return () => unsubscribe();
  }, [gameMode, onlineGameId, game, updateGame]);


  const makeAiMove = useCallback(async (currentGame: Chess) => {
    if (currentGame.isGameOver()) return;
    setIsThinking(true);
    try {
        const { bestMove } = await getBestMove({ fen: currentGame.fen(), level: aiLevel });
        if(bestMove){
            const newGame = new Chess(currentGame.fen());
            const move = newGame.move(bestMove);
            if(move) updateGame(newGame, move);
        }
    } catch(e) {
        console.error(e);
        toast({
            title: "AI Error",
            description: "The AI failed to make a move. Please try again.",
            variant: "destructive"
        })
    } finally {
        setIsThinking(false);
    }
  }, [aiLevel, updateGame, toast]);

  useEffect(() => {
    if (!gameMode || game.isGameOver() || isThinking) return;
    
    const isAiTurn = (gameMode === 'playerVsAi' && game.turn() === 'b') || 
                     (gameMode === 'aiVsAi');

    if (isAiTurn) {
      setTimeout(() => makeAiMove(game), 500);
    }
  }, [board, gameMode, isThinking, makeAiMove, game]);

  const handleSquareClick = (square: Square) => {
    if (game.isGameOver() || isThinking) return;

    if (gameMode === 'playerVsAi' && game.turn() === 'b') return;
    if (gameMode === 'online' && game.turn() !== onlinePlayerColor) return;

    if (selectedSquare) {
       const move = { from: selectedSquare, to: square, promotion: 'q' as PieceSymbol | undefined };
       const newGame = new Chess(game.fen());
       const result = newGame.move(move);

       if (result) {
         updateGame(newGame, result);
         if (gameMode === 'online' && onlineGameId) {
           const gameRef = ref(db, `games/${onlineGameId}`);
           set(gameRef, { fen: newGame.fen() });
         }
       }
       
       setSelectedSquare(null);
       setPossibleMoves([]);
    } else {
      const piece = game.get(square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
        setPossibleMoves(game.moves({ square, verbose: true }));
      }
    }
  };

  const resetGame = () => {
    const newGame = new Chess();
    setGame(newGame);
    updateGame(newGame);
    setSelectedSquare(null);
    setPossibleMoves([]);
    setEndGameMessage(null);
    setIsThinking(false);
  };
  
  const handleGameModeSelection = (mode: GameMode) => {
      setGameMode(mode);
      resetGame();
  }
  
  const createOnlineGame = () => {
      const newGameId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const gameRef = ref(db, `games/${newGameId}`);
      const newGame = new Chess();
      set(gameRef, { fen: newGame.fen(), players: { w: true } });
      setOnlineGameId(newGameId);
      setOnlinePlayerColor('w');
      handleGameModeSelection('online');
  }

  const joinOnlineGame = async () => {
    if(!joinGameId) return;
    const gameRef = ref(db, `games/${joinGameId}`);
    const snapshot = await get(gameRef);
    if(snapshot.exists()){
        const gameData = snapshot.val();
        if(!gameData.players.b){
            set(child(snapshot.ref, 'players'), {...gameData.players, b: true})
            setOnlineGameId(joinGameId);
            setOnlinePlayerColor('b');
            handleGameModeSelection('online');
            updateGame(new Chess(gameData.fen));
        } else {
            toast({ variant: 'destructive', title: "Game is full" });
        }
    } else {
        toast({ variant: 'destructive', title: "Game not found" });
    }
  }

  const copyGameId = () => {
      navigator.clipboard.writeText(onlineGameId);
      toast({ title: "Game ID copied!"});
  }
  
  const boardToRender = useMemo(() => {
      const newBoard = game.board();
      if(onlinePlayerColor === 'b') {
          return newBoard.slice().reverse().map(row => row.slice().reverse());
      }
      return newBoard;
  }, [game, onlinePlayerColor]);

  const files = useMemo(() => onlinePlayerColor === 'b' ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h'], [onlinePlayerColor]);
  const ranks = useMemo(() => onlinePlayerColor === 'b' ? ['1','2','3','4','5','6','7','8'].reverse() : ['8','7','6','5','4','3','2','1'], [onlinePlayerColor]);


  if(!gameMode) {
      return (
          <Card className="shadow-2xl">
              <CardHeader>
                  <CardTitle>Select Game Mode</CardTitle>
                  <CardDescription>Choose how you want to play.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <Button className="w-full" onClick={() => handleGameModeSelection('playerVsPlayer')}><Users className="mr-2"/>Player vs Player</Button>
                  <Button className="w-full" onClick={() => handleGameModeSelection('playerVsAi')}><BrainCircuit className="mr-2"/>Player vs AI</Button>
                  <Button className="w-full" onClick={() => handleGameModeSelection('aiVsAi')}><Bot className="mr-2"/>AI vs AI</Button>
                  <Card className="p-4">
                      <h3 className="font-semibold mb-2 flex items-center"><Swords className="mr-2"/> Online Multiplayer</h3>
                      <div className="space-y-2">
                          <Button className="w-full" onClick={createOnlineGame}>Create New Game</Button>
                          <div className="flex gap-2">
                              <Input placeholder="Enter game code" value={joinGameId} onChange={(e) => setJoinGameId(e.target.value.toUpperCase())} />
                              <Button onClick={joinOnlineGame}>Join Game</Button>
                          </div>
                      </div>
                  </Card>
              </CardContent>
          </Card>
      )
  }

  return (
    <Card className="shadow-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle>Chess</CardTitle>
            <Button variant="link" onClick={() => setGameMode(null)}>Change Mode</Button>
        </div>
      </CardHeader>
      <CardContent className="p-2 md:p-6 space-y-4">
        {gameMode === 'online' && onlineGameId && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                <span className="font-semibold">Game Code: {onlineGameId}</span>
                <Button size="icon" variant="ghost" onClick={copyGameId}><Copy className="w-4 h-4"/></Button>
                <span className="text-sm text-muted-foreground ml-auto">You are playing as {onlinePlayerColor === 'w' ? 'White' : 'Black'}</span>
            </div>
        )}
        <div className="max-w-lg mx-auto bg-[#c8a064] rounded-md">
            <div className="grid grid-cols-[auto_1fr] grid-rows-[1fr_auto]">
                <div className="row-start-2 col-start-2 grid grid-cols-8">
                    {files.map(file => <div key={file} className="flex items-center justify-center text-xs h-6 font-semibold text-black/60">{file}</div>)}
                </div>
                <div className="col-start-1 row-start-1 grid grid-rows-8">
                    {ranks.map(rank => <div key={rank} className="flex items-center justify-center text-xs w-6 font-semibold text-black/60">{rank}</div>)}
                </div>
                <div className="col-start-2 row-start-1 grid grid-cols-8 grid-rows-8 w-full aspect-square">
                    {boardToRender.map((row, r) =>
                        row.map((piece, c) => {
                             const trueRow = onlinePlayerColor === 'b' ? 7 - r : r;
                             const trueCol = onlinePlayerColor === 'b' ? 7 - c : c;
                             const square = `${String.fromCharCode(97 + trueCol)}${8 - trueRow}` as Square;
                             const isLight = (trueRow + trueCol) % 2 !== 0

                            return <SquareComponent
                                key={square}
                                square={square}
                                piece={piece}
                                isLight={isLight}
                                onClick={() => handleSquareClick(square)}
                                isSelected={square === selectedSquare}
                                isPossibleMove={possibleMoves.some(m => m.to === square)}
                            />
                        })
                    )}
                </div>
            </div>
        </div>
        <div className="text-xl font-semibold text-center mt-4 min-h-[32px]">
            {game.isCheckmate() && <Crown className="inline-block mr-2 h-8 w-8 text-yellow-500" />}
            {isThinking ? <><Loader2 className="inline-block mr-2 h-6 w-6 animate-spin" /> AI is thinking...</> : status}
        </div>
        <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={resetGame}><RotateCcw className="mr-2 h-4 w-4" />New Game</Button>
            <Button asChild variant="secondary"><Link href="/"><Home className="mr-2 h-4 w-4" />Home</Link></Button>
        </div>
        {(gameMode === 'playerVsAi' || gameMode === 'aiVsAi') && (
            <div className='space-y-2 max-w-sm mx-auto'>
                <Label htmlFor="ai-level">AI Level</Label>
                <Select value={String(aiLevel)} onValueChange={(value) => setAiLevel(Number(value))}>
                    <SelectTrigger id="ai-level">
                        <SelectValue placeholder="Select AI Level" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">Super Easy</SelectItem>
                        <SelectItem value="2">Easy</SelectItem>
                        <SelectItem value="5">Medium</SelectItem>
                        <SelectItem value="10">Hard</SelectItem>
                        <SelectItem value="20">Super Hard</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        )}
      </CardContent>
      <Dialog open={!!endGameMessage} onOpenChange={(isOpen) => !isOpen && setEndGameMessage(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Game Over</DialogTitle>
                <DialogDescription className="text-xl text-center py-4">{endGameMessage}</DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button onClick={resetGame}>Play Again</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

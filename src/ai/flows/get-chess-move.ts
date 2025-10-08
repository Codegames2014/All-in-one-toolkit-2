'use server';

/**
 * @fileOverview A chess AI agent that determines the best move.
 *
 * - getBestMove - A function that calculates the best move for a given chess position.
 * - GetBestMoveInput - The input type for the getBestMove function.
 * - GetBestMoveOutput - The return type for the getBestMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Chess, Move} from 'chess.js';

const GetBestMoveInputSchema = z.object({
    fen: z.string().describe("The Forsyth-Edwards Notation (FEN) of the current board state."),
    level: z.number().min(1).max(20).describe("The difficulty level for the AI, from 1 to 20.")
});
export type GetBestMoveInput = z.infer<typeof GetBestMoveInputSchema>;

const GetBestMoveOutputSchema = z.object({
  bestMove: z.string().nullable().describe('The best move in Standard Algebraic Notation (SAN), e.g., "e4", "Nf3".'),
});
export type GetBestMoveOutput = z.infer<typeof GetBestMoveOutputSchema>;


export async function getBestMove(input: GetBestMoveInput): Promise<GetBestMoveOutput> {
  return getBestMoveFlow(input);
}


// A simple minimax algorithm with alpha-beta pruning.
// NOTE: This is a placeholder for a more sophisticated engine like Stockfish.
// Genkit flows can't easily run WASM, so this is a server-side alternative.

function evaluateBoard(board: Chess) {
    let totalEvaluation = 0;
    board.board().forEach(row => {
        row.forEach(piece => {
            if (piece) {
                totalEvaluation += getPieceValue(piece.type) * (piece.color === 'w' ? 1 : -1);
            }
        });
    });
    return totalEvaluation;
}

function getPieceValue(piece: string) {
    switch (piece) {
        case 'p': return 10;
        case 'n': return 30;
        case 'b': return 30;
        case 'r': return 50;
        case 'q': return 90;
        case 'k': return 900;
        default: return 0;
    }
}


function minimax(game: Chess, depth: number, alpha: number, beta: number, isMaximizingPlayer: boolean): [number, Move | null] {
    if (depth === 0 || game.isGameOver()) {
        return [evaluateBoard(game), null];
    }

    const moves = game.moves({ verbose: true });
    let bestMove: Move | null = null;
    let bestValue = isMaximizingPlayer ? -Infinity : Infinity;

    // Sort moves to improve alpha-beta pruning (captures first)
    moves.sort((a, b) => (b.flags.includes('c') ? 1 : 0) - (a.flags.includes('c') ? 1 : 0));

    for (const move of moves) {
        game.move(move.san);
        const [value] = minimax(game, depth - 1, alpha, beta, !isMaximizingPlayer);
        game.undo();

        if (isMaximizingPlayer) {
            if (value > bestValue) {
                bestValue = value;
                bestMove = move;
            }
            alpha = Math.max(alpha, bestValue);
        } else {
            if (value < bestValue) {
                bestValue = value;
                bestMove = move;
            }
            beta = Math.min(beta, bestValue);
        }

        if (beta <= alpha) {
            break; // Prune
        }
    }

    return [bestValue, bestMove];
}


const getBestMoveFlow = ai.defineFlow(
  {
    name: 'getBestMoveFlow',
    inputSchema: GetBestMoveInputSchema,
    outputSchema: GetBestMoveOutputSchema,
  },
  async ({fen, level}) => {
    const game = new Chess(fen);
    const isMaximizing = game.turn() === 'w';

    // The level roughly translates to minimax depth.
    // This is a very simplified mapping.
    const depth = Math.floor(level / 5) + 1;

    if(game.moves().length === 0){
      return { bestMove: null };
    }
    
    // For very easy levels, pick a random move sometimes
    if (level <= 2 && Math.random() > level * 0.4) {
        const moves = game.moves();
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        return { bestMove: randomMove };
    }

    const [, bestMove] = minimax(game, depth, -Infinity, Infinity, isMaximizing);

    return { bestMove: bestMove ? bestMove.san : null };
  }
);

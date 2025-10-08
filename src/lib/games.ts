import {
  type LucideIcon,
  Puzzle,
  Car,
  Brain,
  Dice5,
  Combine,
  Gamepad2,
  Hash,
  Crown,
  Search,
  Sigma,
  Bot,
  Grape,
  RectangleHorizontal,
  CircleDot,
} from "lucide-react";

export type Game = {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  wip?: boolean;
};

export const games: Game[] = [
  {
    name: "Tic-Tac-Toe",
    description: "The classic game of X's and O's.",
    icon: Hash,
    href: "/games/tic-tac-toe",
  },
  {
    name: "Chess",
    description: "Classic strategy board game.",
    icon: Crown,
    href: "/games/chess",
  },
  {
    name: "Word Search",
    description: "Find the hidden words.",
    icon: Search,
    href: "/games/word-search",
  },
  {
    name: "Hangman",
    description: "Guess the word before it's too late.",
    icon: Bot,
    href: "/games/hangman",
  },
  {
    name: "Mahjong Solitaire",
    description: "A classic tile-matching puzzle.",
    icon: Puzzle,
    href: "/games/mahjong-solitaire",
  },
  {
    name: "Snake",
    description: "Eat the fruit and grow longer.",
    icon: Grape,
    href: "/games/snake",
  },
  {
    name: "2048",
    description: "Slide tiles to get to 2048.",
    icon: RectangleHorizontal,
    href: "/games/2048",
  },
  {
    name: "Asteroids",
    description: "Shoot asteroids and survive.",
    icon: Sigma,
    href: "/games/asteroids",
  },
  {
    name: "Bubble Shooter",
    description: "Pop bubbles to clear the board.",
    icon: CircleDot,
    href: "/games/bubble-shooter",
  },
  {
    name: "Car Racing",
    description: "High-speed racing action.",
    icon: Car,
    href: "/games/car-racing",
  },
  {
    name: "Mind Games",
    description: "Puzzles to test your logic.",
    icon: Brain,
    href: "/games/mind-games",
  },
  {
    name: "Ludo",
    description: "A classic family dice game.",
    icon: Dice5,
    href: "/games/ludo",
  },
  {
    name: "Snakes & Ladders",
    description: "Climb ladders and avoid snakes.",
    icon: Combine,
    href: "/games/snakes-and-ladders",
  },
];

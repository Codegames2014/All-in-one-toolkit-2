import {
  Calculator,
  Sigma,
  Languages,
  Image,
  Scan,
  Feather,
  BrainCircuit,
  Youtube,
  Instagram,
  Facebook,
  PenTool,
  LayoutGrid,
  Wand2,
  AppWindow,
  Gamepad2,
  CircleDollarSign,
  type LucideIcon,
  Crown,
  FileCode,
  MessageCircle,
  QrCode,
  FileJson,
  Palette,
} from "lucide-react";

export type Tool = {
  name: string;
  description: string;
  icon: LucideIcon;
  href: string;
  wip?: boolean;
};

export const tools: Tool[] = [
  {
    name: "Dashboard",
    description: "Overview of all tools.",
    icon: LayoutGrid,
    href: "/",
  },
  {
    name: "AI Chat",
    description: "Chat with an advanced AI.",
    icon: MessageCircle,
    href: "/ai-chat",
  },
  {
    name: "Code Converter",
    description: "Translate code between languages.",
    icon: FileCode,
    href: "/code-converter",
  },
  {
    name: "File Converter",
    description: "Convert between file formats.",
    icon: FileJson,
    href: "/file-converter",
  },
  {
    name: "Money Converter",
    description: "Convert between currencies.",
    icon: CircleDollarSign,
    href: "/money-converter",
  },
   {
    name: "QR Code Scanner",
    description: "Scan QR codes with your camera.",
    icon: QrCode,
    href: "/qr-code-scanner",
  },
  {
    name: "Color Picker",
    description: "Explore and select colors.",
    icon: Palette,
    href: "/color-picker",
  },
  {
    name: "Basic Calculator",
    description: "For simple arithmetic.",
    icon: Calculator,
    href: "/calculator",
  },
  {
    name: "Advanced Calculator",
    description: "Scientific calculations.",
    icon: Sigma,
    href: "/advanced-calculator",
  },
  {
    name: "Text Translator",
    description: "Translate between languages.",
    icon: Languages,
    href: "/translator",
  },
  {
    name: "Photo Editor",
    description: "Basic image adjustments.",
    icon: Image,
    href: "/photo-editor",
  },
  {
    name: "Advanced Photo Editor",
    description: "Edit photos with text prompts.",
    icon: Wand2,
    href: "/advanced-photo-editor",
  },
  {
    name: "BG Remover",
    description: "Remove photo backgrounds.",
    icon: Scan,
    href: "/background-remover",
  },
  {
    name: "Text Generator",
    description: "Generate creative text.",
    icon: Feather,
    href: "/text-generator",
  },
  {
    name: "Math Solver",
    description: "Solve math problems.",
    icon: BrainCircuit,
    href: "/math-solver",
  },
  {
    name: "App Builder",
    description: "Build apps with text prompts.",
    icon: AppWindow,
    href: "/app-builder",
  },
  {
    name: "Games",
    description: "Play fun offline games.",
    icon: Gamepad2,
    href: "/games",
  },
  {
    name: "Chess",
    description: "The classic game of strategy.",
    icon: Crown,
    href: "/games/chess",
  },
  {
    name: "Logo Generator",
    description: "Create unique logos.",
    icon: PenTool,
    href: "/logo-generator",
  },
  {
    name: "YouTube Downloader",
    description: "Download YouTube videos.",
    icon: Youtube,
    href: "/youtube-downloader",
  },
  {
    name: "Instagram Downloader",
    description: "Download Instagram videos.",
    icon: Instagram,
    href: "/instagram-downloader",
  },
  {
    name: "Facebook Downloader",
    description: "Download Facebook videos.",
    icon: Facebook,
    href: "/facebook-downloader",
  },
];

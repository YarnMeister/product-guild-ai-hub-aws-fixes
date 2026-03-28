export interface Module {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  status: "available" | "locked" | "coming_soon";
  accentColor: string; // HSL values for theming
  totalLessons: number;
  totalChallenges: number;
  waitlistUrl?: string;
}

export const modules: Module[] = [
  {
    id: "ai-driven-experimentation",
    title: "AI Powered Experimentation",
    description:
      "Transform into an AI-assisted discovery practitioner. Learn to amplify your judgment with AI as your force multiplier.",
    icon: "FlaskConical",
    status: "available",
    accentColor: "262 83% 58%", // Primary purple
    totalLessons: 5,
    totalChallenges: 20,
  },
  {
    id: "ai-engineering",
    title: "AI Engineering",
    description:
      "Master the fundamentals of AI engineering. Build, deploy, and scale AI-powered applications with modern tooling.",
    icon: "Code2",
    status: "coming_soon",
    accentColor: "210 100% 50%", // Blue
    totalLessons: 6,
    totalChallenges: 18,
    waitlistUrl: "#",
  },
  {
    id: "ai-marketing",
    title: "AI Marketing",
    description:
      "Leverage AI to supercharge your marketing efforts. From content generation to campaign optimization.",
    icon: "Megaphone",
    status: "coming_soon",
    accentColor: "340 82% 52%", // Pink
    totalLessons: 5,
    totalChallenges: 15,
    waitlistUrl: "#",
  },
];

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getAvailableModules(): Module[] {
  return modules.filter((m) => m.status === "available");
}

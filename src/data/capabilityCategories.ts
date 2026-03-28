import {
  Zap,
  Crosshair,
  TrendingUp,
  BarChart3,
  Layers,
  LucideIcon,
} from "lucide-react";

export type CapabilityCategoryId = "velocity" | "precision" | "leverage" | "impact" | "range";

export interface CapabilityCategory {
  id: CapabilityCategoryId;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const capabilityCategories: CapabilityCategory[] = [
  {
    id: "velocity",
    name: "Velocity",
    description: "Reduce time to insight, prototype, or decision.",
    icon: Zap,
  },
  {
    id: "precision",
    name: "Precision",
    description: "Improve clarity, structure, and output quality using AI.",
    icon: Crosshair,
  },
  {
    id: "leverage",
    name: "Leverage",
    description: "Generate disproportionate output from effort.",
    icon: TrendingUp,
  },
  {
    id: "impact",
    name: "Impact",
    description: "Use AI-generated experiments to influence decisions and drive change.",
    icon: BarChart3,
  },
  {
    id: "range",
    name: "Range",
    description: "Expand AI capability across different tools, contexts, and experiment types.",
    icon: Layers,
  },
];

export function getCapabilityCategory(id: CapabilityCategoryId): CapabilityCategory {
  return capabilityCategories.find((c) => c.id === id)!;
}

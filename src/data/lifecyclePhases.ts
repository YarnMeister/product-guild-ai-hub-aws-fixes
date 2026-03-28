import { Search, Lightbulb, FlaskConical, ClipboardCheck, LucideIcon } from "lucide-react";

export type LifecyclePhaseId = "research" | "hypothesis" | "experimentation" | "evaluation";

export interface LifecyclePhase {
  id: LifecyclePhaseId;
  name: string;
  icon: LucideIcon;
  /** Semantic color key matching CSS tokens and Tailwind config */
  colorKey: string;
  /** Short description of the phase */
  description: string;
}

export const lifecyclePhases: LifecyclePhase[] = [
  {
    id: "research",
    name: "Research",
    icon: Search,
    colorKey: "phase-research",
    description: "Discover insights and understand the problem space.",
  },
  {
    id: "hypothesis",
    name: "Hypothesis",
    icon: Lightbulb,
    colorKey: "phase-hypothesis",
    description: "Form testable assumptions from your research.",
  },
  {
    id: "experimentation",
    name: "Experimentation",
    icon: FlaskConical,
    colorKey: "phase-experimentation",
    description: "Build and run structured experiments using AI tools.",
  },
  {
    id: "evaluation",
    name: "Evaluation",
    icon: ClipboardCheck,
    colorKey: "phase-evaluation",
    description: "Measure outcomes and validate learnings.",
  },
];

/** Map each Golden Path lesson to its lifecycle phase */
export const lessonPhaseMap: Record<number, LifecyclePhaseId> = {
  1: "experimentation", // Prototyping with Figma — AI Collaborator track
  2: "experimentation", // AI Workbench — AI Collaborator track
  3: "evaluation",      // AI Evaluations — AI Integrator track
  4: "research",        // MCP Connections — AI Builder track
};

/** The deliberate learning journey order (differs from the cycle) */
export const learningJourneyOrder: LifecyclePhaseId[] = [
  "experimentation",
  "research",
  "hypothesis",
  "evaluation",
];

export function getPhase(id: LifecyclePhaseId): LifecyclePhase {
  return lifecyclePhases.find((p) => p.id === id)!;
}

export function getLessonPhase(lessonId: number): LifecyclePhase | undefined {
  const phaseId = lessonPhaseMap[lessonId];
  return phaseId ? getPhase(phaseId) : undefined;
}

export interface TrackColor {
  /** Tailwind bg class for solid bar/accent */
  bar: string;
  /** Tailwind bg class for light tint backgrounds */
  bg: string;
  /** Tailwind text color class */
  text: string;
  /** Tailwind border color class */
  border: string;
}

/**
 * Canonical color map for every track.
 * All components should import this instead of defining their own.
 */
export const TRACK_COLORS: Record<string, TrackColor> = {
  prototyping:   { bar: "bg-track-prototyping",   bg: "bg-track-prototyping/10", text: "text-track-prototyping",   border: "border-track-prototyping/30" },
  "ai-workbench": { bar: "bg-track-ai-workbench", bg: "bg-track-ai-workbench/10", text: "text-track-ai-workbench", border: "border-track-ai-workbench/30" },
  productivity:  { bar: "bg-track-productivity",  bg: "bg-track-productivity/10", text: "text-track-productivity",  border: "border-track-productivity/30" },
  hosting:       { bar: "bg-track-hosting",        bg: "bg-track-hosting/10",      text: "text-track-hosting",       border: "border-track-hosting/30" },
  measurement:   { bar: "bg-track-measurement",    bg: "bg-track-measurement/10",  text: "text-track-measurement",   border: "border-track-measurement/30" },
};

export function getTrackColor(trackId: string): TrackColor {
  return TRACK_COLORS[trackId] ?? TRACK_COLORS["ai-workbench"];
}

/** Returns the HSL colour string for use in inline styles (replaces coordinator.ts TRACK_COLORS). */
export function getTrackHsl(trackId: string): string {
  const map: Record<string, string> = {
    prototyping:    "hsl(263, 70%, 58%)",
    "ai-workbench": "hsl(217, 91%, 60%)",
    productivity:   "hsl(160, 84%, 39%)",
    hosting:        "hsl(38, 92%, 50%)",
    measurement:    "hsl(347, 77%, 55%)",
  };
  return map[trackId] ?? map["ai-workbench"]!;
}

export interface Track {
  id: string;
  name: string;
  description: string;
  prerequisiteTrackIds: string[];
  sortOrder: number;
  /** Rank level unlocked by completing this track (2–5) */
  maturityLevel: 2 | 3 | 4 | 5;
  /** Human-readable label for the rank this track unlocks */
  rankLabel: string;
}

export const tracks: Track[] = [
  {
    id: "prototyping",
    name: "Prototyping",
    description: "Build and iterate on AI-assisted prototypes rapidly using modern no-code and low-code tools.",
    prerequisiteTrackIds: [],
    sortOrder: 1,
    maturityLevel: 2,
    rankLabel: "AI Collaborator",
  },
  {
    id: "ai-workbench",
    name: "AI Workbench",
    description: "Master AI-native development environments and coding assistants to accelerate your workflow.",
    prerequisiteTrackIds: [],
    sortOrder: 2,
    maturityLevel: 2,
    rankLabel: "AI Collaborator",
  },
  {
    id: "productivity",
    name: "Productivity",
    description: "Amplify your daily output using AI tools for writing, research, and task automation.",
    prerequisiteTrackIds: ["ai-workbench"],
    sortOrder: 3,
    maturityLevel: 3,
    rankLabel: "AI Integrator",
  },
  {
    id: "hosting",
    name: "Hosting",
    description: "Deploy and scale AI-powered applications with modern cloud hosting and infrastructure tools.",
    prerequisiteTrackIds: ["ai-workbench"],
    sortOrder: 4,
    maturityLevel: 4,
    rankLabel: "AI Builder",
  },
  {
    id: "measurement",
    name: "Measurement",
    description: "Evaluate and improve AI outputs using analytics, evals, and observability best practices.",
    prerequisiteTrackIds: ["hosting"],
    sortOrder: 5,
    maturityLevel: 5,
    rankLabel: "AI Architect",
  },
];

export function getTrack(id: string): Track | undefined {
  return tracks.find((t) => t.id === id);
}


export function getTrackName(id: string): string {
  return getTrack(id)?.name ?? id;
}

export function isTrackAvailable(track: Track): boolean {
  // Without user completion data, tracks with no prerequisites are always available.
  return track.prerequisiteTrackIds.length === 0;
}

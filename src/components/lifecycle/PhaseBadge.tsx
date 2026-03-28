import { getPhase, type LifecyclePhaseId } from "@/data/lifecyclePhases";
import { cn } from "@/lib/utils";

interface PhaseBadgeProps {
  phaseId: LifecyclePhaseId;
  size?: "sm" | "md";
  showLabel?: boolean;
  className?: string;
}

const phaseColorMap: Record<LifecyclePhaseId, { bg: string; text: string }> = {
  research: { bg: "bg-phase-research/15", text: "text-phase-research" },
  hypothesis: { bg: "bg-phase-hypothesis/15", text: "text-phase-hypothesis" },
  experimentation: { bg: "bg-phase-experimentation/15", text: "text-phase-experimentation" },
  evaluation: { bg: "bg-phase-evaluation/15", text: "text-phase-evaluation" },
};

export function PhaseBadge({ phaseId, size = "sm", showLabel = true, className }: PhaseBadgeProps) {
  const phase = getPhase(phaseId);
  const colors = phaseColorMap[phaseId];
  const Icon = phase.icon;

  const sizeClasses = {
    sm: { container: "px-2.5 py-1 gap-1.5", icon: "h-3.5 w-3.5", text: "text-xs" },
    md: { container: "px-3 py-1.5 gap-2", icon: "h-4 w-4", text: "text-sm" },
  };

  const cfg = sizeClasses[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        colors.bg,
        colors.text,
        cfg.container,
        className
      )}
    >
      <Icon className={cfg.icon} />
      {showLabel && <span className={cfg.text}>{phase.name}</span>}
    </span>
  );
}

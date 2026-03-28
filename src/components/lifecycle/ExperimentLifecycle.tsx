import { lifecyclePhases, type LifecyclePhaseId } from "@/data/lifecyclePhases";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical } from "lucide-react";

interface ExperimentLifecycleProps {
  currentPhase?: LifecyclePhaseId;
  completedPhases?: LifecyclePhaseId[];
  size?: "sm" | "md" | "lg";
}

const phaseColorMap: Record<LifecyclePhaseId, { bg: string; text: string; border: string; activeBg: string }> = {
  research: {
    bg: "bg-phase-research/10",
    text: "text-phase-research",
    border: "border-phase-research/30",
    activeBg: "bg-phase-research",
  },
  hypothesis: {
    bg: "bg-phase-hypothesis/10",
    text: "text-phase-hypothesis",
    border: "border-phase-hypothesis/30",
    activeBg: "bg-phase-hypothesis",
  },
  experimentation: {
    bg: "bg-phase-experimentation/10",
    text: "text-phase-experimentation",
    border: "border-phase-experimentation/30",
    activeBg: "bg-phase-experimentation",
  },
  evaluation: {
    bg: "bg-phase-evaluation/10",
    text: "text-phase-evaluation",
    border: "border-phase-evaluation/30",
    activeBg: "bg-phase-evaluation",
  },
};

export function ExperimentLifecycle({
  currentPhase,
  completedPhases = [],
  size = "lg",
}: ExperimentLifecycleProps) {
  const sizeConfig = {
    sm: { container: "w-56 h-56", icon: "h-4 w-4", text: "text-[9px]", center: "w-16 h-16", centerText: "text-[8px]", centerIcon: "h-4 w-4" },
    md: { container: "w-72 h-72", icon: "h-5 w-5", text: "text-[11px]", center: "w-20 h-20", centerText: "text-[10px]", centerIcon: "h-5 w-5" },
    lg: { container: "w-[22rem] h-[22rem] md:w-[26rem] md:h-[26rem]", icon: "h-5 w-5 md:h-6 md:w-6", text: "text-xs", center: "w-24 h-24 md:w-28 md:h-28", centerText: "text-xs", centerIcon: "h-6 w-6" },
  };

  const cfg = sizeConfig[size];

  // Each quadrant uses flexbox to center content in the inner area (away from the arc edge)
  const quadrants: { phase: typeof lifecyclePhases[0]; position: string; rounded: string; flexAlign: string }[] = [
    {
      phase: lifecyclePhases[0], // Research (top-left)
      position: "top-0 left-0",
      rounded: "rounded-tl-full",
      flexAlign: "items-end justify-end pb-[18%] pr-[18%]",
    },
    {
      phase: lifecyclePhases[1], // Hypothesis (top-right)
      position: "top-0 right-0",
      rounded: "rounded-tr-full",
      flexAlign: "items-end justify-start pb-[18%] pl-[18%]",
    },
    {
      phase: lifecyclePhases[2], // Experimentation (bottom-left)
      position: "bottom-0 left-0",
      rounded: "rounded-bl-full",
      flexAlign: "items-start justify-end pt-[18%] pr-[18%]",
    },
    {
      phase: lifecyclePhases[3], // Evaluation (bottom-right)
      position: "bottom-0 right-0",
      rounded: "rounded-br-full",
      flexAlign: "items-start justify-start pt-[18%] pl-[18%]",
    },
  ];

  const lifecycleVisual = (
    <div className={cn("relative mx-auto drop-shadow-lg", cfg.container)}>
      {/* Quadrants */}
      {quadrants.map(({ phase, position, rounded, flexAlign }) => {
        const colors = phaseColorMap[phase.id];
        const isActive = currentPhase === phase.id;
        const isCompleted = completedPhases.includes(phase.id);
        const Icon = phase.icon;

        return (
          <div
            key={phase.id}
            className={cn(
              "absolute w-1/2 h-1/2 flex transition-all duration-300 overflow-hidden",
              position,
              rounded,
              flexAlign,
              colors.activeBg,
              "text-white",
              isActive && "shadow-lg ring-2 ring-white/30",
              isCompleted && !isActive && "opacity-80",
            )}
          >
            <div className="flex flex-col items-center gap-1">
              <div className="relative">
                <Icon className={cn(cfg.icon, "text-white/90")} />
                {isCompleted && !isActive && (
                  <div className="absolute -top-1 -right-1 rounded-full bg-white p-0.5">
                    <Check className="h-2.5 w-2.5 text-phase-evaluation" />
                  </div>
                )}
              </div>
              <span className={cn("font-semibold whitespace-nowrap text-white", cfg.text)}>
                {phase.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Center circle */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background border-4 border-border flex flex-col items-center justify-center z-10 shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
          cfg.center
        )}
      >
        <FlaskConical className={cn(cfg.centerIcon, "text-foreground mb-0.5")} />
        <span className={cn("font-bold text-foreground leading-tight", cfg.centerText)}>
          Experiments
        </span>
      </div>

    </div>
  );


  return lifecycleVisual;
}

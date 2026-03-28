import { ExperimentLifecycle } from "@/components/lifecycle/ExperimentLifecycle";
import { type LifecyclePhaseId } from "@/data/lifecyclePhases";
import { cn } from "@/lib/utils";

interface LifecycleMiniMapProps {
  currentPhase: LifecyclePhaseId;
  completedPhases?: LifecyclePhaseId[];
  className?: string;
}

export function LifecycleMiniMap({ currentPhase, completedPhases = [], className }: LifecycleMiniMapProps) {
  return (
    <div className={cn("inline-block", className)}>
      <ExperimentLifecycle
        currentPhase={currentPhase}
        completedPhases={completedPhases}
        size="sm"
      />
    </div>
  );
}

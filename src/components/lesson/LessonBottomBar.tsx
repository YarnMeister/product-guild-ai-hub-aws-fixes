import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LessonBottomBarProps {
  type: "lesson" | "challenge";
  onMarkComplete: () => void;
  isCompleted?: boolean;
  isCompleting?: boolean;
}

export function LessonBottomBar({
  type,
  onMarkComplete,
  isCompleted = false,
  isCompleting = false,
}: LessonBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t z-40">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Type Label */}
          <div className="text-sm text-muted-foreground capitalize">
            {type}
          </div>

          {/* Complete Button */}
          <Button
            onClick={onMarkComplete}
            size="lg"
            className={`gap-2 px-8 ${
              isCompleted
                ? "bg-muted text-muted-foreground"
                : "bg-accent hover:bg-accent/90 text-accent-foreground"
            }`}
            disabled={isCompleted || isCompleting}
          >
            {isCompleted ? (
              <>
                <Check className="h-5 w-5" />
                Completed
              </>
            ) : isCompleting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading confetti gun...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                Mark Complete
              </>
            )}
          </Button>

          {/* Spacer for alignment */}
          <div className="hidden md:block w-24" />
        </div>
      </div>
    </div>
  );
}

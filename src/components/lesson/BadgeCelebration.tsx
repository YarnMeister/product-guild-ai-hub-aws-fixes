import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Award, Sparkles, ArrowRight, Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Challenge } from "@/lib/contentLoader";
import { DIFFICULTY_INFO } from "@/types/content";
import { resolveIcon } from "@/lib/iconResolver";

interface BadgeCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  onContinue: () => void;
}

export function BadgeCelebration({
  isOpen,
  onClose,
  challenge,
  onContinue,
}: BadgeCelebrationProps) {
  const difficultyInfo = DIFFICULTY_INFO[challenge.difficulty];
  const IconComponent = resolveIcon(challenge.icon);

  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      const fireConfetti = () => {
        // Left side
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.15, y: 0.6 },
          colors: ["#f59e0b", "#eab308", "#fbbf24", "#22c55e", "#10b981"],
        });
        // Right side
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { x: 0.85, y: 0.6 },
          colors: ["#f59e0b", "#eab308", "#fbbf24", "#22c55e", "#10b981"],
        });
      };

      fireConfetti();
      const timeout = setTimeout(fireConfetti, 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              {/* Badge Icon */}
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-accent via-accent/80 to-primary shadow-lg shadow-accent/30 ring-4 ring-accent/30 animate-scale-in">
                <IconComponent className="h-12 w-12 text-white" />
              </div>
              {/* Sparkle */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              </div>
              {/* Checkmark */}
              <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-badge-easy flex items-center justify-center shadow-md">
                <svg
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <DialogTitle className="text-2xl font-bold">
            Badge Earned! 🎉
          </DialogTitle>

          <DialogDescription asChild>
            <div className="space-y-4">
              {/* Badge Name */}
              <div className="py-4 px-6 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-lg font-semibold text-foreground">
                  {challenge.badgeName}
                </p>
                {/* Difficulty Stars */}
                <div className="flex items-center justify-center gap-1 mt-2">
                  {Array.from({ length: challenge.difficulty }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      style={{
                        color: `hsl(var(--${difficultyInfo?.color ?? "badge-easy"}))`,
                        fill: `hsl(var(--${difficultyInfo?.color ?? "badge-easy"}))`,
                      }}
                    />
                  ))}
                  <span
                    className="text-sm ml-1"
                    style={{ color: `hsl(var(--${difficultyInfo?.color ?? "badge-easy"}))` }}
                  >
                    {difficultyInfo?.label ?? "Unknown"}
                  </span>
                </div>
              </div>

              {/* Capability Statement */}
              <div className="flex items-start gap-3 text-left bg-muted/50 rounded-lg p-4">
                <Award className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    New Capability Unlocked
                  </p>
                  <p className="text-sm font-medium text-foreground italic">
                    "{challenge.badgeStatement}"
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 mt-4">
          <Button
            onClick={onContinue}
            size="lg"
            className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Continue Exploring
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import confetti from "canvas-confetti";
import { Crown, Sparkles, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Rank, getRankInfo } from "@/contexts/AuthContext";
interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  lessonId: number;
  newRank: Rank;
  onContinue: () => void;
  hasNextLesson: boolean;
}

export function CompletionCelebration({
  isOpen,
  onClose,
  lessonId,
  newRank,
  onContinue,
  hasNextLesson,
}: CompletionCelebrationProps) {
  const rankInfo = getRankInfo(newRank);
  // Trigger confetti when modal opens
  useEffect(() => {
    if (isOpen) {
      // Fire confetti from both sides
      const fireConfetti = () => {
        // Left side
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.1, y: 0.6 },
          colors: ["#f59e0b", "#eab308", "#fbbf24", "#fcd34d", "#fef3c7"],
        });
        // Right side
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.9, y: 0.6 },
          colors: ["#f59e0b", "#eab308", "#fbbf24", "#fcd34d", "#fef3c7"],
        });
      };

      fireConfetti();
      // Second burst after a short delay
      const timeout = setTimeout(fireConfetti, 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader className="space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent/20 border-4 border-accent animate-scale-in">
                <Crown className="h-12 w-12 text-accent" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-accent animate-pulse" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold">
            Lesson Complete! 🎉
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-4">
              <div className="py-4 px-6 bg-accent/10 rounded-lg border border-accent/20">
                <p className="text-lg font-semibold text-foreground">
                  You've unlocked Rank {newRank}
                </p>
                <p className="text-xl font-bold text-accent mt-1">
                  {rankInfo?.name ?? `Rank ${newRank}`}
                </p>
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
            {hasNextLesson ? "Continue to Next Lesson" : "Back to Dashboard"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

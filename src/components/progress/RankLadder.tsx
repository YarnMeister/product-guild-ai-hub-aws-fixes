import { useAuth, RANK_INFO, type Rank } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

/**
 * Rank descriptors — "You're at this level when…"
 */
const RANK_DESCRIPTORS: Record<number, string> = {
  1: "You're beginning to explore AI tools and understand their potential in your day-to-day work.",
  2: "You actively use AI to prototype ideas and accelerate workflows with confidence.",
  3: "You connect AI tools into broader systems and automate repetitive tasks across platforms.",
  4: "You deploy and host AI-assisted applications, making experiments accessible to stakeholders.",
  5: "You design end-to-end AI strategies, evaluate impact, and mentor others in AI adoption.",
};

/**
 * Shared rank ladder used on both the Module Overview (Course Background accordion)
 * and the Progress page. Reads currentRank from AuthContext so it stays in sync
 * across the entire app when a rank is achieved.
 */
export function RankLadder() {
  const { user } = useAuth();
  const currentRank = user?.currentRank ?? 1;

  return (
    <div className="space-y-1.5">
      {([1, 2, 3, 4, 5] as Rank[]).map((rank) => {
        const info = RANK_INFO[rank];
        const isCurrent = currentRank === rank;

        return (
          <div
            key={rank}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
              isCurrent
                ? "bg-accent/10 border-accent/20"
                : "bg-muted/40 border-border"
            }`}
          >
            {/* Rank number circle */}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
              {rank}
            </div>

            {/* Text content */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">{info?.name ?? `Rank ${rank}`}</span>
                {isCurrent && (
                  <Badge
                    variant="secondary"
                    className="text-[0.625rem] px-1.5 py-0 bg-accent/20 text-accent-foreground border-0 font-medium"
                  >
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {RANK_DESCRIPTORS[rank]}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

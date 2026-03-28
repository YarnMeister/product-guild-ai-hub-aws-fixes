import { useAuth, Rank } from "@/contexts/AuthContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Challenge, getChallenges } from "@/lib/contentLoader";
import { DIFFICULTY_INFO } from "@/types/content";
import { resolveIcon } from "@/lib/iconResolver";
import { capabilityCategories, CapabilityCategoryId, getCapabilityCategory } from "@/data/capabilityCategories";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CheckCircle2, Lock, Star, Award, Trophy, Clock, ArrowRight, ChevronRight, BookOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { getTrackHsl, getTrackName } from "@/data/tracks";
import { useTrackStates } from "@/hooks/useTrackStates";

type CredentialState = "earned" | "available" | "locked";

interface CredentialItemProps {
  quest: Challenge;
  state: CredentialState;
  moduleId: string;
  isTrackUnlocked: boolean;
}

/* ── Challenge Popover Content ── */
function ChallengePopoverContent({ quest, state, moduleId }: CredentialItemProps) {
  const IconComponent = resolveIcon(quest.icon);
  const diffInfo = DIFFICULTY_INFO[quest.difficulty];
  const trackColor = getTrackHsl(quest.track);

  return (
    <div className="space-y-3">
      {/* Color accent */}
      <div className="h-1 -mx-4 -mt-4 rounded-t-md" style={{ backgroundColor: trackColor }} />

      <div className="flex items-center gap-2 pt-1">
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg shrink-0 ${
          state === "earned" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
        }`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{quest.badgeName}</h4>
        </div>
      </div>

      {/* Difficulty, Time & Track */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`h-2.5 w-2.5 ${
                i < quest.difficulty ? "text-accent fill-accent" : "text-border fill-border"
              }`}
            />
          ))}
          <span className="ml-0.5">{diffInfo?.label ?? "Unknown"}</span>
        </Badge>
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {quest.estimatedTime}
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 text-xs border-transparent"
          style={{ color: trackColor }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: trackColor }} />
          {getTrackName(quest.track)}
        </Badge>
      </div>

      {/* Badge Statement */}
      <div className={`p-2.5 rounded-lg border ${
        state === "earned" ? "bg-accent/5 border-accent/20" : "bg-muted/30 border-border"
      }`}>
        <div className="flex items-start gap-2">
          <Award className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${state === "earned" ? "text-accent" : "text-muted-foreground"}`} />
          <p className="text-xs italic text-foreground">"{quest.badgeStatement}"</p>
        </div>
      </div>

      {/* CTA */}
      <Link to={`/module/${moduleId}/explore/challenge/${quest.id}`} className="block">
        <Button size="sm" className="w-full gap-1.5 text-xs h-8">
          {state === "earned" ? "Review Challenge" : "Start Challenge"}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

/* ── Credential Row — compact style with popover ── */
function CredentialItem({ quest, state, moduleId, isTrackUnlocked }: CredentialItemProps) {
  const trackColor = getTrackHsl(quest.track);
  const effectivelyLocked = state === "locked" || !isTrackUnlocked;

  const row = (
    <div
      className={`flex items-center gap-3 px-3 py-2 border-b border-border last:border-b-0 transition-all duration-150 ${
        state === "earned"
          ? "bg-accent/5"
          : effectivelyLocked
          ? "bg-muted/30 cursor-not-allowed"
          : "hover:bg-muted/30 cursor-pointer"
      }`}
    >
      <div className="shrink-0">
        {state === "earned" ? (
          <CheckCircle2 className="h-4 w-4 text-accent" />
        ) : effectivelyLocked ? (
          <Lock className="h-4 w-4 text-muted-foreground/50" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: trackColor }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${state === "earned" ? "text-muted-foreground" : ""}`}>
          {quest.badgeName}
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {quest.description}
        </p>
      </div>
      {!effectivelyLocked && (
        <ChevronRight className="h-4 w-4 text-muted-foreground/50 shrink-0" />
      )}
    </div>
  );

  if (effectivelyLocked) {
    return <div className="w-full">{row}</div>;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full text-left">{row}</button>
      </PopoverTrigger>
      <PopoverContent align="center" side="bottom" sideOffset={4} className="w-80 p-4">
        <ChallengePopoverContent quest={quest} state={state} moduleId={moduleId} isTrackUnlocked={isTrackUnlocked} />
      </PopoverContent>
    </Popover>
  );
}

export function CapabilityPortfolio({ hideHeader = false }: { hideHeader?: boolean }) {
  const { user } = useAuth();
  const { trackStates } = useTrackStates();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [categoryData, setCategoryData] = useState<Array<{
    category: typeof capabilityCategories[0];
    quests: Challenge[];
    earned: Challenge[];
    available: Challenge[];
    progressPercent: number;
    level: string;
  }>>([]);
  const [capabilityScore, setCapabilityScore] = useState(0);

  useEffect(() => {
    async function loadChallenges() {
      if (!user || !moduleId) return;

      const allChallenges = await getChallenges(moduleId);

      const categoryMap: Record<string, CapabilityCategoryId> = {
        "Velocity": "velocity",
        "Precision": "precision",
        "Leverage": "leverage",
        "Impact": "impact",
        "Range": "range",
      };

      const data = capabilityCategories.map((category) => {
        const quests = allChallenges.filter(
          (c) => categoryMap[c.category] === category.id
        );
        const earned = quests.filter((q) =>
          user.badges.some((b) => b.id === q.id)
        );
        const available = quests.filter(
          (q) => !user.badges.some((b) => b.id === q.id)
        );

        const progressPercent =
          quests.length > 0 ? (earned.length / quests.length) * 100 : 0;

        const level =
          earned.length === 0
            ? "—"
            : earned.length >= quests.length
            ? "Advanced"
            : earned.length >= Math.ceil(quests.length / 2)
            ? "Intermediate"
            : "Foundational";

        return { category, quests, earned, available, progressPercent, level };
      });

      setCategoryData(data);

      const totalEarned = allChallenges.filter((q) =>
        user.badges.some((b) => b.id === q.id)
      ).length;
      const totalQuests = allChallenges.length;
      setCapabilityScore(Math.round((totalEarned / totalQuests) * 100));
    }

    loadChallenges();
  }, [user, moduleId]);

  if (!user || !moduleId) return null;

  return (
    <Card className="shadow-card overflow-hidden rounded-xl">
      {/* Header — matches Learning Path card */}
      {!hideHeader && (
        <div className="bg-muted/80 px-6 py-4 flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
            <Award className="h-5 w-5 text-accent" />
            Challenges Completed
          </CardTitle>
          <div className="text-right">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Score</span>
            <p className="text-sm font-bold text-foreground">{capabilityScore}</p>
          </div>
        </div>
      )}

      <CardContent className="p-6 space-y-4">
        {categoryData.map(({ category, quests, earned, available, progressPercent }) => {
          const Icon = category.icon;

          return (
            <div key={category.id} className="rounded-xl border border-border overflow-hidden">
              {/* Category Header */}
              <div className="px-5 py-4 flex items-center justify-between bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-primary">{category.name}</h4>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="text-sm font-semibold">{earned.length}/{quests.length}</p>
                </div>
              </div>


              {/* Credential rows */}
              {quests.length > 0 && (
                <div>
                  {earned.map((quest) => (
                    <CredentialItem key={quest.id} quest={quest} state="earned" moduleId={moduleId} isTrackUnlocked={trackStates.find(s => s.trackId === quest.track)?.isUnlocked ?? true} />
                  ))}
                  {available.map((quest) => (
                    <CredentialItem key={quest.id} quest={quest} state="available" moduleId={moduleId} isTrackUnlocked={trackStates.find(s => s.trackId === quest.track)?.isUnlocked ?? true} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

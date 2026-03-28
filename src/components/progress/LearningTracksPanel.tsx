import { useState, useEffect, useMemo, useRef } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  BookOpen,
  Lock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Eye,
  Award,
  ChevronRight,
} from "lucide-react";
import { loadContentIndex, type Lesson, type Challenge } from "@/lib/contentLoader";
import { tracks, getTrackColor, getTrackHsl, getTrackName } from "@/data/tracks";
import { DIFFICULTY_INFO } from "@/types/content";
import type { Badge as BadgeType } from "@/contexts/AuthContext";
import { useTrackStates } from "@/hooks/useTrackStates";

// ── Helpers ──────────────────────────────────────────────────────────────────

function isLessonCompleted(lessonId: number, lessonsCompleted: number[]): boolean {
  return lessonsCompleted.includes(lessonId);
}

function isChallengeCompleted(challengeId: string, badges: BadgeType[]): boolean {
  return badges.some((b) => b.id === challengeId);
}

function isItemCompleted(
  item: Lesson | Challenge,
  lessonsCompleted: number[],
  badges: BadgeType[]
): boolean {
  if (item.type === "lesson") return isLessonCompleted(item.id as number, lessonsCompleted);
  return isChallengeCompleted((item as Challenge).id, badges);
}

// ── Item Popover Content ─────────────────────────────────────────────────────

function ItemPopoverContent({
  item,
  isCompleted,
  moduleId,
  trackColor,
}: {
  item: Lesson | Challenge;
  isCompleted: boolean;
  moduleId: string;
  trackColor: string;
}) {
  const href =
    item.type === "lesson"
      ? `/module/${moduleId}/explore/lesson/${item.id}`
      : `/module/${moduleId}/explore/challenge/${(item as Challenge).id}`;

  return (
    <div className="space-y-3">
      <div className="h-1 -mx-4 -mt-4 rounded-t-md" style={{ backgroundColor: trackColor }} />
      <div className="flex items-center gap-2 pt-1">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2 shrink-0" style={{ borderColor: trackColor }} />
        )}
        <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {item.estimatedTime}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs capitalize">
          {item.type}
        </Badge>
        {item.type === "challenge" && (() => {
          const diff = (item as Challenge).difficulty as 1 | 2 | 3;
          const dotColor = diff === 1 ? "bg-emerald-500" : diff === 2 ? "bg-amber-500" : "bg-red-500";
          return (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
              {Array.from({ length: diff }).map((_, i) => (
                <span key={i} className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
              ))}
              <span className="ml-0.5">{DIFFICULTY_INFO[diff]?.label}</span>
            </Badge>
          );
        })()}
      </div>
      {item.type === "challenge" && (item as Challenge).badgeStatement && (
        <div className="p-2.5 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-2">
            <Award className="h-3.5 w-3.5 mt-0.5 shrink-0 text-accent" />
            <p className="text-xs italic text-muted-foreground">"{(item as Challenge).badgeStatement}"</p>
          </div>
        </div>
      )}
      <Link to={href} className="block">
        <Button size="sm" className="w-full gap-1.5 text-xs h-8">
          {isCompleted ? "Review" : item.type === "lesson" ? "Start Lesson" : "Start Challenge"}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

// ── ContentRow ────────────────────────────────────────────────────────────────

function ContentRow({
  item,
  isCompleted,
  moduleId,
  trackColor,
}: {
  item: Lesson | Challenge;
  isCompleted: boolean;
  moduleId: string;
  trackColor: string;
}) {
  const isComingSoon = item.status === "coming-soon";

  if (isComingSoon) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-border bg-muted/30 opacity-60 cursor-not-allowed">
        <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground truncate">{item.title}</p>
          <p className="text-xs text-muted-foreground/70">Coming soon</p>
        </div>
      </div>
    );
  }

  const href =
    item.type === "lesson"
      ? `/module/${moduleId}/explore/lesson/${item.id}`
      : `/module/${moduleId}/explore/challenge/${(item as Challenge).id}`;
  const startLabel = isCompleted ? "Review" : item.type === "lesson" ? "Start Lesson" : "Start Challenge";

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-150 ${
        isCompleted
          ? "border-green-500/20 bg-green-500/5"
          : "border-border hover:border-primary/20 hover:bg-muted/30"
      }`}
    >
      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: trackColor }} />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${isCompleted ? "text-muted-foreground" : ""}`}>
          {item.title}
        </p>
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Eye className="h-3 w-3" />
            <span>Peek inside</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" side="bottom" sideOffset={4} className="w-80 p-4">
          <ItemPopoverContent item={item} isCompleted={isCompleted} moduleId={moduleId} trackColor={trackColor} />
        </PopoverContent>
      </Popover>
      <Link to={href}>
        <Button size="sm" className="shrink-0 h-6 px-2 text-[11px]">
          {startLabel}
        </Button>
      </Link>
    </div>
  );
}

// ── TrackCard (unlocked) ──────────────────────────────────────────────────────

function TrackCard({
  track,
  requiredItems,
  optionalItems,
  completionPercent,
  isComplete,
  moduleId,
  lessonsCompleted,
  badges,
}: {
  track: (typeof tracks)[number];
  requiredItems: (Lesson | Challenge)[];
  optionalItems: (Lesson | Challenge)[];
  completionPercent: number;
  isComplete: boolean;
  moduleId: string;
  lessonsCompleted: number[];
  badges: BadgeType[];
}) {
  const trackColor = getTrackHsl(track.id);
  const totalRequired = requiredItems.length;
  const completedCount = requiredItems.filter((i) => isItemCompleted(i, lessonsCompleted, badges)).length;

  return (
    <AccordionItem value={track.id} className="group rounded-xl border border-border overflow-hidden">
      <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
        <div className="flex items-center bg-muted/50 w-full">
          <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: trackColor }} />
          <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: `${trackColor}15` }}
              >
                <BookOpen className="h-5 w-5" style={{ color: trackColor }} />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm text-primary">{getTrackName(track.id)}</h4>
                  {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground truncate">{track.description}</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <div className="px-5 pb-4 pt-2 space-y-3">
          {requiredItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" />
                Required
              </p>
              <div className="space-y-1.5">
                {requiredItems.map((item) => (
                  <ContentRow
                    key={item.type === "lesson" ? item.id : (item as Challenge).id}
                    item={item}
                    isCompleted={isItemCompleted(item, lessonsCompleted, badges)}
                    moduleId={moduleId}
                    trackColor={trackColor}
                  />
                ))}
              </div>
            </div>
          )}
          {optionalItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Optional</p>
              <div className="space-y-1.5 opacity-80">
                {optionalItems.map((item) => (
                  <ContentRow
                    key={item.type === "lesson" ? item.id : (item as Challenge).id}
                    item={item}
                    isCompleted={isItemCompleted(item, lessonsCompleted, badges)}
                    moduleId={moduleId}
                    trackColor={trackColor}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── LockedTrackCard ───────────────────────────────────────────────────────────

function LockedTrackCard({
  track,
  requiredItems,
  optionalItems,
  moduleId,
}: {
  track: (typeof tracks)[number];
  requiredItems: (Lesson | Challenge)[];
  optionalItems: (Lesson | Challenge)[];
  moduleId: string;
}) {
  const prerequisiteNames = track.prerequisiteTrackIds
    .map((id) => getTrackName(id))
    .join(", ");
  const trackColor = getTrackHsl(track.id);

  return (
    <AccordionItem value={track.id} className="group rounded-xl border border-border overflow-hidden">
      <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
        <div className="flex items-center bg-muted/50 w-full">
          <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: trackColor }} />
          <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
                style={{ backgroundColor: `${trackColor}15` }}
              >
                <BookOpen className="h-5 w-5" style={{ color: trackColor }} />
              </div>
              <div className="min-w-0 text-left">
                <h4 className="font-semibold text-sm text-primary">{getTrackName(track.id)}</h4>
                <p className="text-xs text-muted-foreground">Requires: {prerequisiteNames}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant="secondary" className="text-muted-foreground gap-1.5 text-xs px-3 py-1.5 bg-muted border-0">
                <Lock className="h-3.5 w-3.5" /> Locked
              </Badge>
              <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-90" />
            </div>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <div className="px-5 pb-4 pt-2 space-y-3">
          {requiredItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-3 w-3" />
                Required
              </p>
              <div className="space-y-1.5">
                {requiredItems.map((item) => (
                  <div
                    key={item.type === "lesson" ? item.id : (item as Challenge).id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
          {optionalItems.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Optional</p>
              <div className="space-y-1.5">
                {optionalItems.map((item) => (
                  <div
                    key={item.type === "lesson" ? item.id : (item as Challenge).id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border"
                  >
                    <Lock className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/30 shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}

// ── Main Panel Component ─────────────────────────────────────────────────────

export function LearningTracksPanel() {
  const { user } = useAuth();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackParam = searchParams.get("track");
  const scrollTargetRef = useRef<HTMLDivElement>(null);
  const [allLessons, setAllLessons] = useState<Lesson[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [contentLoading, setContentLoading] = useState(true);
  const { trackStates: apiTrackStates, loading: statesLoading } = useTrackStates();

  useEffect(() => {
    loadContentIndex()
      .then((index) => {
        const mLessons = moduleId ? index.lessons.filter((l) => l.module === moduleId) : index.lessons;
        const mChallenges = moduleId ? index.challenges.filter((c) => c.module === moduleId) : index.challenges;
        setAllLessons(mLessons);
        setAllChallenges(mChallenges);
      })
      .catch((err) => console.error("Failed to load content:", err))
      .finally(() => setContentLoading(false));
  }, [moduleId]);

  const loading = contentLoading || statesLoading;

  const trackStatesComputed = useMemo(() => {
    return tracks.map((track) => {
      const tLessons = allLessons.filter((l) => l.track === track.id);
      const tChallenges = allChallenges.filter((c) => c.track === track.id);
      const allItems = [...tLessons, ...tChallenges];
      const required = allItems.filter((i) => i.isRequired);
      const optional = allItems.filter((i) => !i.isRequired);

      const apiState = apiTrackStates.find((s) => s.trackId === track.id);
      const isUnlocked = apiState ? apiState.isUnlocked : track.prerequisiteTrackIds.length === 0;
      const isComplete = apiState ? apiState.isCompleted : false;
      const completionPercent = apiState ? apiState.completionPercent : 0;

      return { track, isUnlocked, isComplete, required, optional, completionPercent, totalItems: allItems.length };
    });
  }, [allLessons, allChallenges, apiTrackStates]);

  // Auto-scroll to the target track when coming from ?track= param
  useEffect(() => {
    if (!loading && trackParam && scrollTargetRef.current) {
      setTimeout(() => {
        scrollTargetRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [loading, trackParam]);

  if (loading) {
    return (
      <Card className="shadow-card overflow-hidden rounded-xl">
        <div className="p-6 text-center">
          <p className="text-muted-foreground text-sm">Loading tracks...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-card overflow-hidden rounded-xl">
      <div className="bg-muted/80 px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
          <BookOpen className="h-5 w-5 text-accent" />
          Learning Tracks
        </CardTitle>
        <div className="text-right">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Tracks</span>
          <p className="text-sm font-bold text-foreground">{trackStatesComputed.length}</p>
        </div>
      </div>

      <CardContent className="p-6">
        <Accordion
          type="multiple"
          defaultValue={[trackParam || "prototyping"]}
          className="space-y-4"
        >
          {trackStatesComputed.map(({ track, isUnlocked, isComplete, required, optional, completionPercent }, i) => (
            <div
              key={track.id}
              ref={trackParam === track.id ? scrollTargetRef : undefined}
              className="animate-fade-in"
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              {isUnlocked ? (
                <TrackCard
                  track={track}
                  requiredItems={required}
                  optionalItems={optional}
                  completionPercent={completionPercent}
                  isComplete={isComplete}
                  moduleId={moduleId ?? "ai-driven-experimentation"}
                  lessonsCompleted={user?.lessonsCompleted ?? []}
                  badges={user?.badges ?? []}
                />
              ) : (
                <LockedTrackCard track={track} requiredItems={required} optionalItems={optional} moduleId={moduleId ?? "ai-driven-experimentation"} />
              )}
            </div>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock, ArrowLeft, Award, CheckCircle2, BookOpen, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { loadContentIndex } from "@/lib/contentLoader";
import { DIFFICULTY_INFO } from "@/types/content";
import type { Challenge, Lesson } from "@/types/content";
import { resolveIcon } from "@/lib/iconResolver";
import { useAuth } from "@/contexts/AuthContext";
import { BadgeCelebration } from "./BadgeCelebration";
import { getTrackHsl, getTrackName } from "@/data/tracks";

interface ChallengeSidebarProps {
  challenge: Challenge;
}

export function ChallengeSidebar({ challenge }: ChallengeSidebarProps) {
  const { user, isChallengeCompleted } = useAuth();
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [showCelebration, setShowCelebration] = useState(false);
  const [trackItems, setTrackItems] = useState<{ required: (Lesson | Challenge)[]; optional: (Lesson | Challenge)[] }>({ required: [], optional: [] });

  const difficultyInfo = DIFFICULTY_INFO[challenge.difficulty];
  const IconComponent = resolveIcon(challenge.icon);
  const isCompleted = isChallengeCompleted(challenge.id);
  const trackColor = getTrackHsl(challenge.track);
  const trackName = getTrackName(challenge.track);

  useEffect(() => {
    async function loadTrackItems() {
      if (!moduleId) return;
      const index = await loadContentIndex();
      const lessons = index.lessons.filter((l) => l.module === moduleId && l.track === challenge.track);
      const challenges = index.challenges.filter((c) => c.module === moduleId && c.track === challenge.track);
      const all: (Lesson | Challenge)[] = [...lessons, ...challenges];
      setTrackItems({
        required: all.filter((i) => i.isRequired),
        optional: all.filter((i) => !i.isRequired),
      });
    }
    loadTrackItems();
  }, [challenge.track, moduleId]);

  const handleContinue = () => {
    setShowCelebration(false);
    navigate(`/module/${moduleId}/explore`);
  };

  const lessonsCompleted = user?.lessonsCompleted ?? [];
  const badges = user?.badges ?? [];

  function isItemDone(item: Lesson | Challenge): boolean {
    if (item.type === "lesson") return lessonsCompleted.includes(item.id as number);
    return badges.some((b) => b.id === (item as Challenge).id);
  }

  return (
    <>
      <div className="space-y-6 w-full min-w-0">
        {/* Badge Display */}
        <Card className={`shadow-card border-accent/20 ${
          isCompleted 
            ? "bg-gradient-to-br from-accent/15 to-accent/5" 
            : "bg-accent/5"
        }`}>
          <CardHeader className="pb-2 text-center">
            <div className="flex justify-center mb-3">
              <div className={`relative flex h-20 w-20 items-center justify-center rounded-2xl ${
                isCompleted
                  ? "bg-gradient-to-br from-accent via-accent/80 to-primary text-white shadow-lg shadow-accent/30"
                  : "bg-accent/20 text-accent"
              }`}>
                <IconComponent className="h-10 w-10" />
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-badge-easy flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
            <CardTitle className="text-lg break-words">{challenge.title}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mt-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {challenge.estimatedTime}
              </div>
              <div className="flex items-center gap-1">
                {(() => {
                  const diff = challenge.difficulty as 1 | 2 | 3;
                  const dotColor = diff === 1 ? "bg-emerald-500" : diff === 2 ? "bg-amber-500" : "bg-red-500";
                  return (
                    <>
                      {Array.from({ length: diff }).map((_, i) => (
                        <span key={i} className={`inline-block h-2.5 w-2.5 rounded-full ${dotColor}`} />
                      ))}
                    </>
                  );
                })()}
                <span className="ml-1">{difficultyInfo?.label ?? "Unknown"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Outcome */}
        <Card className="shadow-card border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4 text-accent" />
              {isCompleted ? "You can now" : "After completing this"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className={`italic break-words ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
              "{challenge.badgeStatement}"
            </p>
          </CardContent>
        </Card>

        {/* Back to Explore */}
        <Link to={`/module/${moduleId}/explore`} className="mt-4 block">
          <Button variant="outline" className="w-full gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore page
          </Button>
        </Link>

        {/* Track Mini-View */}
        {(trackItems.required.length > 0 || trackItems.optional.length > 0) && (
          <Card className="shadow-card overflow-hidden rounded-xl">
            {/* Track Header */}
            <div className="flex items-center bg-muted/50">
              <div className="w-1 self-stretch shrink-0" style={{ backgroundColor: trackColor }} />
              <div className="flex-1 px-4 py-3 flex items-center gap-3">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
                  style={{ backgroundColor: `${trackColor}15` }}
                >
                  <BookOpen className="h-4 w-4" style={{ color: trackColor }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm text-primary break-words">{trackName}</h4>
                </div>
              </div>
            </div>

            <CardContent className="px-4 pb-4 pt-3 space-y-3">
              {trackItems.required.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-3 w-3" />
                    Required
                  </p>
                  <div className="space-y-1.5">
                    {trackItems.required.map((item) => (
                      <TrackItemRow
                        key={item.type === "lesson" ? item.id : (item as Challenge).id}
                        item={item}
                        isCompleted={isItemDone(item)}
                        isCurrent={item.type === "challenge" && (item as Challenge).id === challenge.id}
                        moduleId={moduleId!}
                        trackColor={trackColor}
                      />
                    ))}
                  </div>
                </div>
              )}
              {trackItems.optional.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Optional</p>
                  <div className="space-y-1.5 opacity-80">
                    {trackItems.optional.map((item) => (
                      <TrackItemRow
                        key={item.type === "lesson" ? item.id : (item as Challenge).id}
                        item={item}
                        isCompleted={isItemDone(item)}
                        isCurrent={item.type === "challenge" && (item as Challenge).id === challenge.id}
                        moduleId={moduleId!}
                        trackColor={trackColor}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Badge Celebration Modal */}
      <BadgeCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        challenge={challenge}
        onContinue={handleContinue}
      />
    </>
  );
}

// ── Compact Track Item Row ───────────────────────────────────────────────────

function TrackItemRow({
  item,
  isCompleted,
  isCurrent,
  moduleId,
  trackColor,
}: {
  item: Lesson | Challenge;
  isCompleted: boolean;
  isCurrent: boolean;
  moduleId: string;
  trackColor: string;
}) {
  const href =
    item.type === "lesson"
      ? `/module/${moduleId}/explore/lesson/${item.id}`
      : `/module/${moduleId}/explore/challenge/${(item as Challenge).id}`;

  const isComingSoon = item.status === "coming-soon";

  if (isComingSoon) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-dashed border-border bg-muted/30 opacity-60">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <p className="text-xs font-medium text-muted-foreground truncate">{item.title}</p>
      </div>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full text-left group">
          <div
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md border transition-all duration-150 ${
              isCurrent
                ? "border-primary/30 bg-primary/5 ring-1 ring-primary/20"
                : isCompleted
                ? "border-green-500/20 bg-green-500/5"
                : "border-border hover:border-primary/20 hover:bg-muted/30"
            }`}
          >
            <div className="shrink-0">
              {isCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <div
                  className="h-3.5 w-3.5 rounded-full border-2"
                  style={{ borderColor: trackColor }}
                />
              )}
            </div>
            <p className={`text-xs font-medium truncate flex-1 ${isCompleted ? "text-muted-foreground" : ""}`}>
              {item.title}
            </p>
            <ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover:text-muted-foreground shrink-0" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" side="left" sideOffset={8} className="w-72 p-4">
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
              {isCurrent ? "Currently Viewing" : isCompleted ? "Review" : item.type === "lesson" ? "Start Lesson" : "Start Challenge"}
              {!isCurrent && <ArrowRight className="h-3 w-3" />}
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
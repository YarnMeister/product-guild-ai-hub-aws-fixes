import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Lock, CheckCircle2, Clock } from "lucide-react";
import { loadContentIndex, type Lesson, type Challenge } from "@/lib/contentLoader";
import { tracks, getTrackHsl, getTrackName } from "@/data/tracks";
import { useTrackStates } from "@/hooks/useTrackStates";
import type { Badge as BadgeType } from "@/contexts/AuthContext";

function isItemCompleted(
  item: Lesson | Challenge,
  lessonsCompleted: number[],
  badges: BadgeType[]
): boolean {
  if (item.type === "lesson") return lessonsCompleted.includes(item.id as number);
  return badges.some((b) => b.id === (item as Challenge).id);
}

interface FlatItem {
  item: Lesson | Challenge;
  trackId: string;
  trackName: string;
  trackColor: string;
  isLocked: boolean;
  isCompleted: boolean;
}

export function ProgressLearningList() {
  const { user } = useAuth();
  const { moduleId } = useParams<{ moduleId: string }>();
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

  const flatItems: FlatItem[] = useMemo(() => {
    const lessonsCompleted = user?.lessonsCompleted ?? [];
    const badges = user?.badges ?? [];

    const items: FlatItem[] = [];

    for (const track of tracks) {
      const tLessons = allLessons.filter((l) => l.track === track.id);
      const tChallenges = allChallenges.filter((c) => c.track === track.id);
      const allTrackItems: (Lesson | Challenge)[] = [...tLessons, ...tChallenges];
      const apiState = apiTrackStates.find((s) => s.trackId === track.id);
      const isUnlocked = apiState ? apiState.isUnlocked : track.prerequisiteTrackIds.length === 0;
      const trackColor = getTrackHsl(track.id);
      const trackName = getTrackName(track.id);

      for (const item of allTrackItems) {
        if (item.status === "coming-soon") continue;
        items.push({
          item,
          trackId: track.id,
          trackName,
          trackColor,
          isLocked: !isUnlocked,
          isCompleted: isUnlocked && isItemCompleted(item, lessonsCompleted, badges),
        });
      }
    }

    return items;
  }, [allLessons, allChallenges, apiTrackStates, user]);

  if (loading) {
    return (
      <Card className="shadow-card overflow-hidden rounded-xl border">
        <div className="p-6 text-center">
          <p className="text-muted-foreground text-sm">Loading progress...</p>
        </div>
      </Card>
    );
  }

  const completedCount = flatItems.filter((f) => f.isCompleted).length;

  return (
    <Card className="shadow-card overflow-hidden rounded-xl border">
      <div className="bg-muted/50 px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
          <BookOpen className="h-5 w-5 text-accent" />
          Learning Progress
        </CardTitle>
        <div className="text-right">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
            {completedCount} / {flatItems.length}
          </span>
        </div>
      </div>

      <CardContent className="p-4 space-y-1.5">
        {flatItems.map((fi, i) => {
          const key = fi.item.type === "lesson" ? `l-${fi.item.id}` : `c-${(fi.item as Challenge).id}`;

          return (
            <div
              key={key}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                fi.isCompleted
                  ? "border-green-500/20 bg-green-500/5"
                  : fi.isLocked
                  ? "border-border opacity-60"
                  : "border-border"
              }`}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {fi.isLocked ? (
                  <Lock className="h-4 w-4 text-muted-foreground/50" />
                ) : fi.isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <div
                    className="h-4 w-4 rounded-full border-2"
                    style={{ borderColor: fi.trackColor }}
                  />
                )}
              </div>

              {/* Title */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-medium truncate ${fi.isCompleted ? "text-muted-foreground" : ""}`}>
                  {fi.item.title}
                </p>
              </div>

              {/* Type + Track badges */}
              <div className="flex items-center gap-1.5 shrink-0">
                <Badge
                  variant="secondary"
                  className="text-xs px-2 py-0.5 capitalize"
                >
                  {fi.item.type === "lesson" ? "Lesson" : "Challenge"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 capitalize border"
                  style={{
                    color: fi.trackColor,
                    borderColor: `${fi.trackColor}40`,
                    backgroundColor: `${fi.trackColor}10`,
                  }}
                >
                  {fi.trackName}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

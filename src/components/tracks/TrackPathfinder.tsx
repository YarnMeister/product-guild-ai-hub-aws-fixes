import { useRef, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  Palette,
  Wrench,
  BarChart3,
  Lock,
  CheckCircle2,
  ChevronRight,
  BookOpen,
  Trophy,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { tracks, type Track, getTrackName, getTrackColor } from "@/data/tracks";
import { loadContentIndex, type Lesson, type Challenge } from "@/lib/contentLoader";
import { useTrackStates } from "@/hooks/useTrackStates";

const ICON_MAP: Record<string, LucideIcon> = {
  Palette, Wrench, BarChart3,
};

const TRACK_ICON_KEY: Record<string, string> = {
  prototyping: "Palette",
  "ai-workbench": "Wrench",
  productivity: "BarChart3",
  hosting: "Wrench",
  measurement: "BarChart3",
};

interface TrackContent {
  lessons: Lesson[];
  challenges: Challenge[];
}

/* ── Track Popover Content (read-only) ── */
function TrackPopoverContent({ track, content, isUnlocked }: { track: Track; content: TrackContent; isUnlocked: boolean }) {
  const colors = getTrackColor(track.id);
  const Icon = ICON_MAP[TRACK_ICON_KEY[track.id]] ?? Palette;
  const unlocked = isUnlocked;

  return (
    <div className="space-y-3">
      {/* Color accent */}
      <div className={`h-1.5 -mx-4 -mt-4 rounded-t-lg ${colors.bar}`} />

      {/* Header */}
      <div className="flex items-start gap-3 pt-1">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${colors.bg}`}>
          <Icon className={`h-5 w-5 ${colors.text}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-base text-foreground">{track.name}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">{track.description}</p>
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          <BookOpen className="h-3 w-3" />
          {content.lessons.length} Lesson{content.lessons.length !== 1 ? "s" : ""}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          <Trophy className="h-3 w-3" />
          {content.challenges.length} Challenge{content.challenges.length !== 1 ? "s" : ""}
        </Badge>
        {!unlocked && track.prerequisiteTrackIds.map((preId) => {
          const preColors = getTrackColor(preId);
          return (
            <Badge key={preId} variant="outline" className={`${preColors.text} ${preColors.border} gap-1 text-xs`}>
              <Lock className="h-3 w-3" />
              Requires: {getTrackName(preId)}
            </Badge>
          );
        })}
      </div>

      {/* Content breakdown in scrollable area */}
      <div className="max-h-[400px] overflow-y-auto -mr-2 pr-2">
        <div className="space-y-3">
          {/* Lessons */}
          {content.lessons.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <BookOpen className="h-3 w-3" /> Lessons
              </p>
              <div className="space-y-1">
                {content.lessons.map((lesson) => (
                  <div key={lesson.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/30">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${colors.bar}`} />
                    <span className="text-xs text-foreground flex-1 truncate">{lesson.title}</span>
                    <span className="text-[0.625rem] text-muted-foreground shrink-0 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{lesson.estimatedTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Challenges */}
          {content.challenges.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Trophy className="h-3 w-3" /> Challenges
              </p>
              <div className="space-y-1">
                {content.challenges.map((challenge) => (
                  <div key={challenge.id} className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-muted/30">
                    <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${colors.bar}`} />
                    <span className="text-xs text-foreground flex-1 truncate">{challenge.badgeName || challenge.title}</span>
                    <span className="text-[0.625rem] text-muted-foreground shrink-0 flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />{challenge.estimatedTime}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Track tile ── */
function TrackTile({ track, content, isUnlocked, isCompleted }: { track: Track; content: TrackContent; isUnlocked: boolean; isCompleted: boolean }) {
  const unlocked = isUnlocked;
  const colors = getTrackColor(track.id);
  const Icon = ICON_MAP[TRACK_ICON_KEY[track.id]] ?? Palette;
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  return (
    <Popover>
      <div
        className={`group relative flex-shrink-0 w-[220px] rounded-xl border-2 p-3
          ${colors.bg} ${colors.border} shadow-sm overflow-hidden`}
      >
        {/* Accent bar – bleeds behind the border */}
        <div
          className={`absolute top-0 left-0 right-0 h-[5px] ${colors.bar} ${!unlocked ? "opacity-50" : ""}`}
          style={{ margin: '-2px -2px 0', width: 'calc(100% + 4px)' }}
        />

        <div className="min-w-0 space-y-2 mt-1.5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-sm text-foreground">{track.name}</h4>
            {isCompleted ? (
              <Badge className="bg-emerald-600 text-white gap-1 text-[0.625rem] px-1.5 py-0 border-0 shrink-0 hover:bg-emerald-600">
                <CheckCircle2 className="h-2.5 w-2.5 text-white" /> Done
              </Badge>
            ) : unlocked ? (
              <Badge className="bg-accent text-accent-foreground gap-1 text-[0.625rem] px-1.5 py-0 border-0 shrink-0 hover:bg-accent">
                <ChevronRight className="h-2.5 w-2.5" /> Available
              </Badge>
            ) : (
              <Badge className="bg-zinc-600 text-white gap-1 text-[0.625rem] px-1.5 py-0 border-0 shrink-0 hover:bg-zinc-600">
                <Lock className="h-2.5 w-2.5 text-white" /> Locked
              </Badge>
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{track.description}</p>

          {!unlocked && track.prerequisiteTrackIds.length > 0 && (
            <span className="text-[0.625rem] text-muted-foreground block">⏳ {track.prerequisiteTrackIds.map(getTrackName).join(", ")}</span>
          )}

          {/* Polished content badges */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {content.lessons.length > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-medium ${colors.text} bg-background/60 ring-1 ring-inset ${colors.border}`}>
                <BookOpen className="h-2.5 w-2.5" />
                {content.lessons.length} lesson{content.lessons.length !== 1 ? "s" : ""}
              </span>
            )}
            {content.challenges.length > 0 && (
              <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[0.625rem] font-medium ${colors.text} bg-background/60 ring-1 ring-inset ${colors.border}`}>
                <Trophy className="h-2.5 w-2.5" />
                {content.challenges.length} challenge{content.challenges.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Bottom row: Peek inside (popover trigger) + Explore → (navigation) — unlocked only */}
          {unlocked && (
            <div className="flex items-center justify-between pt-0.5">
              <PopoverTrigger asChild>
                <button className="text-[0.6875rem] text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors cursor-pointer">
                  Peek inside
                </button>
              </PopoverTrigger>
              <Button
                size="sm"
                variant="default"
                className="h-6 px-2 text-xs"
                onClick={(e) => { e.stopPropagation(); navigate(`/module/${moduleId}/explore?track=${track.id}`); }}
              >
                Explore →
              </Button>
            </div>
          )}
        </div>
      </div>
      <PopoverContent align="center" side="bottom" sideOffset={8} className="w-[400px] p-4">
        <TrackPopoverContent track={track} content={content} isUnlocked={unlocked} />
      </PopoverContent>
    </Popover>
  );
}

/* ── Connector ── */
function Connector() {
  return (
    <div className="flex items-center shrink-0 px-1">
      <div className="w-6 h-px bg-border" />
      <ChevronRight className="h-4 w-4 text-muted-foreground/60 -ml-1" />
    </div>
  );
}

/* ── Main component ── */
export function TrackPathfinder() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [trackContent, setTrackContent] = useState<Record<string, TrackContent>>({});
  const { trackStates } = useTrackStates();

  useEffect(() => {
    loadContentIndex().then((index) => {
      const content: Record<string, TrackContent> = {};
      for (const t of tracks) {
        content[t.id] = {
          lessons: index.lessons.filter((l) => l.track === t.id),
          challenges: index.challenges.filter((c) => c.track === t.id),
        };
      }
      setTrackContent(content);
    });
  }, []);

  const independentTracks = tracks.filter((t) => t.prerequisiteTrackIds.length === 0);
  const dependentTracks = tracks.filter((t) => t.prerequisiteTrackIds.length > 0);

  const getContent = (id: string): TrackContent => trackContent[id] ?? { lessons: [], challenges: [] };
  const getIsUnlocked = (id: string): boolean => {
    const apiState = trackStates.find((s) => s.trackId === id);
    if (apiState) return apiState.isUnlocked;
    const track = tracks.find((t) => t.id === id);
    return track ? track.prerequisiteTrackIds.length === 0 : false;
  };
  const getIsCompleted = (id: string): boolean => {
    const apiState = trackStates.find((s) => s.trackId === id);
    return apiState?.isCompleted ?? false;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
        You can start any of the independent learning tracks right away. After completing the AI-Workbench track, you can start the sequence of dependent tracks, starting with Productivity.
      </p>

      <div ref={scrollRef} className="overflow-x-auto py-2 pb-3 px-2 -mx-2 -my-2" style={{ scrollbarGutter: "stable" }}>
        {/* Lane 1 – Independent */}
        <div className="mb-4">
          <span className="text-[0.625rem] font-semibold text-primary uppercase tracking-widest mb-2 block">Start Here</span>
          <div className="flex items-center">
            {independentTracks.map((t, i) => (
              <div key={t.id} className="flex items-center">
                {i > 0 && <Connector />}
                <TrackTile track={t} content={getContent(t.id)} isUnlocked={getIsUnlocked(t.id)} isCompleted={getIsCompleted(t.id)} />
              </div>
            ))}
          </div>
        </div>

        {/* Lane 2 – Dependency chain */}
        {dependentTracks.length > 0 && (
          <div>
            <span className="text-[0.625rem] font-semibold text-primary uppercase tracking-widest mb-2 block">Do Next</span>
            <div className="flex items-center">
              {dependentTracks.map((t, i) => (
                <div key={t.id} className="flex items-center">
                  {i > 0 && <Connector />}
                  <TrackTile track={t} content={getContent(t.id)} isUnlocked={getIsUnlocked(t.id)} isCompleted={getIsCompleted(t.id)} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

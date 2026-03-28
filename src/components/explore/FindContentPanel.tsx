import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CapabilityPortfolio } from "@/components/progress/CapabilityPortfolio";
import { loadContentIndex } from "@/lib/contentLoader";
import type { Lesson, Challenge } from "@/types/content";
import { getTrackHsl, getTrackName } from "@/data/tracks";
import { useTrackStates } from "@/hooks/useTrackStates";
import { Clock, Star, Shield, Search, Award, CheckCircle2, Lock, ChevronRight, ArrowRight, BookOpen, Wrench, Eye } from "lucide-react";
import { ConstellationKeywords } from "@/components/explore/ConstellationKeywords";


type ContentItem = (Lesson | Challenge) & { kind: "lesson" | "challenge" };

/* ── Popover content for any content item ── */
function ItemPopoverContent({
  item,
  moduleId,
}: {
  item: ContentItem;
  moduleId: string;
}) {
  const trackColor = getTrackHsl(item.track);
  const isChallenge = item.kind === "challenge";
  const challenge = isChallenge ? (item as Challenge) : null;
  const href = isChallenge
    ? `/module/${moduleId}/explore/challenge/${item.id}`
    : `/module/${moduleId}/explore/lesson/${item.id}`;

  return (
    <div className="space-y-3">
      {/* Track accent bar */}
      <div className="h-1 -mx-4 -mt-4 rounded-t-md" style={{ backgroundColor: trackColor }} />

      <div className="flex items-center gap-2 pt-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
          {isChallenge ? <Star className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
        </div>
      </div>

      {/* Metadata badges */}
      <div className="flex items-center gap-2 flex-wrap">
        {challenge && (() => {
          const diff = challenge.difficulty as 1 | 2 | 3;
          const dotColor = diff === 1 ? "bg-emerald-500" : diff === 2 ? "bg-amber-500" : "bg-red-500";
          const label = diff === 1 ? "Easy" : diff === 2 ? "Medium" : "Hard";
          return (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
              {Array.from({ length: diff }).map((_, i) => (
                <span key={i} className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
              ))}
              <span className="ml-0.5">{label}</span>
            </Badge>
          );
        })()}
        <Badge variant="outline" className="text-muted-foreground gap-1 text-xs">
          <Clock className="h-3 w-3" />
          {item.estimatedTime}
        </Badge>
        <Badge
          variant="outline"
          className="gap-1 text-xs border-transparent"
          style={{ color: trackColor }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: trackColor }} />
          {getTrackName(item.track)}
        </Badge>
      </div>

      {/* Description */}
      <div className="p-2.5 rounded-lg border bg-muted/30 border-border">
        <p className="text-xs text-foreground">{item.description}</p>
      </div>

      {/* Badge statement for challenges */}
      {challenge && (
        <div className="p-2.5 rounded-lg border bg-muted/30 border-border">
          <div className="flex items-start gap-2">
            <Award className="h-3.5 w-3.5 mt-0.5 shrink-0 text-muted-foreground" />
            <p className="text-xs italic text-foreground">"{challenge.badgeStatement}"</p>
          </div>
        </div>
      )}

      {/* CTA */}
      <Link to={href} className="block">
        <Button size="sm" className="shrink-0 h-6 px-2 text-[11px] gap-1">
          {isChallenge ? "Start Challenge" : "Start Lesson"}
          <ArrowRight className="h-3 w-3" />
        </Button>
      </Link>
    </div>
  );
}

/* ── Compact content row with inline start button and peek popover ── */
function ContentRow({
  item,
  moduleId,
  isLocked,
}: {
  item: ContentItem;
  moduleId: string;
  isLocked: boolean;
}) {
  const trackColor = getTrackHsl(item.track);
  const isChallenge = item.kind === "challenge";
  const href = isChallenge
    ? `/module/${moduleId}/explore/challenge/${item.id}`
    : `/module/${moduleId}/explore/lesson/${item.id}`;

  if (isLocked) {
    return (
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-b-0 bg-muted/30 cursor-not-allowed">
        <div className="shrink-0">
          <Lock className="h-4 w-4 text-muted-foreground/50" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate text-muted-foreground">{item.title}</p>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-border last:border-b-0">
      <div className="shrink-0">
        <div className="h-4 w-4 rounded-full border-2" style={{ borderColor: trackColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.title}</p>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>
      {/* Peek inside — sole popover trigger */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Eye className="h-3 w-3" />
            <span>Peek inside</span>
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" side="bottom" sideOffset={4} className="w-80 p-4">
          <ItemPopoverContent item={item} moduleId={moduleId} />
        </PopoverContent>
      </Popover>
      {/* Inline start button */}
      <Link to={href}>
        <Button size="sm" variant="default" className="shrink-0 h-6 px-2 text-[11px] gap-1">
          {isChallenge ? "Start Challenge" : "Start Lesson"}
        </Button>
      </Link>
    </div>
  );
}

/* ── Sub-section with grey header, navy title, icon, and bordered row group ── */
function GroupSection({
  label,
  items,
  moduleId,
  icon: SectionIcon,
  badgeText,
  trackStates,
}: {
  label: string;
  items: ContentItem[];
  moduleId: string;
  icon?: React.ElementType;
  badgeText?: string;
  trackStates: Array<{ trackId: string; isUnlocked: boolean }>;
}) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Grey background header with navy font */}
      <div className="px-5 py-3 flex items-center justify-between bg-muted/50">
        <div className="flex items-center gap-3">
          {SectionIcon && (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <SectionIcon className="h-4 w-4" />
            </div>
          )}
          <h4 className="font-semibold text-sm text-primary">{label}</h4>
        </div>
        {badgeText && (
          <p className="text-xs text-muted-foreground">{badgeText}</p>
        )}
      </div>

      {/* Bordered row group */}
      <div>
        {items.map((item) => {
          const isTrackLocked = !(
            trackStates.find((s) => s.trackId === item.track)?.isUnlocked ?? true
          );
          return (
            <ContentRow
              key={`${item.kind}-${item.id}`}
              item={item}
              moduleId={moduleId}
              isLocked={isTrackLocked}
            />
          );
        })}
      </div>
    </div>
  );
}

export function FindContentPanel() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const trackParam = searchParams.get("track");
  const { user } = useAuth();
  const { trackStates } = useTrackStates();
  const [allItems, setAllItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    async function load() {
      if (!moduleId) return;
      const index = await loadContentIndex();
      const lessons: ContentItem[] = index.lessons
        .filter((l) => l.module === moduleId)
        .map((l) => ({ ...l, kind: "lesson" as const }));
      const challenges: ContentItem[] = index.challenges
        .filter((c) => c.module === moduleId)
        .map((c) => ({ ...c, kind: "challenge" as const }));
      setAllItems([...lessons, ...challenges]);
    }
    load();
  }, [moduleId]);

  if (!moduleId || !user) return null;

  const filteredItems = trackParam ? allItems.filter((i) => i.track === trackParam) : allItems;

  // Group by difficulty — lessons go into Beginner
  const easyItems = filteredItems.filter(
    (i) => i.kind === "lesson" || (i.kind === "challenge" && (i as Challenge).difficulty === 1)
  );
  const mediumItems = filteredItems.filter(
    (i) => i.kind === "challenge" && (i as Challenge).difficulty === 2
  );
  const hardItems = filteredItems.filter(
    (i) => i.kind === "challenge" && (i as Challenge).difficulty === 3
  );

  // Group by time
  const quick = filteredItems.filter((i) => i.estimatedMinutes <= 20);
  const thirtyMin = filteredItems.filter((i) => i.estimatedMinutes > 20 && i.estimatedMinutes <= 30);
  const oneHour = filteredItems.filter((i) => i.estimatedMinutes > 30);

  // REA Alignment
  const reaApproved = filteredItems.filter((i) => i.approval === "REA Approved");
  const reaTolerated = filteredItems.filter((i) => i.approval === "REA Tolerated");
  const externalItems = filteredItems.filter((i) => i.approval === "External");

  return (
    <Card className="shadow-card overflow-hidden rounded-xl">
      <div className="bg-muted/80 px-6 py-4 flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
          <Search className="h-5 w-5 text-accent" />
          Find content by...
        </CardTitle>
      </div>

      {trackParam && (
        <div className="px-6 pt-4 pb-0 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Showing:</span>
          <Badge variant="secondary" className="gap-1.5 text-xs">
            {getTrackName(trackParam)}
            <button onClick={() => setSearchParams({})} className="ml-1 hover:text-foreground">×</button>
          </Badge>
        </div>
      )}

      <div className="p-4">
        <Accordion type="multiple" className="space-y-3">
          {/* Difficulty */}
          <AccordionItem value="difficulty" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Star className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Difficulty</h4>
                      <p className="text-xs text-muted-foreground">Filter by Easy, Medium, or Hard challenges</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
              <GroupSection
                label="Easy"
                items={easyItems}
                moduleId={moduleId}
                icon={Star}
                badgeText={`${easyItems.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="Medium"
                items={mediumItems}
                moduleId={moduleId}
                icon={Star}
                badgeText={`${mediumItems.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="Hard"
                items={hardItems}
                moduleId={moduleId}
                icon={Star}
                badgeText={`${hardItems.length} items`}
                trackStates={trackStates}
              />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Time investment */}
          <AccordionItem value="time" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Time investment</h4>
                      <p className="text-xs text-muted-foreground">Find content that fits your schedule</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
              <GroupSection
                label="Quick (≤ 20 min)"
                items={quick}
                moduleId={moduleId}
                icon={Clock}
                badgeText={`${quick.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="30 minutes"
                items={thirtyMin}
                moduleId={moduleId}
                icon={Clock}
                badgeText={`${thirtyMin.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="1 hour"
                items={oneHour}
                moduleId={moduleId}
                icon={Clock}
                badgeText={`${oneHour.length} items`}
                trackStates={trackStates}
              />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Value */}
          <AccordionItem value="value" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Value</h4>
                      <p className="text-xs text-muted-foreground">Explore content by the capability it builds</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2">
                <CapabilityPortfolio hideHeader />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* REA Alignment */}
          <AccordionItem value="rea-alignment" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">REA Alignment</h4>
                      <p className="text-xs text-muted-foreground">REA Approved means you can adopt right away. Anything not approved should be approached with caution and is listed as FYI only</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
              <GroupSection
                label="REA Approved"
                items={reaApproved}
                moduleId={moduleId}
                icon={CheckCircle2}
                badgeText={`${reaApproved.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="REA Tolerated"
                items={reaTolerated}
                moduleId={moduleId}
                icon={Shield}
                badgeText={`${reaTolerated.length} items`}
                trackStates={trackStates}
              />
              <GroupSection
                label="External"
                items={externalItems}
                moduleId={moduleId}
                icon={Shield}
                badgeText={`${externalItems.length} items`}
                trackStates={trackStates}
              />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Tool Name */}
          <AccordionItem value="tool-name" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Tool Name</h4>
                      <p className="text-xs text-muted-foreground">Scan our huge collection of topics to find inspiration or see what is out there</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2">
                <ConstellationKeywords />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </Card>
  );
}

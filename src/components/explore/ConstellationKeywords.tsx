import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { loadContentIndex } from "@/lib/contentLoader";
import { getTrackHsl, getTrackName } from "@/data/tracks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Lesson, Challenge, ContentIndex } from "@/types/content";
import { Clock, Star, BookOpen, Award, ArrowRight, X } from "lucide-react";

interface KeywordData {
  label: string;
  rawTag: string; // original tag before formatting
  track: string | null;
  weight: number;
}

const DEFAULT_TRACK_KEYWORDS: KeywordData[] = [
  { label: "Prototyping", rawTag: "prototyping", track: "prototyping", weight: 1 },
  { label: "AI IDEs", rawTag: "ai-workbench", track: "ai-workbench", weight: 1 },
  { label: "Measurement", rawTag: "measurement", track: "measurement", weight: 0.9 },
];

const DEFAULT_TOOL_KEYWORDS: KeywordData[] = [
  { label: "Figma", rawTag: "figma", track: "prototyping", weight: 0.85 },
  { label: "Cursor", rawTag: "cursor", track: "ai-workbench", weight: 0.8 },
  { label: "Copilot", rawTag: "copilot", track: "ai-workbench", weight: 0.75 },
  { label: "Lovable", rawTag: "lovable", track: "prototyping", weight: 0.7 },
  { label: "Vercel", rawTag: "vercel", track: "prototyping", weight: 0.65 },
  { label: "Claude Code", rawTag: "claude-code", track: "ai-workbench", weight: 0.7 },
  { label: "Firebase Studio", rawTag: "firebase-studio", track: "prototyping", weight: 0.6 },
  { label: "MCP", rawTag: "mcp", track: "ai-workbench", weight: 0.55 },
  { label: "Analytics", rawTag: "analytics", track: "measurement", weight: 0.6 },
  { label: "Evaluations", rawTag: "evaluations", track: "measurement", weight: 0.65 },
];

function formatToolTag(tag: string): string {
  const MAP: Record<string, string> = {
    mcp: "MCP",
    "claude-code": "Claude Code",
    figma: "Figma",
    cursor: "Cursor",
    copilot: "Copilot",
    analytics: "Analytics",
    evaluations: "Evaluations",
  };
  return MAP[tag] ?? tag.charAt(0).toUpperCase() + tag.slice(1);
}

type ContentItem = (Lesson | Challenge) & { kind: "lesson" | "challenge" };

/* ── Popover for a clicked keyword ── */
function KeywordPopover({
  keyword,
  items,
  position,
  onClose,
}: {
  keyword: KeywordData;
  items: ContentItem[];
  position: { x: number; y: number };
  onClose: () => void;
}) {
  const trackColor = keyword.track ? getTrackHsl(keyword.track) : undefined;
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={popoverRef}
      className="absolute z-50 w-80 rounded-xl border bg-card shadow-lg animate-fade-in overflow-hidden"
      style={{
        left: Math.max(8, Math.min(position.x - 160, window.innerWidth - 340)),
        top: position.y + 12,
      }}
    >
      {/* Accent bar */}
      {trackColor && (
        <div className="h-1 w-full" style={{ backgroundColor: trackColor }} />
      )}

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {trackColor && (
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: trackColor }} />
            )}
            <h4 className="font-semibold text-sm text-foreground">{keyword.label}</h4>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">No content found for this keyword.</p>
        ) : (
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {items.map((item) => {
              const isChallenge = item.kind === "challenge";
              const challenge = isChallenge ? (item as Challenge) : null;
              const itemTrackColor = getTrackHsl(item.track);
              const href = isChallenge
                ? `/module/${item.module}/explore/challenge/${item.id}`
                : `/module/${item.module}/explore/lesson/${item.id}`;

              return (
                <Link
                  key={`${item.kind}-${item.id}`}
                  to={href}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-border hover:bg-muted/40 transition-colors group"
                >
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-md shrink-0 mt-0.5"
                    style={{ backgroundColor: `${itemTrackColor}15` }}
                  >
                    {isChallenge ? (
                      <Star className="h-3.5 w-3.5" style={{ color: itemTrackColor }} />
                    ) : (
                      <BookOpen className="h-3.5 w-3.5" style={{ color: itemTrackColor }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {challenge && (() => {
                        const diff = challenge.difficulty as 1 | 2 | 3;
                        const dotColor = diff === 1 ? "bg-emerald-500" : diff === 2 ? "bg-amber-500" : "bg-red-500";
                        return (
                          <span className="flex items-center gap-0.5">
                            {Array.from({ length: diff }).map((_, i) => (
                              <span key={i} className={`inline-block h-2 w-2 rounded-full ${dotColor}`} />
                            ))}
                          </span>
                        );
                      })()}
                      <span className="text-[0.65rem] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-2.5 w-2.5" />
                        {item.estimatedTime}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConstellationKeywords({ dimmed }: { dimmed?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const timeRef = useRef(0);
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 });
  const [trackKeywords, setTrackKeywords] = useState<KeywordData[]>(DEFAULT_TRACK_KEYWORDS);
  const [toolKeywords, setToolKeywords] = useState<KeywordData[]>(DEFAULT_TOOL_KEYWORDS);
  const [contentIndex, setContentIndex] = useState<ContentIndex | null>(null);
  const [selectedKeyword, setSelectedKeyword] = useState<{
    keyword: KeywordData;
    position: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    loadContentIndex()
      .then((index) => {
        setContentIndex(index);
        const trackSet = new Set<string>();
        const toolTrackCount = new Map<string, Map<string, number>>();

        [...index.lessons, ...index.challenges].forEach((item) => {
          if (item.track) trackSet.add(item.track);
          if (item.toolTags) {
            item.toolTags.forEach((tag) => {
              if (!toolTrackCount.has(tag)) toolTrackCount.set(tag, new Map());
              const trackCounts = toolTrackCount.get(tag)!;
              trackCounts.set(item.track ?? "", (trackCounts.get(item.track ?? "") || 0) + 1);
            });
          }
        });

        const newTrackKeywords: KeywordData[] = Array.from(trackSet).map((track, i) => ({
          label: getTrackName(track),
          rawTag: track,
          track,
          weight: Math.max(0.6, 1 - i * 0.05),
        }));

        const newToolKeywords: KeywordData[] = Array.from(toolTrackCount.entries()).map(
          ([tag, trackCounts], i) => {
            let bestTrack = "";
            let bestCount = 0;
            trackCounts.forEach((count, track) => {
              if (count > bestCount) { bestCount = count; bestTrack = track; }
            });
            return { label: formatToolTag(tag), rawTag: tag, track: bestTrack || null, weight: Math.max(0.4, 0.85 - i * 0.05) };
          }
        );

        if (newTrackKeywords.length > 0) setTrackKeywords(newTrackKeywords);
        if (newToolKeywords.length > 0) setToolKeywords(newToolKeywords);
      })
      .catch((e) => {
        console.error("[ConstellationKeywords] Failed to load content index:", e);
      });
  }, []);

  const allKeywords = useMemo(() => [...trackKeywords, ...toolKeywords], [trackKeywords, toolKeywords]);

  // Find content items matching a keyword
  const getItemsForKeyword = useCallback(
    (kw: KeywordData): ContentItem[] => {
      if (!contentIndex) return [];
      const allContent = [
        ...contentIndex.lessons.map((l) => ({ ...l, kind: "lesson" as const })),
        ...contentIndex.challenges.map((c) => ({ ...c, kind: "challenge" as const })),
      ];

      const isTrackKeyword = trackKeywords.some((tk) => tk.label === kw.label);

      if (isTrackKeyword) {
        // Track keyword → show all content in that track
        return allContent.filter((item) => item.track === kw.rawTag);
      } else {
        // Tool keyword → show content with matching toolTag
        return allContent.filter(
          (item) => item.toolTags?.some((t) => t === kw.rawTag)
        );
      }
    },
    [contentIndex, trackKeywords]
  );

  const keywordPositions = useMemo(() => {
    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;
    const maxRadius = Math.min(cx, cy) - 60;

    const innerRing = trackKeywords.map((kw, i) => {
      const angle = (i / trackKeywords.length) * Math.PI * 2 - Math.PI / 2;
      const r = maxRadius * 0.35;
      return {
        ...kw,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        baseAngle: angle,
        ring: "inner" as const,
        radius: r,
        orbitSpeed: 0.0003 * 1.3,
      };
    });

    const outerRing = toolKeywords.map((kw, i) => {
      const angle = (i / toolKeywords.length) * Math.PI * 2 - Math.PI / 4;
      const r = maxRadius * 0.78;
      return {
        ...kw,
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        baseAngle: angle,
        ring: "outer" as const,
        radius: r,
        orbitSpeed: 0.00015 * 1.3,
      };
    });

    return [...innerRing, ...outerRing];
  }, [dimensions, trackKeywords, toolKeywords]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setDimensions({ width, height: Math.min(800, width * 0.95) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = dimensions.width * dpr;
    canvas.height = dimensions.height * dpr;
    ctx.scale(dpr, dpr);

    const cx = dimensions.width / 2;
    const cy = dimensions.height / 2;

    const withAlpha = (c: string, a: number) => {
      const m = c.match(/^hsl\(([^)]+)\)$/);
      if (m) return `hsla(${m[1]}, ${a})`;
      const hex = Math.round(a * 255).toString(16).padStart(2, "0");
      return `${c.replace(/[0-9a-f]{2}$/i, "")}${hex}`;
    };

    const draw = () => {
      timeRef.current += 1;
      const t = timeRef.current;
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      const globalAlpha = dimmed ? 0.3 : 1;
      ctx.globalAlpha = globalAlpha;

      const maxR = Math.min(cx, cy) - 60;
      [0.35, 0.78].forEach((ratio) => {
        ctx.beginPath();
        ctx.arc(cx, cy, maxR * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(224, 76%, 33%, ${dimmed ? 0.08 : 0.16})`;
        ctx.setLineDash([4, 8]);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      const currentPositions = keywordPositions.map((kw) => {
        const angle = kw.baseAngle + t * kw.orbitSpeed;
        const breathe = Math.sin(t * 0.008 + kw.baseAngle) * 6;
        return {
          ...kw,
          currentX: cx + Math.cos(angle) * (kw.radius + breathe),
          currentY: cy + Math.sin(angle) * (kw.radius + breathe),
        };
      });

      currentPositions.forEach((kw1, i) => {
        currentPositions.forEach((kw2, j) => {
          if (j <= i) return;
          if (kw1.track !== kw2.track || !kw1.track) return;
          const color = getTrackHsl(kw1.track);
          const isHovered = hoveredKeyword === kw1.label || hoveredKeyword === kw2.label;
          ctx.beginPath();
          ctx.moveTo(kw1.currentX, kw1.currentY);
          ctx.lineTo(kw2.currentX, kw2.currentY);
          ctx.strokeStyle = isHovered ? withAlpha(color, 0.56) : withAlpha(color, 0.19);
          ctx.lineWidth = isHovered ? 1.8 : 0.9;
          ctx.stroke();
        });
      });

      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      gradient.addColorStop(0, `hsla(38, 92%, 50%, ${dimmed ? 0.05 : 0.15})`);
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = dimmed ? "hsla(224, 76%, 33%, 0.1)" : "hsla(224, 76%, 33%, 0.06)";
      ctx.beginPath();
      ctx.arc(cx, cy, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = dimmed ? "hsla(38, 92%, 50%, 0.1)" : "hsla(38, 92%, 50%, 0.3)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.font = "bold 32px system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = dimmed ? "hsla(38, 92%, 50%, 0.15)" : "hsla(38, 92%, 50%, 0.8)";
      ctx.fillText("?", cx, cy + 1);

      currentPositions.forEach((kw) => {
        const isHovered = hoveredKeyword === kw.label;
        const color = kw.track ? getTrackHsl(kw.track) : "hsl(220, 9%, 46%)";
        const isTrack = kw.ring === "inner";

        const dotRadius = isTrack ? (isHovered ? 6 : 5) : (isHovered ? 5 : 4);
        ctx.beginPath();
        ctx.arc(kw.currentX, kw.currentY, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = isHovered ? color : withAlpha(color, isTrack ? 0.8 : 0.85);
        ctx.fill();

        if (isHovered) {
          const glow = ctx.createRadialGradient(
            kw.currentX, kw.currentY, 0,
            kw.currentX, kw.currentY, 24
          );
          glow.addColorStop(0, withAlpha(color, 0.25));
          glow.addColorStop(1, "transparent");
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(kw.currentX, kw.currentY, 24, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = isTrack
          ? `${isHovered ? "bold " : "600 "}${isHovered ? "16" : "15"}px system-ui, -apple-system, sans-serif`
          : `${isHovered ? "600 " : ""}${isHovered ? "14" : "13"}px system-ui, -apple-system, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = isHovered ? color : withAlpha(color, isTrack ? 0.87 : 0.82);
        ctx.fillText(kw.label, kw.currentX, kw.currentY + (isTrack ? 22 : 20));
      });

      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [dimensions, keywordPositions, hoveredKeyword, dimmed]);

  const findKeywordAtPosition = useCallback(
    (mx: number, my: number) => {
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      const t = timeRef.current;

      let closest: KeywordData | null = null;
      let closestDist = 35;

      keywordPositions.forEach((kw) => {
        const angle = kw.baseAngle + t * kw.orbitSpeed;
        const breathe = Math.sin(t * 0.008 + kw.baseAngle) * 6;
        const px = cx + Math.cos(angle) * (kw.radius + breathe);
        const py = cy + Math.sin(angle) * (kw.radius + breathe);
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2);
        if (dist < closestDist) {
          closestDist = dist;
          closest = kw;
        }
      });

      return closest;
    },
    [dimensions, keywordPositions]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const kw = findKeywordAtPosition(mx, my);
      setHoveredKeyword(kw?.label ?? null);
    },
    [findKeywordAtPosition]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const kw = findKeywordAtPosition(mx, my);
      if (kw) {
        setSelectedKeyword({
          keyword: kw,
          position: { x: mx, y: my },
        });
      } else {
        setSelectedKeyword(null);
      }
    },
    [findKeywordAtPosition]
  );

  const selectedItems = useMemo(() => {
    if (!selectedKeyword) return [];
    return getItemsForKeyword(selectedKeyword.keyword);
  }, [selectedKeyword, getItemsForKeyword]);

  return (
    <div ref={containerRef} className="w-full relative">
      <canvas
        ref={canvasRef}
        style={{ width: dimensions.width, height: dimensions.height }}
        className="w-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredKeyword(null)}
        onClick={handleClick}
      />

      {/* Hover tooltip */}
      {hoveredKeyword && !selectedKeyword && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur border shadow-card text-sm font-medium text-foreground pointer-events-none">
          {hoveredKeyword}
          {(() => {
            const kw = allKeywords.find((k) => k.label === hoveredKeyword);
            if (kw?.track) {
              const trackName = getTrackName(kw.track);
              const color = getTrackHsl(kw.track);
              return (
                <span className="ml-1.5 opacity-70" style={{ color }}>
                  · {trackName}
                </span>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Click popover */}
      {selectedKeyword && (
        <KeywordPopover
          keyword={selectedKeyword.keyword}
          items={selectedItems}
          position={selectedKeyword.position}
          onClose={() => setSelectedKeyword(null)}
        />
      )}
    </div>
  );
}

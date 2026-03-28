import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BookOpen, FileEdit, Eye, ListOrdered, AlertTriangle, Clock, Crown, Star, Award, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { MarkdownErrorBoundary } from "@/components/lesson/MarkdownErrorBoundary";
import { parseFrontmatter, type FrontmatterMetadata } from "@/lib/parseFrontmatter";
import { ComponentLibrary } from "@/components/content-studio/ComponentLibrary";
import { directiveRegistry } from "@/lib/directiveRegistry";
import { copyToClipboard } from "@/lib/clipboard";

type ContentType = "lesson" | "challenge" | null;

export default function ContentStudio() {
  const [markdown, setMarkdown] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [previewMetadata, setPreviewMetadata] = useState<FrontmatterMetadata>({});
  const [contentType, setContentType] = useState<ContentType>(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [activeTab, setActiveTab] = useState<"lesson" | "challenge">("lesson");
  const [directiveWarnings, setDirectiveWarnings] = useState<string[]>([]);
  const previewRef = useRef<HTMLDivElement>(null);

  // Fetch and copy authoring guide
  const handleCopyGuide = async () => {
    setIsLoadingGuide(true);
    try {
      const response = await fetch("/content/AUTHORING-GUIDE-v3.md");
      if (!response.ok) {
        throw new Error("Failed to fetch authoring guide");
      }
      const guideText = await response.text();
      await copyToClipboard(guideText);
      toast.success("Authoring guide copied to clipboard!");
    } catch (error) {
      console.error("Error copying guide:", error);
      toast.error("Failed to copy authoring guide");
    } finally {
      setIsLoadingGuide(false);
    }
  };

  // Detect content type from frontmatter
  const detectContentType = (metadata: FrontmatterMetadata): ContentType => {
    // Primary detection: use explicit type field if present
    if (metadata.type === "challenge") {
      return "challenge";
    }
    if (metadata.type === "lesson") {
      return "lesson";
    }

    // Fallback detection: check for type-specific fields
    // Check for challenge-specific fields
    if ("badgeId" in metadata || "difficulty" in metadata) {
      return "challenge";
    }
    // Check for lesson-specific fields
    if ("estimatedTime" in metadata || "unlocksRank" in metadata) {
      return "lesson";
    }
    return null;
  };

  // Strip wrapping code fences that ChatGPT often adds around markdown output
  const stripCodeFence = (text: string): string => {
    const stripped = text.trim();
    const match = stripped.match(/^```(?:md|markdown)?\s*\n([\s\S]*)\n```\s*$/);
    return match ? match[1] : stripped;
  };

  // Handle preview button click
  const handlePreview = () => {
    const cleanedMarkdown = stripCodeFence(markdown);
    const { metadata, content } = parseFrontmatter(cleanedMarkdown);
    setPreviewMetadata(metadata);
    setPreviewContent(content);
    setDirectiveWarnings([]); // Clear previous warnings

    const detected = detectContentType(metadata);
    setContentType(detected);

    // Set active tab based on detected type
    if (detected === "challenge") {
      setActiveTab("challenge");
    } else {
      setActiveTab("lesson");
    }

    // Auto-scroll to preview with reduced motion support
    setTimeout(() => {
      if (previewRef.current) {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        previewRef.current.scrollIntoView({ 
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start"
        });
        
        // Move focus to preview heading for accessibility
        const previewHeading = previewRef.current.querySelector("h2");
        if (previewHeading instanceof HTMLElement) {
          previewHeading.focus();
        }
      }
    }, 100);
  };

  const hasContent = markdown.trim().length > 0;

  // Handle directive warnings from MarkdownRenderer
  const handleDirectiveWarnings = (warnings: string[]) => {
    setDirectiveWarnings(warnings);
  };

  // Get suggestions for unrecognized directives
  const getSuggestions = (directiveName: string): string[] => {
    const validNames = directiveRegistry.map(d => d.name);
    // Simple similarity check - find directives that contain similar characters
    return validNames.filter(valid => {
      const lower = directiveName.toLowerCase();
      const validLower = valid.toLowerCase();
      return validLower.includes(lower) || lower.includes(validLower);
    });
  };

  return (
    <Layout>
      <div className="container py-8 space-y-8 max-w-5xl">

        {/* Back to Overview */}
        <Link to="/module/ai-driven-experimentation">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
        </Link>

        {/* Hero Panel */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 md:p-8 text-primary-foreground animate-fade-in">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
          <div className="relative">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Content Studio
            </h1>
            <p className="text-primary-foreground/80 max-w-xl">
              Create and preview lessons and challenges with AI assistance
            </p>
          </div>
        </div>

        {/* Workflow Instructions */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.05s" }}>
          <div className="bg-muted/80 px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <ListOrdered className="h-5 w-5 text-accent" />
              Workflow Instructions
            </h2>
          </div>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Use this workflow to create and preview content:
            </p>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">1.</span>
                <span>Copy the authoring guide to your clipboard</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">2.</span>
                <span>Paste it into your AI assistant (Omnia, Claude, etc.)</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">3.</span>
                <span>Collaborate with your AI assistant to generate lesson or challenge content</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">4.</span>
                <span>Reference the component library below to specify which UI elements to include</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">5.</span>
                <span>Paste the final markdown into the editor and click Preview</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">6.</span>
                <span>Review the fully rendered lesson or challenge</span>
              </li>
              <li className="flex gap-3">
                <span className="font-semibold text-accent min-w-[1.5rem]">7.</span>
                <span>Share your final content with jan.erasmus@rea-group.com to publish it in the app</span>
              </li>
            </ol>
          </CardContent>
        </Card>

        {/* Section 1: Authoring Guide Card */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="bg-muted/80 px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-accent" />
              Authoring Guide
            </h2>
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              Use the authoring guide with AI assistants to create well-structured lessons and challenges.
              The guide contains templates, best practices, and formatting instructions.
            </p>
            <Button
              onClick={handleCopyGuide}
              disabled={isLoadingGuide}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLoadingGuide ? "Loading..." : "Copy Authoring Guide"}
            </Button>
            <ComponentLibrary />
          </CardContent>
        </Card>

        {/* Section 2: Editor Card */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-muted/80 px-6 py-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <FileEdit className="h-5 w-5 text-accent" />
              Editor
            </h2>
          </div>
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Paste your AI-created content below and click Preview to see what it will look like in-app
            </p>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Paste your markdown content here..."
              className="w-full min-h-[320px] md:min-h-[420px] p-4 rounded-md border bg-background font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Markdown editor"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground" aria-live="polite">
                {contentType && (
                  <span>Detected: <span className="font-medium text-foreground capitalize">{contentType}</span></span>
                )}
              </div>
              <Button
                onClick={handlePreview}
                disabled={!hasContent}
                className="bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                Preview
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Preview Card */}
        {previewContent && (
          <Card
            ref={previewRef}
            className="shadow-card animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="bg-muted/80 px-6 py-4">
              <h2
                className="text-xl font-semibold text-foreground flex items-center gap-2"
                tabIndex={-1}
              >
                <Eye className="h-5 w-5 text-accent" />
                Preview
              </h2>
            </div>
            <CardContent className="p-6 space-y-6">
              {/* Tabs for view modes */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "lesson" | "challenge")}>
                <TabsList>
                  <TabsTrigger value="lesson">Lesson View</TabsTrigger>
                  <TabsTrigger value="challenge">Challenge View</TabsTrigger>
                </TabsList>

                <TabsContent value="lesson" className="space-y-4">
                  {/* Lesson-Specific Metadata */}
                  {Object.keys(previewMetadata).length > 0 && (
                    <div className="space-y-4">
                      {/* Title and Description */}
                      {(previewMetadata.title || previewMetadata.description) && (
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                          {previewMetadata.title && (
                            <h3 className="text-lg font-bold text-foreground">{previewMetadata.title}</h3>
                          )}
                          {previewMetadata.description && (
                            <p className="text-sm text-muted-foreground">{previewMetadata.description}</p>
                          )}
                        </div>
                      )}

                      {/* Lesson Metadata Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Time Estimate */}
                        {previewMetadata.estimatedTime && (
                          <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
                                <Clock className="h-5 w-5 text-accent" />
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Time Estimate</p>
                                <p className="font-semibold">{previewMetadata.estimatedTime}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Rank Unlock */}
                        {previewMetadata.unlocksRank !== undefined && (
                          <div className="rounded-lg border border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
                                <span className="text-lg font-bold">{previewMetadata.unlocksRank}</span>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Unlocks Rank</p>
                                <p className="font-semibold">Rank {previewMetadata.unlocksRank}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Additional Lesson Fields */}
                      {(previewMetadata.module || previewMetadata.order !== undefined || previewMetadata.isRequired !== undefined) && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Additional Info</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {previewMetadata.module && (
                              <div>
                                <span className="text-muted-foreground">Module:</span>{" "}
                                <span className="font-medium">{previewMetadata.module}</span>
                              </div>
                            )}
                            {previewMetadata.order !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Order:</span>{" "}
                                <span className="font-medium">{previewMetadata.order}</span>
                              </div>
                            )}
                            {previewMetadata.isRequired !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Required:</span>{" "}
                                <span className="font-medium">{previewMetadata.isRequired ? "Yes" : "No"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Directive Warnings */}
                  {directiveWarnings.length > 0 && (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                            Unrecognized Directives
                          </h3>
                          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                            {directiveWarnings.map((directive, idx) => {
                              const suggestions = getSuggestions(directive);
                              return (
                                <div key={idx}>
                                  <code className="px-1.5 py-0.5 rounded bg-yellow-900/20 font-mono">
                                    ::{directive}
                                  </code>
                                  {suggestions.length > 0 && (
                                    <span className="ml-2">
                                      — Did you mean{" "}
                                      <code className="px-1.5 py-0.5 rounded bg-green-900/20 font-mono">
                                        ::{suggestions[0]}
                                      </code>
                                      ?
                                    </span>
                                  )}
                                  {suggestions.length === 0 && (
                                    <span className="ml-2">
                                      — Not found in directive registry
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                            Valid directives: {directiveRegistry.map(d => `::${d.name}`).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendered Content */}
                  <div className="rounded-lg border bg-background p-6">
                    <MarkdownErrorBoundary>
                      <MarkdownRenderer
                        content={previewContent}
                        onDirectiveWarnings={handleDirectiveWarnings}
                      />
                    </MarkdownErrorBoundary>
                  </div>
                </TabsContent>

                <TabsContent value="challenge" className="space-y-4">
                  {/* Challenge-Specific Metadata */}
                  {Object.keys(previewMetadata).length > 0 && (
                    <div className="space-y-4">
                      {/* Title and Description */}
                      {(previewMetadata.title || previewMetadata.description) && (
                        <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                          {previewMetadata.title && (
                            <h3 className="text-lg font-bold text-foreground">{previewMetadata.title}</h3>
                          )}
                          {previewMetadata.description && (
                            <p className="text-sm text-muted-foreground">{previewMetadata.description}</p>
                          )}
                        </div>
                      )}

                      {/* Badge Display */}
                      {(previewMetadata.badgeName || previewMetadata.badgeId) && (
                        <div className="rounded-lg border border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 p-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20 text-secondary">
                              <Award className="h-8 w-8" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Badge</p>
                              <p className="font-bold text-lg">{previewMetadata.badgeName || "Challenge Badge"}</p>
                              {previewMetadata.badgeId && (
                                <p className="text-xs text-muted-foreground">ID: {previewMetadata.badgeId}</p>
                              )}
                            </div>
                          </div>
                          {previewMetadata.badgeStatement && (
                            <div className="mt-3 pt-3 border-t border-secondary/20">
                              <p className="text-sm italic text-muted-foreground">
                                "{previewMetadata.badgeStatement}"
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Challenge Stats */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Difficulty */}
                        {previewMetadata.difficulty !== undefined && (
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Star className="h-4 w-4 text-accent" />
                              <p className="text-sm text-muted-foreground">Difficulty</p>
                            </div>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 3 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < previewMetadata.difficulty!
                                      ? "text-accent fill-accent"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                              <span className="ml-2 font-semibold">
                                {previewMetadata.difficulty === 1 ? "Easy" : previewMetadata.difficulty === 2 ? "Medium" : "Hard"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Required Rank */}
                        {previewMetadata.requiredRank !== undefined && (
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Crown className="h-4 w-4 text-secondary" />
                              <p className="text-sm text-muted-foreground">Required Rank</p>
                            </div>
                            <p className="font-semibold text-lg">Rank {previewMetadata.requiredRank}</p>
                          </div>
                        )}

                        {/* Estimated Time */}
                        {previewMetadata.estimatedTime && (
                          <div className="rounded-lg border bg-muted/50 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-4 w-4 text-secondary" />
                              <p className="text-sm text-muted-foreground">Time Estimate</p>
                            </div>
                            <p className="font-semibold">{previewMetadata.estimatedTime}</p>
                          </div>
                        )}
                      </div>

                      {/* Additional Challenge Fields */}
                      {(previewMetadata.category || previewMetadata.icon || previewMetadata.module) && (
                        <div className="rounded-lg border bg-muted/50 p-4">
                          <h4 className="text-sm font-semibold text-foreground mb-2">Additional Info</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            {previewMetadata.category && (
                              <div>
                                <span className="text-muted-foreground">Category:</span>{" "}
                                <span className="font-medium">{previewMetadata.category}</span>
                              </div>
                            )}
                            {previewMetadata.icon && (
                              <div>
                                <span className="text-muted-foreground">Icon:</span>{" "}
                                <span className="font-medium">{previewMetadata.icon}</span>
                              </div>
                            )}
                            {previewMetadata.module && (
                              <div>
                                <span className="text-muted-foreground">Module:</span>{" "}
                                <span className="font-medium">{previewMetadata.module}</span>
                              </div>
                            )}
                            {previewMetadata.isRequired !== undefined && (
                              <div>
                                <span className="text-muted-foreground">Required:</span>{" "}
                                <span className="font-medium">{previewMetadata.isRequired ? "Yes" : "No"}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Directive Warnings */}
                  {directiveWarnings.length > 0 && (
                    <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                            Unrecognized Directives
                          </h3>
                          <div className="space-y-2 text-sm text-yellow-800 dark:text-yellow-200">
                            {directiveWarnings.map((directive, idx) => {
                              const suggestions = getSuggestions(directive);
                              return (
                                <div key={idx}>
                                  <code className="px-1.5 py-0.5 rounded bg-yellow-900/20 font-mono">
                                    ::{directive}
                                  </code>
                                  {suggestions.length > 0 && (
                                    <span className="ml-2">
                                      — Did you mean{" "}
                                      <code className="px-1.5 py-0.5 rounded bg-green-900/20 font-mono">
                                        ::{suggestions[0]}
                                      </code>
                                      ?
                                    </span>
                                  )}
                                  {suggestions.length === 0 && (
                                    <span className="ml-2">
                                      — Not found in directive registry
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <p className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                            Valid directives: {directiveRegistry.map(d => `::${d.name}`).join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rendered Content */}
                  <div className="rounded-lg border bg-background p-6">
                    <MarkdownErrorBoundary>
                      <MarkdownRenderer
                        content={previewContent}
                        onDirectiveWarnings={handleDirectiveWarnings}
                      />
                    </MarkdownErrorBoundary>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Back to Overview (bottom) */}
        <div className="pt-4">
          <Link to="/module/ai-driven-experimentation">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Overview
            </Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
}


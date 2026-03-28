import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { X, BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useAuth, Rank } from "@/contexts/AuthContext";
import { MarkdownRenderer } from "@/components/lesson/MarkdownRenderer";
import { MarkdownErrorBoundary } from "@/components/lesson/MarkdownErrorBoundary";
import { LessonSidebar } from "@/components/lesson/LessonSidebar";
import { LessonBottomBar } from "@/components/lesson/LessonBottomBar";
import { CompletionCelebration } from "@/components/lesson/CompletionCelebration";
import { getLesson } from "@/lib/contentLoader";
import { parseFrontmatter } from "@/lib/parseFrontmatter";
import type { Lesson } from "@/types/content";

export default function LessonPlayer() {
  const { lessonId, moduleId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, completeLesson } = useAuth();
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isLoadingMarkdown, setIsLoadingMarkdown] = useState(false);
  const [lesson, setLesson] = useState<Lesson | null>(null);

  const currentLessonId = lessonId ? parseInt(lessonId) : null;

  // Check completion status
  const isCompleted = user?.lessonsCompleted.includes(currentLessonId || 0) || false;

  // Fetch lesson metadata and navigation
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!currentLessonId || !moduleId) return;

      try {
        // Fetch lesson metadata
        const lessonData = await getLesson(currentLessonId);
        if (lessonData) {
          setLesson(lessonData);
        }

      } catch (error) {
        console.error("Failed to fetch lesson data:", error);
      }
    };

    fetchLessonData();
  }, [currentLessonId, moduleId]);

  // Fetch markdown content from contentPath
  useEffect(() => {
    const fetchMarkdownContent = async () => {
      if (!lesson?.contentPath) return;

      setIsLoadingMarkdown(true);
      try {
        const response = await fetch(lesson.contentPath);
        if (response.ok) {
          const markdownText = await response.text();
          // Strip frontmatter before rendering
          const { content } = parseFrontmatter(markdownText);
          setMarkdownContent(content);
        } else {
          console.error("Failed to fetch markdown content");
        }
      } catch (error) {
        console.error("Failed to fetch markdown content:", error);
      } finally {
        setIsLoadingMarkdown(false);
      }
    };

    fetchMarkdownContent();
  }, [lesson?.contentPath]);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollContainer = document.getElementById("lesson-content");
      if (scrollContainer) {
        const scrollTop = scrollContainer.scrollTop;
        const scrollHeight = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);
      }
    };

    const scrollContainer = document.getElementById("lesson-content");
    scrollContainer?.addEventListener("scroll", handleScroll);
    return () => scrollContainer?.removeEventListener("scroll", handleScroll);
  }, []);

  // Redirect if not authenticated or content not found
  if (!isAuthenticated || !user) {
    navigate("/");
    return null;
  }

  if (!currentLessonId || !lesson) {
    if (currentLessonId && !lesson) {
      // Still loading
      return null;
    }
    navigate(moduleId ? `/module/${moduleId}/explore` : "/");
    return null;
  }

  const handleMarkComplete = async () => {
    if (!lesson || isCompleting) return;
    setIsCompleting(true);
    const success = await completeLesson(lesson.id);
    setIsCompleting(false);
    if (success) {
      setShowCelebration(true);
    } else {
      toast.error("Couldn't save your progress — try again");
    }
  };

  const handleCelebrationContinue = () => {
    setShowCelebration(false);
    navigate(moduleId ? `/module/${moduleId}/explore` : "/");
  };

  const handleExit = () => {
    navigate(moduleId ? `/module/${moduleId}/explore` : "/");
  };

  // Breadcrumb parts
  const breadcrumbs = ["Lesson", lesson.title];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b backdrop-blur-sm bg-accent/5 border-accent/20">
        <div className="container py-3">
          <div className="flex items-center justify-between">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/20 text-accent">
                <BookOpen className="h-4 w-4" />
              </div>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span
                    className={
                      index === breadcrumbs.length - 1
                        ? "font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {crumb}
                  </span>
                </span>
              ))}
            </div>

            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExit}
              className="gap-1"
            >
              <X className="h-4 w-4" />
              Exit
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area (70%) */}
        <div className="flex-1 min-w-0 relative">
          {/* Scroll Progress Indicator */}
          <div
            className="fixed left-0 top-[57px] w-1 bg-muted z-30"
            style={{ height: "calc(100vh - 57px - 73px)" }}
          >
            <div
              className="w-full transition-all bg-accent"
              style={{ height: `${scrollProgress}%` }}
            />
          </div>

          <ScrollArea
            id="lesson-content"
            className="h-[calc(100vh-57px-73px)]"
          >
            <div className="max-w-4xl mx-auto px-6 md:px-8 py-8 pb-24">
              {/* Content */}
              <div className="mt-8">
                {isLoadingMarkdown && (
                  <div className="text-center text-muted-foreground py-8">
                    Loading content...
                  </div>
                )}

                {!isLoadingMarkdown && markdownContent && (
                  <MarkdownErrorBoundary>
                    <MarkdownRenderer content={markdownContent} />
                  </MarkdownErrorBoundary>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar (30%) - Hidden on mobile */}
        <aside className="hidden lg:block w-80 xl:w-96 shrink-0 border-l bg-muted/30">
          <ScrollArea className="h-[calc(100vh-57px-73px)]">
            <div className="p-6">
              <LessonSidebar
                currentLesson={lesson as Lesson}
                lessonsCompleted={user.lessonsCompleted}
              />
            </div>
          </ScrollArea>
        </aside>
      </div>

      {/* Bottom Bar */}
      <LessonBottomBar
        type="lesson"
        onMarkComplete={handleMarkComplete}
        isCompleted={isCompleted}
        isCompleting={isCompleting}
      />

      {/* Celebration Modal */}
      <CompletionCelebration
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        lessonId={lesson.id}
        newRank={lesson.unlocksRank as Rank}
        onContinue={handleCelebrationContinue}
        hasNextLesson={false}
      />
    </div>
  );
}

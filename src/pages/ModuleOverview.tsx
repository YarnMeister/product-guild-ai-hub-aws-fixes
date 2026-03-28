import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Route,
} from "lucide-react";
import { useParams, Navigate } from "react-router-dom";
import { getLessons, getChallenges, type Lesson, type Challenge } from "@/lib/contentLoader";
import { getModule } from "@/data/modules";
import { TrackPathfinder } from "@/components/tracks/TrackPathfinder";
import { CourseBackground } from "@/components/overview/CourseBackground";

export default function ModuleOverview() {
  const { user, isAuthenticated } = useAuth();
  const { moduleId } = useParams<{ moduleId: string }>();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  const module = moduleId ? getModule(moduleId) : null;

  // Fetch lessons and challenges
  useEffect(() => {
    if (!moduleId) return;

    setLoading(true);
    Promise.all([
      getLessons(moduleId),
      getChallenges(moduleId)
    ])
      .then(([fetchedLessons, fetchedChallenges]) => {
        setLessons(fetchedLessons);
        setChallenges(fetchedChallenges);
      })
      .catch((error) => {
        console.error("Failed to load content:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [moduleId]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  if (!module || module.status !== "available") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading content...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 space-y-8 max-w-5xl">

        {/* Hero Section */}
        <section className="animate-fade-in">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-primary/80 p-8 md:p-12 text-primary-foreground">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-5 w-5 text-accent" />
                <span className="text-sm font-medium text-accent">
                  Welcome back, {user.name.split(" ")[0]}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                AI-Assisted Experimentation
              </h1>
              <p className="text-lg text-primary-foreground/80 mb-2">
                Design, build, and validate experiments independently using AI.
              </p>
              <p className="text-sm text-primary-foreground/70 max-w-2xl">
                This module equips you to run structured experiments using AI tools — from idea to validated outcome.
              </p>
            </div>
          </div>
        </section>

        {/* Course Background (accordions) */}
        <CourseBackground moduleId={moduleId} />

        {/* Available Learning Tracks */}
        <Card className="shadow-card animate-fade-in overflow-hidden rounded-xl border" style={{ animationDelay: "0.12s" }}>
          <div className="bg-muted/50 px-6 md:px-8 py-4 flex items-center gap-2">
            <Route className="h-5 w-5 text-accent" />
            <CardTitle className="text-base font-semibold text-primary">
              Available Learning Tracks
            </CardTitle>
          </div>
          <CardContent className="p-6 md:p-8">
            <TrackPathfinder />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

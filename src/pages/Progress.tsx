import { useState, useEffect } from "react";
import { useAuth, getRankInfo, RANK_INFO, Rank } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  CheckCircle2,
  Lock,
  Clock,
  BookOpen,
  ArrowRight,
  Award,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { getLessons, getChallenges, type Lesson, type Challenge } from "@/lib/contentLoader";
import { getEstimatedLearningMinutes } from "@/lib/learningTime";
import { Link, useParams, Navigate } from "react-router-dom";
import { getModule } from "@/data/modules";
import { Progress } from "@/components/ui/progress";
import { RankLadder } from "@/components/progress/RankLadder";
import { ProgressLearningList } from "@/components/progress/ProgressLearningList";

function ProgressPage() {
  const { user } = useAuth();
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

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Please sign in to view your progress.</p>
          <Link to="/">
            <Button className="mt-4">Go to Modules</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  if (!module || module.status !== "available") {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <p className="text-muted-foreground">Loading progress...</p>
        </div>
      </Layout>
    );
  }

  const rankInfo = getRankInfo(user.currentRank);
  const nextRankInfo = user.currentRank < 5 ? getRankInfo((user.currentRank + 1) as Rank) : null;
  const lessonsCompleted = user.lessonsCompleted.length;
  const totalLessons = lessons.length;
  const badgesEarned = user.badges.length;
  const totalChallenges = challenges.length;
  // Calculate hours learned
  const completedIds = [
    ...user.lessonsCompleted.map(String),
    ...user.badges.map((b) => b.id),
  ];
  const totalMinutes = getEstimatedLearningMinutes(completedIds, { lessons, challenges });
  const hoursLearned = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <Layout>
      <div className="container py-8 max-w-5xl space-y-8">


        <div className="relative overflow-hidden rounded-xl bg-primary p-8 text-primary-foreground animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="h-5 w-5 text-accent" />
                <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                  Professional Development
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">
                Capability Portfolio
              </h1>
              <p className="text-primary-foreground/70 max-w-xl text-[0.9375rem]">
                Building real, transferable capability across AI-assisted experimentation.
              </p>
            </div>

          </div>

          {/* Key Metrics */}
          <div className="relative mt-6 grid grid-cols-3 gap-4">
            <div className="bg-primary-foreground/10 rounded-lg p-4 border border-primary-foreground/5">
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-primary-foreground/60">Lessons</span>
              </div>
              <p className="text-lg font-bold">{lessonsCompleted}/{totalLessons}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4 border border-primary-foreground/5">
              <div className="flex items-center gap-2 mb-1">
                <Award className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-primary-foreground/60">Challenges</span>
              </div>
              <p className="text-lg font-bold">{badgesEarned}/{totalChallenges}</p>
            </div>
            <div className="bg-primary-foreground/10 rounded-lg p-4 border border-primary-foreground/5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs text-primary-foreground/60">Hours</span>
              </div>
              <p className="text-lg font-bold">{hoursLearned}</p>
            </div>
          </div>
        </div>

        {/* Rank Progress */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <Card className="shadow-card overflow-hidden rounded-xl border">
            <div className="bg-muted/50 px-6 py-4 flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold text-primary">
                <Target className="h-5 w-5 text-accent" />
                Rank Progress
              </CardTitle>
            </div>
            <CardContent className="p-6">
              <RankLadder />
            </CardContent>
          </Card>
        </section>

        {/* Learning Progress – flat view-only list */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <ProgressLearningList />
        </section>
      </div>
    </Layout>
  );
}

export default ProgressPage;

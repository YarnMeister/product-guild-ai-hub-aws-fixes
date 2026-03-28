import { Module } from "@/data/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FlaskConical,
  Code2,
  Megaphone,
  Lock,
  ArrowRight,
  BookOpen,
  Trophy,
  Bell,
} from "lucide-react";
import { Link } from "react-router-dom";
import { User } from "@/contexts/AuthContext";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FlaskConical,
  Code2,
  Megaphone,
};

interface ModuleCardProps {
  module: Module;
  userProgress?: User;
  isLocked?: boolean;
}

export function ModuleCard({ module, userProgress, isLocked }: ModuleCardProps) {
  const Icon = iconMap[module.icon] || FlaskConical;

  // Calculate progress for available modules
  const lessonsCompleted = userProgress?.lessonsCompleted.length || 0;
  const progressPercent = (lessonsCompleted / module.totalLessons) * 100;
  const badgesEarned = userProgress?.badges.length || 0;

  if (isLocked) {
    return (
      <Card className="shadow-card opacity-75 hover:opacity-100 transition-opacity group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted"
              style={{
                background: `linear-gradient(135deg, hsl(${module.accentColor} / 0.1), hsl(${module.accentColor} / 0.2))`,
              }}
            >
              <Icon
                className="h-6 w-6"
                style={{ color: `hsl(${module.accentColor})` }}
              />
            </div>
            <Badge variant="secondary" className="gap-1">
              <Lock className="h-3 w-3" />
              Coming Soon
            </Badge>
          </div>
          <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {module.description}
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              {module.totalLessons} Lessons
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              {module.totalChallenges} Challenges
            </span>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 group-hover:border-primary group-hover:text-primary transition-colors"
            onClick={() => {
              // TODO: Implement waitlist modal
              alert("Waitlist feature coming soon!");
            }}
          >
            <Bell className="h-4 w-4" />
            Join Waitlist
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-card hover:shadow-card-hover transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{
              background: `linear-gradient(135deg, hsl(${module.accentColor} / 0.15), hsl(${module.accentColor} / 0.3))`,
            }}
          >
            <Icon
              className="h-6 w-6"
              style={{ color: `hsl(${module.accentColor})` }}
            />
          </div>
          {lessonsCompleted > 0 && (
            <Badge variant="default" className="bg-primary/10 text-primary">
              In Progress
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg mt-3">{module.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {module.description}
        </p>

        {/* Progress Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Lessons</span>
            <span className="font-medium">
              {lessonsCompleted}/{module.totalLessons}
            </span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {module.totalLessons} Lessons
          </span>
          <span className="flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            {module.totalChallenges} Challenges
          </span>
        </div>

        <Link to={`/module/${module.id}`} className="block">
          <Button className="w-full gap-2 group-hover:gap-3 transition-all">
            {lessonsCompleted > 0 ? "Continue Learning" : "Start Module"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

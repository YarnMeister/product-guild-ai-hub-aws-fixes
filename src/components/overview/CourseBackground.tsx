import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Trophy,
  Heart,
  Lock,
  CheckCircle2,
  ArrowRight,
  FlaskConical,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { ExperimentLifecycle } from "@/components/lifecycle/ExperimentLifecycle";
import { lessonPhaseMap, type LifecyclePhaseId } from "@/data/lifecyclePhases";
import { Link } from "react-router-dom";
import { RankLadder } from "@/components/progress/RankLadder";

/* ── Placeholder team members ── */
const TEAM_SECTIONS = [
  {
    label: "Working Group Lead",
    members: [
      { name: "Ken Sandy", title: "Product Management Consultant" },
    ],
  },
  {
    label: "Core Product Guild Representative",
    members: [
      { name: "Jan Erasmus", title: "Senior Product Manager" },
      { name: "Blair Dowding", title: "Senior Product Manager" },
      { name: "Chris Stonestreet", title: "Product Manager" },
      { name: "Danni Garcia", title: "Product Manager" },
      { name: "Darren Lim", title: "Senior Product Innovation" },
      { name: "Nick Polianlis", title: "Senior Product Manager" },
    ],
  },
  {
    label: "Supporting Roles",
    members: [
      { name: "Andrea Castano", title: "Product Design Manager" },
      { name: "Brett Knowles", title: "Senior Capability Specialist" },
      { name: "Longkai Cao", title: "Staff Software Engineer" },
    ],
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function CourseBackground({ moduleId }: { moduleId?: string }) {
  const { user } = useAuth();

  // Determine lifecycle state from user progress
  const lessonsCompleted = user?.lessonsCompleted ?? [];
  const totalLessons = 4; // placeholder
  const nextLessonId = lessonsCompleted.length < totalLessons ? lessonsCompleted.length + 1 : null;
  const currentPhase: LifecyclePhaseId | undefined = nextLessonId
    ? lessonPhaseMap[nextLessonId]
    : undefined;
  const completedPhaseIds = lessonsCompleted
    .map((id) => lessonPhaseMap[id])
    .filter(Boolean) as LifecyclePhaseId[];
  const completedPhases = [...new Set(completedPhaseIds)];

  // Check if AI Workbench track is completed (placeholder logic)
  const isContributor = (user?.currentRank ?? 1) >= 2;

  return (
    <Card className="shadow-card animate-fade-in overflow-hidden rounded-xl border" style={{ animationDelay: "0.1s" }}>
      <div className="bg-muted/50 px-6 md:px-8 py-4 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-accent" />
        <h2 className="text-base font-semibold text-primary">
          Read this before you start
        </h2>
      </div>
      <CardContent className="p-4">
        <Accordion type="single" collapsible className="w-full space-y-3">

          {/* Accordion 1 — Experimentation Lifecycle */}
          <AccordionItem value="lifecycle" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <FlaskConical className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">The Experimentation Lifecycle</h4>
                      <p className="text-xs text-muted-foreground">Understand the phases of structured experimentation</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="flex justify-center">
                    <ExperimentLifecycle
                      currentPhase={currentPhase}
                      completedPhases={completedPhases}
                      size="lg"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-[0.9375rem] text-muted-foreground/90 leading-relaxed">
                      This module will enable you to be more proficient in all phases of the experimentation lifecycle. However, this course is focussed on AI maturity and enabling you to do progressively more complex tasks using AI tech. Read the next section for more on maturity.
                    </p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-primary uppercase tracking-wider">
                        The sequence is deliberate
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted-foreground">
                        <li className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-phase-experimentation mt-0.5 shrink-0" />
                          High-impact, hands-on skill development comes first
                        </li>
                        <li className="flex items-start gap-2">
                          <Target className="h-4 w-4 text-phase-research mt-0.5 shrink-0" />
                          Short, focussed challenges to unlock new abilities in all phases of the lifecycle with minimal time investment
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion 2 — Maturity Levels & Ranks */}
          <AccordionItem value="ranks" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Maturity Levels &amp; Ranks</h4>
                      <p className="text-xs text-muted-foreground">Progress through 5 ranks of AI maturity</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  As you complete Lessons and Challenges, you'll level up. To get started, pick a track in the section below.
                </p>
                <RankLadder />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion 3 — Meet the Course Team */}
          <AccordionItem value="team" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Meet the Team</h4>
                      <p className="text-xs text-muted-foreground">The practitioners behind this course</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This course is designed and maintained by practitioners across REA.
                </p>
                {TEAM_SECTIONS.map((section) => (
                  <div key={section.label} className="space-y-2">
                    <p className="text-xs font-medium text-primary uppercase tracking-wider">
                      {section.label}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {section.members.map((member) => (
                        <div
                          key={member.name}
                          className="flex items-start gap-3 rounded-lg border bg-muted/30 px-3 py-3"
                        >
                          <Avatar className="h-9 w-9 shrink-0">
                            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                              {getInitials(member.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground leading-tight">{member.name}</p>
                            <p className="text-xs text-muted-foreground">{member.title}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Accordion 4 — Become a Contributor */}
          <AccordionItem value="contributor" className="group rounded-xl border border-border overflow-hidden">
            <AccordionTrigger className="hover:no-underline p-0 [&>svg]:hidden">
              <div className="flex items-center bg-muted/50 w-full">
                <div className="w-1 self-stretch shrink-0 bg-primary" />
                <div className="flex-1 px-5 py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0 bg-primary/10">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 text-left">
                      <h4 className="font-semibold text-sm text-primary">Become a Contributor</h4>
                      <p className="text-xs text-muted-foreground">Unlock access to author content for peers</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-4 pt-2 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Learners who complete the AI Workbench track unlock Contributor status, granting access to the
                  Content Studio where you can author lessons, design challenges, and shape the course for future cohorts.
                </p>

                {isContributor ? (
                  <div className="flex items-center gap-3 rounded-lg border border-phase-evaluation/30 bg-phase-evaluation/10 px-4 py-3">
                    <CheckCircle2 className="h-5 w-5 text-phase-evaluation shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        You're a Contributor — access Content Studio
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Create and edit course content for your peers.
                      </p>
                    </div>
                    <Button size="sm" className="gap-1.5 text-xs h-8 shrink-0" asChild>
                      <Link to="/content-studio">
                        Open Studio <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
                    <Lock className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Complete AI Workbench to unlock
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Finish the AI Workbench track to earn Contributor access.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

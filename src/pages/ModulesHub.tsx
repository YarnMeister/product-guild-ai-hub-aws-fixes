import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { modules, Module } from "@/data/modules";
import { ModuleCard } from "@/components/modules/ModuleCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, FlaskConical, Sparkles } from "lucide-react";

function LoginPrompt() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30">
      <div className="text-center max-w-md px-6 animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card">
            <FlaskConical className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-3">Welcome to AI Hub</h1>
        <p className="text-muted-foreground mb-8">
          Transform into an AI-assisted discovery practitioner. Learn to amplify
          your judgment with AI as your force multiplier.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link to="/login">
            Sign in to get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function ModulesHub() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPrompt />;
  }

  const availableModules = modules.filter((m) => m.status === "available");
  const comingSoonModules = modules.filter((m) => m.status === "coming_soon");

  return (
    <Layout>
      <div className="container py-8 space-y-8">
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
                AI Hub
              </h1>
              <p className="text-primary-foreground/80 max-w-xl">
                Choose a learning module to begin or continue your journey.
                Master AI skills through structured paths and hands-on practice.
              </p>
            </div>
          </div>
        </section>

        {/* Available Modules */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-lg font-semibold mb-4">Your Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableModules.map((module) => (
              <ModuleCard key={module.id} module={module} userProgress={user} />
            ))}
          </div>
        </section>

        {/* Coming Soon Modules */}
        {comingSoonModules.length > 0 && (
          <section
            className="animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-lg font-semibold mb-4">Coming Soon</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comingSoonModules.map((module) => (
                <ModuleCard key={module.id} module={module} isLocked />
              ))}
            </div>
          </section>
        )}
      </div>

    </Layout>
  );
}

import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { BookOpen } from "lucide-react";
import { FindContentPanel } from "@/components/explore/FindContentPanel";
import { LearningTracksPanel } from "@/components/progress/LearningTracksPanel";

function Explore() {
  const { user } = useAuth();
  const { moduleId } = useParams<{ moduleId: string }>();

  if (!user) {
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
      <div className="container py-8 max-w-4xl space-y-6">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-xl bg-primary p-8 text-primary-foreground animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/90" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="h-5 w-5 text-accent" />
              <span className="text-xs font-medium text-primary-foreground/70 uppercase tracking-wider">
                Explore
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">Choose your adventure</h1>
            <p className="text-primary-foreground/70 max-w-xl text-[0.9375rem]">
              Find the content you are interested in. Lots of content is available right away, but more advanced topics have prerequisites. Tracks were designed to be modular with a logical sequence.
            </p>
          </div>
        </div>

        {/* Find content by... panel */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <FindContentPanel />
        </section>

        {/* Learning Tracks panel */}
        <section className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <LearningTracksPanel />
        </section>
      </div>
    </Layout>
  );
}

export default Explore;


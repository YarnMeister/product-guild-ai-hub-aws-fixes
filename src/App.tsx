import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet, Navigate, useParams } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ModulesHub from "./pages/ModulesHub";
import ModuleOverview from "./pages/ModuleOverview";
import Explore from "./pages/Explore";
import Progress from "./pages/Progress";
import LessonPlayer from "./pages/LessonPlayer";
import ChallengePlayer from "./pages/ChallengePlayer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import { Analytics } from "@vercel/analytics/react";
import { lazy, Suspense } from "react";

const ContentStudio = lazy(() => import("./pages/ContentStudio"));

const queryClient = new QueryClient();

const LearnRedirect = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  return <Navigate to={`/module/${moduleId}/explore`} replace />;
};

const LearnLessonRedirect = () => {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  return <Navigate to={`/module/${moduleId}/explore/lesson/${lessonId}`} replace />;
};

const LearnChallengeRedirect = () => {
  const { moduleId, challengeId } = useParams<{ moduleId: string; challengeId: string }>();
  return <Navigate to={`/module/${moduleId}/explore/challenge/${challengeId}`} replace />;
};

const ProtectedLayout = () => {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<ProtectedLayout />}>
                <Route path="/" element={<Navigate to="/module/ai-driven-experimentation" replace />} />
                <Route path="/modules" element={<ModulesHub />} />
                <Route path="/module/:moduleId" element={<ModuleOverview />} />
                <Route path="/module/:moduleId/explore" element={<Explore />} />
                <Route path="/module/:moduleId/explore/lesson/:lessonId" element={<LessonPlayer />} />
                <Route path="/module/:moduleId/explore/challenge/:challengeId" element={<ChallengePlayer />} />
                {/* Legacy redirects: /learn → /explore */}
                <Route path="/module/:moduleId/learn" element={<LearnRedirect />} />
                <Route path="/module/:moduleId/learn/lesson/:lessonId" element={<LearnLessonRedirect />} />
                <Route path="/module/:moduleId/learn/challenge/:challengeId" element={<LearnChallengeRedirect />} />
                <Route path="/module/:moduleId/progress" element={<Progress />} />
                <Route
                  path="/content-studio"
                  element={
                    <Suspense fallback={<div>Loading...</div>}>
                      <ContentStudio />
                    </Suspense>
                  }
                />
              </Route>
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Analytics />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

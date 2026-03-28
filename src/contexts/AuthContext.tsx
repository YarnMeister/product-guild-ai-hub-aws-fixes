import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getAuthToken, setAuthToken, clearAuthToken } from "@/lib/apiClient";

export type Rank = 1 | 2 | 3 | 4 | 5;

export interface Badge {
  id: string;
  name: string;
  description: string;
  difficulty: 1 | 2 | 3;
  rankEarned: Rank;
  earnedAt: Date;
}

export interface LessonCompletion {
  lessonId: number;
  completedAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currentRank: Rank;
  lessonsCompleted: number[];
  lessonCompletions: LessonCompletion[];
  badges: Badge[];
  joinedAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  completeLesson: (lessonId: number) => Promise<boolean>;
  completeChallenge: (challengeId: string, challengeData: { name: string; description: string; difficulty: 1 | 2 | 3; requiredRank: Rank }) => Promise<boolean>;
  isChallengeCompleted: (challengeId: string) => boolean;
  getLessonCompletionDate: (lessonId: number) => Date | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "/api/auth";
const PROGRESS_API_BASE = "/api/progress";

async function loadUserProgress(token: string) {
  try {
    const response = await fetch(PROGRESS_API_BASE, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error("[AuthContext] Failed to load user progress:", await response.text());
      return { lessonsCompleted: [], lessonCompletions: [], badges: [] };
    }

    const data = await response.json();

    const progress = {
      lessonsCompleted: data.completedLessons.map((l: { lessonId: number }) => l.lessonId),
      lessonCompletions: data.completedLessons.map((l: { lessonId: number; completedAt: string }) => ({
        lessonId: l.lessonId,
        completedAt: new Date(l.completedAt),
      })),
      badges: (data.badges || []).map((b: any) => ({
        id: b.id,
        name: b.name,
        description: b.description,
        difficulty: b.difficulty,
        rankEarned: b.rankEarned,
        earnedAt: new Date(b.earnedAt),
      })),
    };

    return progress;
  } catch (error) {
    console.error("[AuthContext] Error loading user progress:", error);
    return { lessonsCompleted: [], lessonCompletions: [], badges: [] };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getAuthToken();
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/me`, { headers });
        if (!res.ok) {
          setIsLoading(false);
          return;
        }
        const data = await res.json();

        if (data.user && token) {
          const progress = await loadUserProgress(token);
          setUser({
            ...data.user,
            currentRank: data.user.currentRank || 1,
            joinedAt: new Date(data.user.joinedAt),
            ...progress,
          });
        }
      } catch {
        // ignore — user stays null (unauthenticated)
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    setAuthToken(data.token);
    const progress = await loadUserProgress(data.token);
    setUser({
      ...data.user,
      currentRank: data.user.currentRank || 1,
      lessonsCompleted: progress.lessonsCompleted,
      lessonCompletions: progress.lessonCompletions,
      badges: progress.badges || [],
      joinedAt: new Date(),
    });
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }

    setAuthToken(data.token);
    setUser({
      ...data.user,
      currentRank: 1,
      lessonsCompleted: [],
      lessonCompletions: [],
      badges: [],
      joinedAt: new Date(),
    });
  };

  const logout = () => {
    clearAuthToken();
    setUser(null);
    navigate("/login");
  };

  const completeLesson = async (lessonId: number): Promise<boolean> => {
    if (!user) {
      console.warn("[AuthContext] completeLesson called but no user");
      return false;
    }

    if (user.lessonsCompleted.includes(lessonId)) {
      return false;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.error("[AuthContext] No auth token found");
        return false;
      }

      const response = await fetch(`${PROGRESS_API_BASE}/lesson`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId }),
      });

      if (response.ok) {
        const data = await response.json();

        setUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            lessonsCompleted: [...prev.lessonsCompleted, lessonId],
            lessonCompletions: [
              ...prev.lessonCompletions,
              { lessonId, completedAt: new Date(data.completedAt) },
            ],
            currentRank: (data.newRank !== undefined ? data.newRank : prev.currentRank) as Rank,
          };
          return updated;
        });
        return true;
      } else {
        const errorText = await response.text();
        console.error("[AuthContext] Failed to complete lesson:", errorText);
        return false;
      }
    } catch (error) {
      console.error("[AuthContext] Error completing lesson:", error);
      return false;
    }
  };

  const completeChallenge = async (
    challengeId: string,
    challengeData: { name: string; description: string; difficulty: 1 | 2 | 3; requiredRank: Rank }
  ): Promise<boolean> => {
    if (!user) {
      console.warn("[AuthContext] completeChallenge called but no user");
      return false;
    }

    if (user.badges.some((b) => b.id === challengeId)) {
      return false;
    }

    try {
      const token = getAuthToken();
      if (!token) {
        console.error("[AuthContext] No auth token found");
        return false;
      }

      const response = await fetch(`${PROGRESS_API_BASE}/challenge`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId }),
      });

      if (response.ok) {
        const data = await response.json();

        const newBadge: Badge = {
          id: data.badge.id,
          name: data.badge.name,
          description: data.badge.description,
          difficulty: data.badge.difficulty as 1 | 2 | 3,
          rankEarned: user.currentRank,
          earnedAt: new Date(data.badge.earnedAt),
        };

        setUser((prev) => {
          if (!prev) return prev;
          const updated = {
            ...prev,
            badges: [...prev.badges, newBadge],
            currentRank: (data.newRank !== undefined ? data.newRank : prev.currentRank) as Rank,
          };
          return updated;
        });

        return true;
      } else {
        const errorText = await response.text();
        console.error("[AuthContext] Failed to complete challenge:", errorText);
        return false;
      }
    } catch (error) {
      console.error("[AuthContext] Error completing challenge:", error);
      return false;
    }
  };

  const isChallengeCompleted = (challengeId: string): boolean => {
    if (!user) return false;
    return user.badges.some((b) => b.id === challengeId);
  };

  const getLessonCompletionDate = (lessonId: number): Date | undefined => {
    if (!user) return undefined;
    const completion = user.lessonCompletions.find(
      (c) => c.lessonId === lessonId
    );
    return completion?.completedAt;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        completeLesson,
        completeChallenge,
        isChallengeCompleted,
        getLessonCompletionDate,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const RANK_INFO = {
  1: { name: "AI User", color: "rank-user" },
  2: { name: "AI Collaborator", color: "rank-collaborator" },
  3: { name: "AI Integrator", color: "rank-integrator" },
  4: { name: "AI Builder", color: "rank-builder" },
  5: { name: "AI Architect", color: "rank-architect" },
} as const;

export function getRankInfo(rank: Rank) {
  return RANK_INFO[rank];
}

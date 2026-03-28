import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthToken } from "@/lib/apiClient";

export interface TrackState {
  trackId: string;
  isUnlocked: boolean;
  isCompleted: boolean;
  completionPercent: number;
  maturityLevel: number;
  rankLabel: string;
}

export function useTrackStates() {
  const { user } = useAuth();

  const { data: trackStates = [], isLoading: loading } = useQuery({
    queryKey: ['trackStates', user?.id],
    queryFn: async () => {
      const token = getAuthToken();
      if (!token) return [];

      const response = await fetch('/api/tracks/state', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes (v5 renamed cacheTime → gcTime)
  });

  return { trackStates, loading };
}


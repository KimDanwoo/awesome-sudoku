"use client";

import { GameResult } from "@entities/leaderboard/model/types";
import { fetchLeaderboard } from "@features/leaderboard/model/services/leaderboardService";
import { Difficulty, GameMode } from "@entities/game/model/types";
import { useCallback, useEffect, useState } from "react";

interface UseLeaderboardOptions {
  difficulty: Difficulty;
  gameMode: GameMode;
  take?: number;
}

interface UseLeaderboardResult {
  entries: GameResult[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useLeaderboard({
  difficulty,
  gameMode,
  take = 20,
}: UseLeaderboardOptions): UseLeaderboardResult {
  const [entries, setEntries] = useState<GameResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    () => fetchLeaderboard({ difficulty, gameMode, take }),
    [difficulty, gameMode, take],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await load();
      setEntries(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "랭킹을 불러오지 못했습니다.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  useEffect(() => {
    let isActive = true;

    setIsLoading(true);
    setError(null);

    load()
      .then((data) => {
        if (!isActive) return;
        setEntries(data);
      })
      .catch((err) => {
        if (!isActive) return;
        const message = err instanceof Error ? err.message : "랭킹을 불러오지 못했습니다.";
        setError(message);
      })
      .finally(() => {
        if (!isActive) return;
        setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, [load]);

  return {
    entries,
    isLoading,
    error,
    refresh,
  };
}

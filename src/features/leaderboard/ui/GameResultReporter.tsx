"use client";

import { useAuthStore } from "@features/auth/model/stores/authStore";
import { useSudokuStore } from "@features/game-controls/model/stores";
import { submitGameResult } from "@features/leaderboard/model/services/leaderboardService";
import { useEffect, useRef } from "react";

export const GameResultReporter = () => {
  const user = useAuthStore((state) => state.user);
  const isCompleted = useSudokuStore((state) => state.isCompleted);
  const isSuccess = useSudokuStore((state) => state.isSuccess);
  const difficulty = useSudokuStore((state) => state.difficulty);
  const gameMode = useSudokuStore((state) => state.gameMode);
  const currentTime = useSudokuStore((state) => state.currentTime);

  const lastSubmittedSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isCompleted || !isSuccess) {
      lastSubmittedSignatureRef.current = null;
      return;
    }

    if (!user || currentTime <= 0) {
      return;
    }

    const signature = `${user.uid}-${gameMode}-${difficulty}-${currentTime}`;
    if (lastSubmittedSignatureRef.current === signature) {
      return;
    }

    lastSubmittedSignatureRef.current = signature;

    const userName = user.displayName || user.email || "익명 유저";

    submitGameResult({
      userId: user.uid,
      userName,
      difficulty,
      gameMode,
      timeInSeconds: currentTime,
    }).catch(() => {
      lastSubmittedSignatureRef.current = null;
    });
  }, [isCompleted, isSuccess, user, difficulty, gameMode, currentTime]);

  return null;
};

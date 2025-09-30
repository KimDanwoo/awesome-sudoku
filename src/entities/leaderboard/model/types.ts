import { Difficulty, GameMode } from "@entities/game/model/types";

export interface GameResult {
  id: string;
  userId: string | null;
  userName: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  timeInSeconds: number;
  completedAt: string;
}

export interface SubmitGameResultPayload {
  userId: string | null;
  userName: string;
  difficulty: Difficulty;
  gameMode: GameMode;
  timeInSeconds: number;
}

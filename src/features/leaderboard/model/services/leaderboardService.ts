import { GameResult, SubmitGameResultPayload } from "@entities/leaderboard/model/types";
import { db } from "@shared/lib/firebase/config";
import {
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  type QueryConstraint,
} from "firebase/firestore";

interface FetchLeaderboardParams {
  difficulty: SubmitGameResultPayload["difficulty"];
  gameMode?: SubmitGameResultPayload["gameMode"];
  take?: number;
}

const LEADERBOARD_COLLECTION = "leaderboard";

export async function submitGameResult(payload: SubmitGameResultPayload): Promise<void> {
  const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);

  const normalizedPayload = {
    ...payload,
    userId: payload.userId ?? null,
    userName: payload.userName.trim() || "익명 유저",
    completedAt: serverTimestamp(),
  };

  await addDoc(leaderboardRef, normalizedPayload);
}

export async function fetchLeaderboard({
  difficulty,
  gameMode,
  take = 20,
}: FetchLeaderboardParams): Promise<GameResult[]> {
  const leaderboardRef = collection(db, LEADERBOARD_COLLECTION);

  const constraints: QueryConstraint[] = [where("difficulty", "==", difficulty)];

  if (gameMode) {
    constraints.push(where("gameMode", "==", gameMode));
  }

  constraints.push(orderBy("timeInSeconds", "asc"));
  constraints.push(limit(take));

  const leaderboardQuery = query(leaderboardRef, ...constraints);
  const snapshot = await getDocs(leaderboardQuery);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as SubmitGameResultPayload & {
      completedAt?: Timestamp | Date | null;
    };

    let completedAtDate: Date;

    if (!data.completedAt) {
      completedAtDate = new Date();
    } else if (data.completedAt instanceof Timestamp) {
      completedAtDate = data.completedAt.toDate();
    } else {
      completedAtDate = new Date(data.completedAt);
    }

    return {
      id: doc.id,
      userId: data.userId ?? null,
      userName: data.userName,
      difficulty: data.difficulty,
      gameMode: data.gameMode,
      timeInSeconds: data.timeInSeconds,
      completedAt: completedAtDate.toISOString(),
    } satisfies GameResult;
  });
}

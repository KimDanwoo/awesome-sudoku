"use client";

import { formatTime } from "@features/game-board/model/utils";
import { useLeaderboard } from "@features/leaderboard/model";
import { GAME_LEVEL, GAME_LEVEL_LABELS, GAME_MODE } from "@entities/game/model/constants";
import { Difficulty, GameMode } from "@entities/game/model/types";
import { cn } from "@shared/model/utils";
import { useMemo, useState } from "react";

const difficultyOptions = Object.values(GAME_LEVEL);
const gameModeOptions = Object.values(GAME_MODE);

export const Leaderboard = () => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(GAME_LEVEL.MEDIUM);
  const [selectedGameMode, setSelectedGameMode] = useState<GameMode>(GAME_MODE.CLASSIC);

  const { entries, isLoading, error, refresh } = useLeaderboard({
    difficulty: selectedDifficulty,
    gameMode: selectedGameMode,
  });

  const headerDescription = useMemo(() => {
    const difficultyLabel = GAME_LEVEL_LABELS[selectedDifficulty];
    const gameModeLabel = selectedGameMode === GAME_MODE.CLASSIC ? "클래식" : "킬러";

    return `${gameModeLabel} · ${difficultyLabel}`;
  }, [selectedDifficulty, selectedGameMode]);

  const headerCellClass =
    "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider";
  const tableWrapperClass = "bg-white rounded-lg shadow-sm border border-gray-200";
  const baseCellClass = "px-4 py-3 whitespace-nowrap text-sm";

  return (
    <div className="w-full flex flex-col gap-6 px-6 py-8 mx-auto max-w-4xl">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">랭킹</h1>
          <p className="text-sm text-gray-500">{headerDescription}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            value={selectedGameMode}
            onChange={(event) => setSelectedGameMode(event.target.value as GameMode)}
          >
            {gameModeOptions.map((mode) => (
              <option key={mode} value={mode}>
                {mode === GAME_MODE.CLASSIC ? "클래식" : "킬러"}
              </option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            value={selectedDifficulty}
            onChange={(event) => setSelectedDifficulty(event.target.value as Difficulty)}
          >
            {difficultyOptions.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {GAME_LEVEL_LABELS[difficulty]}
              </option>
            ))}
          </select>

          <button
            type="button"
            className={cn(
              "px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md",
              "hover:bg-blue-700 transition-colors",
            )}
            onClick={refresh}
            disabled={isLoading}
          >
            새로고침
          </button>
        </div>
      </div>

      <div className={tableWrapperClass}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className={headerCellClass}>
                  순위
                </th>
                <th scope="col" className={headerCellClass}>
                  플레이어
                </th>
                <th scope="col" className={headerCellClass}>
                  클리어 시간
                </th>
                <th scope="col" className={headerCellClass}>
                  완료일시
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    랭킹을 불러오는 중입니다...
                  </td>
                </tr>
              )}

              {!isLoading && error && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              )}

              {!isLoading && !error && entries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                    아직 등록된 기록이 없습니다. 첫 번째 기록의 주인공이 되어보세요!
                  </td>
                </tr>
              )}

              {!isLoading && !error && entries.length > 0 &&
                entries.map((entry, index) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className={cn(baseCellClass, "text-gray-700 font-semibold")}>
                      {index + 1}
                    </td>
                    <td className={cn(baseCellClass, "text-gray-700")}>
                      {entry.userName}
                    </td>
                    <td className={cn(baseCellClass, "font-mono text-gray-900")}>
                      {formatTime(entry.timeInSeconds)}
                    </td>
                    <td className={cn(baseCellClass, "text-gray-500")}>
                      {new Date(entry.completedAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;

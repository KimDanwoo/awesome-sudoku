"use client";

import { Difficulty, EASY, EXPERT, HARD, MEDIUM, useSudokuStore } from "@entities/sudoku/model";
import { TimerControl } from "@features/timer-control/ui/TimerControl";
import React from "react";

export const GameStatus: React.FC = () => {
  const difficulty = useSudokuStore((state) => state.difficulty);
  const isCompleted = useSudokuStore((state) => state.isCompleted);
  const isSuccess = useSudokuStore((state) => state.isSuccess);
  const initializeGame = useSudokuStore((state) => state.initializeGame);

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex justify-between w-full max-w-md px-4">
        <select
          name="difficulty"
          id="difficulty"
          value={difficulty}
          onChange={(e) => initializeGame(e.target.value as Difficulty)}
        >
          <option value={EASY}>쉬움</option>
          <option value={MEDIUM}>중간</option>
          <option value={HARD}>어려움</option>
          <option value={EXPERT}>전문가</option>
        </select>

        <TimerControl />
      </div>

      {isCompleted && (
        <div
          className={`mt-4 p-4 rounded-md ${
            isSuccess ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          } text-center w-full max-w-md`}
        >
          {isSuccess
            ? "축하합니다! 스도쿠를 성공적으로 완료했습니다! 🎉"
            : "스도쿠가 정확하지 않습니다. 다시 확인해보세요. ⚠️"}
        </div>
      )}
    </div>
  );
};

export default GameStatus;

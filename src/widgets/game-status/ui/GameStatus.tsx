"use client";

import { useSudokuStore } from "@entities/sudoku/model/store";
import { Difficulty } from "@entities/sudoku/model/types";
import { formatTime } from "@entities/sudoku/model/utils";
import React, { useEffect } from "react";
import { AiOutlinePause } from "react-icons/ai";
import { VscPlay } from "react-icons/vsc";

export const GameStatus: React.FC = () => {
  const { isCompleted, isSuccess, currentTime, timerActive, incrementTimer, initializeGame, toggleTimer } =
    useSudokuStore();

  // 타이머 로직
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (timerActive) {
      timer = setInterval(() => {
        incrementTimer();
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, incrementTimer]);

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex justify-between w-full max-w-md px-4">
        <select name="difficulty" id="difficulty" onChange={(e) => initializeGame(e.target.value as Difficulty)}>
          <option value="easy">쉬움</option>
          <option value="medium">중간</option>
          <option value="hard">어려움</option>
        </select>

        <div className="flex items-center gap-2">
          <div className="text-xl font-mono">{formatTime(currentTime)}</div>
          <button className={`p-2 rounded-full transition-colors bg-gray-300`} onClick={() => toggleTimer()}>
            {timerActive ? <AiOutlinePause className="text-gray-500" /> : <VscPlay className="text-gray-500" />}
          </button>
        </div>
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

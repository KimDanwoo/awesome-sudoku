import { GAME_LEVEL } from "@entities/game/model/constants";
import { useSudokuStore } from "@features/game-controls/model/stores/sudokuStore";
import { useEffect } from "react";

export const useInitializeGame = () => {
  const initializeGame = useSudokuStore((state) => state.initializeGame);
  const board = useSudokuStore((state) => state.board);

  useEffect(() => {
    const isEmpty = board.every((row) => row.every((cell) => cell.value === null && !cell.isInitial));

    if (isEmpty) {
      initializeGame(GAME_LEVEL.MEDIUM);
    }
  }, [board, initializeGame]);
};

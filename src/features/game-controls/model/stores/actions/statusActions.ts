import { NUMBER_COUNTS } from "@entities/board/model/constants";
import { SudokuStoreActionCreator } from "@features/game-controls/model/stores/types";
import { useTimerStore } from "@features/game-controls/model/stores/timerStore";
import { buildGameResultState, resolveBoardState } from "@features/game-controls/model/stores/helpers/gameResult";

export const createStatusActions: SudokuStoreActionCreator<
  "countBoardNumbers" | "checkSolution"
> = (set, get) => ({
  countBoardNumbers: () => {
    const { board } = get();
    const counts = structuredClone(NUMBER_COUNTS);

    board.forEach((row) => {
      row.forEach((cell) => {
        if (cell.value !== null) {
          counts[cell.value as keyof typeof counts]++;
        }
      });
    });

    set({ numberCounts: counts });
  },

  checkSolution: () => {
    const { board, solution, gameMode, cages } = get();
    const { result } = resolveBoardState(board, solution, gameMode, cages);

    set(buildGameResultState(result));

    if (result.completed) {
      useTimerStore.getState().stopTimer();
    }
  },
});

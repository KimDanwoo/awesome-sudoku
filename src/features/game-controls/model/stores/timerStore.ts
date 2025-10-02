import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  initialTimerState,
  SUDOKU_TIMER_STORAGE_KEYS,
} from "@features/game-controls/model/stores/initialState";
import { SudokuTimerStore } from "@features/game-controls/model/stores/types";

export const useTimerStore = create<SudokuTimerStore>()(
  persist(
    (set, get) => ({
      ...initialTimerState,
      incrementTimer: () => {
        const { currentTime, timerActive } = get();
        if (timerActive) {
          set({ currentTime: currentTime + 1 });
        }
      },
      toggleTimer: (isActive) => {
        if (typeof isActive === "boolean") {
          set({ timerActive: isActive });
          return;
        }

        set((state) => ({ timerActive: !state.timerActive }));
      },
      resetTimer: (shouldActivate = false) => {
        set({ currentTime: 0, timerActive: shouldActivate });
      },
      stopTimer: () => {
        set({ timerActive: false });
      },
    }),
    {
      name: "awesome-sudoku-timer-storage",
      partialize: (state) =>
        Object.fromEntries(
          SUDOKU_TIMER_STORAGE_KEYS.map((key) => [key, state[key]]),
        ) as Partial<SudokuTimerStore>,
    },
  ),
);

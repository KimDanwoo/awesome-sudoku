import { NUMBER_COUNTS } from "@entities/board/model/constants";
import { Position, SudokuBoard } from "@entities/board/model/types";
import { GAME_LEVEL, GAME_MODE, HINTS_REMAINING } from "@entities/game/model/constants";
import { Difficulty, GameMode, KillerCage } from "@entities/game/model/types";
import { CellHighlight } from "@entities/cell/model/types";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

import { createEmptyBoard, createEmptyGrid, createEmptyHighlights } from "@features/game-board/model/utils";

const storage = typeof window === "undefined" ? undefined : createJSONStorage(() => window.localStorage);

const createInitialNumberCounts = () => ({ ...NUMBER_COUNTS });

export const boardAtom = atomWithStorage<SudokuBoard>(
  "sudoku:board",
  createEmptyBoard(),
  storage,
);

export const solutionAtom = atomWithStorage<number[][]>("sudoku:solution", createEmptyGrid(), storage);
export const selectedCellAtom = atomWithStorage<Position | null>("sudoku:selected-cell", null, storage);
export const isCompletedAtom = atomWithStorage<boolean>("sudoku:is-completed", false, storage);
export const isSuccessAtom = atomWithStorage<boolean>("sudoku:is-success", false, storage);
export const currentTimeAtom = atomWithStorage<number>("sudoku:current-time", 0, storage);
export const timerActiveAtom = atomWithStorage<boolean>("sudoku:timer-active", false, storage);
export const difficultyAtom = atomWithStorage<Difficulty>("sudoku:difficulty", GAME_LEVEL.MEDIUM, storage);
export const numberCountsAtom = atomWithStorage<Record<number, number>>(
  "sudoku:number-counts",
  createInitialNumberCounts(),
  storage,
);
export const hintsRemainingAtom = atomWithStorage<number>("sudoku:hints-remaining", HINTS_REMAINING, storage);
export const gameModeAtom = atomWithStorage<GameMode>("sudoku:game-mode", GAME_MODE.CLASSIC, storage);
export const cagesAtom = atomWithStorage<KillerCage[]>("sudoku:cages", [], storage);

export const isNoteModeAtom = atom(false);
export const highlightedCellsAtom = atom<Record<string, CellHighlight>>(createEmptyHighlights());

export const resetHighlightedCellsAtom = atom(null, (_get, set) => {
  set(highlightedCellsAtom, createEmptyHighlights());
});

export const toggleNoteModeAtom = atom(null, (get, set) => {
  set(isNoteModeAtom, !get(isNoteModeAtom));
});

export const incrementCurrentTimeAtom = atom(null, (get, set) => {
  if (get(timerActiveAtom)) {
    set(currentTimeAtom, get(currentTimeAtom) + 1);
  }
});

export const decrementHintsRemainingAtom = atom(null, (get, set) => {
  set(hintsRemainingAtom, Math.max(0, get(hintsRemainingAtom) - 1));
});

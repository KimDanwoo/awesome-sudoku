import { NUMBER_COUNTS } from "@entities/board/model/constants";
import { GAME_LEVEL, GAME_MODE, HINTS_REMAINING } from "@entities/game/model/constants";
import { SudokuState, SudokuTimerState } from "@entities/game/model/types";
import {
  createEmptyBoard,
  createEmptyGrid,
  createEmptyHighlights,
} from "@features/game-board/model/utils";

export const initialSudokuState: SudokuState = {
  board: createEmptyBoard(),
  isNoteMode: false,
  solution: createEmptyGrid(),
  selectedCell: null,
  isCompleted: false,
  isSuccess: false,
  difficulty: GAME_LEVEL.MEDIUM,
  highlightedCells: createEmptyHighlights(),
  numberCounts: NUMBER_COUNTS,
  hintsRemaining: HINTS_REMAINING,
  gameMode: GAME_MODE.CLASSIC,
  cages: [],
};

export const SUDOKU_STORAGE_KEYS: (keyof SudokuState)[] = [
  "board",
  "solution",
  "selectedCell",
  "isCompleted",
  "isSuccess",
  "difficulty",
  "numberCounts",
  "hintsRemaining",
  "gameMode",
  "cages",
];

export const initialTimerState: SudokuTimerState = {
  currentTime: 0,
  timerActive: false,
};

export const SUDOKU_TIMER_STORAGE_KEYS: (keyof SudokuTimerState)[] = [
  "currentTime",
  "timerActive",
];

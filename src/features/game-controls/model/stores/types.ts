import { SudokuState, Difficulty, GameMode, SudokuTimerState } from "@entities/game/model/types";
import { StoreApi } from "zustand";

export interface SudokuActions {
  initializeGame: (difficulty?: Difficulty) => void;
  resetUserInputs: () => void;
  selectCell: (row: number, col: number) => void;
  deselectCell: () => void;
  fillCell: (value: number | null) => void;
  toggleNote: (value: number) => void;
  getHint: () => void;
  checkSolution: () => void;
  restartGame: () => void;
  updateHighlights: (row: number, col: number) => void;
  toggleNoteMode: () => void;
  countBoardNumbers: () => void;
  switchGameMode: (mode: GameMode, difficulty?: Difficulty) => void;
  handleKeyInput: (key: string) => void;
}

export type SudokuStore = SudokuState & SudokuActions;
export type SudokuStoreApi = StoreApi<SudokuStore>;
export type SudokuStoreSet = SudokuStoreApi["setState"];
export type SudokuStoreGet = SudokuStoreApi["getState"];

export type SudokuStoreActionCreator<Keys extends keyof SudokuActions> = (
  set: SudokuStoreSet,
  get: SudokuStoreGet,
) => Pick<SudokuActions, Keys>;

export interface SudokuTimerActions {
  incrementTimer: () => void;
  toggleTimer: (isActive?: boolean) => void;
  resetTimer: (isActive?: boolean) => void;
  stopTimer: () => void;
}

export type SudokuTimerStore = SudokuTimerState & SudokuTimerActions;

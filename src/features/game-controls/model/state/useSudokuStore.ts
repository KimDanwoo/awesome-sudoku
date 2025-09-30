"use client";

import { Difficulty, GameMode, SudokuState } from "@entities/game/model/types";
import { useAtomValue, useSetAtom } from "jotai";
import { useMemo } from "react";

import {
  checkSolutionAtom,
  countBoardNumbersAtom,
  deselectCellAtom,
  fillCellAtom,
  getHintAtom,
  handleKeyInputAtom,
  initializeGameAtom,
  resetUserInputsAtom,
  restartGameAtom,
  selectCellAtom,
  sudokuStateAtom,
  switchGameModeAtom,
  toggleNoteAtom,
  toggleTimerAtom,
  updateHighlightsAtom,
} from "./sudokuActions";
import { incrementCurrentTimeAtom, toggleNoteModeAtom } from "./sudokuAtoms";

interface SudokuActions {
  initializeGame: (difficulty?: Difficulty) => void;
  resetUserInputs: () => void;
  selectCell: (row: number, col: number) => void;
  deselectCell: () => void;
  fillCell: (value: number | null) => void;
  toggleNote: (value: number) => void;
  getHint: () => void;
  checkSolution: () => void;
  restartGame: () => void;
  incrementTimer: () => void;
  toggleTimer: (isActive?: boolean) => void;
  updateHighlights: (row: number, col: number) => void;
  toggleNoteMode: () => void;
  countBoardNumbers: () => void;
  switchGameMode: (mode: GameMode, difficulty?: Difficulty) => void;
  handleKeyInput: (key: string) => void;
}

type SudokuStore = SudokuState & SudokuActions;

function useSudokuState(): SudokuState {
  const state = useAtomValue(sudokuStateAtom);
  return useMemo(() => ({ ...state }), [state]);
}

function useSudokuActions(): SudokuActions {
  const initializeGame = useSetAtom(initializeGameAtom);
  const switchGameMode = useSetAtom(switchGameModeAtom);
  const resetUserInputs = useSetAtom(resetUserInputsAtom);
  const selectCell = useSetAtom(selectCellAtom);
  const deselectCell = useSetAtom(deselectCellAtom);
  const fillCell = useSetAtom(fillCellAtom);
  const toggleNote = useSetAtom(toggleNoteAtom);
  const getHint = useSetAtom(getHintAtom);
  const checkSolution = useSetAtom(checkSolutionAtom);
  const restartGame = useSetAtom(restartGameAtom);
  const incrementTimer = useSetAtom(incrementCurrentTimeAtom);
  const toggleTimer = useSetAtom(toggleTimerAtom);
  const updateHighlights = useSetAtom(updateHighlightsAtom);
  const toggleNoteModeInternal = useSetAtom(toggleNoteModeAtom);
  const countBoardNumbers = useSetAtom(countBoardNumbersAtom);
  const handleKeyInput = useSetAtom(handleKeyInputAtom);

  const memoizedActions = useMemo(
    () => ({
      initializeGame: (difficulty?: Difficulty) => initializeGame(difficulty),
      switchGameMode: (mode: GameMode, difficulty?: Difficulty) => switchGameMode({ mode, difficulty }),
      resetUserInputs: () => resetUserInputs(),
      selectCell: (row: number, col: number) => selectCell({ row, col }),
      deselectCell: () => deselectCell(),
      fillCell: (value: number | null) => fillCell(value),
      toggleNote: (value: number) => toggleNote(value),
      getHint: () => getHint(),
      checkSolution: () => checkSolution(),
      restartGame: () => restartGame(),
      incrementTimer: () => incrementTimer(),
      toggleTimer: (isActive?: boolean) => toggleTimer(isActive),
      updateHighlights: (row: number, col: number) => updateHighlights({ row, col }),
      toggleNoteMode: () => toggleNoteModeInternal(),
      countBoardNumbers: () => countBoardNumbers(),
      handleKeyInput: (key: string) => handleKeyInput(key),
    }),
    [
      checkSolution,
      countBoardNumbers,
      deselectCell,
      fillCell,
      getHint,
      handleKeyInput,
      incrementTimer,
      initializeGame,
      resetUserInputs,
      restartGame,
      selectCell,
      toggleNote,
      toggleNoteModeInternal,
      toggleTimer,
      updateHighlights,
      switchGameMode,
    ],
  );

  return memoizedActions;
}

export function useSudokuStore(): SudokuStore;
export function useSudokuStore<T>(selector: (store: SudokuStore) => T): T;
export function useSudokuStore<T>(selector?: (store: SudokuStore) => T) {
  const state = useSudokuState();
  const actions = useSudokuActions();

  const store = useMemo(() => ({ ...state, ...actions }), [actions, state]);

  if (selector) {
    return selector(store);
  }

  return store;
}

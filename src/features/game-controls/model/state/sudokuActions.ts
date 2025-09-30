import { SudokuBoard } from "@entities/board/model/types";
import { GAME_LEVEL, GAME_MODE, HINTS_REMAINING } from "@entities/game/model/constants";
import type { Difficulty, GameMode, KillerCage, SudokuState } from "@entities/game/model/types";
import { atom, type Atom } from "jotai";

import {
  boardAtom,
  cagesAtom,
  decrementHintsRemainingAtom,
  difficultyAtom,
  gameModeAtom,
  highlightedCellsAtom,
  hintsRemainingAtom,
  isCompletedAtom,
  isNoteModeAtom,
  isSuccessAtom,
  numberCountsAtom,
  resetHighlightedCellsAtom,
  selectedCellAtom,
  solutionAtom,
  timerActiveAtom,
} from "./sudokuAtoms";
import {
  canFillCell,
  calculateHighlights,
  checkGameCompletion,
  clearHighlights,
  findEmptyCells,
  resetUserInputs as resetUserInputsOptimized,
  updateCellNotes,
  updateCellSelection,
  updateCellValue,
  updateSingleCell,
  validateBoard,
} from "@features/game-controls/model/utils";
import {
  checkConflicts,
  generateBoard,
  generateKillerBoard,
  generateSolution,
  isBoardComplete,
  isBoardCorrect,
  isKillerBoardComplete,
  validateKillerCages,
} from "@features/game-board/model/utils";

const DEFAULT_HINTS = HINTS_REMAINING;

const cloneNumberCounts = (board: SudokuBoard) => {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

  board.forEach((row) => {
    row.forEach((cell) => {
      if (cell.value !== null) {
        counts[cell.value as keyof typeof counts]++;
      }
    });
  });

  return counts;
};

const resetGameplayState = (set: <Value>(target: Atom<Value>, value: Value) => void) => {
  set(isCompletedAtom, false);
  set(isSuccessAtom, false);
  set(selectedCellAtom, null);
  set(resetHighlightedCellsAtom, null);
  set(hintsRemainingAtom, DEFAULT_HINTS);
  set(currentTimeAtom, 0);
};

export const updateHighlightsAtom = atom(null, (get, set, payload: { row: number; col: number }) => {
  const { row, col } = payload;
  const board = get(boardAtom);
  const highlights = calculateHighlights(board, row, col, get(highlightedCellsAtom));
  set(highlightedCellsAtom, highlights);
});

export const initializeGameAtom = atom(null, (get, set, difficulty: Difficulty = GAME_LEVEL.MEDIUM) => {
  const solution = generateSolution();
  const currentMode = get(gameModeAtom);

  let board: SudokuBoard;
  let cages: KillerCage[] = [];

  if (currentMode === GAME_MODE.KILLER) {
    const killerResult = generateKillerBoard(solution, difficulty);
    board = killerResult.board;
    cages = killerResult.cages;
  } else {
    board = generateBoard(solution, difficulty);
  }

  set(boardAtom, board);
  set(solutionAtom, solution);
  set(difficultyAtom, difficulty);
  set(cagesAtom, cages);
  set(isNoteModeAtom, false);
  set(timerActiveAtom, true);
  set(numberCountsAtom, cloneNumberCounts(board));
  resetGameplayState(set);
});

export const switchGameModeAtom = atom(null, (get, set, payload: { mode: GameMode; difficulty?: Difficulty }) => {
  const { mode, difficulty } = payload;
  set(gameModeAtom, mode);
  const currentDifficulty = difficulty ?? get(difficultyAtom);
  set(initializeGameAtom, currentDifficulty);
});

export const resetUserInputsAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  const updatedBoard = resetUserInputsOptimized(board);
  const emptyHighlights = clearHighlights(get(highlightedCellsAtom));

  set(boardAtom, updatedBoard);
  set(highlightedCellsAtom, emptyHighlights);
  set(timerActiveAtom, true);
  set(numberCountsAtom, cloneNumberCounts(updatedBoard));
  resetGameplayState(set);
});

export const selectCellAtom = atom(null, (get, set, payload: { row: number; col: number }) => {
  const { row, col } = payload;
  const board = get(boardAtom);
  const newBoard = updateCellSelection(board, row, col);

  set(boardAtom, newBoard);
  set(selectedCellAtom, { row, col });
  set(updateHighlightsAtom, { row, col });
});

export const deselectCellAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  const selectedCell = get(selectedCellAtom);

  if (!selectedCell) {
    set(resetHighlightedCellsAtom, null);
    return;
  }

  const newBoard = updateSingleCell(board, selectedCell.row, selectedCell.col, { isSelected: false });
  set(boardAtom, newBoard);
  set(selectedCellAtom, null);
  set(resetHighlightedCellsAtom, null);
});

export const toggleNoteAtom = atom(null, (get, set, value: number) => {
  const board = get(boardAtom);
  const selectedCell = get(selectedCellAtom);

  if (!selectedCell) return;

  const { row, col } = selectedCell;
  const cell = board[row][col];

  if (cell.isInitial || cell.value !== null) return;

  const currentNotes = cell.notes;
  const noteIndex = currentNotes.indexOf(value);

  const newNotes =
    noteIndex === -1
      ? [...currentNotes, value].sort((a, b) => a - b)
      : currentNotes.filter((note) => note !== value);

  const newBoard = updateCellNotes(board, row, col, newNotes);
  set(boardAtom, newBoard);
});

export const countBoardNumbersAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  set(numberCountsAtom, cloneNumberCounts(board));
});

export const fillCellAtom = atom(null, (get, set, value: number | null) => {
  const board = get(boardAtom);
  const selectedCell = get(selectedCellAtom);
  const solution = get(solutionAtom);
  const gameMode = get(gameModeAtom);
  const cages = get(cagesAtom);

  if (!canFillCell(selectedCell, board)) return;

  const { row, col } = selectedCell!;
  const updatedBoard = updateCellValue(board, row, col, value);
  const boardWithConflicts = validateBoard(updatedBoard, gameMode, cages);
  const gameResult = checkGameCompletion(boardWithConflicts, solution, gameMode, cages);

  set(boardAtom, boardWithConflicts);
  set(isCompletedAtom, gameResult.completed);
  set(isSuccessAtom, gameResult.success);
  set(timerActiveAtom, !gameResult.completed);
  set(numberCountsAtom, cloneNumberCounts(boardWithConflicts));
  set(updateHighlightsAtom, { row, col });

  if (gameResult.success) {
    const newBoard = updateSingleCell(boardWithConflicts, row, col, { isSelected: false });
    set(boardAtom, newBoard);
    set(selectedCellAtom, null);
    set(resetHighlightedCellsAtom, null);
    set(timerActiveAtom, false);
  }
});

export const getHintAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  const solution = get(solutionAtom);
  const hintsRemaining = get(hintsRemainingAtom);
  const gameMode = get(gameModeAtom);
  const cages = get(cagesAtom);

  if (hintsRemaining <= 0) {
    alert("더 이상 힌트를 사용할 수 없습니다!");
    return;
  }

  const emptyCells = findEmptyCells(board);

  if (emptyCells.length === 0) {
    alert("모든 칸이 이미 채워져 있습니다!");
    return;
  }

  const randomIndex = Math.floor(Math.random() * emptyCells.length);
  const { row, col } = emptyCells[randomIndex];
  const value = solution[row][col];

  const newBoard = updateCellValue(board, row, col, value);
  const boardWithConflicts =
    gameMode === GAME_MODE.KILLER ? validateKillerCages(newBoard, cages) : checkConflicts(newBoard);

  const completed =
    gameMode === GAME_MODE.KILLER
      ? isKillerBoardComplete(boardWithConflicts, cages)
      : isBoardComplete(boardWithConflicts);
  const success = completed && isBoardCorrect(boardWithConflicts, solution);

  set(boardAtom, boardWithConflicts);
  set(isCompletedAtom, completed);
  set(isSuccessAtom, success);
  set(timerActiveAtom, !completed);
  set(selectedCellAtom, { row, col });
  set(updateHighlightsAtom, { row, col });
  set(decrementHintsRemainingAtom, null);
  set(numberCountsAtom, cloneNumberCounts(boardWithConflicts));
});

export const restartGameAtom = atom(null, (get, set) => {
  const difficulty = get(difficultyAtom);
  set(initializeGameAtom, difficulty);
});

export const checkSolutionAtom = atom(null, (get, set) => {
  const board = get(boardAtom);
  const solution = get(solutionAtom);
  const gameMode = get(gameModeAtom);
  const cages = get(cagesAtom);

  const isCorrect = isBoardCorrect(board, solution);
  const boardWithConflicts =
    gameMode === GAME_MODE.KILLER ? validateKillerCages(board, cages) : checkConflicts(board);
  const completed =
    gameMode === GAME_MODE.KILLER
      ? isKillerBoardComplete(boardWithConflicts, cages)
      : isBoardComplete(boardWithConflicts);
  const success = isCorrect && completed;

  set(boardAtom, boardWithConflicts);
  set(isCompletedAtom, completed);
  set(isSuccessAtom, success);
  set(timerActiveAtom, !completed);
});

export const toggleTimerAtom = atom(null, (get, set, isActive?: boolean) => {
  if (typeof isActive === "boolean") {
    set(timerActiveAtom, isActive);
    return;
  }

  set(timerActiveAtom, !get(timerActiveAtom));
});

export const handleKeyInputAtom = atom(null, (get, set, key: string) => {
  const isNoteMode = get(isNoteModeAtom);

  if (key === "Backspace" || key === "Delete") {
    set(fillCellAtom, null);
    return;
  }

  if (/^[1-9]$/.test(key)) {
    const value = Number(key);
    if (isNoteMode) {
      set(toggleNoteAtom, value);
    } else {
      set(fillCellAtom, value);
    }
    return;
  }

  if (!key.startsWith("Arrow")) return;

  const selectedCell = get(selectedCellAtom);
  if (!selectedCell) return;

  let { row, col } = selectedCell;

  if (key === "ArrowUp") {
    row = Math.max(0, row - 1);
  } else if (key === "ArrowDown") {
    row = Math.min(8, row + 1);
  } else if (key === "ArrowLeft") {
    col = Math.max(0, col - 1);
  } else if (key === "ArrowRight") {
    col = Math.min(8, col + 1);
  }

  set(selectCellAtom, { row, col });
});

export const sudokuStateAtom = atom((get) => ({
  board: get(boardAtom),
  isNoteMode: get(isNoteModeAtom),
  solution: get(solutionAtom),
  selectedCell: get(selectedCellAtom),
  isCompleted: get(isCompletedAtom),
  isSuccess: get(isSuccessAtom),
  currentTime: get(currentTimeAtom),
  timerActive: get(timerActiveAtom),
  difficulty: get(difficultyAtom),
  highlightedCells: get(highlightedCellsAtom),
  numberCounts: get(numberCountsAtom),
  hintsRemaining: get(hintsRemainingAtom),
  gameMode: get(gameModeAtom),
  cages: get(cagesAtom),
} as SudokuState));

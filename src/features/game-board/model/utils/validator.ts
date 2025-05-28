import { BLOCK_SIZE, BOARD_SIZE } from "@entities/board/model/constants";
import { Grid, GridPosition, SudokuBoard } from "@entities/board/model/types";
import { getBlockCoordinates } from "@entities/board/model/utils";
import { KillerCage } from "@entities/game/model/types";
import { getBlockNumbers, getColumnNumbers, getRowNumbers, isValidNumberSet } from "@entities/game/model/utils";

/**
 * @description 특정 위치에 놓을 수 있는 숫자 확인
 * @param {(number | null)[][]} grid - 스도쿠 그리드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @returns {number[]} 유효한 숫자 배열
 */
function getValidCandidates(grid: (number | null)[][], row: number, col: number): number[] {
  const used = new Set<number>();

  // 행 검사
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (grid[row][c] !== null) {
      used.add(grid[row][c]!);
    }
  }

  // 열 검사
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (grid[r][col] !== null) {
      used.add(grid[r][col]!);
    }
  }

  // 3x3 블록 검사
  const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE;
  const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE;
  for (let r = 0; r < BLOCK_SIZE; r++) {
    for (let c = 0; c < BLOCK_SIZE; c++) {
      const value = grid[blockRow + r][blockCol + c];
      if (value !== null) {
        used.add(value);
      }
    }
  }

  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => !used.has(n));
}

/**
 * @description 유일 솔루션 검사
 * @param {(number | null)[][]} grid - 스도쿠 그리드
 * @returns {boolean} 유일 솔루션 여부
 */
export function hasUniqueSolution(grid: (number | null)[][]): boolean {
  let solutionCount = 0;
  const MAX_SOLUTIONS = 2;
  const MAX_ITERATIONS = 50000; // 최대 반복 횟수 제한
  let iterations = 0;

  const tempGrid = grid.map((row) => [...row]);

  // 빈 셀 찾기 및 제약 조건 순으로 정렬
  const emptyCells: GridPosition[] = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (tempGrid[r][c] === null) {
        emptyCells.push([r, c]);
      }
    }
  }

  // MRV (Most Constraining Variable) 휴리스틱
  emptyCells.sort((a, b) => {
    const candidatesA = getValidCandidates(tempGrid, a[0], a[1]).length;
    const candidatesB = getValidCandidates(tempGrid, b[0], b[1]).length;
    return candidatesA - candidatesB;
  });

  function backtrack(index: number): boolean {
    iterations++;
    if (iterations > MAX_ITERATIONS) {
      return true; // 안전장치
    }

    if (index >= emptyCells.length) {
      solutionCount++;
      return solutionCount >= MAX_SOLUTIONS;
    }

    const [row, col] = emptyCells[index];
    const candidates = getValidCandidates(tempGrid, row, col);

    if (candidates.length === 0) {
      return false; // 더 이상 진행 불가능
    }

    for (const num of candidates) {
      tempGrid[row][col] = num;

      if (backtrack(index + 1)) {
        return true;
      }

      tempGrid[row][col] = null;
    }

    return false;
  }

  backtrack(0);

  return solutionCount === 1;
}

/**
 * @description 행 내 충돌 검사
 * @param {SudokuBoard} board - 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} value - 확인할 숫자
 * @returns {boolean} 충돌 여부
 */
export function checkRowConflict(board: SudokuBoard, row: number, col: number, value: number): boolean {
  for (let c = 0; c < BOARD_SIZE; c++) {
    if (c !== col && board[row][c].value === value) {
      return true;
    }
  }
  return false;
}

/**
 * @description 열 내 충돌 검사
 * @param {SudokuBoard} board - 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} value - 확인할 숫자
 * @returns {boolean} 충돌 여부
 */
export function checkColConflict(board: SudokuBoard, row: number, col: number, value: number): boolean {
  for (let r = 0; r < BOARD_SIZE; r++) {
    if (r !== row && board[r][col].value === value) {
      return true;
    }
  }
  return false;
}

/**
 * @description 3x3 블록 내 충돌 검사
 * @param {SudokuBoard} board - 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @param {number} value - 확인할 숫자
 * @returns {boolean} 충돌 여부
 */
export function checkBlockConflict(board: SudokuBoard, row: number, col: number, value: number): boolean {
  const blockRow = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE;
  const blockCol = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE;

  for (let r = 0; r < BLOCK_SIZE; r++) {
    for (let c = 0; c < BLOCK_SIZE; c++) {
      const curRow = blockRow + r;
      const curCol = blockCol + c;
      if ((curRow !== row || curCol !== col) && board[curRow][curCol].value === value) {
        return true;
      }
    }
  }
  return false;
}

/**
 * @description 특정 셀에 충돌이 있는지 확인
 * @param {SudokuBoard} board - 스도쿠 보드
 * @param {number} row - 행 인덱스
 * @param {number} col - 열 인덱스
 * @returns {boolean} 충돌 여부
 */
export function hasConflict(board: SudokuBoard, row: number, col: number): boolean {
  const value = board[row][col].value;
  if (value === null) return false;

  return (
    checkRowConflict(board, row, col, value) ||
    checkColConflict(board, row, col, value) ||
    checkBlockConflict(board, row, col, value)
  );
}

/**
 * @description 스도쿠 보드의 충돌 확인 및 표시
 * @description 행, 열, 3x3 블록 규칙 검증
 * @param {SudokuBoard} board - 검사할 스도쿠 보드
 * @returns {SudokuBoard} 충돌 정보가 업데이트된 보드
 */
export function checkConflicts(board: SudokuBoard): SudokuBoard {
  const newBoard = structuredClone(board);

  // 각 행, 열, 블록별로 중복 검사를 한 번에 처리
  const conflicts = new Set<string>();

  // 행별 중복 검사
  for (let row = 0; row < BOARD_SIZE; row++) {
    const seen = new Map<number, number[]>();
    for (let col = 0; col < BOARD_SIZE; col++) {
      const value = newBoard[row][col].value;
      if (value !== null) {
        if (!seen.has(value)) {
          seen.set(value, []);
        }
        seen.get(value)!.push(col);
      }
    }

    // 중복된 값들의 위치를 conflicts에 추가
    for (const [, positions] of seen) {
      if (positions.length > 1) {
        positions.forEach((col) => conflicts.add(`${row}-${col}`));
      }
    }
  }

  // 열별 중복 검사
  for (let col = 0; col < BOARD_SIZE; col++) {
    const seen = new Map<number, number[]>();
    for (let row = 0; row < BOARD_SIZE; row++) {
      const value = newBoard[row][col].value;
      if (value !== null) {
        if (!seen.has(value)) {
          seen.set(value, []);
        }
        seen.get(value)!.push(row);
      }
    }

    for (const [, positions] of seen) {
      if (positions.length > 1) {
        positions.forEach((row) => conflicts.add(`${row}-${col}`));
      }
    }
  }

  // 3x3 블록별 중복 검사
  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const seen = new Map<number, Array<[number, number]>>();

      for (let r = 0; r < BLOCK_SIZE; r++) {
        for (let c = 0; c < BLOCK_SIZE; c++) {
          const row = blockRow * BLOCK_SIZE + r;
          const col = blockCol * BLOCK_SIZE + c;
          const value = newBoard[row][col].value;

          if (value !== null) {
            if (!seen.has(value)) {
              seen.set(value, []);
            }
            seen.get(value)!.push([row, col]);
          }
        }
      }

      for (const [, positions] of seen) {
        if (positions.length > 1) {
          positions.forEach(([row, col]) => conflicts.add(`${row}-${col}`));
        }
      }
    }
  }

  // 충돌 정보를 보드에 반영
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      newBoard[row][col].isConflict = conflicts.has(`${row}-${col}`);
    }
  }

  return newBoard;
}

/**
 * @description 스도쿠 보드가 완성되었는지 확인
 * @description 모든 셀이 채워져 있고 충돌이 없어야 함
 * @param {SudokuBoard} board - 확인할 스도쿠 보드
 * @returns {boolean} 완성 여부
 */
export function isBoardComplete(board: SudokuBoard): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = board[row][col];
      if (cell.value === null || cell.isConflict) {
        return false;
      }
    }
  }
  return true;
}

/**
 * @description 스도쿠 보드가 원본 솔루션과 일치하는지 확인
 * @param {SudokuBoard} board - 확인할 스도쿠 보드
 * @param {Grid} solution - 원본 솔루션
 * @returns {boolean} 일치 여부
 */
export function isBoardCorrect(board: SudokuBoard, solution: Grid): boolean {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col].value !== solution[row][col]) {
        return false;
      }
    }
  }
  return true;
}

/**
 * @description 최적화된 그리드 검증 함수
 * @param {Grid} grid - 검사할 그리드
 * @returns {boolean} 유효성 여부
 */
export function validateBaseGrid(grid: Grid): boolean {
  // 행과 열을 동시에 검증
  for (let i = 0; i < BOARD_SIZE; i++) {
    const rowNumbers = getRowNumbers(grid, i);
    const colNumbers = getColumnNumbers(grid, i);

    if (!isValidNumberSet(rowNumbers) || !isValidNumberSet(colNumbers)) {
      throw new Error(`Invalid row ${i} or column ${i}`);
      return false;
    }
  }

  // 3x3 블록 검증
  for (let blockRow = 0; blockRow < BLOCK_SIZE; blockRow++) {
    for (let blockCol = 0; blockCol < BLOCK_SIZE; blockCol++) {
      const blockNumbers = getBlockNumbers(grid, blockRow, blockCol);

      if (!isValidNumberSet(blockNumbers)) {
        throw new Error(`Invalid block [${blockRow}, ${blockCol}]`);
        return false;
      }
    }
  }

  return true;
}

/**
 * @description 셀 배치 유효성 검사 (수정된 버전)
 * @param {Grid} grid - 검사할 그리드
 * @param {number} row - 행
 * @param {number} col - 열
 * @param {number} num - 숫자
 * @returns {boolean} 유효성 여부
 */
export function isValidPlacement(grid: Grid, row: number, col: number, num: number): boolean {
  // 행 검사
  if (grid[row].includes(num)) return false;

  // 열 검사
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // 블록 검사
  const [blockStartRow, blockStartCol] = getBlockCoordinates(row, col);
  for (let r = 0; r < BLOCK_SIZE; r++) {
    for (let c = 0; c < BLOCK_SIZE; c++) {
      if (grid[blockStartRow + r][blockStartCol + c] === num) return false;
    }
  }

  return true;
}

/**
 * @description 킬러 스도쿠 셀 제거 유효성 검증 (Expert용)
 * @param {SudokuBoard} board - 보드
 * @param {KillerCage[]} cages - 케이지 배열
 * @param {GridPosition} removedPos - 제거할 셀
 * @returns {boolean} 유효성 여부
 */
export function isKillerRemovalValidLenient(
  board: SudokuBoard,
  cages: KillerCage[],
  removedPos: GridPosition,
): boolean {
  const [removedRow, removedCol] = removedPos;
  const targetCage = cages.find((cage) => cage.cells.some(([r, c]) => r === removedRow && c === removedCol));

  if (!targetCage) return false;

  const remainingCells = targetCage.cells.filter(([r, c]) => board[r][c].value !== null);

  if (remainingCells.length === 0) return true; // Expert에서는 빈 케이지 허용

  const currentSum = remainingCells.reduce((sum, [r, c]) => sum + (board[r][c].value || 0), 0);
  if (currentSum > targetCage.sum) return false;

  const values = remainingCells.map(([r, c]) => board[r][c].value).filter((v) => v !== null);
  const uniqueValues = new Set(values);

  return values.length === uniqueValues.size;
}

/**
 * @description 킬러 스도쿠 셀 제거 유효성 검증 (일반용)
 * @param {SudokuBoard} board - 보드
 * @param {KillerCage[]} cages - 케이지 배열
 * @param {GridPosition} removedPos - 제거할 셀
 * @returns {boolean} 유효성 여부
 */
export function isKillerRemovalValid(board: SudokuBoard, cages: KillerCage[], removedPos: GridPosition): boolean {
  const [removedRow, removedCol] = removedPos;
  const targetCage = cages.find((cage) => cage.cells.some(([r, c]) => r === removedRow && c === removedCol));

  if (!targetCage) return false;

  const remainingCells = targetCage.cells.filter(([r, c]) => board[r][c].value !== null);

  if (remainingCells.length === 0) return false;

  const currentSum = remainingCells.reduce((sum, [r, c]) => sum + (board[r][c].value || 0), 0);
  if (currentSum > targetCage.sum) return false;

  const values = remainingCells.map(([r, c]) => board[r][c].value).filter((v) => v !== null);
  const uniqueValues = new Set(values);

  return values.length === uniqueValues.size;
}

/**
 * @description 케이지 유효성 검증 (순수 함수)
 * @param {KillerCage[]} cages - 케이지 배열
 * @param {Grid} solution - 솔루션
 * @returns {boolean} 유효성 여부
 */
export function validateCages(cages: KillerCage[], solution: Grid): boolean {
  return cages.every((cage) => {
    const values = cage.cells.map(([r, c]) => solution[r][c]);
    const uniqueValues = new Set(values);
    const actualSum = values.reduce((sum, val) => sum + val, 0);

    if (values.length !== uniqueValues.size) {
      return false;
    }

    if (actualSum !== cage.sum) {
      return false;
    }

    return true;
  });
}

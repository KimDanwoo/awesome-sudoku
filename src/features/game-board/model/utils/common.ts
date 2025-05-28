import { BOARD_SIZE } from "@entities/board/model/constants";
import { SudokuBoard } from "@entities/board/model/types";
import { CellHighlight } from "@entities/cell/model/types";
import { MINUTE } from "@shared/model/constants";

/**
 * @description 배열을 무작위로 섞는 함수 (Fisher-Yates 알고리즘)
 * @param {T[]} array - 섞을 배열
 */
export function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * @description 시간 형식 포맷팅 (초 -> 분:초)
 * @param {number} seconds - 초 단위 시간
 * @returns {string} 포맷된 시간 문자열
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / MINUTE);
  const secs = seconds % MINUTE;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * 빈 스도쿠 보드 생성
 * @returns 빈 스도쿠 보드
 */
export function createEmptyBoard(): SudokuBoard {
  return Array(BOARD_SIZE)
    .fill(null)
    .map(() =>
      Array(BOARD_SIZE)
        .fill(null)
        .map(() => ({
          value: null,
          isInitial: false,
          isSelected: false,
          isConflict: false,
          notes: [],
        })),
    );
}

/**
 * @description 빈 스도쿠 하이라이트 생성
 * @returns {Record<string, CellHighlight>} 빈 스도쿠 하이라이트
 */
export function createEmptyHighlights(): Record<string, CellHighlight> {
  const highlights: Record<string, CellHighlight> = {};

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = `${row}-${col}`;
      highlights[key] = {
        selected: false,
        related: false,
        sameValue: false,
      };
    }
  }

  return highlights;
}

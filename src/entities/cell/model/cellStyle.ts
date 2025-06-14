import { cn } from "@shared/model/utils";
import { CellHighlight } from "./types";

/**
 * 셀 테두리 스타일을 반환
 * @param row - 행
 * @param col - 열
 * @returns 셀 테두리 스타일
 */
export function getCellBorderStyles(row: number, col: number) {
  return {
    isRightBlockBorder: (col + 1) % 3 === 0 && col < 8,
    isBottomBlockBorder: (row + 1) % 3 === 0 && row < 8,
  };
}

/**
 * 셀 하이라이트 스타일을 반환
 * @param highlight - 셀 하이라이트
 * @param isConflict - 충돌 여부
 * @returns 셀 하이라이트 스타일
 */
export function getCellHighlightStyles(highlight: CellHighlight, isConflict: boolean) {
  return {
    bgColor: cn(
      "bg-white", // 기본 배경색
      highlight.selected && "bg-blue-200",
      highlight.sameValue && "bg-blue-300",
      highlight.related && "bg-blue-50",
    ),
    textColor: cn(
      "text-slate-700", // 기본 텍스트 색상
      isConflict && "text-red-600",
    ),
    borderColor: "border-slate-200",
  };
}

/**
 * 셀 클래스 이름을 빌드
 * @param highlight - 셀 하이라이트
 * @param borderStyles - 셀 테두리 스타일
 * @param isInitial - 초기 셀 여부
 * @returns 셀 클래스 이름
 */
export function buildCellClassName(
  { bgColor, textColor, borderColor }: ReturnType<typeof getCellHighlightStyles>,
  { isRightBlockBorder, isBottomBlockBorder }: ReturnType<typeof getCellBorderStyles>,
  isInitial: boolean,
) {
  return cn(
    "relative",
    "min-w-8 min-h-8 w-8 h-8",
    "sm:w-10 sm:h-10",
    "md:w-12 md:h-12",
    "lg:w-14 lg:h-14",
    "border",
    "text-center align-middle",
    "cursor-pointer",
    "transition-colors duration-100",
    "focus-visible:outline-none",
    "select-none",
    "touch-manipulation",
    "-webkit-tap-highlight-color: transparent",
    "active:outline-none",
    bgColor,
    textColor,
    borderColor,
    isInitial ? "font-bold" : "font-normal",
    isRightBlockBorder && "border-r-2 border-r-slate-800",
    isBottomBlockBorder && "border-b-2 border-b-slate-800",
  );
}

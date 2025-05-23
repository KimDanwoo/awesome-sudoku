"use client";

import dynamic from "next/dynamic";

const SudokuBoard = dynamic(() => import("@widgets/game-board/ui/GameBoard"), { ssr: false });
const SelectNumber = dynamic(() => import("@features/select-number/ui/SelectNumber"), { ssr: false });
const Controls = dynamic(() => import("@widgets/game-controls/ui/GameControls"), { ssr: false });
const GameStatus = dynamic(() => import("@widgets/game-header/ui/GameHeader"), { ssr: false });
const GameModeSelector = dynamic(() => import("@features/game-mode-selector/ui/GameModeSelector"), { ssr: false });
const CompleteGameOverlay = dynamic(() => import("@widgets/game-overlays/ui/CompleteGameOverlay"), { ssr: false });
const PauseGameOverlay = dynamic(() => import("@widgets/game-overlays/ui/PauseGameOverlay"), { ssr: false });

export default function Home() {
  return (
    <main className="min-w-[400px] min-h-screen flex flex-col gap-6">
      <GameModeSelector />

      <div className="mx-auto p-6  rounded-lg flex flex-col lg:flex-row">
        <div className="relative">
          <GameStatus />

          <div className="relative">
            <CompleteGameOverlay />

            <PauseGameOverlay />

            <SudokuBoard />
          </div>
        </div>
        <div className="lg:max-w-[400px]">
          <Controls />

          <SelectNumber />
        </div>
      </div>
    </main>
  );
}

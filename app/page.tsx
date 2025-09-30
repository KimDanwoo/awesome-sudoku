"use client";

import { useState } from "react";
import { UserProfileMenu } from "@entities/auth/ui";
import { GameModeSelector, SelectNumber } from "@features/game-controls/ui";
import { GameResultReporter } from "@features/leaderboard/ui";
import { SudokuBoard } from "@widgets/game-board/ui";
import { Controls } from "@widgets/game-controls/ui";
import { GameStatus } from "@widgets/game-header/ui";
import { CompleteGameOverlay, PauseGameOverlay } from "@widgets/game-overlays/ui";
import { Leaderboard } from "@widgets/leaderboard/ui";
import { cn } from "@shared/model/utils";

const TABS = {
  GAME: "game",
  RANKING: "ranking",
} as const;

type TabKey = (typeof TABS)[keyof typeof TABS];

const TAB_ITEMS: Array<{ key: TabKey; label: string }> = [
  { key: TABS.GAME, label: "게임" },
  { key: TABS.RANKING, label: "랭킹" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>(TABS.GAME);

  return (
    <main className="min-w-[320px] min-h-screen flex flex-col gap-4">
      <GameResultReporter />

      <nav className="flex flex-col border-b border-gray-200">
        <div className="flex items-center justify-between px-2 py-2">
          <GameModeSelector />

          <UserProfileMenu />
        </div>

        <div className="flex gap-2 px-2 pb-2">
          {TAB_ITEMS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200",
              )}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          "mx-auto px-6 rounded-lg flex flex-col gap-4 lg:flex-row w-full",
          activeTab !== TABS.GAME && "hidden",
        )}
      >
        <div className="relative">
          <GameStatus />

          <div className="relative">
            <CompleteGameOverlay />

            <PauseGameOverlay />

            <SudokuBoard />
          </div>
        </div>
        <div className="lg:max-w-[380px] flex flex-col gap-4">
          <Controls />

          <SelectNumber />
        </div>
      </div>

      <div className={cn("w-full", activeTab === TABS.RANKING ? "block" : "hidden")}>
        <Leaderboard />
      </div>
    </main>
  );
}

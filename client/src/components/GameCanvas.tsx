/**
 * 赤道雷暴行动风格：React 只提供深色全屏画框；战斗画面、HUD 与品牌徽记均由 Phaser 统一渲染。
 */
import { useEffect, useRef } from "react";
import { createSkyStrikerGame } from "@/game/game";

export default function GameCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const gameRef = useRef<ReturnType<typeof createSkyStrikerGame> | null>(null);

  useEffect(() => {
    if (!mountRef.current || gameRef.current) return;

    const demo = new URLSearchParams(window.location.search).has("demo");
    const game = createSkyStrikerGame(mountRef.current, demo);
    gameRef.current = game;

    const resize = () => game.scale.refresh();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="game-shell" aria-label="Sky Striker 飞机射击游戏">
      <div ref={mountRef} className="game-mount" />
      <aside className="orientation-hint" aria-live="polite">
        <span className="orientation-mark">↻</span>
        <strong>横置设备</strong>
        <span>进入雷暴航道</span>
      </aside>
      <p className="sr-only">
        使用方向键或 WASD 控制拦截机左右移动，自动开火。按 P 暂停或继续任务。
      </p>
    </main>
  );
}

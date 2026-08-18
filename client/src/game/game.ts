import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { BattleScene } from "./scenes/BattleScene";
import { MenuScene } from "./scenes/MenuScene";

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export function createSkyStrikerGame(parent: HTMLElement, demo: boolean) {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    backgroundColor: "#061A22",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
    },
    scene: [BootScene, MenuScene, BattleScene],
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
    },
  });

  game.registry.set("demo", demo);
  if (import.meta.env.DEV) {
    // 仅开发环境暴露，便于 ?demo=1 下的自动化视觉/状态回归检查；生产构建不包含。
    (window as unknown as { __skyStriker?: { game: Phaser.Game } }).__skyStriker = { game };
  }
  return game;
}

import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game";
import { sfx, unlockAudio } from "../audio";

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("menu");
  }

  create() {
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x061a22);

    const backgroundAvailable = this.textures.exists("storm-background");
    if (backgroundAvailable) {
      this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, "storm-background")
        .setDisplaySize(GAME_WIDTH, GAME_HEIGHT)
        .setAlpha(0.46);
    }

    const scan = this.add.graphics();
    scan.lineStyle(1, 0x44f5d6, 0.22);
    for (let y = 88; y < GAME_HEIGHT; y += 42) scan.lineBetween(0, y, GAME_WIDTH, y);
    scan.lineStyle(2, 0xffb43d, 0.26);
    scan.arc(GAME_WIDTH / 2, 320, 226, Phaser.Math.DegToRad(205), Phaser.Math.DegToRad(335), false);
    scan.strokePath();

    const mark = this.textures.exists("sky-striker-mark")
      ? this.add.image(GAME_WIDTH / 2, 140, "sky-striker-mark").setDisplaySize(74, 74)
      : this.add.triangle(GAME_WIDTH / 2, 140, 0, 74, 37, 0, 74, 74, 0xffb43d);
    mark.setAlpha(0.95);

    this.add.text(GAME_WIDTH / 2, 250, "SKY // STRIKER", {
      fontFamily: "Barlow Condensed, sans-serif",
      fontSize: "86px",
      fontStyle: "bold italic",
      color: "#F1FFFB",
      letterSpacing: 4,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 324, "赤道雷暴行动", {
      fontFamily: "Noto Sans SC, sans-serif",
      fontSize: "20px",
      color: "#44F5D6",
      letterSpacing: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 395, "云层已打开。保持航线，压制来袭目标。", {
      fontFamily: "Noto Sans SC, sans-serif",
      fontSize: "19px",
      color: "#C3D8D7",
    }).setOrigin(0.5);

    const start = this.add.container(GAME_WIDTH / 2, 490);
    const panel = this.add.graphics();
    panel.fillStyle(0xffb43d, 1);
    panel.fillRect(-156, -31, 312, 62);
    panel.fillTriangle(-182, 0, -156, -31, -156, 31);
    panel.fillTriangle(182, 0, 156, -31, 156, 31);
    const label = this.add.text(0, 0, "锁定航线  ·  ENTER", {
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#08222A",
      letterSpacing: 1,
    }).setOrigin(0.5);
    start.add([panel, label]).setSize(364, 62).setInteractive({ useHandCursor: true });

    const launch = () => {
      unlockAudio();
      sfx.uiClick();
      this.scene.start("battle");
    };
    start.on("pointerover", () => start.setScale(1.04));
    start.on("pointerout", () => start.setScale(1));
    start.on("pointerdown", launch);
    this.input.keyboard?.once("keydown-ENTER", launch);
    this.input.keyboard?.once("keydown-SPACE", launch);

    this.add.text(GAME_WIDTH / 2, 618, "WASD / 方向键：机动     火控：自动     P：暂停    M：音效", {
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: "14px",
      color: "#9AB6B6",
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 661, "02  //  STORM CORRIDOR  //  7,240M", {
      fontFamily: "IBM Plex Mono, monospace",
      fontSize: "12px",
      color: "#618282",
      letterSpacing: 3,
    }).setOrigin(0.5);

    const demoMode = Boolean(this.registry.get("demo")) || new URLSearchParams(window.location.search).has("demo");
    if (demoMode) {
      this.scene.start("battle");
    }
  }
}

import Phaser from "phaser";

const ASSET_URLS = {
  background: `${import.meta.env.BASE_URL}assets/storm_background.png`,
  player: `${import.meta.env.BASE_URL}assets/player_interceptor.png`,
  enemy: `${import.meta.env.BASE_URL}assets/enemy_drone.png`,
  mark: `${import.meta.env.BASE_URL}assets/sky_striker_mark.png`,
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("boot");
  }

  preload() {
    this.load.image("storm-background", ASSET_URLS.background);
    this.load.image("player-interceptor", ASSET_URLS.player);
    this.load.image("enemy-drone", ASSET_URLS.enemy);
    this.load.image("sky-striker-mark", ASSET_URLS.mark);
  }

  create() {
    this.createProceduralTextures();
    this.scene.start("menu");
  }

  private createProceduralTextures() {
    const g = this.add.graphics();

    g.fillStyle(0x44f5d6, 1);
    g.fillRoundedRect(4, 0, 8, 28, 4);
    g.fillStyle(0xffffff, 0.85);
    g.fillRect(6, 2, 4, 20);
    g.generateTexture("player-bullet", 16, 30);
    g.clear();

    g.fillStyle(0xffb43d, 1);
    g.fillCircle(7, 7, 7);
    g.fillStyle(0xfff3c0, 0.92);
    g.fillCircle(7, 7, 3);
    g.generateTexture("enemy-bullet", 14, 14);
    g.clear();

    g.lineStyle(3, 0x44f5d6, 0.95);
    g.strokeCircle(22, 22, 18);
    g.fillStyle(0xffb43d, 1);
    g.fillCircle(22, 22, 8);
    g.fillStyle(0xfff5cf, 1);
    g.fillCircle(22, 22, 3);
    g.generateTexture("shield", 44, 44);
    g.clear();

    g.lineStyle(2, 0x9ef8eb, 0.32);
    for (let x = 8; x < 140; x += 26) {
      g.lineBetween(x, 0, x - 26, 180);
    }
    g.generateTexture("rain", 140, 180);
    g.clear();

    g.fillStyle(0xffb43d, 1);
    g.fillCircle(32, 32, 28);
    g.fillStyle(0xf25c4d, 0.95);
    g.fillCircle(32, 32, 18);
    g.fillStyle(0xffefc1, 1);
    g.fillCircle(32, 32, 9);
    g.generateTexture("blast", 64, 64);
    g.destroy();
  }
}

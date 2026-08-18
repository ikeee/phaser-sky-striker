import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../game";

type Ship = Phaser.Physics.Arcade.Sprite;

export class BattleScene extends Phaser.Scene {
  private player!: Ship;
  private enemies!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;
  private pickups!: Phaser.Physics.Arcade.Group;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private moveKeys!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
  private backgroundA!: Phaser.GameObjects.Image;
  private backgroundB!: Phaser.GameObjects.Image;
  private rainLayer!: Phaser.GameObjects.TileSprite;
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private armorPips: Phaser.GameObjects.Rectangle[] = [];
  private pauseLabel!: Phaser.GameObjects.Text;
  private statusText!: Phaser.GameObjects.Text;
  private spawnTimer?: Phaser.Time.TimerEvent;
  private enemyShotTimer?: Phaser.Time.TimerEvent;
  private shieldTimer?: Phaser.Time.TimerEvent;
  private fireAt = 0;
  private score = 0;
  private combo = 0;
  private armor = 3;
  private invulnerable = false;
  private ended = false;
  private paused = false;
  private touchLeft = false;
  private touchRight = false;
  private autoPilot = false;
  private pauseHandler?: () => void;

  constructor() {
    super("battle");
  }

  create() {
    this.autoPilot = Boolean(this.registry.get("demo"));
    this.score = 0;
    this.combo = 0;
    this.armor = 3;
    this.ended = false;
    this.paused = false;
    this.invulnerable = false;
    this.createBackdrop();
    this.createGroups();
    this.createPlayer();
    this.createHud();
    this.createInput();
    this.startTimers();
    // Phaser 不会自动调用场景类上名为 shutdown() 的方法；必须订阅 SHUTDOWN 事件才能做清理。
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this);
    if (this.autoPilot) {
      this.spawnEnemy(318, 126, false);
      this.spawnEnemy(786, 204, true);
      this.spawnEnemy(1002, 86, false);
    }
    this.updateHud();
  }

  private createBackdrop() {
    const bgKey = this.textures.exists("storm-background") ? "storm-background" : "rain";
    this.backgroundA = this.add.image(GAME_WIDTH / 2, GAME_HEIGHT / 2, bgKey).setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.8);
    this.backgroundB = this.add.image(GAME_WIDTH / 2, -GAME_HEIGHT / 2, bgKey).setDisplaySize(GAME_WIDTH, GAME_HEIGHT).setAlpha(0.8);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x04151d, 0.36);
    this.rainLayer = this.add.tileSprite(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, "rain").setAlpha(0.42);

    const edge = this.add.graphics();
    edge.lineStyle(2, 0x44f5d6, 0.28);
    edge.lineBetween(84, 0, 26, GAME_HEIGHT);
    edge.lineBetween(GAME_WIDTH - 84, 0, GAME_WIDTH - 26, GAME_HEIGHT);
    edge.lineStyle(1, 0xffb43d, 0.18);
    edge.lineBetween(112, 0, 58, GAME_HEIGHT);
    edge.lineBetween(GAME_WIDTH - 112, 0, GAME_WIDTH - 58, GAME_HEIGHT);
  }

  private createGroups() {
    this.enemies = this.physics.add.group({ maxSize: 22, runChildUpdate: false });
    this.playerBullets = this.physics.add.group({ maxSize: 48 });
    this.enemyBullets = this.physics.add.group({ maxSize: 40 });
    this.pickups = this.physics.add.group({ maxSize: 5 });
  }

  private createPlayer() {
    const playerKey = this.textures.exists("player-interceptor") ? "player-interceptor" : "shield";
    this.player = this.physics.add.sprite(GAME_WIDTH / 2, GAME_HEIGHT - 120, playerKey);
    this.player.setDisplaySize(82, 82).setDepth(10).setCollideWorldBounds(true);
    this.player.body?.setSize(40, 52, true);
    this.player.setData("lastHit", 0);
  }

  private createHud() {
    const hud = this.add.graphics().setDepth(30);
    hud.fillStyle(0x061a22, 0.8);
    hud.fillRect(0, 0, 420, 102);
    hud.fillRect(GAME_WIDTH - 420, 0, 420, 102);
    hud.lineStyle(2, 0x44f5d6, 0.55);
    hud.lineBetween(0, 101, 420, 101);
    hud.lineStyle(2, 0xffb43d, 0.65);
    hud.lineBetween(GAME_WIDTH - 420, 101, GAME_WIDTH, 101);
    hud.lineStyle(1, 0x44f5d6, 0.26);
    hud.lineBetween(0, 148, 72, 220);
    hud.lineBetween(0, 268, 44, 312);
    hud.lineBetween(GAME_WIDTH, 148, GAME_WIDTH - 72, 220);
    hud.lineBetween(GAME_WIDTH, 268, GAME_WIDTH - 44, 312);
    hud.lineStyle(2, 0xffb43d, 0.42);
    hud.lineBetween(0, 416, 28, 444);
    hud.lineBetween(GAME_WIDTH, 416, GAME_WIDTH - 28, 444);

    this.add.text(28, 18, "STRIKE SCORE", { fontFamily: "IBM Plex Mono, monospace", fontSize: "13px", color: "#83ADAA" }).setDepth(31);
    this.scoreText = this.add.text(28, 37, "000 000", { fontFamily: "IBM Plex Mono, monospace", fontSize: "30px", fontStyle: "bold", color: "#F1FFFB" }).setDepth(31);
    this.comboText = this.add.text(260, 49, "× 0", { fontFamily: "IBM Plex Mono, monospace", fontSize: "18px", color: "#44F5D6" }).setDepth(31);

    this.add.text(GAME_WIDTH - 28, 18, "ARMOR / ION", { fontFamily: "IBM Plex Mono, monospace", fontSize: "13px", color: "#DDC391" }).setOrigin(1, 0).setDepth(31);
    for (let i = 0; i < 3; i += 1) {
      const pip = this.add.rectangle(GAME_WIDTH - 28 - i * 34, 60, 24, 16, 0xffb43d).setDepth(31);
      this.armorPips.push(pip);
    }

    this.pauseLabel = this.add.text(GAME_WIDTH - 28, 112, "[ P ] 暂停", { fontFamily: "IBM Plex Mono, monospace", fontSize: "14px", color: "#AFC6C5" })
      .setOrigin(1, 0).setDepth(31).setInteractive({ useHandCursor: true });
    this.pauseLabel.on("pointerdown", () => this.togglePause());
    this.statusText = this.add.text(GAME_WIDTH / 2, 118, "", { fontFamily: "IBM Plex Mono, monospace", fontSize: "14px", color: "#FFCC6A", letterSpacing: 3 })
      .setOrigin(0.5).setDepth(31);
    this.add.text(26, 224, "RANGE\n/ / 042", { fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "#75A6A2", lineSpacing: 4 }).setDepth(31);
    this.add.text(GAME_WIDTH - 26, 224, "THREAT\n// SCAN", { fontFamily: "IBM Plex Mono, monospace", fontSize: "11px", color: "#D99070", align: "right", lineSpacing: 4 }).setOrigin(1, 0).setDepth(31);

    const controls = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT - 45).setDepth(31);
    const strip = this.add.graphics();
    strip.fillStyle(0x061a22, 0.78);
    strip.fillRect(-218, -18, 436, 36);
    strip.fillTriangle(-247, 0, -218, -18, -218, 18);
    strip.fillTriangle(247, 0, 218, -18, 218, 18);
    strip.lineStyle(1, 0x44f5d6, 0.32);
    strip.strokeRect(-218, -18, 436, 36);
    const controlsText = this.add.text(0, 0, "← / →  机动     ·     火控：自动     ·     P  中止", {
      fontFamily: "IBM Plex Mono, monospace", fontSize: "12px", color: "#AFC6C5",
    }).setOrigin(0.5);
    controls.add([strip, controlsText]);
    this.createTouchControls();
  }

  private createTouchControls() {
    const makeControl = (x: number, label: string, onDown: () => void, onUp: () => void) => {
      const control = this.add.container(x, GAME_HEIGHT - 116).setDepth(32);
      const backing = this.add.graphics();
      backing.fillStyle(0x061a22, 0.84);
      backing.fillRect(-24, -28, 48, 56);
      backing.fillTriangle(-42, 0, -24, -28, -24, 28);
      backing.fillTriangle(42, 0, 24, -28, 24, 28);
      backing.lineStyle(2, 0x44f5d6, 0.72);
      backing.strokeRect(-24, -28, 48, 56);
      const text = this.add.text(0, -1, label, { fontFamily: "IBM Plex Mono, monospace", fontSize: "23px", color: "#E9FFFA" }).setOrigin(0.5);
      control.add([backing, text]).setSize(68, 68).setInteractive({ useHandCursor: true });
      control.on("pointerdown", onDown);
      control.on("pointerup", onUp);
      control.on("pointerout", onUp);
    };
    makeControl(86, "◀", () => { this.touchLeft = true; }, () => { this.touchLeft = false; });
    makeControl(GAME_WIDTH - 86, "▶", () => { this.touchRight = true; }, () => { this.touchRight = false; });
  }

  private createInput() {
    this.cursors = this.input.keyboard?.createCursorKeys() as Phaser.Types.Input.Keyboard.CursorKeys;
    this.moveKeys = this.input.keyboard?.addKeys({ left: "A", right: "D" }) as { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key };
    this.pauseHandler = () => this.togglePause();
    this.input.keyboard?.on("keydown-P", this.pauseHandler);
    this.physics.add.overlap(this.playerBullets, this.enemies, this.onBulletHitEnemy, undefined, this);
    this.physics.add.overlap(this.enemyBullets, this.player, this.onPlayerHit, undefined, this);
    this.physics.add.overlap(this.enemies, this.player, this.onPlayerHit, undefined, this);
    this.physics.add.overlap(this.pickups, this.player, this.onPickup, undefined, this);
  }

  private startTimers() {
    this.spawnTimer = this.time.addEvent({ delay: 720, loop: true, callback: this.spawnEnemy, callbackScope: this });
    this.enemyShotTimer = this.time.addEvent({ delay: 1250, loop: true, callback: this.fireEnemyVolley, callbackScope: this });
    this.shieldTimer = this.time.addEvent({ delay: 11000, loop: true, callback: this.spawnShield, callbackScope: this });
  }

  update(time: number, delta: number) {
    if (this.ended || this.paused) return;
    this.scrollBackdrop(delta);
    this.updatePlayer(time);
    this.updateEntities();
    if (time > this.fireAt) {
      this.firePlayerBullet();
      this.fireAt = time + 180;
    }
  }

  private scrollBackdrop(delta: number) {
    const step = 0.06 * delta;
    this.backgroundA.y += step;
    this.backgroundB.y += step;
    if (this.backgroundA.y >= GAME_HEIGHT * 1.5) this.backgroundA.y = this.backgroundB.y - GAME_HEIGHT;
    if (this.backgroundB.y >= GAME_HEIGHT * 1.5) this.backgroundB.y = this.backgroundA.y - GAME_HEIGHT;
    this.rainLayer.tilePositionY -= 0.28 * delta;
  }

  private updatePlayer(time: number) {
    let velocity = 0;
    if (this.autoPilot) {
      const targetX = GAME_WIDTH / 2 + Math.sin(time / 700) * 260;
      velocity = Phaser.Math.Clamp((targetX - this.player.x) * 2.6, -560, 560);
    } else {
      const left = this.cursors.left?.isDown || this.moveKeys.left?.isDown || this.touchLeft;
      const right = this.cursors.right?.isDown || this.moveKeys.right?.isDown || this.touchRight;
      if (left) velocity = -480;
      if (right) velocity = 480;
    }
    this.player.setVelocityX(velocity);
    this.player.setAngle(Phaser.Math.Clamp(velocity / 58, -8, 8));
  }

  private updateEntities() {
    const clean = (group: Phaser.Physics.Arcade.Group, top: number, bottom: number) => {
      group.children.forEach((child) => {
        const sprite = child as Ship;
        if (sprite.active && (sprite.y < top || sprite.y > bottom || sprite.x < -90 || sprite.x > GAME_WIDTH + 90)) {
          sprite.disableBody(true, true);
        }
      });
    };
    clean(this.playerBullets, -80, GAME_HEIGHT + 90);
    clean(this.enemyBullets, -80, GAME_HEIGHT + 80);
    clean(this.enemies, -80, GAME_HEIGHT + 90);
    clean(this.pickups, -80, GAME_HEIGHT + 90);
    this.enemyBullets.children.forEach((child) => {
      const bullet = child as Ship;
      if (bullet.active && bullet.getData("tracking")) this.steerEnemyBullet(bullet, 300);
    });
    this.enemies.children.forEach((child) => {
      const enemy = child as Ship;
      if (!enemy.active) return;
      enemy.setVelocityX((enemy.getData("drift") as number) * 95);
    });
  }

  private firePlayerBullet() {
    const bullet = this.playerBullets.get(this.player.x, this.player.y - 48, "player-bullet") as Ship | null;
    if (!bullet) return;
    bullet.enableBody(true, this.player.x, this.player.y - 48, true, true);
    bullet.setDisplaySize(12, 28).setVelocityY(-760).setDepth(9);
    bullet.body?.setSize(10, 22, true);
  }

  private spawnEnemy(x = Phaser.Math.Between(150, GAME_WIDTH - 150), startY = -70, forcedElite?: boolean) {
    if (this.ended) return;
    const key = this.textures.exists("enemy-drone") ? "enemy-drone" : "blast";
    const elite = forcedElite ?? Phaser.Math.Between(0, 7) === 0;
    const enemy = this.enemies.get(x, startY, key) as Ship | null;
    if (!enemy) return;
    enemy.enableBody(true, x, startY, true, true);
    const size = elite ? 82 : 64;
    enemy.setDisplaySize(size, size).setVelocityY(elite ? 125 : Phaser.Math.Between(180, 260)).setDepth(8);
    enemy.setDataEnabled();
    enemy.setData({ hp: elite ? 3 : 1, elite, drift: Phaser.Math.FloatBetween(-0.55, 0.55) });
    enemy.body?.setSize(size * 0.65, size * 0.65, true);
    if (elite) enemy.setTint(0xffcc86);
    else enemy.setTint(0xff866f);
  }

  private fireEnemyVolley() {
    if (this.ended) return;
    let volleyDelay = 0;
    this.enemies.children.forEach((child) => {
      const enemy = child as Ship;
      if (!enemy.active || enemy.y < 40 || enemy.y > GAME_HEIGHT - 80) return;
      this.time.delayedCall(volleyDelay, () => this.fireEnemyBullet(enemy));
      volleyDelay += 110;
    });
  }

  private fireEnemyBullet(enemy: Ship) {
    if (this.ended || !enemy.active) return;
    const bullet = this.enemyBullets.get(enemy.x, enemy.y + 36, "enemy-bullet") as Ship | null;
    if (!bullet) return;
    bullet.enableBody(true, enemy.x, enemy.y + 36, true, true);
    bullet.setDisplaySize(14, 14).setDepth(7);
    bullet.setDataEnabled();
    bullet.setData("tracking", true);
    bullet.body?.setSize(12, 12, true);
    this.steerEnemyBullet(bullet, 300);
  }

  private steerEnemyBullet(bullet: Ship, speed: number) {
    const angle = Phaser.Math.Angle.Between(bullet.x, bullet.y, this.player.x, this.player.y);
    bullet.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  private spawnShield() {
    if (this.ended || this.armor >= 3) return;
    const shield = this.pickups.get(Phaser.Math.Between(160, GAME_WIDTH - 160), -30, "shield") as Ship | null;
    if (!shield) return;
    shield.enableBody(true, shield.x, -30, true, true);
    shield.setDisplaySize(38, 38).setVelocityY(140).setDepth(8);
    shield.body?.setSize(30, 30, true);
    this.tweens.add({ targets: shield, angle: 360, duration: 1500, repeat: -1 });
  }

  private onBulletHitEnemy(bulletObj: unknown, enemyObj: unknown) {
    const bullet = bulletObj as Ship;
    const enemy = enemyObj as Ship;
    if (!bullet.active || !enemy.active) return;
    bullet.disableBody(true, true);
    const hp = (enemy.getData("hp") as number) - 1;
    enemy.setData("hp", hp);
    if (hp > 0) {
      this.tweens.add({ targets: enemy, alpha: 0.35, duration: 70, yoyo: true });
      return;
    }
    const points = enemy.getData("elite") ? 550 : 100;
    this.score += points * Math.max(1, Math.floor(this.combo / 5) + 1);
    this.combo += 1;
    this.explode(enemy.x, enemy.y);
    enemy.disableBody(true, true);
    this.updateHud();
  }

  private onPlayerHit(first: unknown, second: unknown) {
    const other = first === this.player ? second as Ship : first as Ship;
    if (this.invulnerable || this.ended) return;
    if (other.active) other.disableBody(true, true);
    this.armor -= 1;
    this.combo = 0;
    this.invulnerable = true;
    this.cameras.main.shake(120, 0.006);
    this.tweens.add({ targets: this.player, alpha: 0.2, duration: 90, yoyo: true, repeat: 5, onComplete: () => { this.player.setAlpha(1); this.invulnerable = false; } });
    this.updateHud();
    if (this.armor <= 0) this.endMission();
  }

  private onPickup(pickupObj: unknown) {
    const pickup = pickupObj as Ship;
    if (!pickup.active || this.ended) return;
    pickup.disableBody(true, true);
    this.armor = Math.min(3, this.armor + 1);
    this.score += 180;
    this.statusText.setText("ION SHIELD RESTORED");
    this.time.delayedCall(1300, () => { if (!this.ended) this.statusText.setText(""); });
    this.updateHud();
  }

  private explode(x: number, y: number) {
    const blast = this.add.image(x, y, "blast").setDepth(14).setDisplaySize(30, 30);
    this.tweens.add({ targets: blast, scale: 2.4, alpha: 0, duration: 220, ease: "Sine.Out", onComplete: () => blast.destroy() });
  }

  private updateHud() {
    const scoreString = Math.max(0, this.score).toString().padStart(6, "0");
    this.scoreText.setText(scoreString.replace(/\B(?=(\d{3})+(?!\d))/g, " "));
    this.comboText.setText(`× ${this.combo}`);
    this.armorPips.forEach((pip, index) => pip.setFillStyle(index < this.armor ? 0xffb43d : 0x39545a, index < this.armor ? 1 : 0.7));
  }

  private togglePause() {
    if (this.ended) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.tweens.pauseAll();
      if (this.spawnTimer) this.spawnTimer.paused = true;
      if (this.enemyShotTimer) this.enemyShotTimer.paused = true;
      if (this.shieldTimer) this.shieldTimer.paused = true;
      this.pauseLabel.setText("[ P ] 继续");
      this.statusText.setText("MISSION PAUSED");
    } else {
      this.physics.resume();
      this.tweens.resumeAll();
      if (this.spawnTimer) this.spawnTimer.paused = false;
      if (this.enemyShotTimer) this.enemyShotTimer.paused = false;
      if (this.shieldTimer) this.shieldTimer.paused = false;
      this.pauseLabel.setText("[ P ] 暂停");
      this.statusText.setText("");
    }
  }

  private endMission() {
    this.ended = true;
    this.player.setVelocity(0, 0).setAlpha(0.45);
    this.spawnTimer?.remove(false);
    this.enemyShotTimer?.remove(false);
    this.shieldTimer?.remove(false);
    const overlay = this.add.container(GAME_WIDTH / 2, GAME_HEIGHT / 2).setDepth(50);
    const veil = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x031017, 0.76);
    const title = this.add.text(0, -80, "AIRFRAME LOST", { fontFamily: "Barlow Condensed, sans-serif", fontSize: "64px", fontStyle: "bold italic", color: "#FFF3D4", letterSpacing: 3 }).setOrigin(0.5);
    const score = this.add.text(0, -11, `FINAL SCORE  ${this.score.toString().padStart(6, "0")}`, { fontFamily: "IBM Plex Mono, monospace", fontSize: "22px", color: "#44F5D6" }).setOrigin(0.5);
    const prompt = this.add.text(0, 43, "任务重启：把这一次飞得更深。", { fontFamily: "Noto Sans SC, sans-serif", fontSize: "18px", color: "#C3D8D7" }).setOrigin(0.5);
    const button = this.add.text(0, 119, "[ ENTER ] 重新起飞", { fontFamily: "IBM Plex Mono, monospace", fontSize: "20px", fontStyle: "bold", color: "#08222A", backgroundColor: "#FFB43D", padding: { x: 26, y: 14 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    overlay.add([veil, title, score, prompt, button]);
    const restart = () => this.scene.restart();
    button.on("pointerdown", restart);
    this.input.keyboard?.once("keydown-ENTER", restart);
    this.input.keyboard?.once("keydown-SPACE", restart);
  }

  private handleShutdown() {
    if (this.pauseHandler) this.input.keyboard?.off("keydown-P", this.pauseHandler);
    this.pauseHandler = undefined;
    this.spawnTimer?.remove(false);
    this.enemyShotTimer?.remove(false);
    this.shieldTimer?.remove(false);
    this.tweens.killAll();
  }
}

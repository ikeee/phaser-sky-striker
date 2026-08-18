/**
 * 程序化音效：使用 Web Audio 合成短促音效。
 * 无外部音频资源、无许可问题、完全离线可用，契合项目"程序化运行时资产"理念。
 * 遵循浏览器自动播放策略：必须等首次用户手势后调用 unlockAudio() 解锁。
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

const ACtor =
  typeof window !== "undefined"
    ? window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : undefined;

export function unlockAudio(): void {
  if (!ACtor) return;
  if (!ctx) {
    ctx = new ACtor();
    master = ctx.createGain();
    master.gain.value = 0.5;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master) master.gain.value = m ? 0 : 0.5;
}

export function isMuted(): boolean {
  return muted;
}

interface ToneOpts {
  freq: number;
  endFreq?: number;
  type?: OscillatorType;
  duration?: number;
  volume?: number;
  delay?: number;
}

function tone(opts: ToneOpts): void {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const dur = opts.duration ?? 0.1;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type ?? "square";
  osc.frequency.setValueAtTime(opts.freq, t0);
  if (opts.endFreq) osc.frequency.exponentialRampToValueAtTime(opts.endFreq, t0 + dur);
  gain.gain.setValueAtTime(opts.volume ?? 0.2, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain);
  gain.connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.03);
}

function noise(opts: { duration?: number; volume?: number; freq?: number; delay?: number }): void {
  if (!ctx || !master || muted) return;
  const t0 = ctx.currentTime + (opts.delay ?? 0);
  const dur = opts.duration ?? 0.2;
  const buffer = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(opts.freq ?? 1200, t0);
  filter.frequency.exponentialRampToValueAtTime((opts.freq ?? 1200) * 0.25, t0 + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(opts.volume ?? 0.3, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.03);
}

export const sfx = {
  /** 玩家开火：短促下降方波。 */
  fire(): void {
    tone({ freq: 880, endFreq: 240, type: "square", duration: 0.07, volume: 0.1 });
  },
  /** 普通敌机击落：噪声爆裂 + 低频下滑。 */
  enemyDown(): void {
    noise({ duration: 0.22, freq: 1100, volume: 0.22 });
    tone({ freq: 220, endFreq: 60, type: "sawtooth", duration: 0.18, volume: 0.14 });
  },
  /** 精英敌机击落：更响、更长的爆裂。 */
  eliteDown(): void {
    noise({ duration: 0.4, freq: 1500, volume: 0.26 });
    tone({ freq: 320, endFreq: 48, type: "sawtooth", duration: 0.34, volume: 0.18 });
  },
  /** 玩家受击：低频闷响。 */
  playerHit(): void {
    tone({ freq: 130, endFreq: 42, type: "sawtooth", duration: 0.3, volume: 0.26 });
    noise({ duration: 0.16, freq: 520, volume: 0.18 });
  },
  /** 护盾拾取：上行三音琶音。 */
  shield(): void {
    [660, 880, 1320].forEach((f, i) =>
      tone({ freq: f, type: "triangle", duration: 0.12, volume: 0.16, delay: i * 0.07 }),
    );
  },
  /** 任务失败：下行四音。 */
  gameOver(): void {
    [392, 330, 262, 196].forEach((f, i) =>
      tone({ freq: f, type: "sawtooth", duration: 0.32, volume: 0.18, delay: i * 0.22 }),
    );
  },
  /** UI 点击。 */
  uiClick(): void {
    tone({ freq: 520, endFreq: 800, type: "triangle", duration: 0.06, volume: 0.13 });
  },
};

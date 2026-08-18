/**
 * 波次配置（数据驱动，教学可编辑）。
 *
 * 每个波次是一组「生成队列」：
 * - kind: "normal" 普通敌机 / "elite" 精英敌机（更慢、更耐久、扇形弹幕）
 * - count: 本组数量
 * - interval: 同组相邻敌机的生成间隔（毫秒）
 * - delay: 相对波次开始的延时（毫秒）
 *
 * 定义 6 个波次后进入无尽循环：第 N 次循环会把每组 count +2、interval 加快 60ms。
 * 学生改这里的数字即可调整难度，这就是"数据驱动设计"的教学点。
 */

export interface WaveGroup {
  kind: "normal" | "elite";
  count: number;
  interval: number;
  delay: number;
}

export const WAVES: WaveGroup[][] = [
  // W1：热身
  [{ kind: "normal", count: 6, interval: 900, delay: 0 }],

  // W2：引入精英
  [
    { kind: "normal", count: 8, interval: 800, delay: 0 },
    { kind: "elite", count: 1, interval: 0, delay: 4000 },
  ],

  // W3：双精英
  [
    { kind: "normal", count: 10, interval: 700, delay: 0 },
    { kind: "elite", count: 2, interval: 2600, delay: 2000 },
  ],

  // W4：密度上升
  [
    { kind: "normal", count: 12, interval: 620, delay: 0 },
    { kind: "elite", count: 3, interval: 1800, delay: 1500 },
  ],

  // W5：压力测试
  [
    { kind: "normal", count: 10, interval: 520, delay: 0 },
    { kind: "elite", count: 4, interval: 1400, delay: 1000 },
  ],

  // W6：混合风暴（此后循环加强）
  [
    { kind: "normal", count: 12, interval: 460, delay: 0 },
    { kind: "elite", count: 5, interval: 1200, delay: 800 },
  ],
];

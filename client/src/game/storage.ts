/**
 * 本地持久化（localStorage，无后端）：
 * - 最高分：仅存更大的值，重开有复玩动机。
 * - 简易成就：每个成就只解锁一次，浏览器维度持久。
 */

const HS_KEY = "sky-striker-highscore";
const ACH_KEY = "sky-striker-achievements";

export function getHighScore(): number {
  try {
    const v = Number(localStorage.getItem(HS_KEY) ?? 0);
    return Number.isFinite(v) && v > 0 ? v : 0;
  } catch {
    return 0;
  }
}

/** 返回是否刷新了纪录。 */
export function setHighScore(score: number): boolean {
  if (score <= getHighScore()) return false;
  try {
    localStorage.setItem(HS_KEY, String(score));
    return true;
  } catch {
    return false;
  }
}

export const ACHIEVEMENTS = {
  firstKill: "首个击杀",
  combo5: "连击 ×5",
  firstWave: "首次清波",
  fullArmor: "满甲修复",
} as const;

export type AchievementId = keyof typeof ACHIEVEMENTS;

/** 返回是否首次解锁（用于只在第一次弹出提示）。 */
export function unlockAchievement(id: AchievementId): boolean {
  try {
    const done = new Set<string>(JSON.parse(localStorage.getItem(ACH_KEY) ?? "[]") as string[]);
    if (done.has(id)) return false;
    done.add(id);
    localStorage.setItem(ACH_KEY, JSON.stringify(Array.from(done)));
    return true;
  } catch {
    return false;
  }
}

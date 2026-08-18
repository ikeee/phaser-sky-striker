# Sky Striker 版本信息

| 字段 | 内容 |
|---|---|
| 当前版本 | **v0.01** |
| 交接基线 | Manus 项目版本 `2b751b0c` |
| 交付时间 | 2026-08-18（GMT+8） |
| 技术栈 | Phaser 4.2.1、React 19、TypeScript、Vite 7、Tailwind 4 |
| 运行形态 | 单人、纯浏览器端、16:9 横屏街机射击游戏 |

## 已实现功能

玩家可使用方向键、WASD 或横屏触控控制器进行四向机动，并持续自动开火。普通与精英敌机会生成、横向漂移并以错峰瞄准弹反击；双方弹体、敌机和拾取物都通过 Arcade Physics 组复用。游戏实现了得分、连击、装甲、护盾拾取、完整暂停、程序化音效（M 键静音开关）、死亡结算、无刷新重开和 `?demo=1` 自动演示。菜单、项目内本地 PNG、雷暴背景、程序化雨线、切角航电 HUD、品牌图标和竖屏横置提示均已完成。

## 未完成项

当前版本尚未包含音效或音乐、精英敌机的独立弹幕模式、武器升级、关卡波次、存档、排行榜、账号系统、可访问性设置或原生平台打包。相关技术债和已知限制见 `KNOWN_ISSUES.md`。

## v0.02（本地整合，2026-08-18）

- 将 Manus 交接包（`sky-striker`）整体平移到仓库根，成为可直接运行的项目；godogen 流程
  参考文档移入 `docs/pipeline/`，交接包 zip 与需求文档归档至 `archive/`（不入库）。
- 修复（详见 `KNOWN_ISSUES.md` 本地验收补丁）：
  - K-13（严重，交接包回归）：玩家子弹越界回收边界错误，导致射击失效，已修复并实测。
  - K-01：暂停键监听清理改为订阅 `Phaser.Scenes.Events.SHUTDOWN` 事件（原 `shutdown()`
    方法不会被 Phaser 调用，属死代码）。
  - K-12：移除 `client/index.html` 中 Manus 模板残留的 umami 占位脚本。
- 变更：`client/src/game/game.ts` 增加 DEV 调试钩子 `window.__skyStriker`；README 补充
  pnpm 版本注意事项。
- 环境：安装依赖统一使用 `corepack pnpm install --frozen-lockfile`（pnpm 10.4.1）。

## v0.02.1（2026-08-18）

- K-15 已修复：`?demo=1` 演示模式免伤（`onPlayerHit` 在 autoPilot 下直接返回），玩家机
  幽灵穿过敌方弹/敌机，不掉甲、不死亡，可稳定产出长时战斗截图。实测运行 22 秒仍 `ended=false`。

## v0.02.2（2026-08-18）

- 新增四向移动：键盘 ↑↓/W/S 加入上下机动；触控改为左侧 ◀▶（横向）、右侧 ▲▼（纵向）；
  demo 自动驾驶加入轻微上下漂移。
- 新增程序化音效（`client/src/game/audio.ts`，Web Audio 合成，无外部资源）：开火、敌机
  爆炸（普通/精英）、受击、护盾拾取、结算、UI 点击；首次手势解锁，M 键静音开关。

## v0.02.3（2026-08-18）

- 清理 Manus 模板残留：
  - `vite.config.ts`：移除三个 Manus 插件（ManusRuntime / DebugCollector /
    StorageProxy）、Manus allowedHosts、`@assets`/`@shared` 别名（对应目录不存在或已删）。
  - 删除：`vite-plugin-manus-runtime` 依赖、`client/public/__manus__/`、
    `ManusDialog.tsx`（无引用）、`const.ts`（模板 OAuth 代码，无引用）、`shared/`、
    `template.json`、`.project-config.json`、`.manus/`、`.manus-logs/`。
- 验证：`pnpm check` / `pnpm build` 通过；`?demo=1` 实测战斗正常，console 0 错误 0 警告。

## v0.03（2026-08-18）

- 新增 **JSON 数据驱动波次系统**（`client/src/game/waves.ts`）：6 个定义波次 + 无尽循环
  加强；清波奖励分、HUD 显示 WAVE 编号、自动推进。
- 敌弹改造：普通敌弹改"发射瞬间瞄准直射"（经典 STG 设计，替代连续追踪）；**精英机 5 发
  扇形弹幕**（±20°、略慢）。
- 敌机漂移改**真正弦摆动航线**（沿生成点横向往返），与 PLAN 声明的"摆动"一致。
- 验证：`?demo=1` 实测 42 秒推进到 WAVE 04、清波奖励生效、精英扇形弹幕发射角正确；
  `pnpm check` / `pnpm build` 通过。

## v0.04（2026-08-18）

- 程序化 **BGM**：`audio.ts` 音序器（Am-F-C-G 循环、低音+琶音），随首次手势解锁启动，
  M 键静音一并生效。
- **localStorage 最高分**（HUD 显示 HI，结算页 NEW RECORD / HIGH SCORE）与**简易成就**
  （首个击杀 / 连击×5 / 首次清波 / 满甲修复，首次解锁提示，浏览器维度持久）。
- **URL 教学调参**：`?wave=&speed=&armor=&fire=`（README 已文档化，适合课堂"数据驱动
  设计"实验）。
- **源码瘦身**：删除 49 个未用 shadcn/ui 组件 + 4 个孤儿文件（Map、useComposition、
  useMobile、usePersistFn）；bundle 2018→1978 KB（主要重量仍是 Phaser，瘦身主要是
  源码可读性收益）。
- 验证：`?demo=1&wave=4&armor=9&fire=90` 实测参数全部生效；BGM 随手势启动无报错；
  `pnpm check` / `pnpm build` 通过。

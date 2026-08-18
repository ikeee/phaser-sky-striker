# Sky Striker 缺陷与限制清单

**版本：** v0.01  
**更新时间：** 2026-08-18（GMT+8）

本文合并了交接请求中的本地审查项与当前项目维护视角。优先级遵循 P0（阻断运行）、P1（影响核心体验或维护）、P2（体验增强或技术债）。

## 已修复项

| ID | 来源 | 原优先级 | 状态 | 处理结果 |
|---|---|---|---|---|
| K-01 | 本地审查 | P1 | 已修复 | 暂停键监听保存为 `pauseHandler`，在 `shutdown()` 中使用 `off` 精确解除；不再调用会影响其他订阅的 `removeAllListeners()`。 |
| K-02 | 本地审查 | P1 | 已修复 | 敌机的 `drift` 数据已在 `updateEntities()` 转化为横向速度，普通与精英机均会偏移航线。 |
| K-03 | 本地审查 | P1 | 已修复 | `togglePause()` 同时暂停/恢复 Physics、三个游戏计时器和 Phaser Tween 管理器。 |
| K-04 | 本地审查 | P2 | 已修复 | 敌方弹体以有限速度持续朝玩家转向；该行为是可躲避的轻度瞄准，不是不可规避的瞬时锁定。 |
| K-05 | 本地审查 | P2 | 已修复 | 得分格式改为通用千位分组，七位及以上分数保持可读。 |
| K-08 | 项目范围 | P2 | 部分改善 | 敌机齐射改为 110ms 错峰发射；扇形、分波和 Boss 弹幕仍未实现。 |

## 当前限制与待办

| ID | 优先级 | 状态 | 说明与建议 |
|---|---|---|---|
| K-06 | P2 | 已知限制 | 无音效或音乐。接入时须在首次用户手势后解锁浏览器音频，并在暂停/重开时处理声音状态。 |
| K-07 | P2 | 已知限制 | 项目是浏览器横屏版本；竖屏仅显示横置提示，不含原生桌面或移动端打包。 |
| K-09 | P2 | 待办 | 精英敌机只增加生命与尺寸，尚无独立走位或弹幕识别。建议先做一种扇形弹幕并为其添加明确的暖色预警。 |
| K-10 | P2 | 已知限制 | Google Fonts 通过网络加载；离线环境会回退到系统字体，但游戏仍可运行。若需要完全离线视觉一致性，应将字体文件自托管。 |
| K-11 | P2 | 待办 | 生产 JavaScript 包约 2.2 MB（gzip 约 547 KB），主要来自模板依赖与 Phaser。若需优化首屏，清理未使用模板依赖或实施按场景拆包。 |

## 推荐的 v0.02 顺序

先实现 K-09 的精英弹幕与预警，再接入 K-06 的用户手势解锁音频，最后根据发布目标决定是否处理 K-10 和 K-11。每次修改都应执行 `pnpm check`、`pnpm build`，并在 `?demo=1` 下验证不出现纹理、销毁或控制台错误。

---

## 本地验收补丁（2026-08-18，Codex 在本地复验后追加）

在干净本地环境完成 `pnpm install --frozen-lockfile`、`pnpm check`、`pnpm build`
并通过浏览器实测后，追加以下记录。验证方式：`pnpm dev` + `?demo=1`，
通过开发环境暴露的 `window.__skyStriker.game` 直接读取场景状态（弹体数量/位置、
分数/连击/暂停态），比截图更可靠。

| ID | 原状态 | 结论与处理 |
|---|---|---|
| K-01 | 声称已修复 | **实际未生效，已真正修复。** Phaser 4.2.1 不会自动调用场景类上名为 `shutdown()` 的方法（`Systems.shutdown()` 只 emit `SHUTDOWN` 事件）。原修复把解绑写在 `shutdown()` 里属于死代码，重开后 P 键仍会叠加监听。已改为 `this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.handleShutdown, this)`，重开后按 P 实测可正常暂停/恢复。 |
| K-13（新增·严重） | 交接包回归 | **玩家子弹被立即回收，射击失效。** 交接包把 `clean()` 的 `limit` 参数改为下半界后，`clean(this.playerBullets, -60)` 使 `sprite.y > -60` 对创建于 y≈552 的子弹恒真，子弹约 1 帧后被禁用。实测 `?demo=1` 运行 6 秒：`activeBullets=0`、`score=0`、`combo=0`。已改为显式上下界 `clean(this.playerBullets, -80, GAME_HEIGHT + 90)`，实测子弹正常推进至顶部回收、击杀与计分正常。 |
| K-12（新增） | Manus 模板残留 | `client/index.html` 中的 `%VITE_ANALYTICS_ENDPOINT%/umami` 脚本占位导致 404 与控制台报错，已移除；修复后 console 0 错误 0 警告。 |
| K-15（v0.02.1 已修复） | 演示模式局限 | `?demo=1` 原约 5 秒被击落、长截图变 Game Over。已在 `onPlayerHit()` 顶部加 `if (this.autoPilot) return;`：demo 模式下玩家机幽灵穿过敌方弹/敌机，不掉甲、不结算。实测运行 22 秒仍在战斗（`ended=false`、`armor=3`、`score=400`）。 |
| 调试钩子（新增） | 开发辅助 | `client/src/game/game.ts` 在 `import.meta.env.DEV` 下暴露 `window.__skyStriker`，生产构建不含。便于未来自动化状态回归（弹体、分数、暂停态），若不需要可删除。 |

> 技术依据：Phaser 官方仓库 [phaserjs/phaser](https://github.com/phaserjs/phaser)，
> `src/scene/Systems.js` 的 `shutdown()` 仅 `events.emit(Events.SHUTDOWN)`；场景文档明确
> 用 `this.events.on('shutdown', listener)` 监听。

## v0.02.1（2026-08-18）

- K-15 已修复：demo 模式免伤（见上表）。`?demo=1` 现在可稳定产出长时战斗截图。

# Runtime Structure

Sky Striker 使用 React 仅承载页面、字体和 Phaser 生命周期；战斗规则、场景、输入、资源与 HUD 都归属于 `client/src/game/`。这样可避免 React 渲染周期干扰每帧游戏更新，同时让场景能独立管理计时器、物理组和销毁流程。

| 模块 | 所有权与职责 |
|---|---|
| `components/GameCanvas.tsx` | 创建并销毁唯一 `Phaser.Game` 实例，传递 `?demo` 自动演示参数，并在窗口尺寸变化时执行缩放。 |
| `game/game.ts` | 提供固定 16:9、Arcade Physics 与场景列表的 Phaser 配置。 |
| `game/scenes/BootScene.ts` | 预载生成资产，并建立程序化子弹、护盾、雨线与爆炸纹理。 |
| `game/scenes/MenuScene.ts` | 绘制品牌化开始屏，管理“开始任务”按钮、键盘入口与演示模式自动启动。 |
| `game/scenes/BattleScene.ts` | 拥有玩家、敌机、子弹对象池、生成计时器、碰撞、得分、装甲、暂停与结算状态。 |

## State Model

`MenuScene` 和 `BattleScene` 是互斥的顶层状态。战斗场景内部只维护 `active`、`paused` 和 `ended` 三种模式：`active` 接收移动并进行生成/碰撞；`paused` 冻结物理系统和计时器；`ended` 停止生成，锁定输入并显示重启入口。`?demo` 不改变规则，只用确定性横向飞行替代玩家输入，以便画面验证时稳定展示真实对象与战斗反馈。

## Asset Hints

`storm_background` 绘制为两张满屏背景交替下移；`player_interceptor`、`enemy_drone` 与 `sky_striker_mark` 从 `client/public/assets/` 以 `/assets/` 本地路径加载。程序化资源仅用于高频、小尺寸、具备明确几何形状的对象：子弹、护盾、爆炸与雨线。详见 `ASSETS.md`。

## Verification Contract

`pnpm check` 负责静态类型检查。运行时通过 WebDev 预览的 `?demo` 截图验证：屏幕应显示雷暴背景、玩家机、敌机、双向弹体和可读 HUD；随后检查浏览器控制台，确保没有缺失资源或对象销毁错误。

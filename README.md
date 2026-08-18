# Sky Striker（赤道雷暴行动）

Sky Striker 是一款使用 **Phaser 4.2.1**、React 19、TypeScript 和 Vite 构建的浏览器端 2D 纵向飞机射击游戏。React 只负责承载和销毁一个全屏 Phaser 画布；所有战斗循环、对象池、碰撞、输入和 HUD 都位于 `client/src/game/`。

## 环境要求

建议使用 **Node.js 22.x** 与 **pnpm 10.x**。项目包含 `pnpm-lock.yaml`，请使用 pnpm 安装依赖，不要混用 npm 或 yarn。项目是纯浏览器端应用，不需要数据库、密钥、第三方 API 。

> **pnpm 版本注意事项**：lockfile 由 pnpm 10 生成（`packageManager` 固定为 `pnpm@10.4.1`）。
> **安装依赖请使用 `corepack pnpm install --frozen-lockfile`**（corepack 会自动使用 10.4.1）。
> 若本机全局 pnpm 为 11 以上，`pnpm dev / check / build` 均可直接使用；但 `pnpm install`
> 会因 pnpm 11 不再读取 package.json 中 `pnpm` 字段（overrides/patchedDependencies 已迁移
> 到 pnpm-workspace.yaml）而报配置不匹配，因此**安装务必走 corepack pnpm**。

## 安装与启动

在项目根目录执行：

```bash
corepack enable
pnpm install
pnpm dev
```

Vite 会在终端输出本地访问地址，固定为 `http://localhost:5173/`。点击“锁定航线”或按 Enter 即可进入战斗。

要验证可重复的真实战斗画面，请访问：

```text
http://localhost:5173/?demo=1
```

`?demo=1` 会自动进入战斗、让玩家机沿确定性横向轨迹移动，并预置一组敌机。它用于截图、视觉回归和快速确认本地资产、对象池与战斗 HUD 均已加载。

## 常用命令

| 命令 | 用途 |
|---|---|
| `pnpm dev` | 启动 Vite 开发服务器和热更新。 |
| `pnpm check` | 执行 TypeScript 静态类型检查。 |
| `pnpm build` | 生成生产构建到 `dist/`。 |
| `pnpm preview` | 预览 Vite 生产构建。 |
| `pnpm start` | 在先执行 `pnpm build` 后启动打包的静态服务。 |
| `pnpm format` | 使用 Prettier 格式化项目文件。 |

## 开发调试钩子（可选）

`client/src/game/game.ts` 在开发环境（`import.meta.env.DEV`）下暴露 `window.__skyStriker`，
便于通过浏览器控制台直接读取 Phaser 场景状态（弹体数量/位置、分数、暂停态等）做状态级
回归验证，比截图更可靠。生产构建不包含该代码。

## 教学调参（URL 参数）

在访问地址后附加参数即可调整难度，适合课堂实验"数据驱动设计"：

| 参数 | 作用 | 示例 |
|---|---|---|
| `?wave=N` | 从第 N 波开始 | `?wave=4` |
| `?speed=X` | 敌机下落速度倍率 | `?speed=1.5` |
| `?armor=N` | 玩家装甲数（1-9） | `?armor=9` |
| `?fire=ms` | 开火间隔（毫秒，默认 180） | `?fire=90` |

组合示例：`http://localhost:5173/?demo=1&wave=4&speed=1.5&armor=9&fire=90`

另有最高分（localStorage，HUD 显示 HI）与简易成就（首个击杀/连击×5/首次清波/满甲修复）。

## 目录结构

```text
client/
  public/assets/                 # 四张离线运行所需的 PNG
  src/
    components/GameCanvas.tsx    # 唯一 Phaser 实例的 React 生命周期容器
    game/game.ts                 # GAME_WIDTH、GAME_HEIGHT、Phaser 配置与场景注册
    game/scenes/BootScene.ts     # 图片预载与程序化纹理
    game/scenes/MenuScene.ts     # 开始界面和演示模式入口
    game/scenes/BattleScene.ts   # 战斗、对象池、碰撞、HUD、暂停、结算
    App.tsx                      # 只渲染 GameCanvas
    main.tsx                     # React 挂载入口
```

更详细的资源规格在 `ASSETS.md`，风险拆解与验收标准在 `PLAN.md`，架构约定在 `STRUCTURE.md`，制作过程在 `DEVELOPMENT_WORKFLOW.md`，已知问题和交接结论在 `KNOWN_ISSUES.md`。

## 本地资产

游戏默认读取 `client/public/assets/` 下的四张 PNG，因此本地运行不依赖 Manus 托管 URL。请保留文件名不变；替换素材时，同步检查 `ASSETS.md` 的显示尺寸、哈希、视觉对比度和 `BootScene.ts` 的加载 key。

## 限制与边界

项目是纯浏览器运行版本，未包含原生桌面、iOS 或 Android 打包流程。竖屏窄设备会提示横置使用，以确保 16:9 战场、HUD 与触控方向控制保持可读。当前没有音频；未来接入浏览器音频时必须在首次用户手势后解锁播放。完整限制、已知问题和后续方向见 `KNOWN_ISSUES.md`。

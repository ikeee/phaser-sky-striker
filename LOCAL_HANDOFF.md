# Sky Striker 本地开发交接说明

## 交接内容与版本

本地交接包对应 **v0.01**，以 Manus 项目版本 **`2b751b0c`** 为基线。项目为 Phaser 4.2.1、React 19、TypeScript、Vite 7 与 Tailwind 4 的浏览器游戏。源代码、锁文件、项目内本地 PNG、设计决策、资产表、架构文档、工作流程记录、版本信息和缺陷清单均包含在交接包内；`node_modules`、`dist`、Git 元数据和运行日志被有意排除，以使交接文件保持轻量和可复现。

| 内容 | 位置 | 用途 |
|---|---|---|
| 游戏源代码 | `sky-striker/client/src/` | React 容器、Phaser 配置和三个游戏场景。 |
| 运行配置 | `sky-striker/package.json`、`pnpm-lock.yaml`、`vite.config.ts` | 锁定依赖与开发/构建脚本。 |
| 本地素材 | `sky-striker/client/public/assets/` | 雷暴背景、玩家机、敌机与品牌图标的运行时 PNG。 |
| 资产规范 | `sky-striker/ASSETS.md` | 资产的设计职责、显示尺寸与托管路径。 |
| 设计决策 | `sky-striker/ideas.md` | 视觉方向、色彩、HUD 语言与交互规范。 |
| 项目架构 | `sky-striker/STRUCTURE.md` | 场景职责、状态模型与验证契约。 |
| 开发流程 | `sky-striker/DEVELOPMENT_WORKFLOW.md`、`PLAN.md`、`MEMORY.md`、`KNOWN_ISSUES.md` | 开发顺序、风险控制、验证结果、缺陷与后续注意事项。 |

## 环境要求

建议使用 **Node.js 22** 与 **pnpm 10**。包内含 `pnpm-lock.yaml`，因此应优先使用 pnpm，而不要混用 npm 或 yarn。Windows、macOS 和 Linux 均可运行；游戏是纯浏览器端项目，不要求数据库、密钥、后端服务或第三方账号。

## 首次启动

将交接包解压到本地后，在终端进入 `sky-striker` 目录并执行：

```bash
corepack enable
pnpm install --frozen-lockfile
```

素材已在项目的运行时静态目录中，不需要额外下载、复制或设置环境变量：

```bash
pnpm dev
```

Vite 会输出本地地址，固定为 `http://localhost:5173/`（与本地 Nuxt 的 3000 端口隔离）。进入首页后，点击“锁定航线”或按 Enter 开始任务。若要直接观察可重复的真实战斗画面，可访问 `http://localhost:5173/?demo=1`；该模式会自动进入战斗、以固定轨迹操控玩家机，并预置敌机编队，适合截图或视觉回归检查。

> `BootScene` 默认从 `/assets/` 载入项目内 PNG。项目不再依赖已发布网页或任何 Manus 托管资源 URL。

## 常用命令

| 目的 | 命令 | 说明 |
|---|---|---|
| 本地开发 | `pnpm dev` | 启动 Vite 开发服务器，支持热更新。 |
| 类型检查 | `pnpm check` | 运行 TypeScript 严格检查。 |
| 生产构建 | `pnpm build` | 生成 `dist/` 并打包启动文件。 |
| 本地预览构建 | `pnpm preview` | 预览 Vite 构建产物。 |
| 启动生产包 | `pnpm start` | 在执行 `pnpm build` 后运行 Express 静态服务。 |
| 代码格式化 | `pnpm format` | 使用项目内 Prettier 格式化文件。 |

## 游戏代码地图

`client/src/components/GameCanvas.tsx` 管理唯一 Phaser 实例、缩放和销毁；React 不管理战斗状态。`client/src/game/game.ts` 定义画布尺寸、Arcade Physics 和场景列表。`BootScene.ts` 预载 PNG 并创建子弹、雨线、护盾和爆炸的程序化纹理。`MenuScene.ts` 绘制主菜单、品牌及启动入口。`BattleScene.ts` 维护玩家、敌机、对象池、碰撞、得分、连击、装甲、暂停和结算重开。

如果新增玩法，优先将实体规则放入 `BattleScene.ts` 的明确方法，而不是在 React 组件内写逐帧逻辑。敌机、子弹与拾取物都应继续使用现有 Arcade Physics 组和禁用/复用模式，避免长时间游玩时无界创建对象。

## 本地资产与发布差异

交接包中的 `client/public/assets/` 已包含四张生成图的可移植副本。若未来替换图片，保持相同文件名，或同步修改 `BootScene.ts` 中 `ASSET_URLS` 的本地路径；具体哈希、显示尺寸、加载 key 和兜底规则请以 `ASSETS.md` 为准。

程序化的玩家子弹、敌方子弹、护盾、爆炸和雨线不需要额外文件：它们在 `BootScene.createProceduralTextures()` 中生成。新视觉资产的尺寸、颜色和可读性要求请对照 `ASSETS.md` 与 `ideas.md`；其中规定青绿属于玩家/正向反馈，暖朱红或琥珀属于敌方威胁。

## 验证基线

交接前已执行 `pnpm check` 与 `pnpm build`，均通过。桌面端 `?demo=1` 截图已经确认雷暴背景、雨线、玩家机、敌机、上行青绿弹体、HUD、切角控制器和暖色威胁识别同时可见。竖屏窄设备会提示横置；横屏下保留触控方向控制器。后续每次改动核心玩法后，至少重做类型检查、生产构建和一次 `?demo=1` 视觉检查。

## 推荐的下一步开发顺序

首先将精英敌机扩展为具有可读扇形弹幕的独立战术目标；然后为护盾或连击系统加入短时火力升级；最后在首次用户交互后接入音效与音乐。每项功能都应先通过 `PLAN.md` 写明碰撞/对象池/可视验证条件，再扩大素材或数值规模。

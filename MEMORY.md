# Development Memory

## 运行时与架构结论

Phaser 4.2.1 可直接作为 React/Vite 项目的运行时，但 React 只应管理 `Phaser.Game` 的创建、缩放与销毁；逐帧规则必须留在场景中。`GameCanvas.tsx` 因此只创建一个实例，`BootScene`、`MenuScene` 和 `BattleScene` 各自管理自己的资源、菜单和战斗状态。React 19 的开发模式可能发生重复挂载，销毁 Phaser 实例与解除窗口事件是必要的生命周期边界。

Arcade Physics 组的 `children` 在当前 Phaser 类型定义中表现为 `Set`；遍历应使用 `forEach`，不应沿用旧示例中的 `children.each`。对象池必须在越界后调用 `disableBody(true, true)`，并通过 `group.get()` 复用对象，否则长局会持续创建弹体与敌机。

## 资产与本地化结论

最初网页使用托管图片 URL，适合 WebDev 预览但不满足独立本地交接。最终版已将四张 PNG 放入 `client/public/assets/`，并在 `BootScene.ts` 中固定使用 `/assets/` 路径；本地 `pnpm install && pnpm dev` 不再依赖 Manus 登录、托管链接或环境变量。程序化的 `rain`、`shield`、`blast`、`player-bullet` 与 `enemy-bullet` 仍由 `BootScene.createProceduralTextures()` 生成，不需要额外文件。

## 已修复的审查项

键盘暂停事件现在保存自己的回调引用，并在 `shutdown()` 精确解除，不再使用影响全局订阅的 `removeAllListeners()`。敌机存储的 `drift` 已进入每帧横向速度；敌方弹改为 110ms 错峰发射并在飞行中持续向玩家进行有限速度的瞄准转向；暂停同时冻结 Physics、计时器和 Tween；分数格式采用可扩展的千位分组，超过六位时仍正常显示。

## 验收记录

在干净副本中删除原有 `node_modules` 后，已执行 `pnpm install --frozen-lockfile`、`pnpm check` 和 `pnpm build`，均通过。随后以独立端口启动 Vite，并请求 `http://127.0.0.1:4317/?demo=1`，返回 HTTP 200。WebDev 预览截图也确认本地 `/assets/` 图片能够呈现雷暴背景、玩家机、敌机、航电 HUD 和触控控制器。

## 后续维护注意事项

如果增加键盘事件，应像暂停事件一样保留回调引用并在场景关闭时单独解除。如果增加敌方弹幕，继续采用对象池和短生命周期；不要在场景关闭后保留延迟回调。若替换 PNG，请保留路径/文件名或同步更新 `BootScene.ts` 和 `ASSETS.md`；在商业发行前，对生成资产与外部字体的权利状态进行最终审查。

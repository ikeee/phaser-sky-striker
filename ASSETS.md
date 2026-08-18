# Sky Striker 资产清单

**版本：** v0.01  
**运行时策略：** 四张生成 PNG 随项目存放在 `client/public/assets/`，由 `BootScene.ts` 通过稳定的本地根路径加载。项目在本地运行、离线开发和生产构建时均不依赖 `/manus-storage/`、Manus 账户或任何临时外部资源链接。

## 艺术方向

游戏采用复古未来主义航空插画与高对比街机 HUD：深海蓝绿的雷暴云层保持低对比，电离青绿只用于玩家和正向反馈，朱红/琥珀用于敌方威胁、能量与警示。所有精灵遵循顶视角、清晰轮廓和小尺寸下可辨识的原则。

## 文件资产

| 资产 ID | 本地文件 | BootScene 加载 key | 显示规格 | 透明底 | SHA-256 | 作用 |
|---|---|---|---|---|---|---|
| `storm_background` | `client/public/assets/storm_background.png` | `storm-background` | 填满 1280×720，纵向循环 | 否 | `91a5497154bb78adfd5ac54118e4f177198b52af5132005ffe6c9c148599aa85` | 雷暴云层和中央航道背景。 |
| `player_interceptor` | `client/public/assets/player_interceptor.png` | `player-interceptor` | 80×80 px | 是 | `bb6ee127bad885eebd71e6f04e053102563c613534fd01e2fdd4c785163fe438` | 玩家拦截机，机头朝上。 |
| `enemy_drone` | `client/public/assets/enemy_drone.png` | `enemy-drone` | 普通 64×64 px；精英 82×82 px | 是 | `0b63e47807e08cb9f09bff915332696c2f0d18f767ffcbd270cbbed1c328e308` | 敌方三角翼无人截击机，机头朝下。 |
| `sky_striker_mark` | `client/public/assets/sky_striker_mark.png` | `sky-striker-mark` | 菜单 74×74 px；移动端品牌图标 40×40 px | 是 | `78d6acfea4daa37c6cef20f2fb0a54c602cb42bb0c6a9cc0bce39f707b05596f` | 无文字三角翼/航迹品牌标记和 favicon。 |

## 程序化纹理

以下纹理无需文件，均由 `BootScene.createProceduralTextures()` 使用 Phaser `Graphics` 创建，并在战斗中由对象池复用。

| 运行时 key | 规格 | 用途 |
|---|---|---|
| `player-bullet` | 16×30 px | 青绿色、向上飞行的玩家能量弹。 |
| `enemy-bullet` | 14×14 px | 琥珀色敌方追踪/瞄准弹。 |
| `shield` | 44×44 px | 琥珀核心与青绿外环的护盾拾取物。 |
| `blast` | 64×64 px | 琥珀、朱红和浅黄组合的短促爆炸。 |
| `rain` | 140×180 px | 斜向低透明雨线，作为滚动覆盖层。 |

## 加载与兜底行为

`BootScene` 使用上表的 key 载入所有 PNG。若任意 PNG 在运行时缺失或加载失败，Phaser 不会创建对应纹理；后续场景通过 `this.textures.exists(key)` 检查并执行以下回退：背景使用 `rain` 程序化纹理，玩家使用 `shield` 纹理，敌机使用 `blast` 纹理，菜单品牌图标使用程序化三角形。该回退只用于保持调试可进入场景；正式交付必须确保四张 PNG 完整存在且哈希匹配。

## 来源与使用说明

四张 PNG 在本项目的制作过程中由 Manus 内置图像生成流程生成，并以原创游戏视觉资产用途记录。它们不包含已知第三方角色、商标或受版权保护作品的复刻元素。交接包随附实际文件和 SHA-256 校验值；在商业发行前，项目维护者仍应根据所使用生成服务在发行时有效的条款进行最终权利和商标审查。

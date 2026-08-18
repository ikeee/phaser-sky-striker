# Assets

**Art direction：** 复古未来主义航空插画与高对比街机 HUD。游戏采用直接俯视的纵向卷轴镜头：深海蓝绿雷暴云层为低对比背景，玩家、生命与正向反馈使用电离青绿，能源与高价值读数使用雷暴琥珀，敌方威胁使用克制的朱红。画面保持锋利的平面层次、细颗粒纹理和明确的对象分离，避免拟真雾化、镜头光晕与不可读的细节。

## Visual Target

| 名称 | 说明 | 显示规格 | 运行时位置 |
|---|---|---|---|
| `sky_striker_reference` | 含玩家、敌机、子弹、护盾和 HUD 的最终画面参考；用于构图与色彩 QA，不在游戏中直接加载。 | 16:9 视觉参考 | `/manus-storage/sky-striker-reference_dd63a738.png` |

## Backgrounds

| 名称 | 说明 | 显示规格 | 运行时位置 |
|---|---|---|---|
| `storm_background` | 带中央航道的深蓝绿色雷暴云海，提供远景云层与雨线质感。 | 填满 1280×720 视口；纵向循环滚动 | `/manus-storage/sky-striker-storm-background_4c9b0839.png` |

## Sprites

| 名称 | 说明 | 显示规格 | 运行时位置 |
|---|---|---|---|
| `player_interceptor` | 青绿色紧凑型拦截机，机头朝上；用于玩家实体。 | 80×80 px | `/manus-storage/sky-striker-player-interceptor_7e971a3d.png` |
| `enemy_drone` | 暗色三角翼无人截击机，机头朝下；用于普通与精英敌机实体。 | 64×64 px（精英 82×82 px） | `/manus-storage/sky-striker-enemy-drone_431ce67e.png` |
| `sky_striker_mark` | 无文字三角翼/航迹品牌图标；用于菜单徽记与游戏内小型标识。 | 56×56 px（移动端 40×40 px） | `/manus-storage/sky-striker-mark_1bb5bbaa.png` |

## Procedural Runtime Art

| 名称 | 说明 | 显示规格 | 实现方式 |
|---|---|---|---|
| `player_bullet` | 向上飞行的青绿细长能量弹。 | 6×22 px | Phaser `Graphics` 生成纹理，对象池复用 |
| `enemy_bullet` | 向下飞行的琥珀色圆形追踪弹。 | 10×10 px | Phaser `Graphics` 生成纹理，对象池复用 |
| `shield_pickup` | 琥珀核心、青绿外环的护盾补给。 | 34×34 px | Phaser `Graphics` 生成纹理，tween 旋转 |
| `explosion` | 由琥珀与朱红粒子构成的短促爆炸。 | 64×64 px | Phaser 粒子与圆形纹理 |
| `rain_streak` | 低透明的斜向雨线。 | 2×64 px | Phaser 线条纹理，多层向下滚动 |

## 资产接入与审查说明

所有运行时艺术资源均以 WebDev 托管路径加载，不被复制进项目仓库。程序化几何仅承担子弹、补给、雨线和爆炸等小型动态元素；玩家机、敌机、背景与品牌图标则使用生成资产，保证游戏具有明确的非占位视觉方向。实现时应保持透明底精灵的原始比例，不将背景图作为精灵拉伸；若生成过程中的占位图片尚未替换为最终图像，则可以先用同名 URL 接入，托管资源完成后会自动更新。

# M不复还 项目工作流 — Agent 指引

## 1. 双仓库架构

| 仓库 | 路径 | 用途 | 修改后动作 |
|------|------|------|-----------|
| **tavern_helper_template** | `D:\zzz\tavern_helper_template` | SillyTavern 插件项目，编译为 `dist/` 内联 HTML | `pnpm build` → commit → tag → push |
| **M不复还** | `D:\zzz\M不复还` | 世界书项目，存放 YAML 定义（物品、楼层、事件等） | commit → push |

**关键规则**：两处都改。schema.ts 必须同步、物品 YAML 与世界书条目内容一致。

### 代码存放位置

所有状态栏代码在 `tavern_helper_template/src/M不复还/界面/状态栏/`：
- `game-actions.ts` — 交互逻辑（装备/使用/加点/投掷）
- `App.vue` — 主布局 + 战斗结束重置 watch
- `components/BackpackPanel.vue` — 背包渲染 + 按钮
- `store.ts` — Pinia store + MVU 数据桥接
- `schema.ts` — Zod schema（必须与 M不复还/schema.ts 同步）

## 2. Git 版本策略

### 仓库信息

- 远程: `origin → https://github.com/ccccxxx/M-tower-status-bar.git`
- 默认分支: `main`
- **禁止创建新分支**（包括远程分支）

### 发布流程

```
修改代码 → pnpm build 验证 → git commit → git tag v0.0.x → git push origin v0.0.x
```

- 版本号递增：`v0.0.1` → `v0.0.2` → `v0.0.3` ...（从 `v0.0.5` 开始当前状态）
- tag 基于当前 `HEAD`（即 `main`），不额外创建分支
- tag 名用 `v` 前缀 + 语义号，如 `v0.0.5`
- 只推 tag，不推 branch

### 常见陷阱

- ❌ 不要 `git push origin main`（会推送与 origin/main 的差异）
- ❌ 不要创建本地或远端分支
- ❌ 不要删除已有 tag（除非有计划重建）
- ✅ 只 `git push origin v0.0.x`

## 3. 物品系统 YAML 结构与约定

### 目录结构

```
M不复还/世界书/物品/
├── 消耗品/     → type: 消耗品
├── 饰品/       → type: 饰品
├── 武器/       → type: 武器
├── 防具/       → type: 防具
├── 道具/       → type: 道具
├── 特殊道具/    → type: 特殊道具
└── 材料/       → type: 材料
```

### YAML 字段规则

```yaml
名称: "物品名"
类型: "消耗品"       # 枚举之一
描述: "物品描述"
效果: "+100HP；一阵暖流涌遍全身；；"     # 4段式
投掷效果: ""        # 有值则显示「投掷」按钮
数量: 3
```

- `效果` 4段格式: `[属性变动]；[效果文本]；[临时增幅]；[代价/负面]`
  以 `;` 分隔，段可为空。段1 `+-N%?(HP|MP|WIL|ATK|DEF|EXP|MaxHP|MaxMP|MaxWIL)`。
- `投掷效果` 格式: `命中敌方后附加[名称]:描述。持续N回合`
- 饰品/武器/防具用 `属性` 字段（`{ATK: 5, MaxHP: 20}`），消耗品用 `效果` 字段
- 纯投掷物品（如催情先走液瓶）→ `效果` 留空，`投掷效果` 写值
- 双用途物品（如琥珀黏液瓶）→ `效果` 和 `投掷效果` 同时有值

## 4. AI 触发规则

| 操作 | 触发 AI | 机制 |
|------|---------|------|
| 装备/卸下 | ❌ | 仅 `addOneMessage(is_system: true)` |
| 使用消耗品 | ❌ | 仅系统消息 |
| 投掷物品 | ❌ | 仅系统消息 |
| 特殊道具 | ✅ | `generateQuietPrompt()` |
| 加点 | ❌ | 仅系统消息 |
| 战斗结束重置 | ❌ | 无消息，纯数据操作 |

## 5. schema 变更传播

修改 schema.ts 后必须执行：

```
Add new field in schema.ts × 2
        ↓
pnpm dump        (更新 schema.json)
        ↓
pnpm build       (编译验证)
```

两处 schema.ts:
- `tavern_helper_template/src/M不复还/schema.ts`
- `D:\zzz\M不复还/schema.ts`

## 6. 构建验证

```bash
pnpm build
```

必须在每次代码修改后执行，确认编译通过。

## 7. 关键交互逻辑摘要

- **装备加成**：ATK/DEF 直接加减 curATK/curDEF；MaxHP/MP/WIL 加上限同时补当前值，卸下时当前值同步减去再加 clamp
- **战斗结束重置**：watch `战斗.战斗中` false → 清空所有 `状态效果`，重置 `curATK=ATK`、`curDEF=DEF`
- **DEF 加点**：1 SP = +2 DEF（不是 +1）
- **投掷**：只在 `战斗中 === true` 时启用按钮；写入敌人 `状态效果.减益` 并扣属性
- **特殊道具**：`使用次数++`；不减数量；触发 AI
- **store 访问**：模板中直接 `store.data.xxx`，无需 computed 包装

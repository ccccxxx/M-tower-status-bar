# M不复还 状态栏交互开发知识沉淀

## 1. 文件架构与职责

```
界面/状态栏/
├── index.ts             入口文件，等待 MVU 初始化后挂载 App
├── index.html           HTML 模板（含 <div id="app">）
├── App.vue              主布局 + 标签切换（3 个子组件）
├── store.ts             数据层，defineMvuDataStore 连接 MVU 变量
├── game-actions.ts      交互逻辑层（装备/使用/加点等）
├── global.css           CRT 共享样式（CSS 变量、按钮、进度条、滚动条等）
├── KNOWLEDGE.md         本文档
└── components/
    ├── StatusPanel.vue   状态面板（HP/MP/WIL 条、ATK/DEF、SP 加点、天赋/技能/状态折叠区）
    ├── BackpackPanel.vue 背包面板（3 装备槽 + 物品列表 + 装备/使用按钮）
    └── BattlePanel.vue   战斗面板（敌人翻页、HP 条、增益/减益）
```

### 组件约束

| 组件 | 访问数据方式 | 是否可修改数据 | 可调用的 action |
|------|-------------|--------------|----------------|
| App.vue | `store.data.系统` | 否 | 无 |
| StatusPanel | `store.data.玩家` | 是（加点） | `assignStatPoint` |
| BackpackPanel | `store.data.装备` + `store.data.背包` | 是（装备/卸下/使用） | `equipItem`, `unequipItem`, `useConsumable`, `useSpecialItem` |
| BattlePanel | `store.data.战斗` | 否 | 无 |

---

## 2. 数据流

### 读取数据

Pinia store 使用 `ref` 持有数据，在模板中**直接**用 `store.data.xxx`：

```vue
<!-- ✅ 正确：Pinia 自动解包 ref -->
<span>{{ store.data.玩家.HP }}</span>
```

```vue
<!-- ❌ 不要：多一层 computed 包装 -->
const d = computed(() => store.data)
<span>{{ d.value.玩家.HP }}</span>
```

子组件在 `<script setup>` 中各自调用 `useDataStore()`，Pinia 保证返回同一单例。

### 写入数据

`game-actions.ts` 中的函数直接修改 `store.data.玩家.HP += 10`。

`defineMvuDataStore` 的 `deep watch` 检测到变化后：
1. 运行 `schema.safeParse` 验证新值
2. 若值不符合 schema，自动修正（不触发再写入循环）
3. 调用 `updateVariablesWith` 写回 ST 变量系统

### 外部同步

`defineMvuDataStore` 每 2 秒轮询一次 `getVariables()`，检测外部变更（如 AI 或正则脚本修改了数据），通过 `schema.safeParse` 后更新 `store.data`。

---

## 3. Schema 变更清单

### 文件位置（两个必须同步）

| 位置 | 用途 |
|------|------|
| `tavern_helper_template/src/M不复还/schema.ts` | 模板编译时使用 |
| `D:\zzz\M不复还\schema.ts` | 世界书项目变量定义 |

### 装备字段（已从字符串升级为对象）

```ts
// 旧格式（自动兼容）
武器: "暂无"       // → preprocess → null
武器: "铁剑"       // → preprocess → {名称: "铁剑", 属性: {}, 效果: ""}

// 新格式
武器: {
  名称: "铁剑",
  属性: { ATK: 5 },
  效果: "锋锐：攻击时有概率造成额外伤害"
}
```

`z.preprocess` 处理迁移：

```ts
z.preprocess(val => {
  if (typeof val === 'string')
    return val === '暂无' || val === '无'
      ? null
      : {名称: val, 属性: {}, 效果: ''};
  return val;
}, z.object({
  名称: z.string(),
  属性: z.record(z.string(), z.coerce.number()).default({}),
  效果: z.string().default(''),
}).nullable()),
```

### 背包条目字段

```ts
记录: z.object({
  数量: z.coerce.number().default(1),
  描述: z.string().default(''),
  类型: z.enum(['武器','防具','饰品','消耗品','材料','道具','特殊道具']).default('道具'),
  属性: z.record(z.string(), z.coerce.number()).default({}),
  效果: z.string().default(''),
  持续回合: z.coerce.number().default(0),
})
```

### 新增变量/类型的传播矩阵

修改 schema.ts 后同步更新：

| 变更类型 | schema.ts | 对应的世界书条目 | initvar.yaml | schema.json |
|---------|-----------|----------------|-------------|-------------|
| 新增字段 | ✓ | enum 值需描述 | ✓ | pnpm dump |
| 修改变量名 | ✓ | — | ✓ | pnpm dump |
| 修改类型 | ✓ | enum 值需更新描述 | 需通过校验 | pnpm dump |
| 删除字段 | ✓ | — | ✓ | pnpm dump |

**schema.json 由 `pnpm dump` 自动生成**（无需手动编辑）。

---

## 4. 装备系统规则

### 装备（equipItem）

1. 检查物品类型 → `武器` / `防具` / `饰品` 才可装备
2. 若该槽已有装备 → 先 `unequipItem` 卸下
3. 属性加成：
   - `ATK` → 加到 `curATK`
   - `DEF` → 加到 `curDEF`
   - `MaxHP/MaxMP/MaxWIL` → 加到上限并同步补满当前值
4. 物品效果文字 → 写入 `玩家.被动技能[物品名] = { 描述: 效果 }`
5. 装备槽设为 `{ 名称, 属性, 效果 }`
6. 从 `背包` 删除该条目
7. 发送系统消息 `你装备了 xx。`

### 卸下（unequipItem）

1. 从装备槽读取 `{ 名称, 属性, 效果 }`
2. 减去对应属性加成：
   - ATK/DEF → 直接减 curATK/curDEF
   - **MaxHP/MaxMP/MaxWIL → 同步减去当前值（保留受伤比例），然后 clamp 到 [0, 新上限]**
3. 删除 `玩家.被动技能[物品名]`
4. 装备槽设回 `null`
5. 物品写回 `背包[物品名] = { 数量: 1, 描述: '', 类型: slotToType(slot), 属性, 效果, 持续回合: 0 }`
6. 发送系统消息 `你卸下了 xx。`

### ⚠️ 属性异常说明

在修复前（旧逻辑），MaxHP/MP/WIL 在卸下时**只做上限截断**而不减去当前值 → 反复穿脱 +MaxHP 装备会导致无限回血。

| 时机 | 旧逻辑（bug） | 修复后逻辑 |
|------|-------------|-----------|
| 初始 | MaxHP=100, HP=50 | MaxHP=100, HP=50 |
| 装备 +20 MaxHP | MaxHP=120, HP=70 | MaxHP=120, HP=70 |
| 卸下 | MaxHP=100, **HP=70**（维持 70） | MaxHP=100, **HP=50**（减去 20）|
| 再次装备 | MaxHP=120, **HP=90**（多了 20） | MaxHP=120, **HP=70**（回到初始+20）|

修复要点：卸下 MaxHP/MP/WIL 时，当前值同步减去加成的数值，再 clamp 到 [0, 新上限]，保证反复穿脱后状态不变。ATK/DEF 直接加减，无此漏洞。

### 关键：何时不触发 AI 生成

只有装备变更、消耗品使用、加点会发送系统消息（`SillyTavern.addOneMessage` 设置 `is_system: true`）。**不会调用 `generateQuietPrompt`**，不会触发 AI 回复。

---

## 5. 消耗品与特殊道具

### 效果格式（4段式）

格式：`[属性变动]；[效果文本]；[临时增幅]；[代价/负面]`

以 `;` 分隔。段可为空，按顺序对位。

#### 段1 — 属性变动（立即生效，不改回合）

```
+100HP
+50HP,+50MP,+20WIL
+15%HP
-10EXP
```

HP/MP/WIL/ATK/DEF/EXP/MaxHP/MaxMP/MaxWIL，`%` 按最大值比例计算。

#### 段2 — 效果文本（叙事描述）

```
解除[勃起][发情]等负面状态
使用后清除体内所有蝇卵及蛆奴幼虫
```

不解析数值，仅通过系统消息转发给 AI。

#### 段3 — 临时增幅（写入 增益）

```
+3ATK。持续5回合
```

含 `持续N回合` 或 `持续至战斗结束`。直接改 curATK/curDEF，写入 `状态效果.增益{剩余回合, 描述}`。

#### 段4 — 代价/负面（写入 减益）

```
叠加2层[痛觉转换]，持续至战斗结束
```

正负号或关键词（负面/削弱/代价）自动归类为 减益。

### 投掷道具（throwItem）

物品有 `投掷效果` 字段时显示「投掷」按钮。

- 非战斗状态 → 按钮灰色禁用 + 提示"只能在战斗中使用"
- 战斗状态 → 解析 `投掷效果` 写入第一个敌人的 `状态效果.减益` + 扣减敌属性
- 触发系统消息，**不触发 AI 生成**
- 数量 -1

`投掷效果` 格式：
```
命中敌方后附加[名称]:描述。持续N回合
```

- `[名称]` → debuff 名称
- `持续N回合` → 剩余回合数
- `[+-]N(ATK|DEF)` → 修改敌人属性
- `%` → 按比例修改

### 双用途物品

既有 `效果` 又有 `投掷效果` 的消耗品（如琥珀黏液瓶）：
- 同时显示「使用」和「投掷」两个按钮
- 使用 → 解析 `效果` 作用于自身
- 投掷 → 解析 `投掷效果` 作用于敌人

### 特殊道具（useSpecialItem）

1. `使用次数++`
2. 不减少数量
3. 触发 AI 生成（`generateQuietPrompt`）
4. 系统消息「你使用了 XX。（已使用N次）」
---

## 6. 属性加点（assignStatPoint）

| 属性 | 消耗 SP | 效果 |
|------|---------|------|
| ATK | 1 | ATK +1, curATK +1 |
| DEF | 1 | DEF +2, curDEF +2 |
| MaxHP | 1 | MaxHP +10, HP +10 |
| MaxMP | 1 | MaxMP +10, MP +10 |
| MaxWIL | 1 | MaxWIL +10, WIL +10 |

当 `SP > 0` 时状态栏显示脉冲动画（`sp-pulse`）和加点按钮。

### 战斗结束重置

当 `战斗.战斗中` 从 `true` → `false` 时：
1. 清空 `玩家.状态效果`（增益 + 减益）
2. 重置 `curATK = ATK`, `curDEF = DEF`
3. 清空所有敌人的状态效果

---

## 7. 构建与运行

### 命令一览

| 命令 | 作用 | 说明 |
|------|------|------|
| `pnpm build` | 生产编译 | 输出到 `dist/`，产物内联到 HTML |
| `pnpm watch` | 监听开发 | 自动重新编译，配合 Live Server 即时预览 |
| `pnpm dump` | 生成 schema.json | 从 schema.ts 转换为 JSON Schema |
| `pnpm format` | 代码格式化 | Prettier |

### 构建环境说明

本项目使用 `moduleResolution: "bundler"`（在 tsconfig.json 中），此设置与 `ts-node` 在 Node.js v22 下不兼容。因此：

- **`webpack.config.ts` 无法被原生 Node.js 加载**
- 使用 `tsx` 作为 TypeScript 执行器：`tsx node_modules/webpack-cli/bin/cli.js --mode production`
- `package.json` 中的 `build` / `watch` / `build:dev` 脚本已配置为通过 `tsx` 调用 webpack
- `dump` 脚本使用 `.mjs` 格式（`dump_schema.mjs`），原生 `node` 可直接执行

### schema.json 生成

`dump_schema.mjs` 内联了完整的 Zod schema 定义（与 `schema.ts` 结构一致），使用 Zod 4.x 内置的 `z.toJSONSchema()` 输出 JSON Schema。修改 schema.ts 后务必：

```bash
pnpm dump
```

确保 `schema.json` 与 `schema.ts` 一致。

---

## 8. 常见陷阱

### 陷阱 1：store.data 不需要 computed 包装

```ts
// ❌
const d = computed(() => store.data);
{{ d.value.玩家.HP }}

// ✅
{{ store.data.玩家.HP }}
```

Pinia 自动解包 store 中的 ref，模板直接使用即可。

### 陷阱 2：generateQuietPrompt 是柯里化函数

类型定义：
```ts
SillyTavern.generateQuietPrompt  // () => executorFn
SillyTavern.generateQuietPrompt() // executorFn: (quiet_prompt, quiet_to_loud, skip_wian) => Promise<string>
```

必须调用两次。

### 陷阱 3：两个 schema.ts 必须同步

`tavern_helper_template/src/M不复还/schema.ts` 和 `D:\zzz\M不复还\schema.ts` 必须保持一致。添加新字段或修改类型时，两处都改。

### 陷阱 4：背包 item key 包含前缀

ST 变量中背包的 key 格式如 `item_1_铁剑`，显示时需要用 `extractName` 去除 `item_\d+_` 前缀。

### 陷阱 5：CSS 变量应在 global.css 定义

不要在组件中硬编码颜色值。使用 `var(--crt-hp)`、`var(--crt-text)` 等语义变量，变量定义在 `global.css` 的 `:root` 中。

### 陷阱 6：组件 style 应加 scoped

```vue
<!-- ✅ -->
<style scoped>...</style>

<!-- ❌ 全局泄露 -->
<style>...</style>
```

### 陷阱 7：empty/null 判断

装备槽使用 `z.nullable()`，空槽值为 `null`：
```vue
<template v-if="store.data.装备?.武器">
  <!-- 有装备 -->
</template>
<template v-else>
  <!-- 无装备 -->
</template>
```

---

## 9. CSS 变量一览

| 变量名 | 用途 | 值 |
|--------|------|-----|
| `--crt-bg1` | 背景色（上） | rgba(12,12,12,0.88) |
| `--crt-bg2` | 背景色（下） | rgba(8,16,8,0.95) |
| `--crt-green` | 主色调/高亮 | #64FF64 |
| `--crt-green-dim` | 暗绿色 | #3a6a3a |
| `--crt-text` | 主文字色 | #d0ffd0 |
| `--crt-dim` | 灰绿色文字 | #8ab88a |
| `--crt-dim2` | 浅灰绿文字 | #a0d0a0 |
| `--crt-hp` | HP 色 | #e94560 |
| `--crt-mp` | MP 色 | #4a9eff |
| `--crt-wil` | WIL 色 | #ffd93d |
| `--crt-exp` | EXP 色 | #6c5ce7 |

---

## 10. 修改流程

参考 `references/mvu/guide.md` 的变更传播矩阵，调整为本项目：

| 变更类型 | schema.ts ×2 | game-actions | 组件(.vue) | 世界书条目 | schema.json |
|---------|-------------|-------------|-----------|-----------|-------------|
| 新增交互按钮 | — | 新增函数 | 新增按钮+事件 | — | — |
| 新增变量字段 | ✓ | 按需使用 | 按需显示 | enum 补充描述 | pnpm dump |
| 修改装备规则 | — | 改 equip/unequip | — | — | — |
| 修改物品类型 | ✓ enum | 改 canEquip | 改 typeClass | — | pnpm dump |

### 标准步骤

1. 明确变更类型（查找上表对应行）
2. 按矩阵修改文件
3. `npx tsc --noEmit` 验证类型（仅检查项目文件）
4. `pnpm dump` 更新 schema.json（如果改了 schema.ts）
5. `pnpm build` 编译验证
6. 如改了世界书目录的 schema.ts，到世界书项目执行对应同步

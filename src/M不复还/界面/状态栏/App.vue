<template>
  <div class="crt">
    <div class="header-row">
      <span>{{ d.系统?.当前楼层 }}</span>
      <span>{{ d.系统?.游戏阶段 }}</span>
      <span>难度:{{ d.系统?.难度 }}</span>
    </div>

    <div class="tab-bar">
      <button class="tab-btn" :class="{active:tab==='status'}" @click="tab='status'">📊 状态</button>
      <button class="tab-btn" :class="{active:tab==='backpack'}" @click="tab='backpack'">🎒 背包</button>
      <button class="tab-btn" :class="{active:tab==='battle'}" @click="tab='battle'">⚔️ 战斗</button>
    </div>

    <div class="scroll">

      <!-- ════════ 状态 ════════ -->
      <template v-if="tab==='status'">
        <div class="status-split">
          <div class="left-col">
            <div class="user-row">
              <span class="user-name">{{ userName }}</span>
              <span class="user-lv">Lv{{ d.玩家?.LV }}</span>
              <span class="user-gold">{{ d.玩家?.G }}G</span>
            </div>

            <div class="fold-hd" style="margin:0 0 2px" @click="c.左栏=!c.左栏">
              <span class="fold-icon">{{ c.左栏?'▶':'▼' }}</span>
              {{ c.左栏?'展开':'收起' }}属性详情
            </div>

            <template v-if="!c.左栏">
              <div class="exp-area">
                <div class="exp-hd"><span>EXP</span><span>{{ d.玩家?.EXP }}/{{ (d.玩家?.LV||1)*100 }}</span></div>
                <div class="bar-track thin"><div class="bar-fill exp" :style="{width:expPct+'%'}"></div></div>
              </div>

              <div class="职业行">{{ d.玩家?.职业?.名称||'无' }}<template v-if="d.玩家?.职业?.名称"> ·{{ d.玩家?.职业?.阶位 }}阶</template></div>

              <div class="res-area">
                <div class="bar-row"><span class="bar-label" style="color:#e94560">HP</span><div class="bar-track"><div class="bar-fill hp" :style="{width:hpPct+'%'}"></div></div><span class="bar-text">{{ d.玩家?.HP }}/{{ d.玩家?.MaxHP }}</span></div>
                <div class="bar-row"><span class="bar-label" style="color:#4a9eff">MP</span><div class="bar-track"><div class="bar-fill mp" :style="{width:mpPct+'%'}"></div></div><span class="bar-text">{{ d.玩家?.MP }}/{{ d.玩家?.MaxMP }}</span></div>
                <div class="bar-row"><span class="bar-label" style="color:#ffd93d">WIL</span><div class="bar-track"><div class="bar-fill wil" :style="{width:wilPct+'%'}"></div></div><span class="bar-text">{{ d.玩家?.WIL }}/{{ d.玩家?.MaxWIL }}</span></div>
              </div>

              <div class="atkdef-area">
                <div class="atkdef-row">
                  <span class="label">ATK</span>
                  <span class="val" :class="atkClass">{{ d.玩家?.ATK }}</span>
                  <span class="formula">({{ d.玩家?.ATK公式 }})</span>
                </div>
                <div class="atkdef-row">
                  <span class="label">DEF</span>
                  <span class="val" :class="defClass">{{ d.玩家?.DEF }}</span>
                  <span class="formula">({{ d.玩家?.DEF公式 }})</span>
                </div>
              </div>

              <div class="sp-area" :class="(d.玩家?.SP||0)>0?'pulse':'normal'">
                <template v-if="(d.玩家?.SP||0)>0">⭐⭐⭐</template>
                可用属性点:{{ d.玩家?.SP }}
                <template v-if="(d.玩家?.SP||0)>0">⭐⭐⭐</template>
              </div>
            </template>
          </div>

          <div class="right-col">
            <div class="fold-hd" @click="c.天赋=!c.天赋"><span class="fold-icon">{{ c.天赋?'▸':'▾' }}</span>天赋</div>
            <template v-if="!c.天赋">
              <div v-for="(v,k) in d.玩家?.天赋||{}" :key="k" class="attr-item">
                <div class="attr-name">{{ k }}</div>
                <div class="attr-desc">{{ v.描述 }}</div>
              </div>
              <div v-if="!talentKeys.length" class="empty-row">无</div>
            </template>

            <div class="fold-hd" @click="c.技能=!c.技能"><span class="fold-icon">{{ c.技能?'▸':'▾' }}</span>技能</div>
            <template v-if="!c.技能">
              <div class="sub-title">─ 主动 ─</div>
              <div v-for="(v,k) in d.玩家?.主动技能||{}" :key="k" class="attr-item">
                <div class="attr-name">{{ k }}</div>
                <div class="attr-desc">{{ v.描述 }}</div>
              </div>
              <div v-if="!actSkillKeys.length" class="empty-row">无</div>

              <div class="sub-title">─ 被动 ─</div>
              <div v-for="(v,k) in d.玩家?.被动技能||{}" :key="k" class="attr-item">
                <div class="attr-name">{{ k }}</div>
                <div class="attr-desc">{{ v.描述 }}</div>
              </div>
              <div v-if="!pasSkillKeys.length" class="empty-row">无</div>
            </template>

            <div class="fold-hd" @click="c.状态=!c.状态"><span class="fold-icon">{{ c.状态?'▸':'▾' }}</span>状态</div>
            <template v-if="!c.状态">
              <div class="sub-title">─ 增益 ─</div>
              <div v-for="(v,k) in d.玩家?.状态效果?.增益||{}" :key="k" class="attr-item">
                <div class="attr-name">{{ k }}<span class="回合"> (剩{{ v.剩余回合 }}回合)</span></div>
                <div class="attr-desc">{{ v.描述 }}</div>
              </div>
              <div v-if="!buffKeys.length" class="empty-row">无</div>

              <div class="sub-title">─ 减益 ─</div>
              <div v-for="(v,k) in d.玩家?.状态效果?.减益||{}" :key="k" class="attr-item">
                <div class="attr-name">{{ k }}<span class="回合"> (剩{{ v.剩余回合 }}回合)</span></div>
                <div class="attr-desc">{{ v.描述 }}</div>
              </div>
              <div v-if="!debuffKeys.length" class="empty-row">无</div>
            </template>
          </div>
        </div>
      </template>

      <!-- ════════ 背包 ════════ -->
      <template v-if="tab==='backpack'">
        <div class="fold-hd" @click="c.装备栏=!c.装备栏"><span class="fold-icon">{{ c.装备栏?'▶':'▼' }}</span>装备</div>
        <template v-if="!c.装备栏">
          <div class="equip-grid">
            <div class="equip-slot"><div class="icon">🗡️</div><div class="name" :class="d.装备?.武器==='暂无'?'empty':'weapon'">{{ d.装备?.武器 }}</div></div>
            <div class="equip-slot"><div class="icon">🛡️</div><div class="name" :class="d.装备?.防具==='暂无'?'empty':'armor'">{{ d.装备?.防具 }}</div></div>
            <div class="equip-slot"><div class="icon">💍</div><div class="name" :class="d.装备?.饰品==='暂无'?'empty':'acce'">{{ d.装备?.饰品 }}</div></div>
          </div>
        </template>

        <hr class="divider">

        <div class="fold-hd" @click="c.物品=!c.物品"><span class="fold-icon">{{ c.物品?'▶':'▼' }}</span>物品</div>
        <template v-if="!c.物品">
          <div v-for="(v,k) in d.背包||{}" :key="k" class="item-row">
            <div class="item-hd">{{ k }}<span class="count"> ×{{ v.数量 }}</span></div>
            <div class="item-desc">{{ v.描述||'无描述' }}</div>
          </div>
          <div v-if="!itemKeys.length" class="empty-row">背包空荡荡的...</div>
        </template>
      </template>

      <!-- ════════ 战斗 ════════ -->
      <template v-if="tab==='battle'">
        <div class="battle-hd">⚔️ 战斗 ── 第{{ d.战斗?.回合数 }}回合</div>

        <template v-if="d.战斗?.战斗中 && enemyKeys.length">
          <div class="battle-nav">
            <button @click="prevEnemy" :disabled="enemyIdx<=0">◀</button>
            <span class="idx">{{ enemyIdx+1 }}/{{ enemyKeys.length }}</span>
            <button @click="nextEnemy" :disabled="enemyIdx>=enemyKeys.length-1">▶</button>
          </div>

          <div class="enemy-card">
            <div class="enemy-name">{{ currentEnemyName }}</div>
            <div class="enemy-stat">
              <span>LV{{ ce.LV }}</span>
              <span>ATK{{ ce.ATK }}</span>
              <span>DEF{{ ce.DEF }}</span>
            </div>
            <div class="bar-row">
              <span class="bar-label" style="color:#e94560">HP</span>
              <div class="bar-track"><div class="bar-fill hp" :style="{width:enemyHpPct+'%'}"></div></div>
              <span class="bar-text">{{ ce.HP }}/{{ ce.MaxHP }}</span>
            </div>

            <div class="fold-hd" @click="c.敌状态=!c.敌状态" style="margin:6px 0 2px">
              <span class="fold-icon">{{ c.敌状态?'▸':'▾' }}</span>状态
            </div>
            <template v-if="!c.敌状态">
              <div class="sub-title" style="color:#6bc5ff">─ 增益 ─</div>
              <div v-if="Object.keys(ce.状态效果?.增益||{}).length">
                <div v-for="(ev,ek) in ce.状态效果.增益" :key="ek" class="attr-item">
                  <div class="attr-name" style="color:#6bc5ff">{{ ek }}<span class="回合"> (剩{{ ev.剩余回合 }}回合)</span></div>
                  <div class="attr-desc">{{ ev.描述 }}</div>
                </div>
              </div>
              <div v-else class="empty-row" style="padding:0 4px 2px">无</div>

              <div class="sub-title" style="color:#e94560">─ 减益 ─</div>
              <div v-if="Object.keys(ce.状态效果?.减益||{}).length">
                <div v-for="(ev,ek) in ce.状态效果.减益" :key="ek" class="attr-item">
                  <div class="attr-name" style="color:#e94560">{{ ek }}<span class="回合"> (剩{{ ev.剩余回合 }}回合)</span></div>
                  <div class="attr-desc">{{ ev.描述 }}</div>
                </div>
              </div>
              <div v-else class="empty-row" style="padding:0 4px 2px">无</div>
            </template>
          </div>
        </template>

        <template v-else>
          <div class="empty-row" style="text-align:center;padding:20px 0">
            {{ d.战斗?.战斗中 ? '暂无敌人数据' : '不在战斗中' }}
          </div>
        </template>

        <div class="battle-foot">敌人总数: {{ enemyKeys.length }}</div>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useDataStore } from './store';

const store = useDataStore();
const d = computed(() => store.data || {});
const userName = SillyTavern.name1 || getCurrentPersonaName() || '&lt;user&gt;';

const tab = ref('status');
const enemyIdx = ref(0);
const c = reactive({
  左栏: false, 天赋: false, 技能: false, 状态: false,
  装备栏: false, 物品: false, 敌状态: false
});

const hpPct = computed(() => {
  const s = d.value.玩家;
  return s ? Math.min(100, Math.round((s.HP||0) / (s.MaxHP||1) * 100)) : 0;
});
const mpPct = computed(() => {
  const s = d.value.玩家;
  return s ? Math.min(100, Math.round((s.MP||0) / (s.MaxMP||1) * 100)) : 0;
});
const wilPct = computed(() => {
  const s = d.value.玩家;
  return s ? Math.min(100, Math.round((s.WIL||0) / (s.MaxWIL||1) * 100)) : 0;
});
const expPct = computed(() => {
  const s = d.value.玩家;
  return s ? Math.min(100, Math.round((s.EXP||0) / ((s.LV||1) * 100) * 100)) : 0;
});

const talentKeys = computed(() => Object.keys(d.value.玩家?.天赋||{}));
const actSkillKeys = computed(() => Object.keys(d.value.玩家?.主动技能||{}));
const pasSkillKeys = computed(() => Object.keys(d.value.玩家?.被动技能||{}));
const buffKeys = computed(() => Object.keys(d.value.玩家?.状态效果?.增益||{}));
const debuffKeys = computed(() => Object.keys(d.value.玩家?.状态效果?.减益||{}));
const itemKeys = computed(() => Object.keys(d.value.背包||{}));
const enemyKeys = computed(() => Object.keys(d.value.战斗?.敌人||{}));

const currentEnemyName = computed(() => {
  const keys = enemyKeys.value;
  return keys[enemyIdx.value] || '';
});
const ce = computed(() => {
  const name = currentEnemyName.value;
  return d.value.战斗?.敌人?.[name] || {};
});
const enemyHpPct = computed(() => {
  const e = ce.value;
  return e.MaxHP ? Math.min(100, Math.round(e.HP / e.MaxHP * 100)) : 0;
});

const atkClass = computed(() => {
  const f = d.value.玩家?.ATK公式 || '';
  return (f.includes('-') && !f.includes('1-')) || (f.match(/-\d+%/) && !f.includes('1-')) ? 'atk-down' : 'atk-up';
});
const defClass = computed(() => {
  const f = d.value.玩家?.DEF公式 || '';
  return f.includes('+') ? 'atk-up' : 'atk-down';
});

function prevEnemy() { if (enemyIdx.value > 0) enemyIdx.value--; }
function nextEnemy() { if (enemyIdx.value < enemyKeys.value.length - 1) enemyIdx.value++; }
</script>

<style>
* { margin:0; padding:0; box-sizing:border-box; }

.crt {
  font-family:'Courier New',Courier,monospace;
  background:#0c0c0c; color:#d0ffd0;
  border:2px solid #3a3a3a; border-radius:6px;
  padding:10px 12px;
  width:100%; height:500px; max-height:500px;
  display:flex; flex-direction:column;
  position:relative; overflow:hidden;
  box-shadow:inset 0 0 0 1px #000,0 12px 24px rgba(0,0,0,.40);
}
.crt::after {
  content:''; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(255,255,255,.05),transparent 40%,rgba(255,255,255,.05) 60%,transparent);
  mix-blend-mode:screen; opacity:.3;
  pointer-events:none;
}

.header-row {
  display:flex; font-size:16px; font-weight:700; color:#64FF64;
  letter-spacing:.04em;
  text-shadow:0 0 6px rgba(100,255,100,.2);
  border-bottom:1px solid #1a2a1a; padding-bottom:5px; margin-bottom:5px;
}
.header-row > span { flex:1; text-align:center; }

.tab-bar {
  display:flex; gap:2px; flex-shrink:0;
  border-bottom:1px solid #3a3a3a; padding-bottom:4px; margin-bottom:6px;
}
.tab-bar > button { flex:1; text-align:center; }
.tab-btn {
  background:transparent; border:1px solid transparent;
  color:#5a8a5a; padding:3px 14px; cursor:pointer;
  font-family:inherit; font-size:14px;
  border-radius:4px 4px 0 0; transition:all .2s;
}
.tab-btn:hover{ color:#90d090; background:rgba(100,255,100,.06); }
.tab-btn.active {
  color:#64FF64; background:rgba(100,255,100,.08);
  border-color:#3a3a3a #3a3a3a #0c0c0c;
  font-weight:700; text-shadow:0 0 6px rgba(100,255,100,.25);
}

.scroll { flex:1; overflow:auto; padding-right:3px; }
.scroll::-webkit-scrollbar { width:4px; }
.scroll::-webkit-scrollbar-track { background:#0a0a0a; }
.scroll::-webkit-scrollbar-thumb { background:#3a3a3a; border-radius:2px; }

.status-split { display:flex; gap:10px; }
.left-col { flex:5.5; min-width:0; }
.right-col { flex:4.5; min-width:0; }

.fold-hd {
  display:flex; align-items:center; gap:4px; cursor:pointer;
  font-size:13px; font-weight:700; color:#64FF64;
  padding:3px 4px; border-radius:3px; margin-top:2px;
  text-shadow:0 0 4px rgba(100,255,100,.12);
  user-select:none;
}
.fold-hd:hover{ background:rgba(100,255,100,.06); }
.fold-icon { width:14px; flex-shrink:0; }

.user-row {
  display:flex; align-items:center; gap:10px;
  font-size:18px; font-weight:800; padding:6px 8px;
  background:rgba(100,255,100,.05); border-radius:4px;
  border-left:3px solid #64FF64;
  margin:6px 0 8px;
  letter-spacing:.03em;
}
.user-row > span { flex:1; text-align:center; }
.user-name { color:#eaffea; }
.user-lv   { color:#6bc5ff; font-size:20px; }
.user-gold { color:#ffd93d; font-size:18px; text-shadow:0 0 8px rgba(255,217,61,.3); }

.exp-area { margin-bottom:4px; }
.exp-hd { display:flex; justify-content:space-between; font-size:11px; color:#7aaa7a; padding:0 4px; }
.bar-track { height:10px; width:100%; background:rgba(0,0,0,.6); border:1px solid #3a3a3a; overflow:hidden; }
.bar-track.thin { height:5px; }
.bar-fill { height:100%; transition:width .3s; }
.bar-fill.exp   { background:repeating-linear-gradient(90deg,#6c5ce7 0 5px,#a29bfe 5px 10px); }
.bar-fill.hp    { background:repeating-linear-gradient(90deg,#e94560 0 5px,#c0392b 5px 10px); }
.bar-fill.mp    { background:repeating-linear-gradient(90deg,#4a9eff 0 5px,#2980b9 5px 10px); }
.bar-fill.wil   { background:repeating-linear-gradient(90deg,#ffd93d 0 5px,#f39c12 5px 10px); }

.职业行 {
  font-size:12px; color:#7aaa7a; padding:2px 4px 4px; border-bottom:1px solid #1a1a1a; margin-bottom:4px;
}

.res-area { margin-bottom:4px; }
.bar-row {
  display:flex; align-items:center; gap:6px; padding:2px 4px;
}
.bar-row .bar-label { font-size:12px; font-weight:700; min-width:28px; }
.bar-row .bar-track { flex:1; min-width:0; height:10px; }
.bar-row .bar-text  { font-size:11px; color:#7aaa7a; min-width:48px; text-align:right; }

.atkdef-area { padding:3px 4px; border-top:1px solid #1a1a1a; margin-bottom:4px; }
.atkdef-row { display:flex; align-items:baseline; gap:4px; padding:1px 0; font-size:13px; }
.atkdef-row .label { color:#7aaa7a; min-width:32px; }
.atkdef-row .val   { font-weight:700; letter-spacing:.02em; }
.atkdef-row .val.atk-up   { color:#6bc5ff; }
.atkdef-row .val.atk-down { color:#e94560; }
.atkdef-row .formula  { color:#5a6a5a; font-size:12px; }

.sp-area {
  text-align:center; font-size:14px; font-weight:700; padding:3px 4px;
  border-top:1px solid #1a1a1a;
}
.sp-area.pulse {
  color:#ffd93d; text-shadow:0 0 8px rgba(255,217,61,.5);
  animation:sp-pulse 1s ease-in-out infinite;
}
@keyframes sp-pulse {
  0%,100%{ opacity:1; transform:scale(1); }
  50%{ opacity:.7; transform:scale(1.03); }
}
.sp-area.normal { color:#7aaa7a; }

.attr-item { padding:2px 4px 2px 14px; font-size:12px; }
.attr-name { color:#eaffea; font-weight:600; }
.attr-desc { color:#7aaa7a; font-size:11px; padding-left:8px; line-height:1.4; }
.attr-name .回合 { color:#5a6a5a; font-weight:400; font-size:11px; }
.sub-title {
  text-align:center; font-size:11px; color:#5a6a5a;
  padding:2px 0; letter-spacing:.1em;
}

.equip-grid {
  display:flex; gap:6px; padding:4px 0;
}
.equip-slot {
  flex:1; text-align:center; padding:6px 4px;
  background:rgba(255,255,255,.03); border-radius:4px;
  border:1px solid #1a1a1a;
}
.equip-slot .icon { font-size:18px; }
.equip-slot .name { font-size:13px; font-weight:700; margin-top:2px; }
.equip-slot .name.weapon { color:#ffd93d; }
.equip-slot .name.armor  { color:#6bc5ff; }
.equip-slot .name.acce   { color:#c084fc; }
.equip-slot .name.empty  { color:#5a6a5a; font-style:italic; font-weight:400; }

.item-row { padding:2px 4px; }
.item-hd { font-size:13px; color:#eaffea; }
.item-hd .count { color:#7aaa7a; }
.item-desc { font-size:11px; color:#5a6a5a; padding-left:12px; line-height:1.3; }

.divider {
  border:none; height:1px;
  background:linear-gradient(90deg,transparent,#3a3a3a,transparent);
  margin:4px 0;
}

.empty-row { color:#5a6a5a; font-style:italic; font-size:12px; padding:4px 8px; }

/* ── 战斗栏 ── */
.battle-hd {
  text-align:center; font-size:18px; font-weight:700;
  padding:6px; border-bottom:1px solid #1a2a1a; margin-bottom:6px;
}
.battle-nav {
  display:flex; align-items:center; justify-content:center; gap:12px;
  margin-bottom:8px; font-size:17px;
}
.battle-nav button {
  background:rgba(100,255,100,.08); border:1px solid #3a3a3a;
  color:#64FF64; padding:4px 14px; border-radius:4px;
  cursor:pointer; font-family:inherit; font-size:18px;
}
.battle-nav button:hover { background:rgba(100,255,100,.15); }
.battle-nav button:disabled { opacity:.3; cursor:default; }
.battle-nav .idx { color:#7aaa7a; }

.enemy-card {
  border:1px solid #3a3a3a; border-radius:6px;
  padding:10px 12px; background:rgba(255,255,255,.02); margin-bottom:8px;
}
.enemy-card .enemy-name { font-size:20px; font-weight:700; color:#e94560; margin-bottom:6px; }
.enemy-card .enemy-stat { display:flex; gap:20px; font-size:15px; color:#7aaa7a; margin-bottom:6px; }

.enemy-card .bar-row .bar-label { font-size:14px; }
.enemy-card .bar-row .bar-track { height:14px; }
.enemy-card .bar-row .bar-text  { font-size:13px; }

.enemy-card .attr-item { padding:3px 4px; font-size:14px; }
.enemy-card .attr-name { font-size:14px; }
.enemy-card .attr-desc { font-size:13px; }
.enemy-card .sub-title { font-size:13px; }
.enemy-card .fold-hd { font-size:14px; }

.battle-foot { text-align:center; font-size:14px; color:#5a6a5a; padding:6px; }
</style>

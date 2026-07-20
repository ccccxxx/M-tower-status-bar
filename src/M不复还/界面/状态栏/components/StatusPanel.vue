<template>
  <div class="status-split">
    <div class="left-col">
      <div class="user-row">
        <span class="user-name">{{ userName }}</span>
        <span class="user-lv">Lv{{ store.data.玩家?.LV }}</span>
        <span class="user-gold">{{ store.data.玩家?.G }}G</span>
      </div>

      <div class="fold-hd" style="margin:0 0 2px" @click="fold.左栏=!fold.左栏">
        <span class="fold-icon">{{ fold.左栏?'▶':'▼' }}</span>
        {{ fold.左栏?'展开':'收起' }}属性详情
      </div>

      <template v-if="!fold.左栏">
        <div class="exp-area">
          <div class="exp-hd"><span>EXP</span><span>{{ store.data.玩家?.EXP }}/{{ (store.data.玩家?.LV||1)*100 }}</span></div>
          <div class="bar-track thin"><div class="bar-fill exp" :style="{width:expPct+'%'}"></div></div>
        </div>

        <div class="职业行">{{ store.data.玩家?.职业?.名称||'无' }}<template v-if="store.data.玩家?.职业?.名称"> ·{{ store.data.玩家?.职业?.阶位 }}阶</template></div>

        <div class="sp-area" :class="(store.data.玩家?.SP||0)>0?'pulse':'normal'">
          <template v-if="(store.data.玩家?.SP||0)>0">⭐⭐⭐</template>
          可用属性点:{{ store.data.玩家?.SP }}
          <template v-if="(store.data.玩家?.SP||0)>0">⭐⭐⭐</template>
        </div>

        <div class="res-area">
          <div class="bar-row"><span class="bar-label" style="color:var(--crt-hp)">HP</span><div class="bar-track"><div class="bar-fill hp" :style="{width:hpPct+'%', background:hpColor}"></div></div><span class="bar-text">{{ store.data.玩家?.HP }}/{{ store.data.玩家?.MaxHP }}</span></div>
          <div class="bar-row"><span class="bar-label" style="color:var(--crt-mp)">MP</span><div class="bar-track"><div class="bar-fill mp" :style="{width:mpPct+'%', background:mpColor}"></div></div><span class="bar-text">{{ store.data.玩家?.MP }}/{{ store.data.玩家?.MaxMP }}</span></div>
          <div class="bar-row"><span class="bar-label" style="color:var(--crt-wil)">WIL</span><div class="bar-track"><div class="bar-fill wil" :style="{width:wilPct+'%', background:wilColor}"></div></div><span class="bar-text">{{ store.data.玩家?.WIL }}/{{ store.data.玩家?.MaxWIL }}</span></div>
        </div>

        <div class="atkdef-area">
          <div v-for="stat in statList" :key="stat.key" class="atkdef-row">
            <span class="label" :style="stat.labelStyle">{{ stat.label }}</span>
            <span class="val" :class="stat.class">{{ stat.val }}<template v-if="stat.up"> ▲</template><template v-else-if="stat.down"> ▼</template></span>
            <span class="formula">({{ stat.base }})</span>
            <button v-if="(store.data.玩家?.SP||0)>0" class="act-btn mini" @click="assignSP(stat.key)">+</button>
          </div>
        </div>
      </template>
    </div>

    <div class="right-col">
      <div class="fold-hd" @click="fold.天赋=!fold.天赋"><span class="fold-icon">{{ fold.天赋?'▸':'▾' }}</span>天赋</div>
      <template v-if="!fold.天赋">
        <div v-for="(v,k) in store.data.玩家?.天赋||{}" :key="k" class="attr-item">
          <div class="attr-name">{{ k }}</div>
          <div class="attr-desc">{{ v.描述 }}</div>
        </div>
        <div v-if="!talentKeys.length" class="empty-row">无</div>
      </template>

      <div class="fold-hd" @click="fold.技能=!fold.技能"><span class="fold-icon">{{ fold.技能?'▸':'▾' }}</span>技能</div>
      <template v-if="!fold.技能">
        <div class="sub-title">─ 主动 ─</div>
        <div v-for="(v,k) in store.data.玩家?.主动技能||{}" :key="k" class="attr-item">
          <div class="attr-name">{{ k }}</div>
          <div class="attr-desc">{{ v.描述 }}</div>
        </div>
        <div v-if="!actSkillKeys.length" class="empty-row">无</div>

        <div class="sub-title">─ 被动 ─</div>
        <div v-for="(v,k) in store.data.玩家?.被动技能||{}" :key="k" class="attr-item">
          <div class="attr-name">{{ k }}</div>
          <div class="attr-desc">{{ v.描述 }}</div>
        </div>
        <div v-if="!pasSkillKeys.length" class="empty-row">无</div>
      </template>

      <div class="fold-hd" @click="fold.状态=!fold.状态"><span class="fold-icon">{{ fold.状态?'▸':'▾' }}</span>状态</div>
      <template v-if="!fold.状态">
        <div class="sub-title">─ 增益 ─</div>
        <div v-for="(v,k) in store.data.玩家?.状态效果?.增益||{}" :key="k" class="attr-item">
          <div class="attr-name">{{ k }}<span class="回合"> (剩{{ v.剩余回合 }}回合)</span></div>
          <div class="attr-desc">{{ v.描述 }}</div>
        </div>
        <div v-if="!buffKeys.length" class="empty-row">无</div>

        <div class="sub-title">─ 减益 ─</div>
        <div v-for="(v,k) in store.data.玩家?.状态效果?.减益||{}" :key="k" class="attr-item">
          <div class="attr-name">{{ k }}<span class="回合"> (剩{{ v.剩余回合 }}回合)</span></div>
          <div class="attr-desc">{{ v.描述 }}</div>
        </div>
        <div v-if="!debuffKeys.length" class="empty-row">无</div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useDataStore } from '../store';
import { useGameActions } from '../game-actions';

const store = useDataStore();
const { assignStatPoint } = useGameActions();
const userName = SillyTavern.name1 || getCurrentPersonaName() || '<user>';

const fold = reactive({
  左栏: false, 天赋: false, 技能: false, 状态: false,
});

const hpPct = computed(() => {
  const s = store.data.玩家;
  return s ? Math.min(100, Math.round((s.HP||0) / (s.MaxHP||1) * 100)) : 0;
});
const mpPct = computed(() => {
  const s = store.data.玩家;
  return s ? Math.min(100, Math.round((s.MP||0) / (s.MaxMP||1) * 100)) : 0;
});
const wilPct = computed(() => {
  const s = store.data.玩家;
  return s ? Math.min(100, Math.round((s.WIL||0) / (s.MaxWIL||1) * 100)) : 0;
});
const expPct = computed(() => {
  const s = store.data.玩家;
  return s ? Math.min(100, Math.round((s.EXP||0) / ((s.LV||1) * 100) * 100)) : 0;
});

const barColor = (cur: number, max: number, hi: string, mid: string) => {
  if (!max) return hi;
  const pct = (cur / max) * 100;
  if (pct >= 50) return hi;
  if (pct >= 30) return mid;
  return 'var(--crt-hp)';
};
const hpColor = computed(() => barColor(store.data.玩家?.HP || 0, store.data.玩家?.MaxHP || 1, '#52b788', '#ffd60a'));
const mpColor = computed(() => barColor(store.data.玩家?.MP || 0, store.data.玩家?.MaxMP || 1, '#4a9eff', '#ffd60a'));
const wilColor = computed(() => barColor(store.data.玩家?.WIL || 0, store.data.玩家?.MaxWIL || 1, '#ffd93d', '#ff8500'));

const talentKeys = computed(() => Object.keys(store.data.玩家?.天赋||{}));
const actSkillKeys = computed(() => Object.keys(store.data.玩家?.主动技能||{}));
const pasSkillKeys = computed(() => Object.keys(store.data.玩家?.被动技能||{}));
const buffKeys = computed(() => Object.keys(store.data.玩家?.状态效果?.增益||{}));
const debuffKeys = computed(() => Object.keys(store.data.玩家?.状态效果?.减益||{}));

const atkUp = computed(() => (store.data.玩家?.curATK||0) > (store.data.玩家?.ATK||0));
const atkDown = computed(() => (store.data.玩家?.curATK||0) < (store.data.玩家?.ATK||0));
const defUp = computed(() => (store.data.玩家?.curDEF||0) > (store.data.玩家?.DEF||0));
const defDown = computed(() => (store.data.玩家?.curDEF||0) < (store.data.玩家?.DEF||0));

function assignSP(stat: string) { assignStatPoint(stat); }

const statList = computed(() => [
  {
    key: 'ATK', label: 'ATK',
    val: store.data.玩家?.curATK,
    base: store.data.玩家?.ATK,
    up: atkUp.value, down: atkDown.value,
    class: atkUp.value ? 'atk-up' : atkDown.value ? 'atk-down' : '',
    labelStyle: '',
  },
  {
    key: 'DEF', label: 'DEF',
    val: store.data.玩家?.curDEF,
    base: store.data.玩家?.DEF,
    up: defUp.value, down: defDown.value,
    class: defUp.value ? 'atk-up' : defDown.value ? 'atk-down' : '',
    labelStyle: '',
  },
  {
    key: 'MaxHP', label: 'MaxHP',
    val: store.data.玩家?.MaxHP, base: '',
    up: false, down: false, class: '',
    labelStyle: 'color:var(--crt-hp)',
  },
  {
    key: 'MaxMP', label: 'MaxMP',
    val: store.data.玩家?.MaxMP, base: '',
    up: false, down: false, class: '',
    labelStyle: 'color:var(--crt-mp)',
  },
  {
    key: 'MaxWIL', label: 'MaxWIL',
    val: store.data.玩家?.MaxWIL, base: '',
    up: false, down: false, class: '',
    labelStyle: 'color:var(--crt-wil)',
  },
]);
</script>

<style scoped>
.status-split { display:flex; gap:10px; }
.left-col { flex:5.5; min-width:0; }
.right-col { flex:4.5; min-width:0; }

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
.exp-hd { display:flex; justify-content:space-between; font-size:12px; color:var(--crt-dim2); padding:0 4px; }

.职业行 {
  font-size:12px; color:var(--crt-dim2); padding:2px 4px 4px; border-bottom:1px solid #1a1a1a; margin-bottom:4px;
}

.res-area { margin-bottom:4px; }

.atkdef-area { padding:3px 4px; border-top:1px solid #1a1a1a; margin-bottom:4px; }
.atkdef-row { display:flex; align-items:baseline; gap:4px; padding:1px 0; font-size:13px; }
.atkdef-row .label { color:var(--crt-dim2); min-width:32px; }
.atkdef-row .val   { font-weight:700; letter-spacing:.02em; }
.atkdef-row .val.atk-up   { color:#6bc5ff; }
.atkdef-row .val.atk-down { color:var(--crt-hp); }
.atkdef-row .formula  { color:#80a080; font-size:12px; }
</style>

<template>
  <div>
    <div class="battle-hd">⚔️ 战斗 ── 第{{ store.data.战斗?.回合数 }}回合</div>

    <template v-if="inBattle && enemyKeys.length">
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
          <span class="bar-label" style="color:var(--crt-hp)">HP</span>
          <div class="bar-track"><div class="bar-fill hp" :style="{width:enemyHpPct+'%'}"></div></div>
          <span class="bar-text">{{ ce.HP }}/{{ ce.MaxHP }}</span>
        </div>

        <div class="fold-hd" @click="fold.敌状态=!fold.敌状态" style="margin:6px 0 2px">
          <span class="fold-icon">{{ fold.敌状态?'▸':'▾' }}</span>状态
        </div>
        <template v-if="!fold.敌状态">
          <div class="sub-title" style="color:#6bc5ff">─ 增益 ─</div>
          <div v-if="Object.keys(ce.状态效果?.增益||{}).length">
            <div v-for="(ev,ek) in ce.状态效果.增益" :key="ek" class="attr-item">
              <div class="attr-name" style="color:#6bc5ff">{{ ek }}<span class="回合"> (剩{{ ev.剩余回合 }}回合)</span></div>
              <div class="attr-desc">{{ ev.描述 }}</div>
            </div>
          </div>
          <div v-else class="empty-row" style="padding:0 4px 2px">无</div>

          <div class="sub-title" style="color:var(--crt-hp)">─ 减益 ─</div>
          <div v-if="Object.keys(ce.状态效果?.减益||{}).length">
            <div v-for="(ev,ek) in ce.状态效果.减益" :key="ek" class="attr-item">
              <div class="attr-name" style="color:var(--crt-hp)">{{ ek }}<span class="回合"> (剩{{ ev.剩余回合 }}回合)</span></div>
              <div class="attr-desc">{{ ev.描述 }}</div>
            </div>
          </div>
          <div v-else class="empty-row" style="padding:0 4px 2px">无</div>
        </template>
      </div>
    </template>

    <template v-else>
      <div class="empty-row" style="text-align:center;padding:20px 0">
        {{ inBattle ? '暂无敌人数据' : '不在战斗中' }}
      </div>
    </template>

    <div class="battle-foot">敌人总数: {{ enemyKeys.length }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useDataStore } from '../store';

const store = useDataStore();

const enemyIdx = ref(0);
const fold = reactive({ 敌状态: false });

const enemyKeys = computed(() => Object.keys(store.data.战斗?.敌人||{}));

const currentEnemyName = computed(() => {
  const keys = enemyKeys.value;
  return keys[enemyIdx.value] || '';
});
const ce = computed(() => {
  const name = currentEnemyName.value;
  return store.data.战斗?.敌人?.[name] || {};
});
const enemyHpPct = computed(() => {
  const e = ce.value;
  return e.MaxHP ? Math.min(100, Math.round(e.HP / e.MaxHP * 100)) : 0;
});

const inBattle = computed(() =>
  store.data.战斗?.战斗中 || (store.data.系统?.游戏阶段||'').includes('战斗')
);

function prevEnemy() { if (enemyIdx.value > 0) enemyIdx.value--; }
function nextEnemy() { if (enemyIdx.value < enemyKeys.value.length - 1) enemyIdx.value++; }
</script>

<style scoped>
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
.enemy-card .enemy-name { font-size:20px; font-weight:700; color:var(--crt-hp); margin-bottom:6px; }
.enemy-card .enemy-stat { display:flex; gap:20px; font-size:15px; color:#7aaa7a; margin-bottom:6px; }

.battle-foot { text-align:center; font-size:14px; color:#5a6a5a; padding:6px; }
</style>

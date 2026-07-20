<template>
  <div class="crt">
    <div class="header-row">
      <span>{{ store.data.系统?.当前楼层 }}</span>
      <span>{{ store.data.系统?.游戏阶段 }}</span>
      <span>难度:{{ store.data.系统?.难度 }}</span>
    </div>

    <div class="tab-bar">
      <button
        v-for="t in tabs" :key="t.id"
        class="tab-btn" :class="{ active: activeTab === t.id }"
        @click="activeTab = activeTab === t.id ? null : t.id"
      >
        {{ t.label }}
      </button>
    </div>

    <div class="scroll">
      <StatusPanel v-if="activeTab === 'status'" />
      <BackpackPanel v-else-if="activeTab === 'backpack'" />
      <BattlePanel v-else-if="activeTab === 'battle'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useDataStore } from './store';
import StatusPanel from './components/StatusPanel.vue';
import BackpackPanel from './components/BackpackPanel.vue';
import BattlePanel from './components/BattlePanel.vue';

const store = useDataStore();

watch(() => store.data.战斗?.战斗中, (now, prev) => {
  if (prev === true && now === false) {
    store.data.玩家.状态效果 = { 增益: {}, 减益: {} };
    store.data.玩家.curATK = store.data.玩家.ATK;
    store.data.玩家.curDEF = store.data.玩家.DEF;
    Object.values(store.data.战斗?.敌人 || {}).forEach(e => {
      e.状态效果 = { 增益: {}, 减益: {} };
    });
  }
});

const tabs = [
  { id: 'status', label: '📊 状态' },
  { id: 'backpack', label: '🎒 背包' },
  { id: 'battle', label: '⚔️ 战斗' },
];

const activeTab = useLocalStorage<string | null>('m_bh_return:active_tab', 'status');
</script>

<style scoped>
.tab-bar {
  display:flex; gap:2px; flex-shrink:0;
  border-bottom:1px solid #3a3a3a; padding-bottom:4px; margin-bottom:6px;
}
.tab-btn {
  flex:1; text-align:center;
  background:transparent; border:1px solid transparent;
  color:var(--crt-dim); padding:3px 14px; cursor:pointer;
  font-family:inherit; font-size:14px;
  border-radius:4px 4px 0 0; transition:all .2s;
}
.tab-btn:hover { color:#90d090; background:rgba(100,255,100,.06); }
.tab-btn.active {
  color:#64FF64; background:rgba(100,255,100,.08);
  border-color:#3a3a3a #3a3a3a #0c0c0c;
  font-weight:700; text-shadow:0 0 6px rgba(100,255,100,.25);
}
</style>

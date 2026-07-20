<template>
  <div>
    <div class="fold-hd" @click="fold.装备栏=!fold.装备栏"><span class="fold-icon">{{ fold.装备栏?'▶':'▼' }}</span>装备</div>
    <template v-if="!fold.装备栏">
      <div class="equip-grid">
        <div v-for="slot in equipSlots" :key="slot.key" class="equip-slot">
          <div class="icon">{{ slot.icon }}</div>
          <template v-if="slot.equip">
            <div class="name" :class="slot.nameClass">{{ slot.equip.名称 }}</div>
            <div class="equip-bonus" v-if="Object.keys(slot.equip.属性||{}).length">
              <span v-for="(v,k) in slot.equip.属性" :key="k" class="bonus-tag">{{ k }}+{{ v }}</span>
            </div>
            <button class="act-btn" @click="unequipItem(slot.key)">卸下</button>
          </template>
          <template v-else>
            <div class="name empty">无</div>
          </template>
        </div>
      </div>
    </template>

    <hr class="divider">

    <div class="fold-hd" @click="fold.物品=!fold.物品"><span class="fold-icon">{{ fold.物品?'▶':'▼' }}</span>物品</div>
    <template v-if="!fold.物品">
      <div v-for="(v,k) in store.data.背包||{}" :key="k" class="item-row">
        <div class="item-hd">
          {{ extractName(k) }}
          <span class="count"> ×{{ v.数量 }}</span>
          <span class="item-type-tag" :class="typeClass(v.类型)">{{ v.类型 }}</span>
        </div>
        <div class="item-desc">{{ v.描述||'无描述' }}</div>
        <div class="item-extra" v-if="v.使用次数">已使用{{ v.使用次数 }}次</div>
        <div class="item-actions">
          <button v-if="canEquip(v.类型)" class="act-btn" @click="equipItem(k)">装备</button>
          <button v-if="v.类型==='消耗品' && v.效果" class="act-btn" @click="useConsumable(k)">使用</button>
          <button v-if="v.投掷效果 && store.data.战斗?.战斗中" class="act-btn" @click="throwItem(k)">投掷</button>
          <button v-if="v.类型==='特殊道具'" class="act-btn special" @click="useSpecial(k)">使用</button>
        </div>
      </div>
      <div v-if="!itemKeys.length" class="empty-row">背包空荡荡的...</div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useDataStore } from '../store';
import { useGameActions } from '../game-actions';

const store = useDataStore();
const { equipItem, unequipItem, useConsumable, throwItem, useSpecialItem, extractName } = useGameActions();

const fold = reactive({ 装备栏: false, 物品: false });

const equipSlots = computed(() => [
  { key: '武器' as const, icon: '🗡️', nameClass: 'weapon', equip: store.data.装备?.武器 },
  { key: '防具' as const, icon: '🛡️', nameClass: 'armor', equip: store.data.装备?.防具 },
  { key: '饰品' as const, icon: '💍', nameClass: 'acce', equip: store.data.装备?.饰品 },
]);

const itemKeys = computed(() => Object.keys(store.data.背包||{}));

function canEquip(type: string): boolean {
  return type === '武器' || type === '防具' || type === '饰品';
}

function typeClass(type: string): string {
  switch (type) {
    case '武器': return 'tc-weapon';
    case '防具': return 'tc-armor';
    case '饰品': return 'tc-acce';
    case '消耗品': return 'tc-consume';
    case '特殊道具': return 'tc-special';
    case '材料': return 'tc-material';
    default: return 'tc-item';
  }
}
</script>

<style scoped>
.equip-grid {
  display:flex; gap:6px; padding:4px 0;
}
.equip-slot {
  flex:1; text-align:center; padding:6px 4px;
  background:rgba(255,255,255,.03); border-radius:4px;
  border:1px solid #1a1a1a; min-height:70px;
  display:flex; flex-direction:column; align-items:center;
}
.equip-slot .icon { font-size:18px; }
.equip-slot .name { font-size:12px; font-weight:700; margin:2px 0; }
.equip-slot .name.weapon { color:#ffd93d; }
.equip-slot .name.armor  { color:#6bc5ff; }
.equip-slot .name.acce   { color:#c084fc; }
.equip-slot .name.empty  { color:#5a6a5a; font-style:italic; font-weight:400; }
.equip-bonus { display:flex; gap:2px; flex-wrap:wrap; justify-content:center; margin-bottom:2px; }
.bonus-tag { font-size:10px; color:#80a080; background:rgba(100,255,100,.08); padding:0 3px; border-radius:2px; }

.item-row { padding:3px 4px; border-bottom:1px solid #1a1a1a; }
.item-hd { display:flex; align-items:center; gap:6px; font-size:13px; color:#eaffea; }
.item-hd .count { color:#7aaa7a; }
.item-type-tag { font-size:10px; padding:0 4px; border-radius:2px; color:#1a1a1a; font-weight:600; }
.tc-weapon { background:#ffd93d; }
.tc-armor  { background:#6bc5ff; }
.tc-acce   { background:#c084fc; }
.tc-consume { background:#52b788; }
.tc-special { background:#ff9e64; }
.tc-material { background:#80a080; }
.tc-item { background:#5a6a5a; color:#d0d0d0; }
.item-desc { font-size:11px; color:#5a6a5a; padding-left:12px; line-height:1.3; }
.item-extra { font-size:10px; color:#7aaa7a; padding-left:12px; }
.item-actions { display:flex; gap:4px; padding:2px 0 2px 12px; }
.item-actions .act-btn:disabled { opacity:.35; cursor:not-allowed; }
</style>

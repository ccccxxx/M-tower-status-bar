import { ref } from 'vue';
import { useDataStore } from './store';

export function useGameActions() {
  const store = useDataStore();
  const pendingChanges = ref<string[]>([]);

  function extractName(key: string): string {
    return key.replace(/^item_\d+_/, '');
  }

  function equipItem(itemKey: string): void {
    const item = store.data.背包?.[itemKey];
    if (!item) return;
    const slot = typeToSlot(item.类型);
    if (!slot) return;
    if (store.data.装备[slot]) unequipItem(slot);

    const itemName = extractName(itemKey);
    const 属性 = item.属性 || {};

    if (属性.ATK) store.data.玩家.curATK = (store.data.玩家.curATK || 0) + 属性.ATK;
    if (属性.DEF) store.data.玩家.curDEF = (store.data.玩家.curDEF || 0) + 属性.DEF;
    if (属性.MaxHP) { store.data.玩家.MaxHP = (store.data.玩家.MaxHP || 0) + 属性.MaxHP; store.data.玩家.HP = (store.data.玩家.HP || 0) + 属性.MaxHP; }
    if (属性.MaxMP) { store.data.玩家.MaxMP = (store.data.玩家.MaxMP || 0) + 属性.MaxMP; store.data.玩家.MP = (store.data.玩家.MP || 0) + 属性.MaxMP; }
    if (属性.MaxWIL) { store.data.玩家.MaxWIL = (store.data.玩家.MaxWIL || 0) + 属性.MaxWIL; store.data.玩家.WIL = (store.data.玩家.WIL || 0) + 属性.MaxWIL; }

    if (item.效果 && itemName) {
      store.data.玩家.被动技能[itemName] = { 描述: item.效果 };
    }

    store.data.装备[slot] = { 名称: itemName, 属性: 属性, 效果: item.效果 || '' };
    delete store.data.背包[itemKey];
  }

  function unequipItem(slot: '武器' | '防具' | '饰品'): void {
    const equip = store.data.装备[slot];
    if (!equip) return;

    const itemName = equip.名称;
    const 属性 = equip.属性 || {};

    if (属性.ATK) store.data.玩家.curATK = (store.data.玩家.curATK || 0) - 属性.ATK;
    if (属性.DEF) store.data.玩家.curDEF = (store.data.玩家.curDEF || 0) - 属性.DEF;
    if (属性.MaxHP) { store.data.玩家.MaxHP -= 属性.MaxHP; store.data.玩家.HP = Math.max(0, Math.min((store.data.玩家.HP || 0) - 属性.MaxHP, store.data.玩家.MaxHP)); }
    if (属性.MaxMP) { store.data.玩家.MaxMP -= 属性.MaxMP; store.data.玩家.MP = Math.max(0, Math.min((store.data.玩家.MP || 0) - 属性.MaxMP, store.data.玩家.MaxMP)); }
    if (属性.MaxWIL) { store.data.玩家.MaxWIL -= 属性.MaxWIL; store.data.玩家.WIL = Math.max(0, Math.min((store.data.玩家.WIL || 0) - 属性.MaxWIL, store.data.玩家.MaxWIL)); }

    if (equip.效果 && store.data.玩家.被动技能[itemName]) {
      delete store.data.玩家.被动技能[itemName];
    }

    store.data.背包[itemName] = {
      数量: 1, 描述: '', 类型: slotToType(slot),
      属性: 属性, 效果: equip.效果 || '',
      投掷效果: '', 使用次数: 0, 持续回合: 0,
    };
    store.data.装备[slot] = null;
  }

  function useConsumable(itemKey: string): void {
    const item = store.data.背包?.[itemKey];
    if (!item || !item.效果) return;
    const itemName = extractName(itemKey);
    applyEffect(item.效果);
    store.data.背包[itemKey].数量 -= 1;
    if (store.data.背包[itemKey].数量 <= 0) delete store.data.背包[itemKey];
  }

  function throwItem(itemKey: string): void {
    const item = store.data.背包?.[itemKey];
    if (!item || !item.投掷效果) return;

    const enemyKeys = Object.keys(store.data.战斗?.敌人 || {});
    if (!enemyKeys.length) {
      return;
    }
    const enemyKey = enemyKeys[0];
    const enemy = store.data.战斗.敌人[enemyKey];
    const itemName = extractName(itemKey);

    const text = item.投掷效果;
    const debuffNameMatch = text.match(/\[([^\]]+)\]/);
    const debuffName = debuffNameMatch ? debuffNameMatch[1] : '投掷效果';
    const turnsMatch = text.match(/持续\s*(\d+)\s*回合/);
    const turns = turnsMatch ? parseInt(turnsMatch[1]) : 1;

    enemy.状态效果 = enemy.状态效果 || { 增益: {}, 减益: {} };
    enemy.状态效果.减益[debuffName] = { 剩余回合: turns, 描述: text };

    const statRe = /([+-]?\d+)\s*%?\s*(ATK|DEF)/g;
    let m;
    while ((m = statRe.exec(text)) !== null) {
      const val = parseInt(m[1]);
      const stat = m[2];
      const isPercent = m[0].includes('%');
      if (stat === 'ATK') {
        const amount = isPercent ? Math.round((enemy.ATK || 0) * val / 100) : val;
        enemy.ATK = Math.max(0, (enemy.ATK || 0) + amount);
      }
      if (stat === 'DEF') {
        const amount = isPercent ? Math.round((enemy.DEF || 0) * val / 100) : val;
        enemy.DEF = Math.max(0, (enemy.DEF || 0) + amount);
      }
    }

    store.data.背包[itemKey].数量 -= 1;
    if (store.data.背包[itemKey].数量 <= 0) delete store.data.背包[itemKey];
  }

  function useSpecialItem(itemKey: string): void {
    const item = store.data.背包?.[itemKey];
    if (!item) return;
    const itemName = extractName(itemKey);
    item.使用次数 = (item.使用次数 || 0) + 1;
    try {
      SillyTavern.generateQuietPrompt()('', false, false);
    } catch (e) {
      console.warn('triggerAI failed', e);
    }
  }

  function assignStatPoint(stat: string): void {
    if ((store.data.玩家.SP || 0) <= 0) return;
    store.data.玩家.SP -= 1;
    switch (stat) {
      case 'ATK': store.data.玩家.ATK += 1; store.data.玩家.curATK += 1; break;
      case 'DEF': store.data.玩家.DEF += 2; store.data.玩家.curDEF += 2; break;
      case 'MaxHP': store.data.玩家.MaxHP += 10; store.data.玩家.HP += 10; break;
      case 'MaxMP': store.data.玩家.MaxMP += 10; store.data.玩家.MP += 10; break;
      case 'MaxWIL': store.data.玩家.MaxWIL += 10; store.data.玩家.WIL += 10; break;
    }
    pendingChanges.value.push(stat);
  }

  function reverseStatPoint(stat: string): void {
    const idx = pendingChanges.value.lastIndexOf(stat);
    if (idx === -1) return;
    pendingChanges.value.splice(idx, 1);
    store.data.玩家.SP += 1;
    switch (stat) {
      case 'ATK': store.data.玩家.ATK -= 1; store.data.玩家.curATK -= 1; break;
      case 'DEF': store.data.玩家.DEF -= 2; store.data.玩家.curDEF -= 2; break;
      case 'MaxHP': store.data.玩家.MaxHP -= 10; store.data.玩家.HP = Math.min(store.data.玩家.HP || 0, store.data.玩家.MaxHP); break;
      case 'MaxMP': store.data.玩家.MaxMP -= 10; store.data.玩家.MP = Math.min(store.data.玩家.MP || 0, store.data.玩家.MaxMP); break;
      case 'MaxWIL': store.data.玩家.MaxWIL -= 10; store.data.玩家.WIL = Math.min(store.data.玩家.WIL || 0, store.data.玩家.MaxWIL); break;
    }
  }

  function confirmAssign(): void {
    if (!pendingChanges.value.length) return;
    const total = pendingChanges.value.length;
    const stats = pendingChanges.value.join('、');
    sendSystemMessage(`你消耗了${total}点属性点，提升了${stats}。`);
    pendingChanges.value = [];
  }

  function typeToSlot(type: string): '武器' | '防具' | '饰品' | null {
    if (type === '武器') return '武器';
    if (type === '防具') return '防具';
    if (type === '饰品') return '饰品';
    return null;
  }

  function slotToType(slot: string): '武器' | '防具' | '饰品' {
    return slot as '武器' | '防具' | '饰品';
  }

  function applyEffect(effect: string): void {
    const s = effect.replace(/^[：:]\s*/, '');
    const segs = s.split(';').map(x => x.trim()).filter(Boolean);

    const statRe = /([+-]?\d+)\s*%?\s*(HP|MP|WIL|ATK|DEF|EXP|MaxHP|MaxMP|MaxWIL)/g;

    function resolveStat(name: string): string {
      if (name === 'HP') return 'HP';
      if (name === 'MP') return 'MP';
      if (name === 'WIL') return 'WIL';
      if (name === 'ATK') return 'ATK';
      if (name === 'DEF') return 'DEF';
      if (name === 'EXP') return 'EXP';
      if (name === 'MaxHP') return 'MaxHP';
      if (name === 'MaxMP') return 'MaxMP';
      if (name === 'MaxWIL') return 'MaxWIL';
      return name;
    }

    function applyStatDelta(stat: string, delta: number, isPercent: boolean): void {
      const p = store.data.玩家;
      if (stat === 'HP') { const amt = isPercent ? Math.round((p.MaxHP || 0) * delta / 100) : delta; p.HP = Math.min(Math.max(0, (p.HP || 0) + amt), p.MaxHP || 999999); }
      else if (stat === 'MP') { const amt = isPercent ? Math.round((p.MaxMP || 0) * delta / 100) : delta; p.MP = Math.min(Math.max(0, (p.MP || 0) + amt), p.MaxMP || 999999); }
      else if (stat === 'WIL') { const amt = isPercent ? Math.round((p.MaxWIL || 0) * delta / 100) : delta; p.WIL = Math.min(Math.max(0, (p.WIL || 0) + amt), p.MaxWIL || 999999); }
      else if (stat === 'ATK') { p.ATK = Math.max(0, (p.ATK || 0) + delta); p.curATK = Math.max(0, (p.curATK || 0) + delta); }
      else if (stat === 'DEF') { p.DEF = Math.max(0, (p.DEF || 0) + delta); p.curDEF = Math.max(0, (p.curDEF || 0) + delta); }
      else if (stat === 'EXP') { p.EXP = Math.max(0, (p.EXP || 0) + delta); }
      else if (stat === 'MaxHP') { p.MaxHP = Math.max(1, (p.MaxHP || 0) + delta); p.HP = Math.min(p.HP || 0, p.MaxHP); }
      else if (stat === 'MaxMP') { p.MaxMP = Math.max(1, (p.MaxMP || 0) + delta); p.MP = Math.min(p.MP || 0, p.MaxMP); }
      else if (stat === 'MaxWIL') { p.MaxWIL = Math.max(1, (p.MaxWIL || 0) + delta); p.WIL = Math.min(p.WIL || 0, p.MaxWIL); }
    }

    for (const seg of segs) {
      const hasDuration = /持续\s*(\d+)\s*回合/.test(seg) || /持续至战斗结束/.test(seg);

      if (hasDuration) {
        const turnsMatch = seg.match(/持续\s*(\d+)\s*回合/);
        const turns = turnsMatch ? parseInt(turnsMatch[1]) : -1;

        const buffNameMatch = seg.match(/\[([^\]]+)\]/);
        const buffName = buffNameMatch ? buffNameMatch[1] : (seg.split(/[：:。]/)[0]?.trim() || '效果');

        let allStats = [...seg.matchAll(statRe)];
        if (allStats.length > 0) {
          const firstVal = parseInt(allStats[0][1]);
          const isPercent = allStats[0][0].includes('%');
          const targetType = (firstVal < 0 || /(负面|削弱|代价)/.test(seg)) ? '减益' : '增益';

          const entry = { 剩余回合: turns, 描述: seg };
          if (targetType === '减益') store.data.玩家.状态效果.减益[buffName] = entry;
          else store.data.玩家.状态效果.增益[buffName] = entry;

          for (const m of allStats) {
            const delta = parseInt(m[1]);
            const rawStat = resolveStat(m[2]);
            const iPct = m[0].includes('%');
            if (['ATK','DEF'].includes(rawStat)) {
              const amt = iPct ? 0 : delta;
              if (rawStat === 'ATK') store.data.玩家.curATK = Math.max(0, (store.data.玩家.curATK || 0) + amt);
              if (rawStat === 'DEF') store.data.玩家.curDEF = Math.max(0, (store.data.玩家.curDEF || 0) + amt);
            }
          }
        } else {
          store.data.玩家.状态效果.减益[buffName] = { 剩余回合: turns, 描述: seg };
        }
        continue;
      }

      const stats = [...seg.matchAll(statRe)];
      if (stats.length > 0) {
        for (const m of stats) {
          const delta = parseInt(m[1]);
          const rawStat = resolveStat(m[2]);
          const isPercent = m[0].includes('%');
          applyStatDelta(rawStat, delta, isPercent);
        }
        continue;
      }
    }
  }

  function sendSystemMessage(text: string): void {
    try {
      SillyTavern.addOneMessage({
        name: '系统', is_user: false, is_system: true,
        mes: `[系统] ${text}`,
      });
    } catch (e) {
      console.warn('sendSystemMessage failed', e);
    }
  }

  return { equipItem, unequipItem, useConsumable, throwItem, useSpecialItem, assignStatPoint, reverseStatPoint, confirmAssign, extractName, pendingChanges, store };
}

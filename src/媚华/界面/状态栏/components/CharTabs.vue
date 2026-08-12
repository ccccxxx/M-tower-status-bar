<template>
  <div class="tabs-wrap">
    <nav class="tabs" :class="{ collapsed: active && !expanded }">
      <button
        v-for="t in props.tabs"
        :key="t.id"
        class="tab-button"
        :style="{ '--tab-accent': t.color }"
        :class="{ active: model === t.id }"
        :aria-expanded="model === t.id"
        @click="toggleTab(t.id)"
      >
        {{ t.label }}
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  tabs: { id: string; label: string; color: string }[];
}>();

const model = defineModel<string | null>({ required: true });

const expanded = ref(true);

watch(model, value => {
  expanded.value = value !== null;
});

function toggleTab(id: string) {
  if (model.value === id) {
    model.value = null;
    expanded.value = false;
  } else {
    model.value = id;
    expanded.value = true;
  }
}
</script>

<style lang="scss" scoped>
.tabs-wrap {
  padding: 8px 12px 0;
}
.tabs {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}
.tab-button {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--btn-bg);
  background-clip: padding-box;
  border: 1px solid var(--btn-border);
  color: var(--txt2);
  cursor: pointer;
  font-family: inherit;
  letter-spacing: 0.04em;
  transition: all var(--transition-fast);
}
.tab-button:hover {
  background: var(--btn-on-bg);
  border-color: var(--btn-on-border);
  color: var(--txt);
}
.tab-button.active {
  background: var(--btn-on-bg);
  border-color: var(--tab-accent, var(--c));
  color: var(--tab-accent, var(--c));
  box-shadow: 0 0 10px color-mix(in srgb, var(--tab-accent, var(--c)) 25%, transparent);
}
</style>
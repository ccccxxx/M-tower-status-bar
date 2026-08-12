<template>
  <div class="sw-hud">
    <div class="sw-c" :style="{ '--a': accent }">
      <div class="sw-f sw-h">
        <span>{{ store.data.世界?.日期 }}</span>
        <span class="sw-w">{{ store.data.世界?.星期 }}</span>
      </div>
      <div class="sw-f">
        <div class="sw-t">{{ store.data.世界?.时间 }}</div>
        <div class="sw-i">
          <div class="sw-r"><span>{{ store.data.世界?.地点 }}</span><span class="sw-n il"></span></div>
          <div class="sw-r"><span>{{ store.data.世界?.天气 }}</span><span class="sw-n iw"></span></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDataStore } from '../store';
import { weatherAccent } from '../images';

const store = useDataStore();

const accent = computed(() => weatherAccent(store.data.世界?.天气 || ''));
</script>

<style scoped>
.sw-hud {
  --a: #06b6d4;
  --b: #080a0d;
  font: 13px/1.2 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  margin: 10px 12px 0;
  position: relative;
  z-index: 1;
}
.sw-c {
  background: linear-gradient(150deg, rgba(34, 40, 49, 0.9) 0%, rgba(12, 14, 18, 0.95) 100%);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  border-left: 4px solid var(--a);
  border-radius: 8px;
  padding: 12px 18px;
  box-shadow:
    0 20px 40px -10px rgba(0, 0, 0, 0.95),
    inset 0 1px 0 rgba(255, 255, 255, 0.05),
    inset 0 -2px 6px rgba(0, 0, 0, 0.6);
  color: #cbd5e1;
  position: relative;
  overflow: hidden;
  text-rendering: optimizeLegibility;
  transform: translateZ(0);
}
.sw-c::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0, 0, 0, 0.2) 1px, rgba(0, 0, 0, 0.2) 2px);
  pointer-events: none;
  z-index: 0;
}
.sw-c::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 5%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0.05) 80%, transparent);
  z-index: 0;
}
.sw-f {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}
.sw-h {
  border-bottom: 1px solid rgba(0, 0, 0, 0.5);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);
  padding-bottom: 6px;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #708096;
  letter-spacing: 0.5px;
}
.sw-w:not(:empty) {
  color: var(--a);
  text-shadow: 0 0 8px color-mix(in srgb, var(--a) 30%, transparent);
  font-weight: 700;
}
.sw-t {
  font-size: 28px;
  font-weight: 800;
  color: #ffffff;
  text-shadow:
    0 3px 6px rgba(0, 0, 0, 0.9),
    0 0 12px color-mix(in srgb, var(--a) 25%, transparent);
  line-height: 1;
  letter-spacing: -0.2px;
}
.sw-i {
  text-align: right;
  font-size: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #8b9bb4;
  min-width: 0;
}
.sw-r {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}
.sw-r > span:first-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 180px;
}
.sw-n {
  width: 14px;
  text-align: center;
  display: inline-block;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8));
}
.il::before {
  content: '🌃';
}
.iw::before {
  content: '🌌';
}
</style>
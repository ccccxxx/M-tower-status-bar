<template>
  <div v-if="open" class="menu-panel">
    <div class="opt-scroll">
      <div class="menu-sec opt-card">
        <div class="opt-head">
          <div class="menu-hd">主题风格</div>
          <div class="opt-note">{{ THEME_META[ui.theme] || '白金主题' }}</div>
        </div>
        <div class="theme-select"><button type="button" class="theme-trigger" @click="themeOpen = !themeOpen">
          <span class="theme-swatch" :class="ui.theme"></span>
          <span class="theme-copy">
            <span class="theme-name">{{ THEME_META[ui.theme] || '白金主题' }}</span>
          </span>
          <span class="theme-caret">⌄</span>
        </button>
        <div v-if="themeOpen" class="theme-list">
          <button v-for="(label, key) in THEME_META" :key="key" type="button" class="theme-item" :class="{ on: ui.theme === key }" @click="setTheme(key)">
            <span class="theme-swatch" :class="key"></span>
            <span class="theme-copy"><span class="theme-name">{{ label }}</span></span>
            <span v-if="ui.theme === key" class="theme-mark">当前</span>
          </button>
        </div>
      </div></div>

      <div class="menu-sec opt-card">
        <div class="opt-head">
          <div class="menu-hd">自定义主题色</div>
          <button type="button" class="st-btn-s" @click="resetAccent">恢复默认</button>
        </div>
        <label class="switch-row"><span>全局强调色</span><input type="color" v-model="ui.customAccent" /></label>
      </div>

      <div class="menu-sec opt-card">
        <div class="menu-hd">显示数量</div>
        <div class="menu-lab"><span>{{ ui.visibleCount }}个</span></div>
        <input class="menu-range" type="range" min="1" max="6" step="1" v-model.number="ui.visibleCount" />
      </div>

      <div class="menu-sec opt-card">
        <div class="menu-hd">图片大小</div>
        <div class="menu-lab"><span>{{ ui.imgSize }}%</span></div>
        <input class="menu-range" type="range" min="20" max="200" step="5" v-model.number="ui.imgSize" />
      </div>

      <div class="menu-sec opt-card">
        <div class="menu-hd">字体大小</div>
        <div class="menu-lab"><span>{{ ui.textSize }}%</span></div>
        <input class="menu-range" type="range" min="60" max="220" step="5" v-model.number="ui.textSize" />
      </div>

      <div class="menu-sec opt-card">
        <div class="menu-hd">效果开关</div>
        <div class="toggle-list">
          <label class="switch-row"><span>减少动画</span><input type="checkbox" v-model="ui.reduceMotion" /></label>
          <label class="switch-row"><span>图片置顶</span><input type="checkbox" v-model="ui.imageTop" /></label>
          <label class="switch-row"><span>卡面扫光</span><input type="checkbox" v-model="ui.shineEnabled" /></label>
          <label class="switch-row"><span>毛玻璃特效</span><input type="checkbox" v-model="ui.glassEnabled" /></label>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ui } from '../ui';
import { THEME_META } from '../images';

defineProps<{ open: boolean }>();

const themeOpen = ref(false);

function setTheme(key: string) {
  ui.theme = key;
  themeOpen.value = false;
}

function resetAccent() {
  ui.customAccent = '';
}
</script>

<style scoped>
.menu-panel {
  position: absolute;
  top: 48px;
  left: 10px;
  width: min(320px, calc(100% - 20px));
  max-height: calc(100vh - 80px);
  border-radius: var(--radius-lg);
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  box-shadow: var(--dropdown-shadow);
  z-index: 30;
  overflow: hidden;
  animation: popIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.opt-scroll {
  max-height: calc(100vh - 90px);
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.menu-sec {
  border-radius: var(--radius-md);
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  padding: 10px 12px;
}
.opt-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.menu-hd {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--txt);
  letter-spacing: 0.05em;
}
.opt-note {
  font-size: 0.68rem;
  color: var(--txt3);
}
.menu-lab {
  font-size: 0.7rem;
  color: var(--txt3);
  margin-bottom: 4px;
}

.theme-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: var(--radius-sm);
  background: var(--btn-bg);
  border: 1px solid var(--btn-border);
  color: var(--txt);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.78rem;
}
.theme-trigger:hover {
  background: var(--btn-on-bg);
  border-color: var(--btn-on-border);
}
.theme-copy {
  flex: 1;
  text-align: left;
}
.theme-caret {
  color: var(--txt3);
}
.theme-list {
  position: absolute;
  left: 12px;
  right: 12px;
  margin-top: 6px;
  border-radius: var(--radius-md);
  background: var(--dropdown-bg);
  border: 1px solid var(--dropdown-border);
  box-shadow: var(--dropdown-shadow);
  z-index: 31;
  overflow: hidden;
  max-height: 260px;
  overflow-y: auto;
}
.theme-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  background: transparent;
  border: none;
  color: var(--txt2);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.76rem;
  text-align: left;
}
.theme-item:hover {
  background: var(--dropdown-hover);
  color: var(--txt);
}
.theme-item.on {
  color: var(--c);
  font-weight: 700;
}
.theme-mark {
  margin-left: auto;
  font-size: 0.62rem;
  color: var(--c);
}
.theme-swatch {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.theme-swatch.night { background: linear-gradient(135deg, #b4a5ff, #241f44); }
.theme-swatch.platinum { background: linear-gradient(135deg, #94a3b8, #3a4250); }
.theme-swatch.day { background: linear-gradient(135deg, #d98268, #fff3e8); }
.theme-swatch.moonlight { background: linear-gradient(135deg, #a0b8e0, #1a2030); }
.theme-swatch.ice { background: linear-gradient(135deg, #8ec8f0, #0a2538); }
.theme-swatch.starry { background: linear-gradient(135deg, #9098d8, #141832); }
.theme-swatch.lavender { background: linear-gradient(135deg, #c8b0e0, #241732); }
.theme-swatch.smoke { background: linear-gradient(135deg, #b8a898, #2b2824); }
.theme-swatch.cyan { background: linear-gradient(135deg, #58c8d8, #0a2830); }

.switch-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.74rem;
  color: var(--txt2);
  padding: 4px 0;
  cursor: pointer;
}
.switch-row input[type='color'] {
  width: 40px;
  height: 24px;
  border: 1px solid var(--btn-border);
  border-radius: var(--radius-xs);
  background: transparent;
  padding: 0;
  cursor: pointer;
}
.switch-row input[type='checkbox'] {
  appearance: none;
  -webkit-appearance: none;
  width: 36px;
  height: 18px;
  border-radius: 999px;
  border: 1px solid var(--btn-border);
  background: var(--block-bg);
  position: relative;
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}
.switch-row input[type='checkbox']::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--txt3);
  transition: all var(--transition-fast);
}
.switch-row input[type='checkbox']:checked {
  background: var(--c-surface);
  border-color: var(--c);
}
.switch-row input[type='checkbox']:checked::after {
  left: 19px;
  background: var(--c);
  box-shadow: 0 0 6px var(--c-glow);
}

.menu-range {
  width: 100%;
  appearance: none;
  -webkit-appearance: none;
  height: 4px;
  border-radius: 999px;
  background: var(--block-bg);
  outline: none;
  cursor: pointer;
}
.menu-range::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--c);
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 0 8px var(--c-glow);
}

.toggle-list {
  display: flex;
  flex-direction: column;
}

@keyframes popIn {
  from { opacity: 0; transform: scale(0.94) translateY(-4px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
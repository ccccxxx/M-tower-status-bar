<template>
  <div v-if="open" class="pv" @click.self="close">
    <div class="pv-b">
      <div class="st-top">
        <div class="st-title">立绘管理</div>
        <div class="st-top-actions">
          <button type="button" class="close-x" @click="close">×</button>
        </div>
      </div>
      <div v-if="tabNames.length" class="st-tabs">
        <button
          v-for="(name, i) in tabNames"
          :key="name"
          type="button"
          class="st-tab"
          :class="{ on: managerIndex === i }"
          :style="{ '--tab-accent': getColor(name) }"
          @click="managerIndex = i"
        >
          {{ name }}
        </button>
      </div>
      <div class="st-body">
        <div v-if="currentName && imgList.length" class="st-stat">
          当前：<span :style="{ color: getColor(currentName) }">{{ currentName }}</span>
          <button type="button" class="st-btn-s" :class="{ 'is-manual': !!imgSel[currentName], 'is-random': !imgSel[currentName] }" @click="resetImage">
            {{ imgSel[currentName] ? '恢复随机' : '随机模式' }}
          </button>
        </div>
        <div v-if="currentName && imgList.length" class="st-grid">
          <button
            v-for="(item, i) in imgList"
            :key="item.u"
            type="button"
            class="st-img-c"
            :class="{ sel: currentUrl === item.u }"
            :style="{ '--tile-accent': getColor(currentName) }"
            @click="selectImage(item.u)"
          >
            <img
              class="st-img"
              :src="item.u"
              :data-fallback="makeFallbackPortrait(currentName, getColor(currentName))"
              referrerpolicy="no-referrer"
              loading="lazy"
              decoding="async"
              :alt="currentName"
              @error="onImgError"
            />
            <span v-if="currentUrl === item.u" class="st-chk"><i class="fa-solid fa-check" aria-hidden="true"></i></span>
          </button>
        </div>
        <div v-else-if="currentName" class="manage-empty">{{ currentName }} 的立绘尚未配置，后续将图片网址填入 images.ts 即可启用。</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useDataStore } from '../store';
import { imgSel, imgRandom, currentImageUrl, clearImgSelection } from '../ui';
import { getColor, getImgList } from '../images';

defineProps<{ open: boolean }>();
const emit = defineEmits<{ close: [] }>();

const store = useDataStore();

const managerIndex = ref(0);

const tabNames = computed(() => Object.keys(store.data.角色 || {}));
const currentName = computed(() => tabNames.value[managerIndex.value] || '');
const imgList = computed(() => getImgList(currentName.value));
const currentUrl = computed(() => currentImageUrl(currentName.value, imgList.value));

function selectImage(url: string) {
  if (!currentName.value) {
    return;
  }
  imgSel[currentName.value] = url;
  delete imgRandom[currentName.value];
}

function resetImage() {
  if (!currentName.value) {
    return;
  }
  clearImgSelection(currentName.value);
  if (!imgRandom[currentName.value]) {
    imgRandom[currentName.value] = true;
  }
}

function close() {
  emit('close');
}

function makeFallbackPortrait(name: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="270" viewBox="0 0 200 270">` +
    `<rect width="200" height="270" fill="${color}" opacity="0.28"/>` +
    `<circle cx="100" cy="96" r="44" fill="${color}" opacity="0.85"/>` +
    `<rect x="64" y="130" width="72" height="130" rx="20" fill="${color}" opacity="0.65"/>` +
    `<text x="100" y="208" font-size="52" font-weight="700" fill="#fff" text-anchor="middle" font-family="serif">${String(name.charAt(0)).replace(/[&<>"']/g, '')}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  const fallback = img.getAttribute('data-fallback');
  if (fallback && img.src !== fallback) {
    img.src = fallback;
  }
}
</script>

<style scoped>
.st-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 8px;
  border-bottom: 1px solid var(--toolbar-border);
}
.st-title {
  font: 600 0.92rem 'Noto Serif SC', 'Microsoft YaHei', serif;
  color: var(--txt);
  letter-spacing: 2px;
}
.close-x {
  width: 26px;
  height: 26px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--txt2);
  cursor: pointer;
  font-size: 15px;
  line-height: 1;
}
.close-x:hover {
  background: var(--btn-on-bg);
  border-color: var(--btn-on-border);
  color: var(--txt);
}

.st-tabs {
  display: flex;
  gap: 4px;
  padding: 10px 16px 4px;
  flex-wrap: wrap;
}
.st-tab {
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
  transition: all var(--transition-fast);
}
.st-tab:hover {
  color: var(--txt);
  background: var(--btn-on-bg);
}
.st-tab.on {
  color: var(--tab-accent, var(--c));
  border-color: var(--tab-accent, var(--c));
  background: var(--btn-on-bg);
  box-shadow: 0 0 10px color-mix(in srgb, var(--tab-accent, var(--c)) 25%, transparent);
}

.st-body {
  padding: 8px 16px 16px;
  max-height: 62vh;
  overflow-y: auto;
}
.st-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 0.8rem;
  color: var(--txt2);
  padding: 4px 2px 10px;
}
.st-btn-s {
  font-size: 0.68rem;
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid var(--btn-border);
  background: var(--btn-bg);
  color: var(--txt3);
  cursor: pointer;
  font-family: inherit;
  transition: all var(--transition-fast);
}
.st-btn-s:hover {
  color: var(--txt);
  border-color: var(--btn-on-border);
}
.st-btn-s.is-manual {
  color: var(--c);
  border-color: var(--c-soft);
  background: var(--c-surface);
}

.st-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 10px;
}
.st-img-c {
  position: relative;
  border-radius: var(--radius-md);
  border: none;
  background: var(--tile-bg);
  box-shadow: var(--glass-edge), 3px 3px 8px rgba(0, 0, 0, 0.18);
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  aspect-ratio: 3 / 4;
  transition: all var(--transition-fast);
}
.st-img-c:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 0 1px var(--tile-accent, var(--c)), 0 6px 16px rgba(0, 0, 0, 0.35);
}
.st-img-c.sel {
  box-shadow: 0 0 0 2px var(--tile-accent, var(--c)), 0 0 14px color-mix(in srgb, var(--tile-accent, var(--c)) 45%, transparent);
}
.st-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.st-chk {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: var(--tile-accent, var(--c));
  color: #fff;
  font-size: 0.66rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
</style>
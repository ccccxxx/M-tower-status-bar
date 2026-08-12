<template>
  <div class="w" :class="rootClasses">
    <TimeBar />

    <div class="tb">
      <div class="tb-l">
        <button type="button" class="tg" :class="{ on: settingsOpen }" aria-label="打开设置" @click="toggleSettings">
          <i class="fa-solid fa-bars"></i>
        </button>
        <button type="button" class="tg" aria-label="立绘管理" @click="galleryOpen = true">
          <i class="fa-solid fa-images"></i>
        </button>
      </div>
      <div class="tit"><i class="fa-solid fa-heart heart" aria-hidden="true"></i><span @click="applyRandomTitle">{{ titleText }}</span></div>
      <div class="ind" id="page-indicator">{{ pageInfo.total > 1 ? pageInfo.page + '/' + pageInfo.total : '' }}</div>
    </div>

    <SettingsPanel :open="settingsOpen" />

    <CharTabs v-model="activeChar" :tabs="charTabs" />

    <CharDeck :only-name="activeChar" @preview="openPreview" @page-info="pageInfo = $event" />

    <div v-if="previewItem" class="pv" @click="previewItem = null">
      <div class="pv-b" @click.stop>
        <div class="pv-n">{{ previewItem.name }} · {{ previewItem.衣着 ? '状态' : '立绘' }}</div>
        <div class="pv-i-c">
          <img
            class="pv-img"
            :src="previewItem.image || previewItem.fallback"
            :data-fallback="previewItem.fallback"
            referrerpolicy="no-referrer"
            loading="lazy"
            decoding="async"
            :alt="previewItem.name"
            @error="onPreviewError"
          />
        </div>
      </div>
    </div>

    <Gallery :open="galleryOpen" @close="galleryOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import TimeBar from './components/TimeBar.vue';
import CharTabs from './components/CharTabs.vue';
import CharDeck from './components/CharDeck.vue';
import type { SceneItem } from './components/CharDeck.vue';
import Gallery from './components/Gallery.vue';
import SettingsPanel from './components/SettingsPanel.vue';
import { useDataStore } from './store';
import { ui } from './ui';
import { CHAR_META, THEME_META, TITLE_EMOTES, getColor } from './images';

const store = useDataStore();

const settingsOpen = ref(false);
const galleryOpen = ref(false);
const activeChar = ref<string | null>(null);
const titleText = ref('状态栏');
const previewItem = ref<SceneItem | null>(null);
const pageInfo = ref({ page: 1, total: 1 });

const charTabs = computed(() => {
  const names = Object.keys(store.data.角色 || {});
  return names.map(name => ({
    id: name,
    label: name,
    color: getColor(name),
  }));
});

const rootClasses = computed(() => ({
  'motion-reduce': ui.reduceMotion,
}));

function toggleSettings() {
  settingsOpen.value = !settingsOpen.value;
}

function applyRandomTitle() {
  const roll = Math.random();
  if (roll < 0.05) {
    titleText.value = '哦齁齁~';
  } else {
    titleText.value = TITLE_EMOTES[Math.floor(Math.random() * TITLE_EMOTES.length)];
  }
}

function openPreview(item: SceneItem) {
  previewItem.value = item;
}

function onPreviewError(event: Event) {
  const img = event.target as HTMLImageElement;
  const fallback = img.getAttribute('data-fallback');
  if (fallback && img.src !== fallback) {
    img.src = fallback;
  }
}

watch(
  () => ui.theme,
  theme => {
    document.documentElement.dataset.theme = THEME_META[theme] ? theme : 'platinum';
  },
  { immediate: true },
);

watch(
  () => ui.customAccent,
  accent => {
    const root = document.documentElement;
    if (accent && /^#[0-9a-f]{6}$/i.test(accent)) {
      root.style.setProperty('--c', accent);
    } else {
      root.style.removeProperty('--c');
    }
  },
  { immediate: true },
);

watch(
  () => ui.imgSize,
  size => {
    document.documentElement.style.setProperty('--img-scale', String(Math.max(0.2, size / 100)));
  },
  { immediate: true },
);

watch(
  () => ui.textSize,
  size => {
    document.documentElement.style.setProperty('--text-scale', String(Math.max(0.6, size / 100)));
  },
  { immediate: true },
);

watch(
  () => ui.glassEnabled,
  enabled => {
    document.documentElement.dataset.glass = enabled ? 'on' : 'off';
  },
  { immediate: true },
);

watch(
  () => ui.shineEnabled,
  enabled => {
    document.documentElement.dataset.shine = enabled ? 'on' : 'off';
  },
  { immediate: true },
);

onMounted(() => {
  applyRandomTitle();
});
</script>

<style scoped>
.w {
  --img-scale: 1;
  --text-scale: 1;
}
</style>
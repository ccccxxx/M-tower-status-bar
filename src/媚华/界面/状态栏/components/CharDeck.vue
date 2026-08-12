<template>
  <div class="deck-wrap">
    <template v-if="sceneItems.length">
      <div class="all-stack" :class="{ 'layout-image-top': ui.imageTop }">
        <div
          v-for="(item, idx) in pageItems"
          :key="item.name"
          class="det-r anim"
          :style="{
            '--card-accent': item.color,
            '--card-glow': item.glow,
            animationDelay: idx * 0.04 + 's',
          }"
        >
          <button type="button" class="av-btn" @click="openPreview(item)">
            <div class="av-flip-wrap">
              <div class="av-flip">
                <span class="av-flip-front">
                  <img
                    v-if="item.image"
                    class="av-img"
                    :class="{ loaded: loadedExtras[item.name] }"
                    :src="item.image"
                    :data-fallback="item.fallback"
                    :alt="item.name"
                    referrerpolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    @error="onImgError"
                    @load="loadedExtras[item.name] = true"
                  />
                  <span v-else class="av-fallback">{{ item.name.charAt(0) }}</span>
                </span>
              </div>
            </div>
          </button>
          <div class="inf">
            <div class="nm-d">
              {{ item.name }}
              <span v-if="item.关系阶段" class="rel-stage">{{ item.关系阶段 }}</span>
            </div>
            <div class="like-area">
              <div class="like-track"><div class="like-fill" :style="{ width: item.好感 + '%' }"></div></div>
              <span class="like-val">{{ item.好感 }}</span>
            </div>
            <div v-if="item.事件 && Object.keys(item.事件).length" class="flags">
              <span v-for="(v, k) in item.事件" v-show="v" :key="k" class="flag-chip">{{ k }}</span>
            </div>
            <div class="blk">
              <div class="bt"><i class="fa-solid fa-shirt"></i>衣着</div>
              <div class="bx">{{ item.衣着 || '—' }}</div>
            </div>
            <div class="blk">
              <div class="bt"><i class="fa-solid fa-eye"></i>外貌</div>
              <div class="bx">{{ item.外貌 || '—' }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="totalPages > 1" class="page-dots">
        <span
          v-for="p in totalPages"
          :key="p"
          class="pg-dot"
          :class="{ on: p === currentPage }"
          role="button"
          :aria-label="'第' + p + '页'"
          @click="jumpToPage(p)"
        ></span>
      </div>
    </template>
    <div v-else class="empty-state">呜哇，现在有点晕嘞~</div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useDataStore } from '../store';
import { ui, currentImageUrl } from '../ui';
import { getColor, getImgList } from '../images';

interface SceneItem {
  name: string;
  衣着: string;
  外貌: string;
  好感: number;
  关系阶段: string;
  事件: Record<string, boolean>;
  color: string;
  glow: string;
  image: string;
  fallback: string;
}

export type { SceneItem };

const props = defineProps<{ onlyName: string | null }>();
const emit = defineEmits<{
  preview: [item: SceneItem];
  'page-info': [info: { page: number; total: number }];
}>();
const store = useDataStore();

const currentPage = ref(1);
const loadedExtras = reactive<Record<string, boolean>>({});

const sceneItems = computed<SceneItem[]>(() => {
  const result: SceneItem[] = [];
  for (const [name, char] of Object.entries(store.data.角色 || {})) {
    if (char.在场 === false) {
      continue;
    }
    if (props.onlyName && props.onlyName !== name) {
      continue;
    }
    const color = getColor(name);
    const rgb = hexToRgb(color);
    result.push({
      name,
      衣着: char.衣着 || '',
      外貌: char.外貌 || '',
      好感: char.好感 || 0,
      关系阶段: char.关系阶段 || '',
      事件: char.事件 || {},
      color,
      glow: 'rgba(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ', 0.32)',
      image: currentImageUrl(name, getImgList(name)),
      fallback: makeFallbackPortrait(name, color),
    });
  }
  return result;
});

const pageSize = computed(() => Math.min(Math.max(ui.visibleCount, 1), 6));
const totalPages = computed(() => Math.max(1, Math.ceil(sceneItems.value.length / pageSize.value)));
const pageItems = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return sceneItems.value.slice(start, start + pageSize.value);
});

watch(
  () => [props.onlyName, ui.visibleCount, store.data.角色] as const,
  () => {
    const max = totalPages.value;
    if (currentPage.value > max) {
      currentPage.value = max;
    }
    emit('page-info', { page: currentPage.value, total: max });
  },
  { deep: true, immediate: true },
);

function jumpToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return;
  }
  currentPage.value = page;
  emit('page-info', { page, total: totalPages.value });
}

function openPreview(item: SceneItem) {
  emit('preview', item);
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [196, 85, 96];
}

function makeFallbackPortrait(name: string, color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="270" viewBox="0 0 200 270">` +
    `<rect width="200" height="270" fill="${color}" opacity="0.28"/>` +
    `<circle cx="100" cy="96" r="44" fill="${color}" opacity="0.85"/>` +
    `<rect x="64" y="130" width="72" height="130" rx="20" fill="${color}" opacity="0.65"/>` +
    `<text x="100" y="208" font-size="52" font-weight="700" fill="#fff" text-anchor="middle" font-family="serif">${escapeXml(name.charAt(0))}</text>` +
    `</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

function escapeXml(text: string): string {
  return String(text || '').replace(/[&<>"']/g, ch => {
    if (ch === '&') return '&amp;';
    if (ch === '<') return '&lt;';
    if (ch === '>') return '&gt;';
    if (ch === '"') return '&quot;';
    return '&apos;';
  });
}

function onImgError(event: Event) {
  const img = event.target as HTMLImageElement;
  const fallback = img.getAttribute('data-fallback');
  if (fallback && img.src !== fallback) {
    img.src = fallback;
  }
}
</script>
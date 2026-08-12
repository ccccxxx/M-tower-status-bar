import { reactive, watch } from 'vue';

const STORAGE_KEY = '媚华状态栏:设置';

export interface UiPrefs {
  visibleCount: number;
  imgSize: number;
  textSize: number;
  theme: string;
  reduceMotion: boolean;
  imageTop: boolean;
  shineEnabled: boolean;
  glassEnabled: boolean;
  customAccent: string;
}

const defaults: UiPrefs = {
  visibleCount: 2,
  imgSize: 100,
  textSize: 100,
  theme: 'platinum',
  reduceMotion: false,
  imageTop: false,
  shineEnabled: true,
  glassEnabled: true,
  customAccent: '',
};

export const ui = reactive<UiPrefs>({ ...defaults });

try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  Object.assign(ui, saved);
} catch (e) {
  /* 忽略读取失败 */
}

try {
  watch(
    ui,
    value => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    },
    { deep: true },
  );
} catch (e) {
  /* 忽略写入失败 */
}

// 立绘选择（仅内存，不持久化）：手动指定 / 随机模式
export const imgSel = reactive<Record<string, string>>({});
export const imgRandom = reactive<Record<string, boolean>>({});
const imgMemo = new Map<string, string>();

export function currentImageUrl(name: string, list: { u: string }[]): string {
  if (imgSel[name]) {
    return imgSel[name];
  }
  if (!list.length) {
    return '';
  }
  if (imgRandom[name]) {
    if (!imgMemo.has(name)) {
      imgMemo.set(name, list[Math.floor(Math.random() * list.length)].u);
    }
    return imgMemo.get(name)!;
  }
  if (!imgMemo.has(name)) {
    imgMemo.set(name, list[0].u);
  }
  return imgMemo.get(name)!;
}

export function clearImgSelection(name: string) {
  delete imgSel[name];
  delete imgRandom[name];
  imgMemo.delete(name);
}
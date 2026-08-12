// 角色与立绘静态数据表（新角色在此按名登记即可）
export interface CharMeta {
  c: string; // 角色主题色
}

export const CHAR_ORDER: string[] = ['丰臣夏海', '织田美姬', '德川千鹤'];

export const CHAR_META: Record<string, CharMeta> = {
  '丰臣夏海': { c: '#7ec8e3' },
  '织田美姬': { c: '#e58ab3' },
  '德川千鹤': { c: '#b99cff' },
};

export const IMG_DATA: Record<string, { u: string }[]> = {
  丰臣夏海: [
    { u: 'https://files.catbox.moe/o7dvg1.webp' },
    { u: 'https://files.catbox.moe/xdkbj7.webp' },
    { u: 'https://files.catbox.moe/uktlcp.webp' },
    { u: 'https://files.catbox.moe/ouw7nx.webp' },
    { u: 'https://files.catbox.moe/mkuh7z.webp' },
    { u: 'https://files.catbox.moe/yx3raf.webp' },
  ],
  织田美姬: [
    { u: 'https://files.catbox.moe/nb4xol.webp' },
    { u: 'https://files.catbox.moe/pnh7n3.webp' },
    { u: 'https://files.catbox.moe/aoei80.webp' },
    { u: 'https://files.catbox.moe/y53quh.webp' },
    { u: 'https://files.catbox.moe/v9wa9d.webp' },
    { u: 'https://files.catbox.moe/pw11m2.webp' },
  ],
  德川千鹤: [
    { u: 'https://files.catbox.moe/74zpsh.webp' },
    { u: 'https://files.catbox.moe/mytts1.webp' },
    { u: 'https://files.catbox.moe/e3yz4z.webp' },
    { u: 'https://files.catbox.moe/h0bjv2.webp' },
    { u: 'https://files.catbox.moe/x7iudq.webp' },
    { u: 'https://files.catbox.moe/hedc1r.webp' },
  ],
};

export const IMG_PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

export const TITLE_EMOTES = [
  '(◕ᴗ◕✿)',
  '(≧▽≦)',
  '٩(ˊᗜˋ*)و',
  '(ฅ´ω`ฅ)',
  '(ﾉ◕ヮ◕)ﾉ',
  '(≧ω≦)/',
  '(๑´ڡ`๑)',
  '(๑•ᴗ•๑)',
  '(੭ˊ꒳ˋ)੭✧',
  '(≧∇≦)b',
  '(o´▽`o)',
  '(*ฅ́˘ฅ̀*)',
  '(ノ≧∀≦)ノ',
  '(˵¯͒〰¯͒˵)',
  '(๑˘︶˘๑)',
  '(≧◡≦)',
  '(＾▽＾)',
  '(｡♥‿♥｡)',
  '(✿◠‿◠)',
  '(๑>◡<๑)',
  '(ˊᗜˋ*)',
  '(つ≧▽≦)つ',
  '(≧∀≦)ゞ',
  '(●´ω｀●)',
  '(๑´ㅂ`๑)',
  '(o^▽o)',
  '(=^･ω･^=)',
  '(๑¯◡¯๑)',
  '(つ✧ω✧)つ',
  '(^•⩊•^)',
];

export const THEME_META: Record<string, string> = {
  platinum: '白金主题',
  night: '夜幕主题',
  day: '白天主题',
  moonlight: '月光主题',
  ice: '冰雪主题',
  starry: '星夜主题',
  lavender: '薰衣草主题',
  smoke: '烟灰主题',
  cyan: '青蓝主题',
};

export const THEME_KEYS = Object.keys(THEME_META);

// 天气 → 时间栏强调色（移植自 时间栏.txt .sw-c[d*="xxx"] 调色盘）
export const WEATHER_PALETTE: [string[], string][] = [
  [['晴', '艳阳', '烈日'], '#fbbf24'],
  [['雨', '潮湿'], '#38bdf8'],
  [['雪', '霜', '冰雹'], '#bae6fd'],
  [['寒', '冷', '凉', '冻'], '#60a5fa'],
  [['夜', '月', '星空', '星光'], '#818cf8'],
  [['森林', '丛林', '绿野'], '#10b981'],
  [['热', '炎', '暑', '燥'], '#fb7185'],
  [['雷', '电', '闪'], '#fcd34d'],
  [['风', '飓', '台风'], '#2dd4bf'],
  [['阴', '云', '雾', '霾'], '#94a3b8'],
  [['魔', '妖', '幻', '灵', '仙'], '#c084fc'],
  [['圣', '神', '光辉'], '#fde047'],
  [['暗', '黑', '虚空', '深渊'], '#64748b'],
  [['血', '红月', '猩红'], '#f43f5e'],
  [['辐射', '毒', '酸', '污染'], '#34d399'],
  [['沙尘', '沙暴'], '#d6d3d1'],
  [['彩虹'], '#f472b6'],
  [['樱', '花瓣'], '#fbcfe8'],
  [['秋', '落叶'], '#f59e0b'],
];

export function weatherAccent(weather: string): string {
  const text = String(weather || '');
  for (const [keys, color] of WEATHER_PALETTE) {
    if (keys.some(key => text.includes(key))) {
      return color;
    }
  }
  return '#06b6d4';
}

export function getColor(name: string): string {
  return CHAR_META[name]?.c || '#94a3b8';
}

export function getImgList(name: string): { u: string }[] {
  return IMG_DATA[name] || [];
}
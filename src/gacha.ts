export type Rarity = "SSR" | "SR" | "R";

export type Character = {
  id: string;
  name: string;
  title: string;
  rarity: Rarity;
  element: string;
  quote: string;
  seal: string;
  palette: string;
  image?: string;
};

export type PullRecord = Character & {
  pullNo: number;
  pityBefore: number;
};

export type GachaState = {
  totalPulls: number;
  pity: number;
  records: PullRecord[];
};

export const SSR_RATE = 0.016;
export const SR_RATE = 0.16;
export const SSR_PITY = 90;

export const characters: Character[] = [
  {
    id: "tianming",
    name: "绛璃",
    title: "天命龙角姬",
    rarity: "SSR",
    element: "金焰",
    quote: "愿望若有形，便会在云端燃成一枚金印。",
    seal: "天命",
    palette: "from-[#fff2a8] via-[#ffd700] to-[#ff8c00]",
    image: "/characters/tianming.png",
  },
  {
    id: "jianxin",
    name: "苍衡",
    title: "碧霄剑心",
    rarity: "SSR",
    element: "云雷",
    quote: "剑光不是答案，只是通向答案的一道门。",
    seal: "剑心",
    palette: "from-[#e8ddff] via-[#c77dff] to-[#5b2c83]",
    image: "/characters/jianxin.png",
  },
  {
    id: "xingluo",
    name: "星罗",
    title: "观星司少主",
    rarity: "SSR",
    element: "星辉",
    quote: "我只拨动星盘，命运会自己显影。",
    seal: "星仪",
    palette: "from-[#fff9ef] via-[#ffd700] to-[#c77dff]",
  },
  {
    id: "qingyao",
    name: "青瑶",
    title: "云纹铃使",
    rarity: "SR",
    element: "风铃",
    quote: "听，祥云正在替你报喜。",
    seal: "青铃",
    palette: "from-[#d8f7ff] via-[#90e0ef] to-[#3f7f93]",
  },
  {
    id: "zihuan",
    name: "紫桓",
    title: "墨阵术士",
    rarity: "SR",
    element: "玄墨",
    quote: "一笔落下，阵眼便活了。",
    seal: "墨阵",
    palette: "from-[#f2daff] via-[#c77dff] to-[#270043]",
  },
  {
    id: "mingzhu",
    name: "明烛",
    title: "灯市巡游者",
    rarity: "R",
    element: "烛火",
    quote: "小小一盏灯，也能照亮很长的夜。",
    seal: "灯影",
    palette: "from-[#fff9ef] via-[#cac4cf] to-[#938f98]",
  },
  {
    id: "yunshu",
    name: "云舒",
    title: "卷轴书记",
    rarity: "R",
    element: "书云",
    quote: "每次祈愿，我都替你记在卷末。",
    seal: "云卷",
    palette: "from-[#d8f7ff] via-[#90e0ef] to-[#4b6882]",
  },
  {
    id: "xiaoyin",
    name: "小印",
    title: "朱砂印童",
    rarity: "R",
    element: "朱砂",
    quote: "盖章！这份好运正式生效。",
    seal: "朱印",
    palette: "from-[#ffd6da] via-[#e63946] to-[#6b1018]",
  },
];

const byRarity = (rarity: Rarity) => characters.filter((character) => character.rarity === rarity);

export function pickCharacter(rarity: Rarity, random = Math.random): Character {
  const pool = byRarity(rarity);
  return pool[Math.floor(random() * pool.length)];
}

export function resolveRarity(pity: number, random = Math.random): Rarity {
  if (pity + 1 >= SSR_PITY) return "SSR";
  if (random() < SSR_RATE) return "SSR";
  if (random() < SR_RATE) return "SR";
  return "R";
}

export function pullOnce(state: GachaState, random = Math.random): GachaState {
  const pityBefore = state.pity;
  const rarity = resolveRarity(state.pity, random);
  const character = pickCharacter(rarity, random);
  const record: PullRecord = {
    ...character,
    pullNo: state.totalPulls + 1,
    pityBefore,
  };

  return {
    totalPulls: state.totalPulls + 1,
    pity: rarity === "SSR" ? 0 : state.pity + 1,
    records: [record, ...state.records],
  };
}

export function pullMany(state: GachaState, count: number, random = Math.random): GachaState {
  return Array.from({ length: count }).reduce((nextState) => pullOnce(nextState, random), state);
}

export function getStats(records: PullRecord[]) {
  const counts = records.reduce(
    (acc, record) => {
      acc[record.rarity] += 1;
      return acc;
    },
    { SSR: 0, SR: 0, R: 0 } satisfies Record<Rarity, number>,
  );

  const ssrRecords = records.filter((record) => record.rarity === "SSR");
  const srRecords = records.filter((record) => record.rarity === "SR");
  const ssrRate = records.length ? (counts.SSR / records.length) * 100 : 0;
  const collection = new Set(records.map((record) => record.id));

  return {
    collection,
    counts,
    lastSsr: ssrRecords[0],
    srRecords,
    ssrRate,
    ssrRecords,
  };
}

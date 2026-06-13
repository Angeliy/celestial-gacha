import { BookOpen, History, Home, RotateCcw, ScrollText, Sparkles, Star, WandSparkles } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import {
  characters,
  getStats,
  pullMany,
  pullOnce,
  SSR_PITY,
  SSR_RATE,
  type Character,
  type GachaState,
  type PullRecord,
  type Rarity,
} from "./gacha";

type Page = "home" | "summon" | "stats" | "codex";

const initialState: GachaState = {
  totalPulls: 0,
  pity: 0,
  records: [],
};

const navItems: Array<{ id: Page; label: string; icon: typeof Home; testId: string }> = [
  { id: "home", label: "Wishes", icon: Sparkles, testId: "nav-home" },
  { id: "summon", label: "Summon", icon: WandSparkles, testId: "nav-summon" },
  { id: "stats", label: "Records", icon: History, testId: "nav-stats" },
  { id: "codex", label: "Codex", icon: BookOpen, testId: "nav-codex" },
];

const rarityStyle: Record<Rarity, { border: string; chip: string; glow: string; label: string }> = {
  SSR: {
    border: "border-gold/70",
    chip: "bg-gold text-primary-container",
    glow: "shadow-gold-bloom",
    label: "天命",
  },
  SR: {
    border: "border-violet/70",
    chip: "bg-violet text-primary-container",
    glow: "shadow-violet-bloom",
    label: "稀世",
  },
  R: {
    border: "border-jade/60",
    chip: "bg-jade text-primary-container",
    glow: "shadow-jade-bloom",
    label: "凡品",
  },
};

function AppShell({
  activePage,
  children,
  setActivePage,
  totalPulls,
}: {
  activePage: Page;
  children: ReactNode;
  setActivePage: (page: Page) => void;
  totalPulls: number;
}) {
  return (
    <div className="celestial-bg relative min-h-screen overflow-x-hidden text-on-surface">
      <div className="gold-dust pointer-events-none fixed inset-0 z-0" />
      <div className="ink-paper pointer-events-none fixed inset-0 z-0" />
      <div className="pointer-events-none fixed -left-24 top-1/4 h-64 w-64 rounded-full bg-primary/10 blur-[90px]" />
      <div className="pointer-events-none fixed -right-24 bottom-1/4 h-80 w-80 rounded-full bg-gold/10 blur-[110px]" />

      <header className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-4 pt-3 sm:px-8" data-testid="top-bar">
        <button className="flex items-center gap-3 text-left" data-testid="app-brand" onClick={() => setActivePage("home")}>
          <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold shadow-gold-bloom">
            <ScrollText size={22} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-serif text-xl font-bold italic tracking-normal text-secondary">Celestial Scroll</span>
            <span className="block font-label text-xs uppercase tracking-[0.22em] text-primary">Oriental Ink</span>
          </span>
        </button>

        <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-2" data-testid="essence-pill">
          <Star className="fill-gold text-gold" size={15} aria-hidden="true" />
          <span className="font-label text-sm font-semibold text-primary">{1600 + totalPulls * 10} Essence</span>
        </div>
      </header>

      <main className="relative z-10 mx-auto min-h-screen w-full max-w-6xl px-4 pb-28 pt-24 sm:px-8" data-testid="page-container">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex max-w-3xl justify-around rounded-t-2xl border border-white/10 bg-surface/70 px-4 pb-4 pt-3 backdrop-blur-xl" data-testid="bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              className={`relative flex min-h-14 min-w-16 flex-col items-center justify-center gap-1 rounded-lg px-2 font-label text-xs font-semibold transition active:scale-95 ${
                active ? "text-gold" : "text-on-surface-variant hover:text-secondary"
              }`}
              data-testid={item.testId}
              onClick={() => setActivePage(item.id)}
            >
              <Icon size={21} aria-hidden="true" />
              <span>{item.label}</span>
              {active && <span className="absolute bottom-0 h-1 w-1 rounded-full bg-cinnabar shadow-[0_0_8px_#e63946]" />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function SectionTitle({ eyebrow, title, right }: { eyebrow: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <p className="font-label text-xs font-bold uppercase tracking-[0.24em] text-gold">{eyebrow}</p>
        <h1 className="mt-2 font-serif text-3xl font-bold tracking-normal text-secondary sm:text-5xl">{title}</h1>
      </div>
      {right}
    </div>
  );
}

function Metric({ label, value, testId }: { label: string; value: string; testId: string }) {
  return (
    <div className="glass-panel rounded-xl p-4" data-testid={testId}>
      <p className="font-label text-xs uppercase tracking-[0.18em] text-on-surface-variant">{label}</p>
      <p className="mt-2 font-serif text-3xl font-bold text-secondary">{value}</p>
    </div>
  );
}

function CharacterFigure({ character, className = "" }: { character: Character; className?: string }) {
  return (
    <div className={`relative grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${character.palette} ${className}`}>
      <div className="cloud-scroll absolute inset-0 opacity-80" />
      <div className="absolute inset-x-10 top-10 h-28 rounded-full bg-white/25 blur-3xl" />
      {character.image ? (
        <img
          className="float-animation relative z-10 h-[88%] max-h-[430px] object-contain drop-shadow-[0_24px_34px_rgba(0,0,0,0.45)]"
          src={character.image}
          alt={character.name}
        />
      ) : (
        <div className="float-animation relative z-10 flex h-full min-h-44 w-full items-center justify-center">
          <div className="relative grid aspect-[3/4] h-[72%] max-h-[390px] min-h-36 place-items-center rounded-t-full rounded-b-[34%] border border-white/45 bg-primary-container/35 shadow-[0_24px_45px_rgba(0,0,0,0.45)]">
            <div className="absolute -top-4 left-1/2 h-12 w-28 -translate-x-1/2 rounded-full border border-white/35 bg-white/20 blur-[1px]" />
            <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full border border-white/45 bg-secondary/85 shadow-gold-bloom" />
            <div className="absolute left-1/2 top-20 flex -translate-x-1/2 gap-8">
              <span className="h-2 w-2 rounded-full bg-primary-container" />
              <span className="h-2 w-2 rounded-full bg-primary-container" />
            </div>
            <div className="absolute left-1/2 top-28 h-2 w-10 -translate-x-1/2 rounded-full bg-cinnabar/70" />
            <div className="absolute bottom-12 left-1/2 h-32 w-40 -translate-x-1/2 rounded-t-[46%] rounded-b-2xl border border-white/35 bg-primary-container/55" />
            <div className="absolute bottom-14 left-1/2 h-24 w-1 -translate-x-1/2 rounded-full bg-gold/70" />
            <div className="absolute bottom-10 left-1/2 grid h-24 w-24 -translate-x-1/2 place-items-center rounded-full border border-gold/60 bg-ink/40 font-serif text-4xl font-bold text-secondary shadow-gold-bloom">
              {character.name.slice(0, 1)}
            </div>
            <div className="absolute bottom-4 rounded-full bg-white/15 px-4 py-1 font-label text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              {character.element}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PoolBanner({
  character,
  index,
  onDetails,
  onWishTen,
}: {
  character: Character;
  index: number;
  onDetails: () => void;
  onWishTen: () => void;
}) {
  const isGold = index === 0;

  return (
    <section className="min-w-full snap-center sm:min-w-[48%]" data-testid={`pool-banner-${character.id}`}>
      <div className={`relative h-[520px] overflow-hidden rounded-2xl border ${isGold ? "border-gold/45 shadow-gold-bloom" : "border-primary/35 shadow-violet-bloom"}`}>
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-primary-container via-primary-container/20 to-transparent" />
        <CharacterFigure character={character} className="absolute inset-0 rounded-none pt-10" />
        <div className="absolute right-6 top-6 z-20 flex h-24 w-12 items-center justify-center border-2 border-cinnabar/55 p-2 text-cinnabar">
          <span className="stamp-frame font-serif text-lg font-bold leading-none">{character.seal}</span>
        </div>
        <div className="absolute bottom-0 left-0 z-20 w-full p-5 sm:p-6">
          <span className={`inline-flex rounded px-3 py-1 font-label text-xs font-bold uppercase tracking-[0.18em] ${isGold ? "bg-gold text-primary-container" : "bg-violet text-primary-container"}`}>
            {isGold ? "Rate UP!" : "Limited"}
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-secondary">{character.title}</h2>
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-on-surface-variant">{character.quote}</p>
          <div className="mt-5 grid grid-cols-[0.8fr_1.2fr] gap-3">
            <button className="glass-panel min-h-12 rounded-full font-label text-sm font-bold text-secondary transition hover:bg-white/10 active:scale-95" data-testid={`pool-details-${character.id}`} onClick={onDetails}>
              Details
            </button>
            <button
              className={`relative min-h-12 overflow-hidden rounded-full font-label text-sm font-bold text-primary-container transition hover:brightness-110 active:scale-95 ${isGold ? "bg-gradient-to-r from-gold to-amber shadow-gold-bloom" : "bg-gradient-to-r from-primary to-violet shadow-violet-bloom"}`}
              data-testid={`pool-wish-ten-${character.id}`}
              onClick={onWishTen}
            >
              <span className="relative z-10">Wish x10</span>
              <span className="shimmer absolute inset-0" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage({ onDetails, onWishTen }: { onDetails: () => void; onWishTen: () => void }) {
  const featured = characters.filter((character) => character.rarity === "SSR").slice(0, 2);

  return (
    <section className="space-y-8" data-testid="home-page">
      <SectionTitle
        eyebrow="限定祈愿池"
        title="天命云卷"
        right={
          <div className="hidden rounded-full border border-gold/30 bg-gold/10 px-4 py-2 font-label text-sm text-gold sm:block" data-testid="home-rate-pill">
            SSR {(SSR_RATE * 100).toFixed(1)}% · {SSR_PITY} 抽保底
          </div>
        }
      />

      <div className="flex snap-x gap-5 overflow-x-auto pb-3" data-testid="pool-carousel">
        {featured.map((character, index) => (
          <PoolBanner key={character.id} character={character} index={index} onDetails={onDetails} onWishTen={onWishTen} />
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric label="SSR 基础概率" value="1.6%" testId="rule-ssr-rate" />
        <Metric label="SSR 保底" value="90" testId="rule-pity" />
        <Metric label="图鉴角色" value={`${characters.length}`} testId="rule-character-count" />
      </div>
    </section>
  );
}

function PityScroll({ pity }: { pity: number }) {
  const width = Math.min(100, (pity / SSR_PITY) * 100);

  return (
    <div className="glass-panel rounded-2xl p-4" data-testid="pity-progress">
      <div className="flex items-center justify-between font-label text-xs uppercase tracking-[0.16em] text-on-surface-variant">
        <span>Scroll Charge</span>
        <span>{pity}/{SSR_PITY}</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-full border border-gold/30 bg-ink/65 p-1">
        <div className="h-4 rounded-full bg-gradient-to-r from-gold to-amber shadow-gold-bloom" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function ResultCard({ record, prominent = false }: { record: PullRecord; prominent?: boolean }) {
  const style = rarityStyle[record.rarity];

  return (
    <article className={`relative overflow-hidden rounded-2xl border ${style.border} bg-surface/60 ${prominent ? style.glow : ""}`} data-testid={`pull-result-${record.pullNo}`}>
      <CharacterFigure character={record} className="h-44 rounded-none" />
      <div className="absolute right-3 top-3 border border-cinnabar/55 px-2 py-3 text-cinnabar">
        <span className="stamp-frame font-serif text-xs font-bold">{record.seal}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-xl font-bold text-secondary">{record.name}</h3>
          <span className={`rounded px-2 py-1 font-label text-xs font-bold ${style.chip}`}>{record.rarity}</span>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">{record.title}</p>
        <p className="mt-3 font-label text-xs uppercase tracking-[0.12em] text-outline">
          Pull {record.pullNo} · Pity {record.pityBefore}
        </p>
      </div>
    </article>
  );
}

function SummonPage({
  state,
  onPullOne,
  onPullTen,
  onReset,
}: {
  state: GachaState;
  onPullOne: () => void;
  onPullTen: () => void;
  onReset: () => void;
}) {
  const latest = state.records[0];

  return (
    <section className="space-y-6" data-testid="summon-page">
      <SectionTitle
        eyebrow="召唤仪式"
        title="开卷见星"
        right={
          <button className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/5 text-on-surface transition hover:bg-white/10" data-testid="reset-button" onClick={onReset} title="重置记录">
            <RotateCcw size={18} aria-hidden="true" />
          </button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="累计抽数" value={`${state.totalPulls}`} testId="summon-total-pulls" />
            <Metric label="距保底" value={`${SSR_PITY - state.pity}`} testId="summon-pity-left" />
          </div>
          <PityScroll pity={state.pity} />
          <div className="grid grid-cols-2 gap-3">
            <button className="glass-panel min-h-16 rounded-full border-gold/40 font-label font-bold text-gold transition hover:bg-gold/10 active:scale-95" data-testid="pull-one-button" onClick={onPullOne}>
              单抽
            </button>
            <button className="relative min-h-16 overflow-hidden rounded-full bg-gradient-to-r from-gold to-amber font-label font-bold text-primary-container shadow-gold-bloom transition hover:brightness-110 active:scale-95" data-testid="pull-ten-button" onClick={onPullTen}>
              <span className="relative z-10">十连祈愿</span>
              <span className="shimmer absolute inset-0" />
            </button>
          </div>
          <div className="glass-panel rounded-2xl p-5" data-testid="summon-rules">
            <p className="font-serif text-xl font-bold text-secondary">祈愿规则</p>
            <div className="brush-divider my-4" />
            <p className="text-sm leading-7 text-on-surface-variant">
              SSR 基础概率 1.6%，未获得 SSR 时保底计数累积，第 90 抽必定显现金色天命。获得 SSR 后保底重置。
            </p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-serif text-2xl font-bold text-secondary">显影结果</h2>
            <span className="font-label text-xs uppercase tracking-[0.16em] text-on-surface-variant">{state.records.length ? `Latest ${Math.min(10, state.records.length)}` : "Empty"}</span>
          </div>
          {latest ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3" data-testid="pull-results-list">
              {state.records.slice(0, 10).map((record, index) => (
                <ResultCard key={`${record.pullNo}-${record.id}`} record={record} prominent={index === 0} />
              ))}
            </div>
          ) : (
            <div className="mt-4 grid min-h-96 place-items-center rounded-2xl border border-dashed border-gold/25 bg-ink/35 text-center" data-testid="empty-results">
              <div>
                <Sparkles className="mx-auto text-gold" size={42} aria-hidden="true" />
                <p className="mt-3 font-serif text-2xl font-bold text-secondary">卷轴尚未展开</p>
                <p className="mt-2 text-sm text-on-surface-variant">点击单抽或十连，生成第一份显影记录。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function StatsPage({ state }: { state: GachaState }) {
  const stats = useMemo(() => getStats(state.records), [state.records]);
  const total = Math.max(1, state.records.length);

  return (
    <section className="space-y-6" data-testid="stats-page">
      <SectionTitle eyebrow="历史卷宗" title="祈愿统计" />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="总抽数" value={`${state.totalPulls}`} testId="stats-total-pulls" />
        <Metric label="SSR 数量" value={`${stats.counts.SSR}`} testId="stats-ssr-count" />
        <Metric label="实际 SSR 率" value={`${stats.ssrRate.toFixed(2)}%`} testId="stats-ssr-rate" />
        <Metric label="当前保底" value={`${state.pity}/${SSR_PITY}`} testId="stats-current-pity" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel rounded-2xl p-5" data-testid="rarity-chart">
          <h2 className="font-serif text-2xl font-bold text-secondary">稀有度墨迹</h2>
          <div className="mt-5 space-y-5">
            {(["SSR", "SR", "R"] as Rarity[]).map((rarity) => {
              const count = stats.counts[rarity];
              const width = (count / total) * 100;
              return (
                <div key={rarity} data-testid={`stats-row-${rarity.toLowerCase()}`}>
                  <div className="flex items-center justify-between font-label text-xs uppercase tracking-[0.16em]">
                    <span className={rarity === "SSR" ? "text-gold" : rarity === "SR" ? "text-violet" : "text-jade"}>{rarityStyle[rarity].label}</span>
                    <span className="text-on-surface-variant">{count} 次</span>
                  </div>
                  <div className="mt-2 overflow-hidden rounded-full bg-ink/55 p-1">
                    <div className={`h-4 rounded-full bg-gradient-to-r ${rarity === "SSR" ? "from-gold to-amber" : rarity === "SR" ? "from-violet to-primary" : "from-jade to-primary"}`} style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5" data-testid="ssr-history">
          <h2 className="font-serif text-2xl font-bold text-secondary">金印记录</h2>
          <div className="mt-4 max-h-[460px] space-y-3 overflow-auto pr-1">
            {stats.ssrRecords.length ? (
              stats.ssrRecords.map((record) => (
                <div key={`${record.pullNo}-${record.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-gold/30 bg-gold/10 p-4">
                  <div>
                    <p className="font-serif text-xl font-bold text-secondary">{record.name}</p>
                    <p className="text-sm text-on-surface-variant">{record.title}</p>
                  </div>
                  <span className="rounded-full bg-gold px-3 py-1 font-label text-xs font-bold text-primary-container">第 {record.pullNo} 抽</span>
                </div>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-on-surface-variant" data-testid="empty-ssr-history">
                暂无 SSR 记录。
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CodexCard({ character, owned }: { character: Character; owned: boolean }) {
  const style = rarityStyle[character.rarity];

  return (
    <article className={`relative overflow-hidden rounded-2xl border ${style.border} bg-surface/55 ${owned ? style.glow : "opacity-65 grayscale"}`} data-testid={`codex-card-${character.id}`}>
      <CharacterFigure character={character} className="h-56 rounded-none" />
      <div className="absolute right-3 top-3 border border-cinnabar/55 px-2 py-3 text-cinnabar">
        <span className="stamp-frame font-serif text-xs font-bold">{character.seal}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-xl font-bold text-secondary">{owned ? character.name : "未显影"}</h3>
          <span className={`rounded px-2 py-1 font-label text-xs font-bold ${style.chip}`}>{character.rarity}</span>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">{character.title}</p>
        <p className="mt-3 text-sm leading-6 text-on-surface-variant">{owned ? character.quote : "继续祈愿以解锁完整档案。"}</p>
      </div>
    </article>
  );
}

function CodexPage({ records }: { records: PullRecord[] }) {
  const ownedIds = new Set(records.map((record) => record.id));
  const ownedCount = characters.filter((character) => ownedIds.has(character.id)).length;

  return (
    <section className="space-y-6" data-testid="codex-page">
      <SectionTitle
        eyebrow="角色图鉴"
        title="星灵名录"
        right={
          <div className="glass-panel rounded-full px-4 py-2 font-label text-sm font-bold text-primary" data-testid="codex-progress">
            {ownedCount}/{characters.length}
          </div>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="codex-grid">
        {characters.map((character) => (
          <CodexCard key={character.id} character={character} owned={ownedIds.has(character.id)} />
        ))}
      </div>
    </section>
  );
}

export function App() {
  const [activePage, setActivePage] = useState<Page>("home");
  const [state, setState] = useState<GachaState>(initialState);

  const handlePullOne = () => {
    setState((current) => pullOnce(current));
    setActivePage("summon");
  };

  const handlePullTen = () => {
    setState((current) => pullMany(current, 10));
    setActivePage("summon");
  };

  const handleReset = () => setState(initialState);

  return (
    <AppShell activePage={activePage} setActivePage={setActivePage} totalPulls={state.totalPulls}>
      {activePage === "home" && <HomePage onDetails={() => setActivePage("codex")} onWishTen={handlePullTen} />}
      {activePage === "summon" && <SummonPage state={state} onPullOne={handlePullOne} onPullTen={handlePullTen} onReset={handleReset} />}
      {activePage === "stats" && <StatsPage state={state} />}
      {activePage === "codex" && <CodexPage records={state.records} />}
    </AppShell>
  );
}

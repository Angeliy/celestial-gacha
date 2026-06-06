import { describe, expect, it } from "vitest";
import { pullMany, pullOnce, SSR_PITY, type GachaState } from "./gacha";

const emptyState: GachaState = {
  totalPulls: 0,
  pity: 0,
  records: [],
};

describe("gacha", () => {
  it("guarantees SSR on the 90th pull", () => {
    const alwaysMiss = () => 0.99;
    const state = pullMany(emptyState, SSR_PITY, alwaysMiss);

    expect(state.records[0].rarity).toBe("SSR");
    expect(state.pity).toBe(0);
  });

  it("resets pity after natural SSR", () => {
    const alwaysHit = () => 0;
    const state = pullOnce(emptyState, alwaysHit);

    expect(state.records[0].rarity).toBe("SSR");
    expect(state.pity).toBe(0);
  });
});

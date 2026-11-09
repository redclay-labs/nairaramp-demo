import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Polyfill Map.groupBy for Node < 21 environments (such as Node 20 runner)
if (typeof (Map as unknown as { groupBy?: unknown }).groupBy !== "function") {
  (Map as unknown as { groupBy: unknown }).groupBy = function <K, T>(
    items: Iterable<T>,
    keySelector: (item: T, index: number) => K
  ): Map<K, T[]> {
    const map = new Map<K, T[]>();
    let index = 0;
    for (const item of items) {
      const key = keySelector(item, index++);
      const group = map.get(key);
      if (group) {
        group.push(item);
      } else {
        map.set(key, [item]);
      }
    }
    return map;
  };
}

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    server: {
      deps: {
        inline: [
          "@nairaramp/core",
          "@nairaramp/react",
          "@stellar/typescript-wallet-sdk",
        ],
      },
    },
  },
});

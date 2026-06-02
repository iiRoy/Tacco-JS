function Main(source) {
  const rows = source.split("\n");
  const first = rows[0].split(" ");
  const n = Number.parseInt(first[0]);
  const k = Number.parseInt(first[1]);
  const heights = rows[1].split(" ").map(x => parseInt(x));

  if (n === 0 || Number.isNaN(n)) {
    console.log(undefined);
    return;
  }

  const best = [];
  best[0] = 0;
  best[1] = Math.abs(heights[1] - heights[0]);

  if (n === 1) {
    console.log(best[0]);
    return;
  }
  if (n === 2) {
    console.log(best[1]);
    return;
  }

  for (let i = 2; i < n; i++) best[i] = 99999;

  for (let from = 0; from < n; from++) {
    const base = best[from];
    for (let step = 1; step <= k; step++) {
      const to = from + step;
      if (to >= n) break;
      if (to < 2) continue;

      const trial = base + Math.abs(heights[to] - heights[from]);
      if (Number.isNaN(trial) || Number.isNaN(best[to])) {
        best[to] = NaN;
      } else if (trial < best[to]) {
        best[to] = trial;
      }
    }
  }

  console.log(best[n - 1]);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

const fs = require("fs");

const n = Number(fs.readFileSync(0, "utf8").trim());
const MOD = 1000000007;

let ways = new Array(Math.max(n + 1, 4)).fill(0);
ways[0] = 1;

for (let total = 3; total <= n; total++) {
  ways[total] = ways[total - 1] + ways[total - 3];
  if (ways[total] >= MOD) ways[total] %= MOD;
}

process.stdout.write(String(ways[n] % MOD));
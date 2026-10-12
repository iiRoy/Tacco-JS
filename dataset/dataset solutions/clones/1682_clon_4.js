const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let at = 1;
const result = [];

function addJob(groups, key, gain) {
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(gain);
}

function greedy(keys, groups) {
  keys.sort((a, b) => a - b);
  const selected = [];

  for (const key of keys) {
    const bucket = groups.get(key);
    bucket.sort((a, b) => b - a);

    for (const gain of bucket) {
      selected.push(gain);
      selected.sort((a, b) => b - a);

      while (selected.length > key + 1) {
        selected.pop();
      }
    }
  }

  return selected.reduce((a, b) => a + b, 0);
}

while (at < data.length) {
  const N = data[at++];
  if (!Number.isFinite(N)) break;

  let base = 0;
  const leftGroups = new Map();
  const rightGroups = new Map();

  for (let i = 0; i < N; i++) {
    const K = data[at++];
    const L = data[at++];
    const R = data[at++];

    if (K === N || L === R) {
      base += L;
    } else if (L > R) {
      base += R;
      addJob(leftGroups, K - 1, L - R);
    } else {
      base += L;
      addJob(rightGroups, N - K - 1, R - L);
    }
  }

  const leftKeys = Array.from(leftGroups.keys());
  const rightKeys = Array.from(rightGroups.keys());

  const answer = base + greedy(leftKeys, leftGroups) + greedy(rightKeys, rightGroups);
  result.push(String(answer));
}

process.stdout.write(result.join("\n"));
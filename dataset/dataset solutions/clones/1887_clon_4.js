const fs = require("fs");

const lines = fs.readFileSync(0, "utf8").trim().split(/\n/);
const n = Number(lines[0]);
const items = lines.slice(1, n + 1).map(s => {
  let balance = 0;
  for (const ch of s) {
    balance += ch === "(" ? 1 : -1;
  }
  return {
    first: s[0],
    last: s[s.length - 1],
    balance
  };
});

let sum = 0;
let hasLeft = false;
let hasRight = false;

for (const item of items) {
  sum += item.balance;
  if (item.first === "(") hasLeft = true;
  if (item.last === ")") hasRight = true;
}

if (sum !== 0 || !hasLeft || !hasRight) {
  console.log("No");
} else if (n === 1) {
  console.log("Yes");
} else {
  items.sort((a, b) => b.balance - a.balance);

  const full = (1 << n) - 1;
  const start = [];
  const seen = new Set();

  for (let i = 0; i < n; i++) {
    if (items[i].first !== ")" && items[i].balance >= 0) {
      start.push([1 << i, items[i].balance]);
    }
  }

  let ok = false;

  while (start.length && !ok) {
    const state = start.pop();
    const used = state[0];
    const value = state[1];

    for (let i = 0; i < n; i++) {
      if ((used & (1 << i)) !== 0) continue;

      const nextMask = used | (1 << i);
      const nextBalance = value + items[i].balance;

      if (nextMask === full) {
        if (items[i].last === ")" && nextBalance === 0) {
          ok = true;
          break;
        }
        continue;
      }

      const key = nextMask + ":" + nextBalance;
      if (seen.has(key)) continue;
      seen.add(key);

      start.push([nextMask, nextBalance]);
    }
  }

  console.log(ok ? "Yes" : "No");
}
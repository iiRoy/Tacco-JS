const fs = require("fs");

const [base, target] = fs.readFileSync(0, "utf8").trim().split(/\n/);
const n = base.length;

const exists = new Set(base);
for (const ch of target) {
  if (!exists.has(ch)) {
    process.stdout.write("-1");
    process.exit(0);
  }
}

const next = Array.from({ length: n + 1 }, () => Array(26).fill(-1));

for (let c = 0; c < 26; c++) {
  next[n][c] = -1;
}

for (let i = n - 1; i >= 0; i--) {
  for (let c = 0; c < 26; c++) {
    next[i][c] = next[i + 1][c];
  }
  next[i][base.charCodeAt(i) - 97] = i;
}

let rounds = 0;
let place = 0;

for (const ch of target) {
  const code = ch.charCodeAt(0) - 97;

  if (next[place][code] !== -1) {
    place = next[place][code] + 1;
  } else {
    rounds++;
    place = next[0][code] + 1;
  }

  if (place === n) {
    rounds++;
    place = 0;
  }
}

process.stdout.write(String(rounds * n + place));
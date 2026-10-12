const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const n = data[p++];
const d = data[p++];
const a = data[p++];

const monsters = [];

for (let i = 0; i < n; i++) {
  monsters.push([data[p++], data[p++]]);
}

monsters.sort((u, v) => u[0] - v[0]);

const cancel = Array(n + 1).fill(0);
let active = 0;
let answer = 0;
let right = 0;

for (let i = 0; i < n; i++) {
  active += cancel[i];

  const hp = monsters[i][1] - active;

  if (hp <= 0) {
    continue;
  }

  const count = Math.ceil(hp / a);
  const damage = count * a;
  const limit = monsters[i][0] + d * 2 + 1;

  answer += count;
  active += damage;

  if (right < i) {
    right = i;
  }

  while (right < n && monsters[right][0] <= limit) {
    right++;
  }

  cancel[right] -= damage;
}

process.stdout.write(String(answer));
const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
let p = 0;

const n = nums[p++];
const c = nums[p++];

const events = new Map();

for (let i = 0; i < n; i++) {
  const s = nums[p++] - 1;
  const t = nums[p++];
  const ch = nums[p++];

  if (!events.has(s)) events.set(s, []);
  if (!events.has(t)) events.set(t, []);

  events.get(s).push([ch, 1]);
  events.get(t).push([ch, -1]);
}

const times = Array.from(events.keys()).sort((a, b) => a - b);
const active = Array(c + 1).fill(0);
let total = 0;
let answer = 0;

for (const time of times) {
  const list = events.get(time);

  for (const event of list) {
    if (event[1] === -1) {
      const channel = event[0];
      if (active[channel] > 0) {
        active[channel]--;
        if (active[channel] === 0) total--;
      }
    }
  }

  for (const event of list) {
    if (event[1] === 1) {
      const channel = event[0];
      if (active[channel] === 0) total++;
      active[channel]++;
    }
  }

  if (total > answer) {
    answer = total;
  }
}

console.log(answer);
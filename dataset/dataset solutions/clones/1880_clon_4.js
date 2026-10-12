const fs = require("fs");

const data = fs.readFileSync(0, "utf8").trim().split(/\s+/);
const n = Number(data[0]);
const k = BigInt(data[1]);
const to = data.slice(2, 2 + n).map(v => Number(v) - 1);

const order = [];
const seen = new Map();

let cur = 0;
let step = 0;

while (!seen.has(cur)) {
  seen.set(cur, step);
  order.push(cur);
  cur = to[cur];
  step++;
}

const loopStart = seen.get(cur);
const loopSize = order.length - loopStart;

let index;
if (k < BigInt(loopStart)) {
  index = Number(k);
} else {
  index = loopStart + Number((k - BigInt(loopStart)) % BigInt(loopSize));
}

process.stdout.write(String(order[index] + 1));
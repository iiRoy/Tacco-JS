const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");
const records = source.trim().split("\n");

const n = Number(records[0].split(" ").reverse().pop());
const block = records.slice(1, 1 + n);

const groups = [0, 0, 0, 0];
let base = 0;

function signature(text) {
  const head = text[0] === "B" ? 2 : 0;
  const tail = text[text.length - 1] === "A" ? 1 : 0;
  return head | tail;
}

for (let idx = 0; idx < n; idx++) {
  const item = block[idx];
  const found = item.match(/AB/g);
  base += found === null ? 0 : found.length;
  groups[signature(item)]++;
}

const tailA = groups[1];
const headB = groups[2];
const both = groups[3];

let bridge;
if (Math.max(tailA, headB)) {
  bridge = Math.min(tailA, headB) + (both ? both : 0);
} else {
  bridge = both - 1;
}

console.log(base + bridge);

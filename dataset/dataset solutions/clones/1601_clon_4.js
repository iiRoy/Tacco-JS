const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(v => parseInt(v, 10));
const x = nums[0];
const k = nums[1];
const d = nums[2];

const distance = Math.abs(x);
const quotient = Math.abs(x / d);
const rest = x % d;

let answer;

const cases = [
  {
    ok: () => distance < d,
    get: () => (k % 2 === 0 ? x : x + d)
  },
  {
    ok: () => quotient > k,
    get: () => Math.abs(x + (x > 0 ? -k * d : k * d))
  },
  {
    ok: () => true,
    get: () => (k % 2 === 0 && rest === 0 ? d : rest)
  }
];

for (const rule of cases) {
  if (rule.ok()) {
    answer = rule.get();
    break;
  }
}

process.stdout.write(String(answer));
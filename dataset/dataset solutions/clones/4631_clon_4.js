const fs = require("fs");

const nums = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const n = nums[0];
const a = nums.slice(1, n + 1);

let blocks = 1;
let trend = 0;

for (let i = 0; i + 1 < a.length; i++) {
  const d = a[i] === a[i + 1] ? 0 : (a[i] > a[i + 1] ? 1 : -1);

  if (trend !== 0 && d !== 0 && trend !== d) {
    blocks++;
    trend = 0;
  } else if (trend === 0) {
    trend = d;
  }
}

process.stdout.write(String(blocks));
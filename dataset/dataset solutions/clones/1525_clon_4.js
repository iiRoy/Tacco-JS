const fs = require("fs");

const v = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(BigInt);
const left = [v[0], v[1]];
const right = [v[2], v[3]];

let best = left[0] * right[0];

for (const x of left) {
  for (const y of right) {
    const product = x * y;
    if (product > best) {
      best = product;
    }
  }
}

process.stdout.write(best.toString());
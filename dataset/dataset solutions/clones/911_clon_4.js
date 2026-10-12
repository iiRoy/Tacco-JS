const fs = require("fs");

const values = fs.readFileSync(0, "utf8").trim().split(/\s+/).map(Number);
const answers = [];

for (let p = 0; p < values.length; p += 2) {
  const total = values[p];
  const target = values[p + 1];

  if (!total) break;

  let best = 1073741824;
  const limit = Math.floor(total / 2);

  for (let left = 0; left <= limit; left++) {
    const right = total - left;
    const length = Math.sqrt(left * left + right * right);
    const gap = Math.abs(target - length);

    if (gap < best) {
      best = gap;
    }
  }

  answers.push(String(best));
}

process.stdout.write(answers.join("\n"));
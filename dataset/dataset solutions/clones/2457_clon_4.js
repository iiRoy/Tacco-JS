const fs = require("fs");

const s = fs.readFileSync(0, "utf8").trim();
let total = 0;
let pos = 0;

function tri(n) {
  return n * (n + 1) / 2;
}

while (pos < s.length) {
  let up = 0;
  while (s[pos] === "<") {
    up++;
    pos++;
  }

  let down = 0;
  while (s[pos] === ">") {
    down++;
    pos++;
  }

  total += tri(up) + tri(down) - Math.min(up, down);
}

process.stdout.write(String(total));
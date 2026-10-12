const fs = require("fs");

const [a, b] = fs.readFileSync(0, "utf8").trim().split(/\n/);
const height = a.length;
const width = b.length;

const len = Array.from({ length: height + 1 }, () => Array(width + 1).fill(0));

for (let y = height - 1; y >= 0; y--) {
  for (let x = width - 1; x >= 0; x--) {
    if (a[y] === b[x]) {
      len[y][x] = len[y + 1][x + 1] + 1;
    } else {
      len[y][x] = Math.max(len[y + 1][x], len[y][x + 1]);
    }
  }
}

let i = 0;
let j = 0;
let out = "";

while (i < height && j < width) {
  if (a[i] === b[j]) {
    out += a[i];
    i++;
    j++;
  } else if (len[i + 1][j] >= len[i][j + 1]) {
    i++;
  } else {
    j++;
  }
}

process.stdout.write(out);
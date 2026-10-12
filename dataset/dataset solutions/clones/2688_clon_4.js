const fs = require("fs");

const s = fs.readFileSync(0, "utf8").trim();
const n = s.length;
const result = Array(n).fill(0);

let i = 0;

while (i < n) {
  let rStart = i;

  while (i < n && s[i] === "R") {
    i++;
  }

  let boundary = i - 1;
  let rCount = i - rStart;

  let lStart = i;

  while (i < n && s[i] === "L") {
    i++;
  }

  let lCount = i - lStart;

  result[boundary] = Math.ceil(rCount / 2) + Math.floor(lCount / 2);
  result[boundary + 1] = Math.floor(rCount / 2) + Math.ceil(lCount / 2);
}

process.stdout.write(result.join(" "));
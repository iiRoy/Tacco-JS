const fs = require("fs");
const source = fs.readFileSync("/dev/stdin", "utf8");

const positions = [0, 2, 4];
const picked = positions.map(function (place) {
  return source[place] * 1;
});

const usable = picked.every(function (part) {
  return part === part;
});

const divisibleEndings = new Set();
for (let ten = 0; ten < 10; ten++) {
  for (let one = 0; one < 10; one++) {
    if ((ten * 10 + one) % 4 === 0) {
      divisibleEndings.add(ten + ":" + one);
    }
  }
}

const key = picked[1] + ":" + picked[2];
console.log(usable && divisibleEndings.has(key) ? "YES" : "NO");

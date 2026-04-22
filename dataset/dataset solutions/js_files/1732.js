var fs = require("fs");
var line = fs.readFileSync("/dev/stdin");
var N = Number(line);
var res = 0;

for (let i = 1; i <= N; i++) {
  const n = Math.floor(N / i);
  res += (i * n * (n + 1)) / 2;
}

console.log(res);

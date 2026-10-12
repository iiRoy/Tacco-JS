for (x = [], y = 100; y--; ) z = x[y] = 0;
require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split("\n")
  .some(function (v) {
    if (+v) x[+v]++, (z = x[+v] > z ? x[+v] : z);
  });
x.some(function (v, k) {
  if (v == z) console.log(k);
});
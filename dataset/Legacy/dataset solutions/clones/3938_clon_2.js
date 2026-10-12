let [val1, val2, val3, val4] = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split("\n")
  .map(Number);
console.log(Math.min(val1, val2) + Math.min(val3, val4));

let [a, b, c, d] = require("fs").readFileSync("/dev/stdin", "utf8").split("\n").map(Number);
console.log(Math.min(a, b) + Math.min(c, d));
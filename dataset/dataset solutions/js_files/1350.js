var input = require("fs").readFileSync("/dev/stdin", "utf8");
var A = input.split(/\n/)[0];
console.log((A * A * A) + "\n");
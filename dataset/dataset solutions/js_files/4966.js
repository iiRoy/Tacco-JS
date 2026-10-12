const input = require("fs").readFileSync("/dev/stdin","UTF-8").trim().split("\n");
const a = Number(input[0]);
const b = Number(input[1]);
const h = Number(input[2]);
console.log((a+b)*h/2);

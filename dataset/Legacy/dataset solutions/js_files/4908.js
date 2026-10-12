'use strict';

const lines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split(" ");
const a = lines[0];
const b = lines[1];
const c = lines[2];

if (a===b && b===c) {
  console.log(1);
}
if (a===b && b!==c) {
  console.log(2);
}
if (a===c && a!==b) {
  console.log(2);
}
if (b===c && a!==b) {
  console.log(2);
}
if (a!==b && b!==c && c!==a) {
  console.log(3);
}
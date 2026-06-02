const fs = require("fs");

const data = fs.readFileSync("/dev/stdin", "utf8").trim();
const parts = new Map();

parts.set("first", 24);
parts.set("second", 24);
parts.set("input", -data);

let answer = 0;
for (const value of parts.values()) {
  answer += value;
}

console.log(answer);

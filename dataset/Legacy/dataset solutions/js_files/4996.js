'use strict';

const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("");

let answer = "Yes";

for (let i = 0; i < lines.length; i++) {
  let count = 0;
  lines.forEach(num => {
    if (lines[i] == num) {
      count++;
    }
  });
  if (count % 2 != 0) {
    answer = "No";
    break;
  }
}

console.log(answer);


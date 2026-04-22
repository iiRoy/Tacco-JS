'use strict';

const lines = require("fs").readFileSync("/dev/stdin", "utf8").split("");
let answer = "Yes";

for (let i = 0; i < lines.length; i++) {
  let count = 0;
  //同じ文字を数える
  lines.forEach(letter => {
    if (lines[i] === letter)
    count++;
  });
  //数えた数が奇数ならNoを返して抜ける
  if (count % 2 === 1) {
    answer = "No";
    break;
  }
}
console.log(answer);


"use strict";
main(require("fs").readFileSync("/dev/stdin", "UTF-8"));

function main(input) {
  input = input
    .split("\n")[0]
    .split(" ")
    .map(n => parseInt(n));
  let conut = 1;
  if (input[0] >= input[1]) console.log(1);
  else {
    while (input[1] > input[0]) {
      input[0] += input[0] - 1;
      conut++;
    }
  }
  console.log(conut);
}

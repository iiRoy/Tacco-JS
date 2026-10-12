"use strict";
main(require("fs").readFileSync("/dev/stdin", "UTF-8"));

function main(input) {
  input = input.split("\n");
  const stringNum = parseInt(input.shift());
  input = input.map(s =>
    s
      .split("")
      .sort()
      .join("")
  );
  let result = 0;
  for (let i = 0; i < stringNum; i++) {
    for (let f = i + 1; f < stringNum; f++) {
      if (input[i] === input[f]) result++;
    }
  }
  console.log(result);
}

"use strict";

function main(input) {
  input = input.trim().split("\n");
  const line1 = Number(input[0]);
  let count = 0;
  for (let i = 1; i <= line1; i++) {
    const tmp = input[i].split(" ");
    if (tmp[0] == tmp[1]) {
      count++;
    } else {
      count = 0;
    }
    if (count >= 3) {
      console.log("Yes");
      return;
    }
  }

  console.log("No");
}

function numberSort(array) {
  array.sort(f);
  return array;
}

var f = function (a, b) {
  return a - b;
};

main(require("fs").readFileSync("/dev/stdin", "utf-8"));

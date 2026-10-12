"use strict";

function main(input) {
  input = input.trim().split(" ");
  const L = parseInt(input[0]);
  const R = parseInt(input[1]);
  const d = parseInt(input[2]);
  let ans = 0;

  for (let i = d; i < 101; i = i + d) {
    if (L <= i && R >= i) {
      ans++;
    }
  }
  console.log(ans);
}

function numberSort(array) {
  array.sort(f);
  return array;
}

var f = function (a, b) {
  return a - b;
};

main(require("fs").readFileSync("/dev/stdin", "utf-8"));

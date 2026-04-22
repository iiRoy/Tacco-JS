"use strict";

function main(input) {
  input = input.trim().split("\n");
  const N = Number(input[0]);
  const line2_arr = input[1].split(" ");
  let ans = 0;
  for (let i = 0; i < N - 1; i++) {
    if (Number(line2_arr[i]) > Number(line2_arr[i + 1])) {
      ans += Number(line2_arr[i]) - Number(line2_arr[i + 1]);
      line2_arr[i + 1] = line2_arr[i];
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

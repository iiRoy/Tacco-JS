"use strict";
function Main(input) {
  input = input.split("\n");
  let line0 = input[0].split(" ");
  let N = parseInt(line0[0]);
  let K = parseInt(line0[1]);
  function pow3(k) {
    return k * k * k;
  }
  if (K % 2 === 0) {
    console.log(pow3(Math.floor(N / K)) + pow3(Math.floor((N + K / 2) / K)));
  } else {
    console.log(pow3(Math.floor(N / K)));
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

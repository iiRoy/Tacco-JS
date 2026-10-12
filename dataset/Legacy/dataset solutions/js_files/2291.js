"use strict"
function Main(input) {
  input = input.trim().split(' ');
  console.log(input[1]+input[0]);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
"use strict"
 
function Main(input) {
  input = input.trim().split(' ').map(Number);
 
  if(input[0] <= 10) {
    console.log(input[1] + (100 * (10 - input[0])));
  } else {
    console.log(input[1]);
  }
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
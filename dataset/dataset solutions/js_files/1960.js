'use strict';
function Main(input) {
	input = input.split("\n");
  let a = parseInt(input[0], 10);
	console.log(2 * a * Math.PI);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));
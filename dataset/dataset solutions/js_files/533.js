"use strict";

function Main(input) {
  const ab = input.split(" ");
  console.log((ab[0]+ab[1])/2);
}
Main(require("fs").readFileSync("/dev/stdin", "utf8"));

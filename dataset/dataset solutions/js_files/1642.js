"use strict";

function main(input) {
  input = input.trim();
  let N = parseInt(input);

  if (N >= 400 && N <= 599) console.log("8");
  if (N >= 600 && N <= 799) console.log("7");
  if (N >= 800 && N <= 999) console.log("6");
  if (N >= 1000 && N <= 1199) console.log("5");
  if (N >= 1200 && N <= 1399) console.log("4");
  if (N >= 1400 && N <= 1599) console.log("3");
  if (N >= 1600 && N <= 1799) console.log("2");
  if (N >= 1800 && N <= 1999) console.log("1");
}

function numberSort(array) {
  array.sort(f);
  return array;
}

var f = function (a, b) {
  return a - b;
};

main(require("fs").readFileSync("/dev/stdin", "utf-8"));

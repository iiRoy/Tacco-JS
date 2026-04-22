"use strict";
function Main(input) {
  const first = parseInt(input.slice(0, 2));
  const second = parseInt(input.slice(2));
  const firstMM = 0 < first && first < 13;
  const secondMM = 0 < second && second < 13;
  if (firstMM && secondMM) {
    console.log('AMBIGUOUS');
    return;
  } else if (firstMM) {
    console.log('MMYY');
    return;
  } else if (secondMM) {
    console.log('YYMM');
    return;
  }
  console.log('NA');
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
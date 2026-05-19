const sourceData = require("fs").readFileSync("/dev/stdin", "utf8").split(/\s|,/);

const numericSequence = sourceData.map(Number);

let currentS = 0;
let currentT = 0;

const initialLengthMinusOne = numericSequence.length - 1;
let currentIdx = initialLengthMinusOne;

while (currentIdx--) {
  const valueB = +numericSequence[currentIdx--];
  currentS += valueB;
  currentT += valueB * numericSequence[currentIdx];
}

const finalDivisor = initialLengthMinusOne * 2;

const roundedCalculation = ~~(currentS / finalDivisor + 0.5);

console.log(currentT + '\n' + roundedCalculation);

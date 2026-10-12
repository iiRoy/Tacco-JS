'use strict';

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const firstLineParts = inputLines[0].split(' ');
  const count = Number(firstLineParts[0]);
  const targetValue = Number(firstLineParts[1]);

  const numbersFromSecondLine = inputLines[1].split(' ').map(Number);

  const diffs = numbersFromSecondLine.map(currentNumber => Math.abs(currentNumber - targetValue));

  function calculateGCD(num1, num2) {
    let remainder;

    let tempHolder;
    if (num1 < num2) {
      tempHolder = num1;
      num1 = num2;
      num2 = tempHolder;
    }

    while ((remainder = num1 % num2) !== 0) {
      num1 = num2;
      num2 = remainder;
    }

    return num2;
  }

  const finalResultGCD = diffs.reduce((accumulator, currentDiffValue) => calculateGCD(accumulator, currentDiffValue));

  console.log(finalResultGCD);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

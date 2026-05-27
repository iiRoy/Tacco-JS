'use strict';

const processInput = (inputLines) => {
  const targetNum = parseInt(inputLines[0], 10);
  let currentMinSum = 10000000000000;

  const sqrtTargetNum = Math.floor(Math.sqrt(targetNum));

  for (let currentDivisor = 1; currentDivisor <= sqrtTargetNum; currentDivisor++) {
    const isFactor = (targetNum % currentDivisor === 0);

    if (isFactor) {
      const otherDivisor = targetNum / currentDivisor;
      const calculatedSum = currentDivisor - 2 + otherDivisor;
      currentMinSum = Math.min(currentMinSum, calculatedSum);
    }
  }
  console.log(currentMinSum);
};

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const linesArray = fileContent.split('\n');
processInput(linesArray);

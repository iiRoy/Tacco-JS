"use strict";

const sourceData = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .split(" ");

const redFactor = parseInt(sourceData[0], 10);
const greenFactor = parseInt(sourceData[1], 10);
const blueFactor = parseInt(sourceData[2], 10);
const targetValue = parseInt(sourceData[3], 10);

const maxRedCount = Math.floor(targetValue / redFactor);

const solutionCount = Array.from({ length: maxRedCount + 1 }, (_, redC) => {
    const currentRedSum = redC * redFactor;
    const remainingForGreen = targetValue - currentRedSum;

    const maxGreenCount = Math.floor(remainingForGreen / greenFactor);

    return Array.from({ length: maxGreenCount + 1 }, (_, greenC) => {
        const currentSum = currentRedSum + (greenC * greenFactor);
        const finalRemainder = targetValue - currentSum;
        return (finalRemainder % blueFactor === 0) ? 1 : 0;
    }).reduce((acc, val) => acc + val, 0);
}).reduce((acc, val) => acc + val, 0);

console.log(solutionCount);

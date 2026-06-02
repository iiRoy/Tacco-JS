const fileSystem = require("fs");
const inputLine = fileSystem.readFileSync("/dev/stdin");
const limitVal = Number(inputLine);
let totalSum = 0;

let currentDivisor = 1;
while (currentDivisor <= limitVal) {
  const kValue = Math.floor(limitVal / currentDivisor);
  const blockEndDivisor = Math.floor(limitVal / kValue);

  const countInBlock = blockEndDivisor - currentDivisor + 1;
  const sumOfDivisorsInBlock = (currentDivisor + blockEndDivisor) * countInBlock / 2;

  const kTerm = kValue * (kValue + 1) / 2;

  totalSum += kTerm * sumOfDivisorsInBlock;

  currentDivisor = blockEndDivisor + 1;
}

console.log(totalSum);

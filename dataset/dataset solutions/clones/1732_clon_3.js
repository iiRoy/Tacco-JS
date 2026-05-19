var fileSystemHandler = require("fs");
var rawInputLine = fileSystemHandler.readFileSync("/dev/stdin");
var limitValue = Number(rawInputLine);

function calculateSummation(upperBound) {
  let cumulativeSum = 0;
  let currentDivisor = 1;

  while (currentDivisor <= upperBound) {
    const quotientFloor = Math.floor(upperBound / currentDivisor);
    const sumOfNaturalsUpToQuotient = (quotientFloor * (quotientFloor + 1)) / 2;
    let termContribution = currentDivisor * sumOfNaturalsUpToQuotient;
    cumulativeSum += termContribution;
    currentDivisor++;
  }
  return cumulativeSum;
}

var finalResult = calculateSummation(limitValue);
console.log(finalResult);

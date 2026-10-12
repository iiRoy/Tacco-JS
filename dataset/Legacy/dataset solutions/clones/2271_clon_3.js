function processInput(rawData) {
  const MOD_CONSTANT_VALUE = 10000000007;
  let moduloValue = MOD_CONSTANT_VALUE;

  let inputLines = rawData.split("\n");
  let elementCount = Number(inputLines[0]);

  let numberStringParts = inputLines[1].split(" ");
  let numericSequence = numberStringParts.map(currentNumStr => parseInt(currentNumStr, 10));

  let accumulatedSum = 0;
  let calculatedFactorial = 1;

  const loopLimit = elementCount;
  const startIndex = 1;

  for (let loopIndex = startIndex; loopIndex < loopLimit; loopIndex++) {
    accumulatedSum += numericSequence[loopIndex];
    calculatedFactorial *= loopIndex;
  }

  const divisorForAverage = elementCount - 1;
  const averageComponent = accumulatedSum / divisorForAverage;

  const productBeforeModulo = averageComponent * calculatedFactorial;
  const finalComputedResult = productBeforeModulo % moduloValue;

  console.log(finalComputedResult);
}

function executeProgram() {
  const fileSystemModule = require("fs");
  const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
  processInput(standardInputContent);
}

executeProgram();

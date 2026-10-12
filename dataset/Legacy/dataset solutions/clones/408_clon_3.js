const memoizedValues = {
  0: 1,
  1: 1,
  2: 2
};

function calculateTribonacciLike(currentTerm) {
  if (currentTerm in memoizedValues) {
    return memoizedValues[currentTerm];
  }

  const termMinusOneResult = calculateTribonacciLike(currentTerm - 1);
  const termMinusTwoResult = calculateTribonacciLike(currentTerm - 2);
  const termMinusThreeResult = calculateTribonacciLike(currentTerm - 3);

  const computedValue = termMinusOneResult + termMinusTwoResult + termMinusThreeResult;
  memoizedValues[currentTerm] = computedValue;
  return computedValue;
}

function calculateYearsNeeded(inputNumber) {
  const dailyUnitsPerYear = 10 * 365;
  const sequenceResult = calculateTribonacciLike(inputNumber);
  const rawYearsCalculation = sequenceResult / dailyUnitsPerYear;
  return Math.ceil(rawYearsCalculation);
}

function retrieveAndParseInput(sourcePath) {
  const fileSystemModule = require("fs");
  const fileContent = fileSystemModule.readFileSync(sourcePath, "utf-8");
  return fileContent.split("\n");
}

const inputLines = retrieveAndParseInput("/dev/stdin");

for (const lineContent of inputLines) {
  const numericInput = Number(lineContent);
  if (numericInput === 0) {
    continue;
  }
  console.log(calculateYearsNeeded(numericInput));
}

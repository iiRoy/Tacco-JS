function calculateGreatestCommonDivisor(paramA, paramB) {
  let currentA = paramA;
  let currentB = paramB;
  while (currentB) {
    [currentA, currentB] = [currentB, currentA % currentB];
  }
  return currentA;
}

function determineLeastCommonMultiple(valueOne, valueTwo) {
  if (valueOne === 0 || valueTwo === 0) return 0;
  return (valueOne * valueTwo) / calculateGreatestCommonDivisor(valueOne, valueTwo);
}

function countNumbersDivisibleBy(factor, rangeStart, rangeEnd) {
  if (factor === 0) return 0;
  if (rangeStart > rangeEnd) return 0;

  return Math.floor(rangeEnd / factor) - Math.floor((rangeStart - 1) / factor);
}

function processInputAndCalculate(inputData) {
  const rangeLower = parseInt(inputData[0], 10);
  const rangeUpper = parseInt(inputData[1], 10);
  const divisorOne = parseInt(inputData[2], 10);
  const divisorTwo = parseInt(inputData[3], 10);

  const totalElementsInSpan = rangeUpper - rangeLower + 1;

  const countDivisibleByOne = countNumbersDivisibleBy(divisorOne, rangeLower, rangeUpper);
  const countDivisibleByTwo = countNumbersDivisibleBy(divisorTwo, rangeLower, rangeUpper);

  const commonDivisorLCM = determineLeastCommonMultiple(divisorOne, divisorTwo);
  const countDivisibleByBoth = countNumbersDivisibleBy(commonDivisorLCM, rangeLower, rangeUpper);

  const countUnionOfDivisors = countDivisibleByOne + countDivisibleByTwo - countDivisibleByBoth;

  console.log(totalElementsInSpan - countUnionOfDivisors);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));

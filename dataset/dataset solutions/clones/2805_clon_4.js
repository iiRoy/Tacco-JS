function computeGcd(val1, val2) {
  if (val2 === 0) {
    return val1;
  }
  return computeGcd(val2, val1 % val2);
}

function computeLcm(val1, val2) {
  if (val1 === 0 || val2 === 0) return 0;
  const absoluteVal1 = Math.abs(val1);
  const absoluteVal2 = Math.abs(val2);
  return (absoluteVal1 / computeGcd(absoluteVal1, absoluteVal2)) * absoluteVal2;
}

function countDivisibleInRange(startValue, endValue, factorValue) {
  if (factorValue === 0) return 0;
  if (startValue > endValue) return 0;

  const countUpToEnd = Math.floor(endValue / factorValue);
  const countUpToBeforeStart = Math.floor((startValue - 1) / factorValue);

  return countUpToEnd - countUpToBeforeStart;
}

function ProcessNumericalData(dataStream) {
  const lowerBoundary = parseInt(dataStream[0], 10);
  const upperBoundary = parseInt(dataStream[1], 10);
  const primaryDivisor = parseInt(dataStream[2], 10);
  const secondaryDivisor = parseInt(dataStream[3], 10);

  const totalElementsInInterval = upperBoundary - lowerBoundary + 1;

  const multiplesOfPrimary = countDivisibleInRange(lowerBoundary, upperBoundary, primaryDivisor);
  const multiplesOfSecondary = countDivisibleInRange(lowerBoundary, upperBoundary, secondaryDivisor);

  const commonMultipleValue = computeLcm(primaryDivisor, secondaryDivisor);
  const multiplesOfCommon = countDivisibleInRange(lowerBoundary, upperBoundary, commonMultipleValue);

  const unionCount = multiplesOfPrimary + multiplesOfSecondary - multiplesOfCommon;

  const finalResult = totalElementsInInterval - unionCount;

  console.log(finalResult);
}

ProcessNumericalData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
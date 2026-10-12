function deduplicateArray(inputArray) {
  return Array.from(new Set(inputArray));
}

function findMultiplesInRange(upperBound, divisorValue, startingFactor) {
  const collectedMultiples = [];
  let currentFactor = startingFactor;
  while (divisorValue * currentFactor <= upperBound) {
    collectedMultiples.push(divisorValue * currentFactor);
    currentFactor++;
  }
  return collectedMultiples;
}

function processInputData(rawData) {
  const rangeStart = parseInt(rawData[0], 10);
  const rangeEnd = parseInt(rawData[1], 10);
  const primaryDivisor = parseInt(rawData[2], 10);
  const secondaryDivisor = parseInt(rawData[3], 10);

  const initialFactorPrimary = Math.ceil(rangeStart / primaryDivisor);
  const initialFactorSecondary = Math.ceil(rangeStart / secondaryDivisor);

  let combinedMultiples = [];

  const multiplesOfPrimary = findMultiplesInRange(rangeEnd, primaryDivisor, initialFactorPrimary);
  combinedMultiples = combinedMultiples.concat(multiplesOfPrimary);

  const multiplesOfSecondary = findMultiplesInRange(rangeEnd, secondaryDivisor, initialFactorSecondary);
  combinedMultiples = combinedMultiples.concat(multiplesOfSecondary);

  const uniqueMultiples = deduplicateArray(combinedMultiples);

  const totalCountInRange = rangeEnd - rangeStart + 1;
  const resultCount = totalCountInRange - uniqueMultiples.length;

  console.log(resultCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));

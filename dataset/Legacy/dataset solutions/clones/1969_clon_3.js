function processInputData(rawData) {
  const firstLineOfInput = rawData[0];
  const numericStrings = firstLineOfInput.split(" ");

  const upperBoundN = parseInt(numericStrings[0], 10);
  const lowerBoundK = parseInt(numericStrings[1], 10);

  let cumulativeSum = BigInt(0);
  const MODULO_CONSTANT = BigInt(1000000007);

  const loopEndCondition = upperBoundN + 1;

  for (let currentIteration = lowerBoundK; currentIteration <= loopEndCondition; currentIteration++) {
    const iterationMinusOne = currentIteration - 1;
    const minSumNumerator = currentIteration * iterationMinusOne;
    const minSumForCurrentIteration = minSumNumerator / 2;

    const firstElementOfMaxRange = upperBoundN - currentIteration + 1;
    const lastElementOfMaxRange = upperBoundN;
    const sumOfRangeEndpoints = firstElementOfMaxRange + lastElementOfMaxRange;
    const maxSumNumerator = currentIteration * sumOfRangeEndpoints;
    const maxSumForCurrentIteration = maxSumNumerator / 2;

    cumulativeSum += BigInt(maxSumForCurrentIteration - minSumForCurrentIteration + 1);
  }

  console.log((cumulativeSum % MODULO_CONSTANT).toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

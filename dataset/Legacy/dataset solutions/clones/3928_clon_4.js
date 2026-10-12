function processInputData(rawData) {
  const lineSegments = rawData.split("\n");
  const dataCount = Number(lineSegments[0]);

  const numericPairs = lineSegments.slice(1, dataCount + 1).map(lineText =>
    lineText.split(" ").map(Number)
  );

  const sumOfFirstElements = numericPairs.reduce((accumulatedSum, currentPair) =>
    accumulatedSum + currentPair[0], 0
  );

  const relevantSecondElements = numericPairs
    .filter(pairItem => pairItem[0] > pairItem[1])
    .map(pairItem => pairItem[1]);

  const smallestRelevantSecond = Math.min(...relevantSecondElements);

  const computedOutcome = (smallestRelevantSecond === Infinity)
    ? 0
    : sumOfFirstElements - smallestRelevantSecond;

  console.log(computedOutcome);
}

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));

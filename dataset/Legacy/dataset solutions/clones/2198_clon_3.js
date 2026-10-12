function processInputData(rawInputContent) {
  const inputLines = rawInputContent.split("\n");
  const firstLineSegments = inputLines[0].split(" ");
  let currentNumericValue = Number.parseInt(firstLineSegments[0], 10);
  let halvingOperationsCount = 0;

  const loopTerminationThreshold = 1;

  while (currentNumericValue > loopTerminationThreshold) {
    currentNumericValue = Math.floor(currentNumericValue / 2);
    halvingOperationsCount++;
  }

  let computedResult = 1;

  if (halvingOperationsCount > 1) {
    const countSquared = halvingOperationsCount * halvingOperationsCount;
    const powerOfTwoValue = Math.pow(2, halvingOperationsCount);
    computedResult = (countSquared - 1) + powerOfTwoValue;
  }

  console.log(computedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

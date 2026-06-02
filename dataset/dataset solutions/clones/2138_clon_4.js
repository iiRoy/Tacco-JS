function processInput(inputString) {
  const inputLines = inputString.split("\n");
  const elementCount = Number(inputLines[0]);
  const numericData = inputLines[1].split(" ").map(Number);

  numericData.sort((valA, valB) => valA - valB);

  let overallMinimumSum = Infinity;

  const lowerBound = numericData[0];
  const upperBound = numericData[elementCount - 1];

  Array.from({ length: upperBound - lowerBound }, (_, index) => lowerBound + index)
    .forEach(currentTestValue => {
      const currentSumOfSquaredDifferences = numericData.reduce((accumulator, dataPoint) => {
        const difference = dataPoint - currentTestValue;
        return accumulator + difference * difference;
      }, 0);

      overallMinimumSum = Math.min(overallMinimumSum, currentSumOfSquaredDifferences);
    });

  console.log(overallMinimumSum);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

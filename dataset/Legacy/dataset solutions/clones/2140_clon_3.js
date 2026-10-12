function processInputData(rawInputString) {
  "use strict";

  const inputLines = rawInputString.split("\n");

  const parseNumericString = (str) => parseInt(str, 10);

  const itemCountString = inputLines.shift();
  const itemCount = parseNumericString(itemCountString);

  const parseCoordinateLine = (line) => {
    return line.split(" ").map(parseNumericString);
  };
  const coordinateValues = parseCoordinateLine(inputLines.shift());

  let minimumSquaredDeviation = Infinity;

  const MIN_POSSIBLE_TARGET = 1;
  const MAX_POSSIBLE_TARGET = 100;

  const calculateSumOfSquaredDifferences = (coordsArray, targetValue) => {
    return coordsArray.map(currentCoord => {
      const difference = currentCoord - targetValue;
      return Math.pow(difference, 2);
    }).reduce((sumAccumulator, currentTerm) => sumAccumulator + currentTerm, 0);
  };

  for (let potentialTarget = MIN_POSSIBLE_TARGET; potentialTarget <= MAX_POSSIBLE_TARGET; potentialTarget++) {
    const currentDeviationSum = calculateSumOfSquaredDifferences(coordinateValues, potentialTarget);
    minimumSquaredDeviation = Math.min(minimumSquaredDeviation, currentDeviationSum);
  }

  console.log(minimumSquaredDeviation);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

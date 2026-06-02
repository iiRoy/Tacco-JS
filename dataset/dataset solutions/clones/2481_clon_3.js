function processInputData(rawDataLines) {
  const getMaximum = (valueOne, valueTwo) => (valueOne > valueTwo ? valueOne : valueTwo);

  const firstLineSegments = rawDataLines[0].split(" ");
  const numberOfItems = parseInt(firstLineSegments[0], 10);
  const allowedSumLimit = parseInt(firstLineSegments[1], 10);

  const arrayAValues = rawDataLines[1].split(" ").map(Number);
  const arrayFValues = rawDataLines[2].split(" ").map(Number);

  // Sort arrayAValues in descending order
  arrayAValues.sort((valA, valB) => valB - valA);

  // Sort arrayFValues in ascending order
  arrayFValues.sort((valA, valB) => valA - valB);

  const initialUpperBoundary = 1000000;
  const initialLowerBoundary = 0;

  let currentUpperBoundary = initialUpperBoundary;
  let currentLowerBoundary = initialLowerBoundary;
  let currentMidpointGuess;

  while (currentLowerBoundary + 1 < currentUpperBoundary) {
    currentMidpointGuess = (currentLowerBoundary + currentUpperBoundary) / 2;
    let accumulatedSum = 0;

    for (let itemIndex = 0; itemIndex < numberOfItems; itemIndex++) {
      const termCalculation = arrayAValues[itemIndex] - currentMidpointGuess / arrayFValues[itemIndex];
      accumulatedSum += getMaximum(termCalculation, 0);
    }

    if (accumulatedSum <= allowedSumLimit) {
      currentUpperBoundary = currentMidpointGuess;
    } else {
      currentLowerBoundary = currentMidpointGuess;
    }
  }

  console.log("d:%s t:%s", currentLowerBoundary, currentUpperBoundary);
}

processInputData(
  require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .split("\n")
);

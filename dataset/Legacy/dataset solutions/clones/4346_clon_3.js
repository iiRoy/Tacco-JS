"use strict";

const parseNumericString = (str) => Number(str);

function processInputAndCalculate(rawInputString) {
  const inputLines = rawInputString.split(/\n/);

  // Extract N and K values from the first two lines
  const [numItems] = inputLines[0].split(" ").map(parseNumericString);
  const [targetPoint] = inputLines[1].split(" ").map(parseNumericString);

  // Parse the array of ball positions from the third line
  const itemPositions = inputLines[2].split(" ").map(parseNumericString);

  let accumulatedDistance = 0;

  // Define a small helper function for the core distance calculation
  const determineMinimumPath = (currentPosition, fixedTarget) => {
    const distanceToOrigin = currentPosition;
    const distanceToTarget = Math.abs(currentPosition - fixedTarget);
    return Math.min(distanceToOrigin, distanceToTarget);
  };

  // Iterate through each item to calculate its contribution to the total distance
  for (let itemIndex = 0; itemIndex < numItems; itemIndex++) {
    const currentItemPosition = itemPositions[itemIndex];
    accumulatedDistance += determineMinimumPath(currentItemPosition, targetPoint);
  }

  // The problem requires the total round trip distance, so multiply by two
  const finalResult = accumulatedDistance * 2;

  console.log(finalResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));

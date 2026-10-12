'use strict'

const calculateAbsoluteDistance = (coordA, coordB) => Math.abs(coordA - coordB);

function processInput(rawInputString) {
  const inputLines = rawInputString.split('\n');
  const numberStrings = inputLines[1].split(' ');
  const parsedNumbers = numberStrings.map(numericValue => Number(numericValue));

  const locationPoints = [0, ...parsedNumbers, 0];
  const differenceArray = [];
  const resultOutputs = [];

  const collectionLength = locationPoints.length;
  for (let idx = 0; idx < collectionLength - 1; idx++) {
    const currentPoint = locationPoints[idx];
    const nextPoint = locationPoints[idx + 1];
    differenceArray.push(nextPoint - currentPoint);
  }

  let totalAbsoluteDifference = 0;
  for (const diffVal of differenceArray) {
    totalAbsoluteDifference += Math.abs(diffVal);
  }

  const numPointsToConsider = locationPoints.length;

  for (let currentIdx = 1; currentIdx < numPointsToConsider - 1; currentIdx++) {
    const prevPointCoord = locationPoints[currentIdx - 1];
    const currentPointCoord = locationPoints[currentIdx];
    const nextPointCoord = locationPoints[currentIdx + 1];

    // Calculate the distance if the intermediate point (currentPointCoord) is skipped (a to c)
    const distanceSkippingIntermediate = calculateAbsoluteDistance(prevPointCoord, nextPointCoord);

    // Calculate the distance if the intermediate point is included ((a to b) + (b to c))
    const distanceIncludingIntermediate = calculateAbsoluteDistance(prevPointCoord, currentPointCoord) +
                                           calculateAbsoluteDistance(currentPointCoord, nextPointCoord);

    // Determine the net change in total distance when the current point is skipped
    const netChangeInDistance = distanceSkippingIntermediate - distanceIncludingIntermediate;

    resultOutputs.push(totalAbsoluteDifference + netChangeInDistance);
  }

  console.log(resultOutputs.join('\n'));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

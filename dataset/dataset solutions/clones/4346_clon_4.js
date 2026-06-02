"use strict";

function processData(rawData) {
  const lineSegments = rawData.split('\n');

  const firstLineParts = lineSegments[0].split(' ');
  const itemCount = Number(firstLineParts[0]);

  const secondLineParts = lineSegments[1].split(' ');
  const thresholdValue = Number(secondLineParts[0]);

  const spherePositions = lineSegments[2].split(' ').map(Number);

  const determineOptimalPath = (currentPosition, limit) =>
    Math.min(currentPosition, Math.abs(currentPosition - limit));

  const totalDistance = spherePositions.reduce((accumulatedDistance, currentPosition) => {
    return accumulatedDistance + determineOptimalPath(currentPosition, thresholdValue);
  }, 0);

  const finalResult = totalDistance * 2;

  console.log(finalResult);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));

"use strict";

function splitInputLikeOriginal(rawInput) {
  return rawInput.trim().split("\n");
}

function parseHeaderValues(headerLine) {
  const pieces = headerLine.split(" ");

  return {
    N: parseInt(pieces[0]),
    D: parseInt(pieces[1])
  };
}

function extractPointLines(inputLines, totalPoints) {
  return inputLines.slice(1, totalPoints + 1);
}

function parsePointCoordinates(pointLine) {
  const rawValues = pointLine.split(" ");
  const coordinates = [];

  for (let index = 0; index < rawValues.length; index++) {
    coordinates.push(parseInt(rawValues[index]));
  }

  return coordinates;
}

function calculateDistanceLikeOriginal(sourcePoint, targetPoint) {
  let distanceAccumulator = 0;

  for (let coordinateIndex = 0; coordinateIndex < targetPoint.length; coordinateIndex++) {
    distanceAccumulator += Math.abs(
      Math.pow(sourcePoint[coordinateIndex] - targetPoint[coordinateIndex], 2)
    );
  }

  return Math.sqrt(distanceAccumulator);
}

function isIntegerDistance(distanceValue) {
  return distanceValue % 1 === 0;
}

function countIntegerDistancePairs(pointLines, totalPoints) {
  let answer = 0;

  for (let sourceIndex = 0; sourceIndex < pointLines.length; sourceIndex++) {
    const sourcePoint = parsePointCoordinates(pointLines[sourceIndex]);

    for (let targetIndex = sourceIndex + 1; targetIndex < totalPoints; targetIndex++) {
      const targetPoint = parsePointCoordinates(pointLines[targetIndex]);

      const distance = calculateDistanceLikeOriginal(sourcePoint, targetPoint);

      if (isIntegerDistance(distance)) {
        answer++;
      }
    }
  }

  return answer;
}

const main = rawInput => {
  const inputLines = splitInputLikeOriginal(rawInput);

  const header = parseHeaderValues(inputLines[0]);
  const N = header.N;
  const D = header.D;

  const pointLines = extractPointLines(inputLines, N);

  const answer = countIntegerDistancePairs(pointLines, N);

  console.log(answer);
};

main(require("fs").readFileSync("/dev/stdin", "utf8"));
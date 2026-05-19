'use strict';

const parseCoordinatePair = (lineString) => {
  return lineString.split(' ').map(Number);
};

const calculateEuclideanDistance = (point1X, point1Y, point2X, point2Y) => {
  const deltaX = point1X - point2X;
  const deltaY = point1Y - point2Y;
  return Math.hypot(deltaX, deltaY);
};

const processInputData = (rawDataLines) => {
  const numberOfPoints = parseInt(rawDataLines[0], 10);
  
  const allPointsCoordinates = [];
  for (let currentLineIndex = 0; currentLineIndex < numberOfPoints; currentLineIndex++) {
    const coordinates = parseCoordinatePair(rawDataLines[currentLineIndex + 1]);
    allPointsCoordinates.push(coordinates);
  }

  let totalAccumulatedDistance = 0;
  
  for (let firstPointIndex = 0; firstPointIndex < numberOfPoints - 1; firstPointIndex++) {
    const currentPointX = allPointsCoordinates[firstPointIndex][0];
    const currentPointY = allPointsCoordinates[firstPointIndex][1];

    for (let secondPointIndex = firstPointIndex + 1; secondPointIndex < numberOfPoints; secondPointIndex++) {
      const otherPointX = allPointsCoordinates[secondPointIndex][0];
      const otherPointY = allPointsCoordinates[secondPointIndex][1];

      totalAccumulatedDistance += calculateEuclideanDistance(
        currentPointX, currentPointY,
        otherPointX, otherPointY
      );
    }
  }
  
  const finalScalingFactor = 2;
  const finalResult = (totalAccumulatedDistance / numberOfPoints) * finalScalingFactor;
  
  console.log(finalResult);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const fileContentBuffer = fileSystemModule.readFileSync(standardInputPath, "utf8");
const inputLinesArray = fileContentBuffer.split('\n');

processInputData(inputLinesArray);

"use strict";

const DEBUG_FLAG = false;
const sourceData = DEBUG_FLAG
  ? "2\n1 19"
  : require("fs")
      .readFileSync("/dev/stdin", "utf8")
      .trim();

const analyzeTravelPlan = (inputPayload) => {
  const inputLines = inputPayload.split("\n");
  const pointCount = parseInt(inputLines[0], 10);
  const pointCoordinates = inputLines[1].split(" ").map(Number);

  const calculateSegmentSum = (pathPoints) => {
    if (pathPoints.length < 2) {
      return 0;
    }
    return pathPoints.slice(1).map((currentVal, index) => {
      const priorVal = pathPoints[index];
      return Math.abs(currentVal - priorVal);
    }).reduce((accumulator, difference) => accumulator + difference, 0);
  };

  for (let skipIndex = 0; skipIndex < pointCount; skipIndex++) {
    const modifiedPath = [
      0,
      ...pointCoordinates.slice(0, skipIndex),
      ...pointCoordinates.slice(skipIndex + 1),
      0,
    ];

    const currentPathTotal = calculateSegmentSum(modifiedPath);
    console.log(currentPathTotal);
  }
};

analyzeTravelPlan(sourceData);

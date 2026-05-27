"use strict";

function parseRobotLineToInterval(robotDescription) {
  const coordinateAndRadius = robotDescription.split(' ').map(Number);
  const centerX = coordinateAndRadius[0];
  const radius = coordinateAndRadius[1];
  const intervalStart = centerX - radius;
  const intervalEnd = centerX + radius;
  return [intervalStart, intervalEnd];
}

function processRobotData(inputString) {
  const allInputLines = inputString.split('\n');

  const robotCountFromInput = Number(allInputLines[0]);

  const robotDescriptionLines = allInputLines.slice(1);

  const robotIntervals = robotDescriptionLines.map(parseRobotLineToInterval);

  robotIntervals.sort((intervalA, intervalB) => intervalA[1] - intervalB[1]);

  const selectedIntervalEndPoints = [Number.NEGATIVE_INFINITY];
  let nonOverlappingRobotCount = 0;

  for (let currentIdx = 0; currentIdx < robotIntervals.length; ++currentIdx) {
    const currentInterval = robotIntervals[currentIdx];
    const currentIntervalStart = currentInterval[0];
    const currentIntervalEnd = currentInterval[1];

    const latestSelectedEndPoint = Math.max(...selectedIntervalEndPoints);

    if (currentIntervalStart >= latestSelectedEndPoint) {
      selectedIntervalEndPoints.push(currentIntervalEnd);
      nonOverlappingRobotCount++;
    }
  }

  console.log(nonOverlappingRobotCount);
}

processRobotData(require("fs").readFileSync("/dev/stdin", "utf8"));

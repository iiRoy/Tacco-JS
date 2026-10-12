const validateMovement = (elapsedTime, deltaX, deltaY) => {
  const totalDistance = deltaX + deltaY;

  if (elapsedTime < totalDistance) {
    return false;
  }

  const timeParity = elapsedTime % 2;
  const distanceParity = totalDistance % 2;

  return timeParity === distanceParity;
};

const simulateJourney = (journeySegments) => {
  'use strict';
  let currentPosition = [0, 0, 0]; // [time, x, y]

  for (const segmentData of journeySegments) {
    const [targetTime, targetX, targetY] = segmentData;
    const [currentTime, currentX, currentY] = currentPosition;

    const xDistance = Math.abs(currentX - targetX);
    const yDistance = Math.abs(currentY - targetY);
    const segmentDuration = targetTime - currentTime;

    if (!validateMovement(segmentDuration, xDistance, yDistance)) {
      return false;
    }

    // This update logic replicates the original's behavior, including the
    // potential accumulation if targetTime is absolute and not duration.
    currentPosition[0] += targetTime;
    currentPosition[1] = targetX;
    currentPosition[2] = targetY;
  }

  return true;
};

const parseSegmentLine = (segmentLine) => {
  return segmentLine.split(' ').map(coordinateString => parseInt(coordinateString, 10));
};

function processInputAndExecute(rawInputString) {
  const inputLines = rawInputString.split('\n');
  const dataLines = inputLines.slice(1); // Skip the first line (N)

  const parsedJourneyPlan = dataLines.map(parseSegmentLine);

  const journeyFeasible = simulateJourney(parsedJourneyPlan);

  console.log(journeyFeasible ? 'Yes' : 'No');
}

processInputAndExecute(require("fs").readFileSync("/dev/stdin", "utf8"));

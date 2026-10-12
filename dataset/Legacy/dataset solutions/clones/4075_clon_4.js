const validateMove = (elapsedTime, deltaX, deltaY) => {
  const totalDistance = deltaX + deltaY;
  return elapsedTime >= totalDistance && (elapsedTime - totalDistance) % 2 === 0;
};

const assessJourney = (pathSegments) => {
  const initialPosition = [0, 0, 0]; // [time, x, y]

  const finalState = pathSegments.reduce((currentCoord, nextCoord) => {
    if (currentCoord === null) {
      return null; // Propagate failure
    }

    const timeElapsed = nextCoord[0] - currentCoord[0];
    const xDiff = Math.abs(currentCoord[1] - nextCoord[1]);
    const yDiff = Math.abs(currentCoord[2] - nextCoord[2]);

    if (!validateMove(timeElapsed, xDiff, yDiff)) {
      return null; // Mark as failed
    }

    return nextCoord; // Update current position to the next point
  }, initialPosition);

  return finalState !== null;
};

const processInputAndDisplay = (rawInput) => {
  const journeyPoints = rawInput
    .split('\n')
    .filter(Boolean)
    .slice(1)
    .map(segmentText => segmentText.split(' ').map(Number));

  const outcome = assessJourney(journeyPoints);
  console.log(outcome ? 'Yes' : 'No');
};

processInputAndDisplay(require("fs").readFileSync("/dev/stdin", "utf8"));

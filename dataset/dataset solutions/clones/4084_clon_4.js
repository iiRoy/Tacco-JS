function processTravelLog(logData) {
  const entryStrings = logData.split('\n').splice(1);
  const destinationCoordinates = entryStrings.map(s => s.split(' ').map(Number));

  const allPoints = [[0, 0, 0], ...destinationCoordinates];

  const finalTravelState = allPoints.reduce((accumulator, currentDestination) => {
    const [previousTime, previousX, previousY, overallFeasibility] = accumulator;
    if (!overallFeasibility) {
      return accumulator;
    }

    const [nextTime, nextX, nextY] = currentDestination;

    const timeElapsed = nextTime - previousTime;
    const horizontalDistance = Math.abs(nextX - previousX);
    const verticalDistance = Math.abs(nextY - previousY);

    const requiredDistance = horizontalDistance + verticalDistance;

    const stepFeasible = (timeElapsed >= requiredDistance) &&
                         ((timeElapsed % 2) === (requiredDistance % 2));

    return [nextTime, nextX, nextY, stepFeasible];
  }, [0, 0, 0, true]);

  console.log(finalTravelState[3] ? 'Yes' : 'No');
}

processTravelLog(require('fs').readFileSync('/dev/stdin', 'utf8'));

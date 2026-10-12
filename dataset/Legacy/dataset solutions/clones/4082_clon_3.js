function processTravelPlan(rawInputData) {
  const allInputLines = rawInputData.split('\n');
  const dataLines = allInputLines.slice(1);

  const parsePointString = (lineStr) => {
    return lineStr.split(' ').map(Number);
  };

  const travelPoints = dataLines.map(parsePointString);

  let pointIndex = 0;
  let previousTime = 0;
  const originX = 0;
  const originY = 0;

  let isPlanFeasible = true;

  const isValidTransition = (timeDiff, xDiffAbs, yDiffAbs) => {
    if (timeDiff < xDiffAbs + yDiffAbs) {
      return false;
    }
    if (timeDiff % 2 === (xDiffAbs + yDiffAbs)) {
      return false;
    }
    return true;
  };

  while (pointIndex < travelPoints.length) {
    const currentPoint = travelPoints[pointIndex];

    const targetTime = currentPoint[0];
    const targetX = currentPoint[1];
    const targetY = currentPoint[2];

    const timeDifference = targetTime - previousTime;
    const absXDifference = Math.abs(targetX - originX);
    const absYDifference = Math.abs(targetY - originY);

    if (!isValidTransition(timeDifference, absXDifference, absYDifference)) {
      isPlanFeasible = false;
      break;
    }

    previousTime = targetTime;
    pointIndex++;
  }

  console.log(isPlanFeasible ? 'Yes' : 'No');
}

processTravelPlan(require('fs').readFileSync('/dev/stdin', 'utf8'));

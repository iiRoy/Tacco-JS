function processTravelData(rawData) {
  const allInputLines = rawData.split('\n');
  const dataLines = allInputLines.splice(1);

  const parseSegmentLine = (lineString) => {
    return lineString.split(' ').map(Number);
  };

  const travelSegments = dataLines.map(parseSegmentLine);

  let segmentIndex = 0;
  let currentTime = 0;
  let currentX = 0;
  let currentY = 0;
  let canReachDestination = true;

  while (segmentIndex < travelSegments.length) {
    const currentSegment = travelSegments[segmentIndex];

    const targetTime = currentSegment[0];
    const targetX = currentSegment[1];
    const targetY = currentSegment[2];

    const timeDiff = targetTime - currentTime;
    const xDiffAbs = Math.abs(targetX - currentX);
    const yDiffAbs = Math.abs(targetY - currentY);

    const manhattanDistance = xDiffAbs + yDiffAbs;

    if (timeDiff < manhattanDistance) {
      canReachDestination = false;
      break;
    }

    if ((timeDiff % 2) !== (manhattanDistance % 2)) {
      canReachDestination = false;
      break;
    }

    currentTime = targetTime;
    currentX = targetX;
    currentY = targetY;

    segmentIndex++;
  }

  console.log(canReachDestination ? 'Yes' : 'No');
}

processTravelData(require('fs').readFileSync('/dev/stdin', 'utf8'));

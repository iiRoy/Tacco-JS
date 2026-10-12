var inputDataLines = [];

var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', function (currentLine) {
  inputDataLines.push(currentLine);
});

process.stdin.on('end', function () {
  executeMainLogic(inputDataLines);
});

const epsilonTolerance = 1e-10;

function calculateSquaredDistance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

function calculateIntersectionPoint(segmentA, segmentB) {
  const pointA1 = segmentA[0];
  const pointA2 = segmentA[1];
  const pointB1 = segmentB[0];
  const pointB2 = segmentB[1];

  const vecAx = pointA2.x - pointA1.x;
  const vecAy = pointA2.y - pointA1.y;

  const vecBx = pointB2.x - pointB1.x;
  const vecBy = pointB2.y - pointB1.y;

  const determinant = vecAx * vecBy - vecAy * vecBx;

  if (Math.abs(determinant) < epsilonTolerance) {
    return null;
  }

  const paramR = ((pointB1.y - pointA1.y) * vecBx - (pointB1.x - pointA1.x) * vecBy) / determinant;

  const intersectX = pointA1.x + paramR * vecAx;
  const intersectY = pointA1.y + paramR * vecAy;

  if (paramR < epsilonTolerance || (1 - paramR) < epsilonTolerance) {
    return null;
  }

  return { x: intersectX, y: intersectY };
}

function processSegmentsAndCountRegions(segmentCollection) {
  let regionCount = 1;

  for (let idxA = 0; idxA < segmentCollection.length; idxA++) {
    regionCount++;

    const currentSegment = segmentCollection[idxA];
    const uniqueIntersectionPoints = [];

    for (let idxB = 0; idxB < idxA; idxB++) {
      const previousSegment = segmentCollection[idxB];
      const potentialIntersection = calculateIntersectionPoint(currentSegment, previousSegment);

      if (potentialIntersection !== null) {
        let isDuplicate = false;
        for (const existingPoint of uniqueIntersectionPoints) {
          if (calculateSquaredDistance(potentialIntersection, existingPoint) < epsilonTolerance) {
            isDuplicate = true;
            break;
          }
        }

        if (!isDuplicate) {
          uniqueIntersectionPoints.push(potentialIntersection);
        }
      }
    }
    regionCount += uniqueIntersectionPoints.length;
  }
  return regionCount;
}

function executeMainLogic(allInputLines) {
  let lineIndex = 0;

  const parseSegmentCoordinates = (lineStr) => {
    const parts = lineStr.split(' ');
    return [
      { x: +parts[0], y: +parts[1] },
      { x: +parts[2], y: +parts[3] }
    ];
  };

  while (true) {
    const numberOfSegmentsStr = allInputLines[lineIndex++];
    const numberOfSegments = parseInt(numberOfSegmentsStr, 10);

    if (numberOfSegments === 0) {
      break;
    }

    const currentSetOfSegments = [];
    for (let i = 0; i < numberOfSegments; i++) {
      const segmentLineStr = allInputLines[lineIndex++];
      currentSetOfSegments.push(parseSegmentCoordinates(segmentLineStr));
    }

    console.log(processSegmentsAndCountRegions(currentSetOfSegments));
  }
}

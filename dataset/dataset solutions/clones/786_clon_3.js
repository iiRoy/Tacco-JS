let receivedInputLines = [];

const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputLineReader.on('line', (individualLineSegment) => {
  receivedInputLines.push(individualLineSegment);
});

process.stdin.on('end', () => {
  executeMainProcessing(receivedInputLines);
});

const GEOMETRIC_PRECISION_TOLERANCE = 1e-10;
const GEOMETRIC_PRECISION_TOLERANCE_SQUARED = GEOMETRIC_PRECISION_TOLERANCE * GEOMETRIC_PRECISION_TOLERANCE;

function calculateSquaredDistance(p1, p2) {
  const deltaX = p1.coordX - p2.coordX;
  const deltaY = p1.coordY - p2.coordY;
  return (deltaX * deltaX) + (deltaY * deltaY);
}

function determineIntersectionCoords(segmentOne, segmentTwo) {
  const point1A = segmentOne[0];
  const point2A = segmentOne[1];
  const point1B = segmentTwo[0];
  const point2B = segmentTwo[1];

  const deltaX1 = point2A.coordX - point1A.coordX;
  const deltaY1 = point2A.coordY - point1A.coordY;
  const deltaX2 = point2B.coordX - point1B.coordX;
  const deltaY2 = point2B.coordY - point1B.coordY;

  const determinantValue = (deltaX1 * deltaY2) - (deltaY1 * deltaX2);

  if (Math.abs(determinantValue) < GEOMETRIC_PRECISION_TOLERANCE) {
    return null;
  }

  const paramR = ((point1B.coordY - point1A.coordY) * deltaX2 - (point1B.coordX - point1A.coordX) * deltaY2) / determinantValue;
  const paramS = ((point1B.coordY - point1A.coordY) * deltaX1 - (point1B.coordX - point1A.coordX) * deltaY1) / determinantValue;

  const minParamVal = -GEOMETRIC_PRECISION_TOLERANCE;
  const maxParamVal = 1 + GEOMETRIC_PRECISION_TOLERANCE;

  if (paramR < minParamVal || paramR > maxParamVal || paramS < minParamVal || paramS > maxParamVal) {
    return null;
  }

  const intersectCoordX = point1A.coordX + paramR * deltaX1;
  const intersectCoordY = point1A.coordY + paramR * deltaY1;

  const minCoordLimit = -100.001;
  const maxCoordLimit = 100.001;

  if (intersectCoordX < minCoordLimit || intersectCoordX > maxCoordLimit ||
      intersectCoordY < minCoordLimit || intersectCoordY > maxCoordLimit) {
    return null;
  }

  return { coordX: intersectCoordX, coordY: intersectCoordY };
}

function addPointUniquelyToArray(currentPointsList, newPointCandidate) {
  const isDuplicate = currentPointsList.some(existingPoint => {
    return calculateSquaredDistance(newPointCandidate, existingPoint) < GEOMETRIC_PRECISION_TOLERANCE_SQUARED;
  });

  if (!isDuplicate) {
    currentPointsList.push(newPointCandidate);
    return true;
  }
  return false;
}

function processIntersectionsAndCount(geometricSegments) {
  if (geometricSegments.length === 0) {
    return 1;
  }

  let uniqueIntersectionPoints = [];
  let totalGeometricElements = 1;

  const totalSegments = geometricSegments.length;

  for (let outerSegmentIndex = 0; outerSegmentIndex < totalSegments; outerSegmentIndex++) {
    totalGeometricElements++;

    const currentSegment = geometricSegments[outerSegmentIndex];

    for (let innerSegmentIndex = 0; innerSegmentIndex < outerSegmentIndex; innerSegmentIndex++) {
      const comparisonSegment = geometricSegments[innerSegmentIndex];

      const potentialIntersection = determineIntersectionCoords(currentSegment, comparisonSegment);

      if (potentialIntersection !== null) {
        addPointUniquelyToArray(uniqueIntersectionPoints, potentialIntersection);
      }
    }
  }

  totalGeometricElements += uniqueIntersectionPoints.length;

  return totalGeometricElements;
}

function parseSegmentLine(inputLine) {
  const coordinateTokens = inputLine.split(/\s+/).filter(Boolean);

  if (coordinateTokens.length !== 4) {
    throw new Error(`Input line malformed: Expected 4 coordinates, got ${coordinateTokens.length}. Line: "${inputLine}"`);
  }

  const coordX1 = parseFloat(coordinateTokens[0]);
  const coordY1 = parseFloat(coordinateTokens[1]);
  const coordX2 = parseFloat(coordinateTokens[2]);
  const coordY2 = parseFloat(coordinateTokens[3]);

  if (isNaN(coordX1) || isNaN(coordY1) || isNaN(coordX2) || isNaN(coordY2)) {
    throw new Error(`Input line contains non-numeric coordinates. Line: "${inputLine}"`);
  }

  return [
    { coordX: coordX1, coordY: coordY1 },
    { coordX: coordX2, coordY: coordY2 }
  ];
}

function executeMainProcessing(rawInputBuffer) {
  let mutableInputSource = [...rawInputBuffer];
  let numberOfSegmentsInCurrentCase;

  while (mutableInputSource.length > 0 &&
         (numberOfSegmentsInCurrentCase = Number(mutableInputSource.shift())) !== 0) {

    let parsedGeometricSegments = [];

    if (mutableInputSource.length < numberOfSegmentsInCurrentCase) {
        console.error("Error: Not enough input lines for the declared number of segments.");
        break;
    }

    for (let segmentIdx = 0; segmentIdx < numberOfSegmentsInCurrentCase; segmentIdx++) {
      try {
        const segmentLine = mutableInputSource.shift();
        parsedGeometricSegments.push(parseSegmentLine(segmentLine));
      } catch (error) {
        console.error(`Parsing error for segment ${segmentIdx + 1}: ${error.message}`);
        return;
      }
    }

    console.log(processIntersectionsAndCount(parsedGeometricSegments));
  }
}
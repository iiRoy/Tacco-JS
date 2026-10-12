const TOLERANCE_THRESHOLD = 1e-10;

const inputDataLines = [];
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on('line', function (currentLine) {
  inputDataLines.push(currentLine);
});

process.stdin.on('end', function () {
  executeProcessing(inputDataLines);
});

function arePointsApproximatelyEqual(point1, point2, tolerance) {
  const deltaX = point1.x - point2.x;
  const deltaY = point1.y - point2.y;
  return (deltaX * deltaX + deltaY * deltaY) < tolerance;
}

function calculateSegmentIntersection(segmentA, segmentB) {
  const p1 = segmentA[0], p2 = segmentA[1];
  const p3 = segmentB[0], p4 = segmentB[1];

  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const crossProductDeterminant = dx1 * dy2 - dy1 * dx2;

  // Check if lines are parallel or collinear
  if (Math.abs(crossProductDeterminant) < TOLERANCE_THRESHOLD) {
    return null;
  }

  // Calculate parameter 't' for segmentA
  // This 't' corresponds to the 'r' in the original code's parametric equation for segmentA
  const paramT = ((p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2) / crossProductDeterminant;

  // The original code returns null if the intersection point is at or very near
  // an endpoint of the *first* segment (segmentA).
  // This means the intersection must be strictly inside segmentA.
  if (paramT < TOLERANCE_THRESHOLD || (1 - paramT) < TOLERANCE_THRESHOLD) {
    return null;
  }

  const intersectX = p1.x + paramT * dx1;
  const intersectY = p1.y + paramT * dy1;

  return { x: intersectX, y: intersectY };
}

function processLineSegments(segmentCollection) {
  let totalGeometricElements = 1; // Initialize count, typically for the first region or line itself

  for (let i = 0; i < segmentCollection.length; i++) {
    totalGeometricElements++; // Each new line segment adds to the count

    const currentSegment = segmentCollection[i];
    const uniqueIntersectionsForCurrentSegment = [];

    for (let j = 0; j < i; j++) {
      const previousSegment = segmentCollection[j];
      const intersectionCandidate = calculateSegmentIntersection(currentSegment, previousSegment);

      if (intersectionCandidate === null) {
        continue; // No valid intersection for this pair of segments
      }

      // Check if this intersection point is already in our list for the current segment
      // (within floating-point tolerance)
      const isPointNew = !uniqueIntersectionsForCurrentSegment.some(existingPoint =>
        arePointsApproximatelyEqual(intersectionCandidate, existingPoint, TOLERANCE_THRESHOLD)
      );

      if (isPointNew) {
        uniqueIntersectionsForCurrentSegment.push(intersectionCandidate);
      }
    }
    totalGeometricElements += uniqueIntersectionsForCurrentSegment.length;
  }
  return totalGeometricElements;
}

function parseLineSegmentString(segmentString) {
  const coordinateValues = segmentString.split(' ').map(Number);
  return [
    { x: coordinateValues[0], y: coordinateValues[1] },
    { x: coordinateValues[2], y: coordinateValues[3] }
  ];
}

function executeProcessing(rawInputLines) {
  let numberOfSegmentsToProcess;
  while ((numberOfSegmentsToProcess = +rawInputLines.shift()) !== 0) {
    const currentProblemSegments = [];
    for (let i = 0; i < numberOfSegmentsToProcess; i++) {
      const segmentDefinitionString = rawInputLines.shift();
      currentProblemSegments.push(parseLineSegmentString(segmentDefinitionString));
    }
    console.log(processLineSegments(currentProblemSegments));
  }
}

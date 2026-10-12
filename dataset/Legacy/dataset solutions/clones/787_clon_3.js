var allInputLines = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputHandler.on('line', function (currentLine) {
  allInputLines.push(currentLine);
});

process.stdin.on('end', function () {
  entryPoint(allInputLines);
});

const GEOMETRIC_TOLERANCE = Math.pow(10, -10);
const MIN_COORD_BOUND = -100;
const MAX_COORD_BOUND = 100;

/**
 * Checks if a given coordinate is within the defined bounds.
 * @param {number} coordValue - The coordinate value (x or y).
 * @returns {boolean} True if within bounds, false otherwise.
 */
function isCoordinateWithinBounds(coordValue) {
  return coordValue >= MIN_COORD_BOUND && coordValue <= MAX_COORD_BOUND;
}

/**
 * Determines if two points are approximately equal given a tolerance.
 * @param {{x: number, y: number}} p1 - First point.
 * @param {{x: number, y: number}} p2 - Second point.
 * @param {number} tolerance - The maximum allowed difference for equality.
 * @returns {boolean} True if points are approximately equal, false otherwise.
 */
function arePointsApproximatelyEqual(p1, p2, tolerance) {
  return Math.abs(p1.x - p2.x) < tolerance && Math.abs(p1.y - p2.y) < tolerance;
}

/**
 * Calculates the intersection point of two line segments.
 * Returns null if segments are parallel or do not intersect within bounds.
 * @param {Array<Object>} segmentA - First line segment, e.g., [{x: x1, y: y1}, {x: x2, y: y2}].
 * @param {Array<Object>} segmentB - Second line segment.
 * @returns {{x: number, y: number}|null} The intersection point or null.
 */
function calculateIntersectionPoint(segmentA, segmentB) {
  const p1 = segmentA[0], p2 = segmentA[1];
  const p3 = segmentB[0], p4 = segmentB[1];

  const dx1 = p2.x - p1.x;
  const dy1 = p2.y - p1.y;
  const dx2 = p4.x - p3.x;
  const dy2 = p4.y - p3.y;

  const denominator = dx1 * dy2 - dy1 * dx2;

  // Check if segments are parallel (or collinear)
  if (denominator === 0) {
    return null;
  }

  const tParamNumerator = (p3.x - p1.x) * dy2 - (p3.y - p1.y) * dx2;
  const uParamNumerator = (p3.x - p1.x) * dy1 - (p3.y - p1.y) * dx1;

  const tParam = tParamNumerator / denominator;
  const uParam = uParamNumerator / denominator;

  // Check if intersection occurs within both segments (0 <= t <= 1 and 0 <= u <= 1)
  // The original problem implies lines, not segments, as it doesn't check t and u ranges.
  // It only checks the final intersection point's coordinates.
  // So, we calculate the intersection point of the *lines* defined by the segments.

  const intersectionCoordX = p1.x + tParam * dx1;
  const intersectionCoordY = p1.y + tParam * dy1;

  // Check if the intersection point is within the defined coordinate bounds
  if (!isCoordinateWithinBounds(intersectionCoordX) || !isCoordinateWithinBounds(intersectionCoordY)) {
    return null;
  }

  return { x: intersectionCoordX, y: intersectionCoordY };
}

/**
 * Processes a set of line segments to count the number of regions they divide the plane into.
 * @param {Array<Array<Object>>} segmentData - An array of line segments.
 * @returns {number} The total number of regions.
 */
function processSegments(segmentData) {
  let regionCount = 1; // Start with 1 region (the entire plane)
  const processedLineSegments = [];
  
  for (let idxA = 0; idxA < segmentData.length; idxA++) {
    regionCount++; // Each new line adds at least one new region
    const uniqueIntersections = [];

    for (let idxB = 0; idxB < processedLineSegments.length; idxB++) {
      const currentIntersectionCandidate = calculateIntersectionPoint(segmentData[idxA], processedLineSegments[idxB]);
      
      if (currentIntersectionCandidate === null) {
        continue;
      }

      // Check if this intersection point is already in our list of unique intersections
      let isDuplicate = false;
      for (const existingIntersection of uniqueIntersections) {
        if (arePointsApproximatelyEqual(currentIntersectionCandidate, existingIntersection, GEOMETRIC_TOLERANCE)) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueIntersections.push(currentIntersectionCandidate);
      }
    }

    processedLineSegments.push(segmentData[idxA]);
    regionCount += uniqueIntersections.length; // Each unique intersection adds another region
  }
  return regionCount;
}

/**
 * Parses a string of four coordinates into two point objects.
 * @param {string} coordString - A string like "x1 y1 x2 y2".
 * @returns {Array<Object>} An array containing two point objects.
 */
function parseSegmentCoordinates(coordString) {
  const parts = coordString.split(' ');
  return [
    { x: +parts[0], y: +parts[1] },
    { x: +parts[2], y: +parts[3] }
  ];
}

/**
 * Main entry point of the program. Reads input and processes line segments.
 * @param {Array<string>} rawInputData - Array of input strings from stdin.
 */
function entryPoint(rawInputData) {
  let dataIndex = 0;
  while (true) {
    const numberOfSegmentsToProcess = +rawInputData[dataIndex++];
    if (numberOfSegmentsToProcess === 0) {
      break;
    }

    const currentSegmentSet = [];
    for (let i = 0; i < numberOfSegmentsToProcess; i++) {
      const coordinateString = rawInputData[dataIndex++];
      currentSegmentSet.push(parseSegmentCoordinates(coordinateString));
    }
    console.log(processSegments(currentSegmentSet));
  }
}

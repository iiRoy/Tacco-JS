const COORDINATE_TOLERANCE = Math.pow(10, -10);
const MIN_BOUNDARY_VALUE = -100;
const MAX_BOUNDARY_VALUE = 100;

// Checks if two point coordinates are approximately equal
function arePointsCoincident(pointOne, pointTwo, precision) {
  return Math.abs(pointOne[0] - pointTwo[0]) < precision &&
         Math.abs(pointOne[1] - pointTwo[1]) < precision;
}

// Transforms a line segment (defined by two points) into its general equation coefficients (Ax + By = C)
function transformSegmentToEquation(segmentTuple) {
  const [pointAlpha, pointBeta] = segmentTuple;
  const coeffA = pointBeta[1] - pointAlpha[1]; // y2 - y1
  const coeffB = pointAlpha[0] - pointBeta[0]; // x1 - x2
  const coeffC = coeffA * pointAlpha[0] + coeffB * pointAlpha[1]; // A*x1 + B*y1
  return [coeffA, coeffB, coeffC];
}

// Computes the intersection point of two infinite lines defined by segments
function determineLineIntersection(segmentX, segmentY) {
  const [A1, B1, C1] = transformSegmentToEquation(segmentX);
  const [A2, B2, C2] = transformSegmentToEquation(segmentY);

  const determinantValue = A1 * B2 - A2 * B1;

  // If determinant is near zero, lines are parallel or coincident
  if (Math.abs(determinantValue) < COORDINATE_TOLERANCE) {
    return null;
  }

  const intersectionX = (C1 * B2 - C2 * B1) / determinantValue;
  const intersectionY = (A1 * C2 - A2 * C1) / determinantValue;

  // Check if the intersection point lies within the specified coordinate bounds
  if (intersectionX < MIN_BOUNDARY_VALUE || intersectionX > MAX_BOUNDARY_VALUE ||
      intersectionY < MIN_BOUNDARY_VALUE || intersectionY > MAX_BOUNDARY_VALUE) {
    return null;
  }

  return [intersectionX, intersectionY];
}

// Calculates the total number of regions formed by the given line segments
function calculateRegionCount(geometricSegments) {
  const uniqueIntersectionPoints = [];

  // Iterate through all distinct pairs of segments to find intersections
  for (let indexA = 0; indexA < geometricSegments.length; ++indexA) {
    for (let indexB = indexA + 1; indexB < geometricSegments.length; ++indexB) {
      const currentIntersection = determineLineIntersection(geometricSegments[indexA], geometricSegments[indexB]);

      if (currentIntersection !== null) {
        // Add point to collection only if it's not already present (within tolerance)
        const foundDuplicate = uniqueIntersectionPoints.some(existingPoint =>
          arePointsCoincident(currentIntersection, existingPoint, COORDINATE_TOLERANCE)
        );

        if (!foundDuplicate) {
          uniqueIntersectionPoints.push(currentIntersection);
        }
      }
    }
  }

  // Apply Euler's formula for planar graphs: R = 1 + L + P
  // Where R is regions, L is number of lines, P is number of unique intersection points.
  return 1 + geometricSegments.length + uniqueIntersectionPoints.length;
}

// --- Input processing and main execution flow ---
const inputBufferCollection = [];
let currentBufferPosition = 0;

process.stdin.on('data', (dataChunk) => {
  inputBufferCollection.push(...dataChunk.toString().split(/\r?\n/));
});

process.stdin.on('end', () => {
  executeCoordinateSystemAnalysis();
});

// Retrieves the next line from the buffered input
function retrieveNextInputLine() {
  if (currentBufferPosition < inputBufferCollection.length) {
    return inputBufferCollection[currentBufferPosition++];
  }
  return null;
}

// Orchestrates the overall processing of input data
function executeCoordinateSystemAnalysis() {
  while (true) {
    const numShapesText = retrieveNextInputLine();
    if (numShapesText === null || numShapesText.trim() === '') {
      break; // End of stream or trailing empty line
    }
    const numShapes = parseInt(numShapesText, 10);

    if (numShapes === 0) {
      break; // Termination condition for the problem
    }

    const currentBatchOfSegments = [];
    for (let shapeCounter = 0; shapeCounter < numShapes; ++shapeCounter) {
      const segmentValues = retrieveNextInputLine().split(' ').map(Number);
      currentBatchOfSegments.push([
        [segmentValues[0], segmentValues[1]],
        [segmentValues[2], segmentValues[3]]
      ]);
    }

    console.log(calculateRegionCount(currentBatchOfSegments));
  }
}
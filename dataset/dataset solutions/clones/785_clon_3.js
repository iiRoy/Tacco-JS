const GEOMETRY_PRECISION_LIMIT = 1e-9; // A small constant for floating-point comparisons, slightly adjusted from original

let collectedRawInput = []; // Buffer to store all incoming lines from standard input

// Initialize the standard input processing mechanism.
const consoleInputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // Output is not strictly needed for input collection, but good practice.
});

// Event listener for each line received from standard input.
consoleInputHandler.on('line', (currentLine) => {
  // Only store non-empty lines to avoid processing blank inputs.
  if (currentLine.trim().length > 0) {
    collectedRawInput.push(currentLine);
  }
});

// Event listener for when the standard input stream has fully ended.
process.stdin.on('end', () => {
  // If no input was provided, log an error and terminate.
  if (collectedRawInput.length === 0) {
    console.error("No input data was supplied for processing.");
    return;
  }
  // Begin the primary program execution with the buffered input.
  processAllTestCases(collectedRawInput);
});

/**
 * A simple object literal representing a two-dimensional point.
 * @typedef {object} Coordinates2D
 * @property {number} x - The horizontal coordinate.
 * @property {number} y - The vertical coordinate.
 */

/**
 * Factory function to create a new Coordinates2D object.
 * @param {number} xCoord - The x-coordinate value.
 * @param {number} yCoord - The y-coordinate value.
 * @returns {Coordinates2D} A new point object.
 */
const createCoordinates = (xCoord, yCoord) => ({ x: xCoord, y: yCoord });

/**
 * Computes the square of the Euclidean distance between two 2D points.
 * This avoids the need for a square root, which is often sufficient for comparisons.
 * @param {Coordinates2D} pointOne - The first point.
 * @param {Coordinates2D} pointTwo - The second point.
 * @returns {number} The squared distance between the two points.
 */
const calculateSquaredDistance = (pointOne, pointTwo) => {
  const deltaX = pointOne.x - pointTwo.x;
  const deltaY = pointOne.y - pointTwo.y;
  return deltaX * deltaX + deltaY * deltaY;
};

/**
 * Checks if two 2D points are considered identical within a specified tolerance.
 * @param {Coordinates2D} pointOne - The first point.
 * @param {Coordinates2D} pointTwo - The second point.
 * @param {number} tolerance - The maximum allowed squared distance for points to be equivalent.
 * @returns {boolean} True if the points are within tolerance, false otherwise.
 */
const arePointsCoincident = (pointOne, pointTwo, tolerance = GEOMETRY_PRECISION_LIMIT) => {
  return calculateSquaredDistance(pointOne, pointTwo) < tolerance * tolerance;
};


/**
 * Determines the intersection point of two line segments.
 *
 * Each segment is defined by an array of two Coordinates2D objects.
 * The function returns the intersection point if it lies strictly within *both* segments.
 * It returns null if the segments are parallel, collinear, or intersect outside their boundaries
 * (including at endpoints, which are not counted as "strict" intersections for this problem).
 *
 * @param {Array<Coordinates2D>} segmentAlpha - The first line segment ([p1, p2]).
 * @param {Array<Coordinates2D>} segmentBeta - The second line segment ([p3, p4]).
 * @returns {Coordinates2D | null} The intersection point if found strictly within both segments, otherwise null.
 */
function findStrictSegmentIntersection(segmentAlpha, segmentBeta) {
  // Extract segment endpoints for clarity: A-B and C-D.
  const pA = segmentAlpha[0];
  const pB = segmentAlpha[1];
  const pC = segmentBeta[0];
  const pD = segmentBeta[1];

  // Calculate vector components for segment AB (v1) and CD (v2).
  const vecAB_x = pB.x - pA.x;
  const vecAB_y = pB.y - pA.y;
  const vecCD_x = pD.x - pC.x;
  const vecCD_y = pD.y - pC.y;

  // Calculate the denominator of the intersection formula, which is the 2D cross product of vectors AB and CD.
  // If this value is near zero, the lines are parallel or collinear.
  const crossProductDenominator = vecAB_x * vecCD_y - vecAB_y * vecCD_x;

  if (Math.abs(crossProductDenominator) < GEOMETRY_PRECISION_LIMIT) {
    // Lines are parallel or collinear; no unique intersection point for this problem.
    return null;
  }

  // Calculate the parameters 's' and 't' for the intersection point.
  // The intersection point can be expressed as P = pA + s * vecAB = pC + t * vecCD.
  const sParam = ((pC.x - pA.x) * vecCD_y - (pC.y - pA.y) * vecCD_x) / crossProductDenominator;
  const tParam = ((pC.x - pA.x) * vecAB_y - (pC.y - pA.y) * vecAB_x) / crossProductDenominator;

  // For a strict intersection (not at endpoints), both 's' and 't' must be between 0 and 1 (exclusive).
  const isSStrictlyBetweenEndpoints = sParam > GEOMETRY_PRECISION_LIMIT && sParam < (1 - GEOMETRY_PRECISION_LIMIT);
  const isTStrictlyBetweenEndpoints = tParam > GEOMETRY_PRECISION_LIMIT && tParam < (1 - GEOMETRY_PRECISION_LIMIT);

  if (!isSStrictlyBetweenEndpoints || !isTStrictlyBetweenEndpoints) {
    // The intersection point lies outside one or both segments, or precisely at an endpoint.
    return null;
  }

  // Calculate the actual coordinates of the intersection point using 's' parameter.
  const finalIntersectionX = pA.x + sParam * vecAB_x;
  const finalIntersectionY = pA.y + sParam * vecAB_y;

  return createCoordinates(finalIntersectionX, finalIntersectionY);
}

/**
 * Computes the total number of distinct regions formed by a collection of line segments
 * in a 2D plane. This calculation is based on a variant of Euler's formula for planar graphs:
 * R = 1 + L + I, where R is the number of regions, L is the number of line segments,
 * and I is the number of unique intersection points.
 *
 * @param {Array<Array<Coordinates2D>>} geometricSegments - An array where each element is a line segment
 *                                                          (an array of two Coordinates2D objects).
 * @returns {number} The total count of regions.
 */
function determineRegionCount(geometricSegments) {
  // Start with 1 region (the entire plane).
  let regionsTotal = 1;

  // Iterate through each segment to add it to the plane.
  for (let currentSegmentIndex = 0; currentSegmentIndex < geometricSegments.length; currentSegmentIndex++) {
    const activeSegment = geometricSegments[currentSegmentIndex];
    let uniqueIntersectionsForActiveSegment = []; // Track intersections for the current segment.

    // Each new segment (line) always adds at least one new region.
    regionsTotal++;

    // Compare the active segment with all previously processed segments.
    for (let previousSegmentIndex = 0; previousSegmentIndex < currentSegmentIndex; previousSegmentIndex++) {
      const pastSegment = geometricSegments[previousSegmentIndex];

      // Attempt to find an intersection point.
      const potentialNewIntersection = findStrictSegmentIntersection(activeSegment, pastSegment);

      if (potentialNewIntersection !== null) {
        // If an intersection is found, check if it's already recorded for the active segment.
        // This ensures that a single point where multiple lines intersect is counted only once
        // for the purpose of region increment per segment.
        let isAlreadyKnown = false;
        for (const existingIntersection of uniqueIntersectionsForActiveSegment) {
          if (arePointsCoincident(potentialNewIntersection, existingIntersection)) {
            isAlreadyKnown = true;
            break;
          }
        }

        if (!isAlreadyKnown) {
          uniqueIntersectionsForActiveSegment.push(potentialNewIntersection);
        }
      }
    }
    // Each unique intersection point created by the active segment with previous segments
    // adds an additional region.
    regionsTotal += uniqueIntersectionsForActiveSegment.length;
  }

  return regionsTotal;
}

/**
 * Orchestrates the reading of raw input, parsing it into geometric segments,
 * processing each test case, and displaying the computed results.
 *
 * @param {Array<string>} rawInputCollection - An array of strings, each representing a line of input.
 */
function processAllTestCases(rawInputCollection) {
  let inputReadCursor = 0; // Pointer to keep track of the current position in the input array.

  // Helper function to safely parse the next numerical value from the input.
  const getNextNumericValue = () => {
    if (inputReadCursor >= rawInputCollection.length) {
      console.error("Critical Error: Unexpected end of input when expecting a number.");
      return NaN; // Return NaN to signify an unrecoverable parsing error.
    }
    const val = Number.parseInt(rawInputCollection[inputReadCursor++], 10);
    if (Number.isNaN(val)) {
      console.error(`Input Parsing Error: Expected a number, but received "${rawInputCollection[inputReadCursor - 1]}".`);
    }
    return val;
  };

  // Helper function to parse a line containing four coordinate values into a segment.
  const parseSegmentCoordinates = () => {
    if (inputReadCursor >= rawInputCollection.length) {
      console.error("Critical Error: Unexpected end of input when expecting segment coordinates.");
      return null;
    }
    const currentCoordLine = rawInputCollection[inputReadCursor++];
    const numericParts = currentCoordLine.split(' ').map(Number);

    // Validate that exactly four numbers were parsed and all are valid.
    if (numericParts.length !== 4 || numericParts.some(Number.isNaN)) {
      console.error(`Input Parsing Error: Malformed coordinate line "${currentCoordLine}". Expected four numeric values.`);
      return null;
    }

    return [
      createCoordinates(numericParts[0], numericParts[1]),
      createCoordinates(numericParts[2], numericParts[3])
    ];
  };

  // Loop through test cases until a zero is encountered for the number of segments.
  while (true) {
    const numberOfSegmentsForCase = getNextNumericValue();

    if (numberOfSegmentsForCase === 0) {
      break; // Termination condition for the input stream.
    }

    // Basic validation for the segment count.
    if (Number.isNaN(numberOfSegmentsForCase) || numberOfSegmentsForCase < 0) {
      console.warn(`Skipping invalid test case: Expected positive number of segments, got ${numberOfSegmentsForCase}.`);
      // Attempt to advance cursor past expected lines for this malformed case to avoid cascading errors.
      // This part is tricky; assuming the input format is strictly followed even for bad N.
      for(let i = 0; i < Math.max(0, numberOfSegmentsForCase); i++) {
          inputReadCursor++; // Just consume the lines without parsing.
      }
      continue;
    }

    const currentCaseSegments = [];
    let parsingSuccessful = true;
    for (let sIdx = 0; sIdx < numberOfSegmentsForCase; sIdx++) {
      const segmentData = parseSegmentCoordinates();
      if (segmentData === null) {
        parsingSuccessful = false;
        // If an error occurs, break from this segment parsing loop.
        // The remaining expected lines for this case must still be consumed
        // to correctly position `inputReadCursor` for the next `numberOfSegmentsForCase`.
        for (let remaining = numberOfSegmentsForCase - (sIdx + 1); remaining > 0; remaining--) {
            inputReadCursor++;
        }
        break;
      }
      currentCaseSegments.push(segmentData);
    }

    // Only process the case if all segments were parsed without errors.
    if (parsingSuccessful && currentCaseSegments.length === numberOfSegmentsForCase) {
      const calculatedRegions = determineRegionCount(currentCaseSegments);
      console.log(calculatedRegions);
    } else {
      console.warn("Skipping test case due to previous input parsing errors.");
    }
  }
}
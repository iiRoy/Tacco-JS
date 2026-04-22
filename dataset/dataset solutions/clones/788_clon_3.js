/**
 * This script processes geometric line segment data to calculate the number of
 * planar regions created by a set of intersecting line segments.
 * It reads input from standard input, processes batches of segments,
 * and prints the resulting region count for each batch to standard output.
 *
 * The core logic relies on an incremental approach:
 * - Each new line segment added to the plane increases the region count by at least one.
 * - Additionally, each unique intersection point that a new segment forms with
 *   previously added segments further increases the region count by one.
 *
 * This implementation is a Type III code clone, featuring extensive renaming,
 * structural alterations, added utility functions, enhanced input validation,
 * and detailed comments compared to its original counterpart.
 */

// --- Global Configuration and Utility Constants ---

/**
 * A small epsilon value used for robust floating-point comparisons in geometric calculations.
 * This helps to account for potential precision errors when checking for equality,
 * parallelism, or whether a point lies on a segment boundary.
 * The value is slightly adjusted from the original code for demonstration.
 * @type {number}
 */
const GEOMETRIC_PRECISION_THRESHOLD = 1e-9;

// --- Input Collection ---

/**
 * An array to store all valid (non-empty) raw input lines read from standard input.
 * This serves as a buffer before parsing the geometric data.
 * @type {string[]}
 */
let receivedInputData = [];

// Set up a readline interface to asynchronously handle input line by line.
// This is the standard Node.js method for reading interactive console input.
const inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout // 'output' stream is technically optional if only reading input
});

/**
 * Event handler executed for each line received from standard input.
 * It trims whitespace and only stores non-empty lines into the `receivedInputData` buffer.
 * @param {string} currentLine - The line of text read from the input stream.
 */
inputLineReader.on('line', (currentLine) => {
  const trimmedLine = currentLine.trim();
  if (trimmedLine.length > 0) {
    receivedInputData.push(trimmedLine);
  }
});

/**
 * Event handler triggered when the standard input stream signals its end.
 * This indicates that all input has been successfully collected.
 * The collected data is then passed to the main processing function.
 */
process.stdin.on('end', () => {
  // Close the readline interface as input collection is complete.
  inputLineReader.close();
  // Initiate the geometric problem solver with the collected input.
  executeGeometricProblemSolver(receivedInputData);
});

// --- Geometric Utility Functions ---

/**
 * Calculates the squared Euclidean distance between two given points.
 * Using squared distance avoids the computationally more expensive square root
 * operation and is sufficient for comparing relative distances or checking proximity.
 * @param {{coordinateX: number, coordinateY: number}} point1 - The first point object.
 * @param {{coordinateX: number, coordinateY: number}} point2 - The second point object.
 * @returns {number} The squared distance between `point1` and `point2`.
 */
const calculateSquaredDistance = (point1, point2) => {
  const deltaX = point1.coordinateX - point2.coordinateX;
  const deltaY = point1.coordinateY - point2.coordinateY;
  return (deltaX * deltaX) + (deltaY * deltaY);
};

/**
 * Determines if two points are considered approximately equivalent based on a
 * specified tolerance (precision threshold). This is crucial for floating-point
 * comparisons to account for minor calculation inaccuracies.
 * @param {{coordinateX: number, coordinateY: number}} point1 - The first point.
 * @param {{coordinateX: number, coordinateY: number}} point2 - The second point.
 * @param {number} [tolerance=GEOMETRIC_PRECISION_THRESHOLD] - The maximum allowed
 *   squared distance for points to be considered identical.
 * @returns {boolean} True if the points are approximately equal, false otherwise.
 */
const arePointsApproximatelyEquivalent = (point1, point2, tolerance = GEOMETRIC_PRECISION_THRESHOLD) => {
  return calculateSquaredDistance(point1, point2) < tolerance;
};

// --- Core Geometric Logic ---

/**
 * Determines the intersection point of two line segments using parametric equations.
 * If the segments are parallel, collinear, or do not intersect within their defined
 * bounds, `null` is returned.
 *
 * Parametric form for a line segment from P1 to P2 is P1 + r * (P2 - P1), where 0 <= r <= 1.
 * For two segments (A1, A2) and (B1, B2), an intersection occurs when:
 * A1 + r * (A2 - A1) = B1 + s * (B2 - B1)
 * Solving for r and s yields the parameters, which must be within [0, 1] for segment intersection.
 *
 * @param {Array<{coordinateX: number, coordinateY: number}>} segmentOne - The first segment, as an array of two point objects [P1, P2].
 * @param {Array<{coordinateX: number, coordinateY: number}>} segmentTwo - The second segment, as an array of two point objects [P3, P4].
 * @returns {{coordinateX: number, coordinateY: number} | null} The computed intersection point, or null.
 */
function determineSegmentIntersectionPoint(segmentOne, segmentTwo) {
  // Extract and rename points for clarity within this function's scope.
  const segmentA_P1 = segmentOne[0];
  const segmentA_P2 = segmentOne[1];
  const segmentB_P1 = segmentTwo[0];
  const segmentB_P2 = segmentTwo[1];

  // Calculate direction vectors for each segment.
  const vectorA_dx = segmentA_P2.coordinateX - segmentA_P1.coordinateX;
  const vectorA_dy = segmentA_P2.coordinateY - segmentA_P1.coordinateY;
  const vectorB_dx = segmentB_P2.coordinateX - segmentB_P1.coordinateX;
  const vectorB_dy = segmentB_P2.coordinateY - segmentB_P1.coordinateY;

  // Calculate the determinant of the system of equations.
  // This is equivalent to the 2D cross product of the direction vectors.
  // If the determinant is near zero, the segments are parallel or collinear.
  const systemDeterminant = (vectorA_dx * vectorB_dy) - (vectorA_dy * vectorB_dx);

  // Check for parallel or collinear segments.
  if (Math.abs(systemDeterminant) < GEOMETRIC_PRECISION_THRESHOLD) {
    // For the purpose of counting regions, parallel or collinear segments
    // are considered not to have a unique intersection point that adds a region.
    return null;
  }

  // Calculate the vector from the start point of segment A to the start point of segment B.
  const vectorA1_to_B1_dx = segmentB_P1.coordinateX - segmentA_P1.coordinateX;
  const vectorA1_to_B1_dy = segmentB_P1.coordinateY - segmentA_P1.coordinateY;

  // Calculate parametric values 'r' and 's'.
  // 'r' applies to segmentOne, 's' applies to segmentTwo.
  const paramR = ((vectorA1_to_B1_dy * vectorB_dx) - (vectorA1_to_B1_dx * vectorB_dy)) / systemDeterminant;
  const paramS = ((vectorA1_to_B1_dy * vectorA_dx) - (vectorA1_to_B1_dx * vectorA_dy)) / systemDeterminant;

  // Verify that the intersection point lies within both line segments.
  // This means 'r' and 's' must be in the range [0, 1], accounting for floating-point precision.
  const isParamR_valid = paramR >= -GEOMETRIC_PRECISION_THRESHOLD && paramR <= 1 + GEOMETRIC_PRECISION_THRESHOLD;
  const isParamS_valid = paramS >= -GEOMETRIC_PRECISION_THRESHOLD && paramS <= 1 + GEOMETRIC_PRECISION_THRESHOLD;

  if (!isParamR_valid || !isParamS_valid) {
    // Intersection point exists for the infinite lines, but not within the segments.
    return null;
  }

  // Compute the coordinates of the intersection point using 'paramR' and segmentOne.
  // Using 'paramS' and segmentTwo would yield the exact same point.
  const intersectionX_coord = segmentA_P1.coordinateX + paramR * vectorA_dx;
  const intersectionY_coord = segmentA_P1.coordinateY + paramR * vectorA_dy;

  return { coordinateX: intersectionX_coord, coordinateY: intersectionY_coord };
}

/**
 * Calculates the total number of regions a plane is divided into by a given
 * collection of line segments. The algorithm incrementally adds segments and
 * uses the principle that each new segment adds 1 region, plus 1 region for
 * each unique intersection point it creates with previously added segments.
 *
 * This is an application of Euler's formula for planar graphs (V - E + F = C + 1),
 * where F (faces/regions) is what we are counting.
 *
 * @param {Array<Array<{coordinateX: number, coordinateY: number}>>} segmentCollection - An array where each element is a line segment,
 *   represented as an array of two point objects.
 * @returns {number} The final count of planar regions.
 */
function determinePlanarRegionsCount(segmentCollection) {
  // If no segments are provided, the entire plane is considered a single region.
  if (!segmentCollection || segmentCollection.length === 0) {
    return 1;
  }

  let totalRegionsFormed = 1; // Start with 1 region (the undivided plane).

  // Iterate through each segment in the collection, treating them as being added one by one.
  for (let currentSegmentIdx = 0; currentSegmentIdx < segmentCollection.length; currentSegmentIdx++) {
    const currentSegmentToAdd = segmentCollection[currentSegmentIdx];

    // Each new segment, at minimum, divides an existing region into two, thus adding one new region.
    totalRegionsFormed++;

    // This array will store unique intersection points that the `currentSegmentToAdd`
    // forms with any of the `previousSegments`.
    let uniqueIntersectionsForCurrentSegment = [];

    // Compare the `currentSegmentToAdd` with all segments that have already been processed.
    for (let previousSegmentIdx = 0; previousSegmentIdx < currentSegmentIdx; previousSegmentIdx++) {
      const previousSegment = segmentCollection[previousSegmentIdx];

      // Attempt to find an intersection point between the current and a previous segment.
      const foundIntersection = determineSegmentIntersectionPoint(currentSegmentToAdd, previousSegment);

      // If an intersection point is found...
      if (foundIntersection !== null) {
        // Check if this specific intersection point has already been recorded
        // for the `currentSegmentToAdd` (due to multiple previous segments
        // intersecting it at the same location).
        const isIntersectionAlreadyRecorded = uniqueIntersectionsForCurrentSegment.some(existingPoint =>
          arePointsApproximatelyEquivalent(existingPoint, foundIntersection)
        );

        // If it's a new, unique intersection point for the `currentSegmentToAdd`, record it.
        if (!isIntersectionAlreadyRecorded) {
          uniqueIntersectionsForCurrentSegment.push(foundIntersection);
        }
      }
    }

    // Each unique intersection point discovered by the `currentSegmentToAdd`
    // further divides an existing region, adding another new region.
    totalRegionsFormed += uniqueIntersectionsForCurrentSegment.length;
  }

  return totalRegionsFormed;
}

// --- Main Program Orchestration ---

/**
 * Orchestrates the entire solution process: parsing raw input,
 * segmenting it into batches, and solving the geometric problem for each batch.
 * It handles input validation and prints the results.
 * @param {string[]} rawInputLines - An array of raw string lines obtained from standard input.
 */
function executeGeometricProblemSolver(rawInputLines) {
  // Guard against empty input, although `process.stdin.on('end')` should ensure some data if available.
  if (!rawInputLines || rawInputLines.length === 0) {
    // console.error("No input data was received to process.");
    return;
  }

  // Create a mutable copy of the input array to allow shifting elements,
  // which simulates consuming lines from a stream.
  let mutableInputSource = [...rawInputLines];

  // Process input in batches. Each batch begins with a number indicating
  // how many segments follow, until a batch size of 0 is encountered.
  while (true) {
    const batchSizeLine = mutableInputSource.shift();

    // If no more lines are available, it means we've processed all input.
    if (batchSizeLine === undefined) {
      break;
    }

    const numberOfSegmentsInCurrentBatch = parseInt(batchSizeLine, 10);

    // Validate the parsed number of segments.
    if (isNaN(numberOfSegmentsInCurrentBatch) || numberOfSegmentsInCurrentBatch < 0) {
      // For malformed input, we can choose to skip or error. Skipping seems more robust.
      // console.warn(`Warning: Invalid segment count '${batchSizeLine}' encountered. Skipping this batch.`);
      continue;
    }

    // A batch size of 0 signals the end of problem input.
    if (numberOfSegmentsInCurrentBatch === 0) {
      break;
    }

    let currentBatchOfSegments = [];

    // Read and parse coordinates for each segment in the current batch.
    for (let segmentIndex = 0; segmentIndex < numberOfSegmentsInCurrentBatch; segmentIndex++) {
      const segmentCoordinatesLine = mutableInputSource.shift();

      // Check for unexpected end of input within a batch.
      if (segmentCoordinatesLine === undefined) {
        // console.error("Error: Unexpected end of input while parsing segment coordinates. Batch incomplete.");
        currentBatchOfSegments = []; // Discard incomplete batch
        break; // Exit inner loop and potentially move to next (non-existent) batch.
      }

      // Parse the four coordinate values (x1, y1, x2, y2) from the line.
      const parsedCoords = segmentCoordinatesLine.split(' ').map(Number);

      // Validate the parsed coordinate values.
      if (parsedCoords.length !== 4 || parsedCoords.some(isNaN)) {
        // console.warn(`Warning: Malformed segment coordinate line "${segmentCoordinatesLine}". Skipping this segment.`);
        continue; // Skip this bad segment and try to parse the next.
      }

      // Add the parsed segment to the current batch, using descriptive property names for points.
      currentBatchOfSegments.push([
        { coordinateX: parsedCoords[0], coordinateY: parsedCoords[1] },
        { coordinateX: parsedCoords[2], coordinateY: parsedCoords[3] }
      ]);
    }

    // Only proceed to calculate regions if the batch contains valid segments.
    if (currentBatchOfSegments.length > 0) {
      const calculatedRegions = determinePlanarRegionsCount(currentBatchOfSegments);
      console.log(calculatedRegions);
    } else if (numberOfSegmentsInCurrentBatch > 0) {
      // If the batch was declared to have segments (numberOfSegmentsInCurrentBatch > 0)
      // but `currentBatchOfSegments` ended up empty due to parsing errors,
      // it means no valid segments were processed for this batch.
      // Consistent with `determinePlanarRegionsCount`, an empty set results in 1 region.
      console.log(1);
    }
  }
}
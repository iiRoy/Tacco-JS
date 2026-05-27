let inputData = []; // Stores all input lines read from standard input.
const inputProcessor = require('readline').createInterface({
  input: process.stdin, // Configure to read from standard input.
  output: process.stdout // Configure to write to standard output (though not directly used for output here).
});

// Event handler for each line received from the input stream.
inputProcessor.on('line', function (currentLine) {
  // Append the current line to our collection of input data.
  inputData.push(currentLine);
});

// Event handler for when the standard input stream concludes.
process.stdin.on('end', function () {
  // Once all input has been gathered, initiate the main program logic.
  executeProgram(inputData);
});

// A small constant value used for floating-point comparisons to account for precision errors.
const TOLERANCE = 1e-10;

/**
 * Computes the intersection point of two given line segments.
 * This function returns null if the segments are parallel, collinear, or if their intersection
 * falls outside the bounds of the first segment (segmentA).
 *
 * @param {Array<Object>} segmentA - The first line segment, defined by an array of two point objects ({x: number, y: number}).
 * @param {Array<Object>} segmentB - The second line segment, defined by an array of two point objects ({x: number, y: number}).
 * @returns {Object|null} An object {x: number, y: number} representing the intersection point, or null if no valid intersection is found.
 */
function calculateIntersectionPoint(segmentA, segmentB) {
  // Destructure the points from the input segments for easier access.
  // segmentA is from pointA to pointB, segmentB is from pointC to pointD.
  const pointA = segmentA[0], pointB = segmentA[1], pointC = segmentB[0], pointD = segmentB[1];
  let paramR, coordX, coordY, determinant; // Variables for intermediate calculations.

  // Calculate the determinant of the system of equations.
  // This value determines if the lines are parallel or intersect.
  determinant = (pointB.x - pointA.x) * (pointD.y - pointC.y) - (pointB.y - pointA.y) * (pointD.x - pointC.x);

  // If the absolute value of the determinant is very small, the lines are parallel or collinear.
  if (Math.abs(determinant) < TOLERANCE) {
    return null; // In this case, there is no unique intersection point.
  }

  // Calculate the parameter 'paramR' for the first line segment.
  // 'paramR' indicates the position of the intersection along segmentA (0 for pointA, 1 for pointB).
  paramR = ((pointD.y - pointC.y) * (pointC.x - pointA.x) - (pointD.x - pointC.x) * (pointC.y - pointA.y)) / determinant;
  // The original code declared 'paramS' but did not use it, so we maintain that behavior.
  // let paramS = ((pointB.y - pointA.y) * (pointC.x - pointA.x) - (pointB.x - pointA.x) * (pointC.y - pointA.y)) / determinant;

  // Compute the coordinates of the intersection point using 'paramR'.
  coordX = pointA.x * (1 - paramR) + pointB.x * paramR;
  coordY = pointA.y * (1 - paramR) + pointB.y * paramR;

  // Check if the intersection point lies strictly within the bounds of the first segment.
  // The original logic excludes endpoints, so we replicate that.
  if (paramR < TOLERANCE || (1 - paramR) < TOLERANCE) {
    return null; // Intersection is at or beyond an endpoint of segmentA.
  }

  // Return the calculated intersection point.
  return { x: coordX, y: coordY };
}

/**
 * Computes the total number of regions created by a given set of line segments.
 * This function implements an algorithm to count regions based on the number of lines
 * and their unique intersection points.
 *
 * @param {Array<Array<Object>>} lineSegments - An array where each element is a line segment,
 *                                              represented as an array of two point objects.
 * @returns {number} The total count of distinct regions formed by the segments.
 */
function processGeometry(lineSegments) {
  let intersectionPoints; // Temporary list to store unique intersection points for the current segment.
  let totalRegions = 1; // Initialize with 1 region (the entire plane before any lines are added).
  let idx1, idx2; // Loop counters for iterating through the line segments.
  let currentIntersection; // Holds the result of an intersection calculation.

  // Iterate through each line segment in the input array.
  for (idx1 = 0; idx1 < lineSegments.length; idx1++) {
    totalRegions++; // Each new line segment, if it doesn't intersect previous lines, adds one new region.
    intersectionPoints = []; // Reset the list of intersection points for the current segment.

    // Compare the current segment (lineSegments[idx1]) with all previously processed segments.
    for (idx2 = 0; idx2 < idx1; idx2++) {
      // Attempt to find an intersection point between the two segments.
      currentIntersection = calculateIntersectionPoint(lineSegments[idx1], lineSegments[idx2]);

      // If no valid intersection is found, skip to the next pair of segments.
      if (currentIntersection === null) {
        continue;
      }

      // Check if this intersection point is already recorded for the current segment.
      // This prevents double-counting intersections if multiple lines meet at the same point.
      // The `||` operator with `push` is a concise way to add an element only if `some` returns false.
      intersectionPoints.some(function (existingPoint) {
        // Compare points using squared Euclidean distance to handle floating-point inaccuracies.
        return (Math.pow(currentIntersection.x - existingPoint.x, 2) + Math.pow(currentIntersection.y - existingPoint.y, 2) < TOLERANCE);
      }) || intersectionPoints.push(currentIntersection);
    }
    // Each unique intersection point on the current line segment effectively splits it,
    // and each split segment adds an additional region.
    totalRegions += intersectionPoints.length;
  }
  return totalRegions; // Return the final calculated number of regions.
}

/**
 * The primary execution function that processes raw input data.
 * It parses line segment definitions, then calls the region calculation function,
 * and finally prints the result for each test case.
 *
 * @param {Array<string>} rawInputLines - An array of strings, where each string is a line from the standard input.
 */
function executeProgram(rawInputLines) {
  let numSegments; // Variable to hold the number of segments for the current test case.
  let loopCounter; // Generic loop counter.
  let segmentCoords; // Temporary array to store coordinate strings after splitting a line.
  let parsedSegments; // Array to store the parsed line segment objects for the current test case.

  // Loop continues as long as the first number in the input block (number of segments) is not zero.
  // `+rawInputLines.shift()` converts the string to a number and removes it from the array.
  while ((numSegments = +rawInputLines.shift()) !== 0) {
    parsedSegments = []; // Initialize an empty array to store segments for the current test case.

    // Read 'numSegments' lines, each defining a line segment.
    for (loopCounter = 0; loopCounter < numSegments; loopCounter++) {
      // Each line contains four space-separated numbers: x1 y1 x2 y2.
      segmentCoords = rawInputLines.shift().split(' ');

      // Parse the string coordinates into numbers and create point objects, then push the segment.
      parsedSegments.push([
        { x: +segmentCoords[0], y: +segmentCoords[1] }, // First point of the segment.
        { x: +segmentCoords[2], y: +segmentCoords[3] }  // Second point of the segment.
      ]);
    }
    // Calculate the number of regions for the current set of segments and print the result.
    console.log(processGeometry(parsedSegments));
  }
}

var inputData = [];
var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

inputProcessor.on('line', function (currentLine) {
  // Store each incoming line of text
  inputData.push(currentLine);
});

process.stdin.on('end', function () {
  // Once all input has been received, initiate processing
  processInputCases(inputData);
});

// A small constant for floating-point comparisons
var TOLERANCE_THRESHOLD = Math.pow(10, -10);

/**
 * Determines the intersection point of two line segments.
 * Returns null if lines are parallel or intersection is out of bounds.
 * @param {Array<Object>} segmentA - First line segment, e.g., [{x: x1, y: y1}, {x: x2, y: y2}]
 * @param {Array<Object>} segmentB - Second line segment
 * @returns {Object|null} The intersection point {x, y} or null
 */
function determineIntersectionPoint(segmentA, segmentB) {
  var point1A = segmentA[0], point2A = segmentA[1], point1B = segmentB[0], point2B = segmentB[1];
  var paramR, paramS, coordX, coordY, determinantVal;

  // Calculate the determinant to check for parallelism
  determinantVal = (point2A.x - point1A.x) * (point2B.y - point1B.y) - (point2A.y - point1A.y) * (point2B.x - point1B.x);

  if (determinantVal === 0) {
    // Lines are parallel, no unique intersection point
    return null;
  }

  // Calculate parameters r and s for the intersection point
  paramR = ((point2B.y - point1B.y) * (point1B.x - point1A.x) - (point2B.x - point1B.x) * (point1B.y - point1A.y)) / determinantVal;
  paramS = ((point2A.y - point1A.y) * (point1B.x - point1A.x) - (point2A.x - point1A.x) * (point1B.y - point1A.y)) / determinantVal;

  // Calculate the actual intersection coordinates
  coordX = point1A.x * (1 - paramR) + point2A.x * paramR;
  coordY = point1A.y * (1 - paramR) + point2A.y * paramR;

  // Check if the intersection point is within the specified bounds
  if (coordX < -100 || coordX > 100 || coordY < -100 || coordY > 100) {
    return null; // Intersection is outside the valid range
  }

  return { x: coordX, y: coordY };
}

/**
 * Calculates the total number of unique elements (lines + unique intersection points).
 * @param {Array<Array<Object>>} segmentCollection - An array of line segments.
 * @returns {number} The total count.
 */
function calculateUniquePoints(segmentCollection) {
  var intersectionPointsFound, totalUniqueElements = 1, idxOuter, idxInner, currentIntersection, processedSegments = [];

  // Iterate through each new line segment in the collection
  for (idxOuter = 0; idxOuter < segmentCollection.length; idxOuter++) {
    totalUniqueElements++; // Each new line segment adds one element
    intersectionPointsFound = []; // Reset intersection points for the current line

    // Compare the current line segment with all previously processed segments
    for (idxInner = 0; idxInner < processedSegments.length; idxInner++) {
      currentIntersection = determineIntersectionPoint(segmentCollection[idxOuter], processedSegments[idxInner]);
      if (currentIntersection == null) {
        continue; // No valid intersection found
      }

      // Check if this intersection point is already in our list for the current line
      var isDuplicate = intersectionPointsFound.some(function (existingPoint) {
        return (Math.abs(currentIntersection.x - existingPoint.x) < TOLERANCE_THRESHOLD &&
                Math.abs(currentIntersection.y - existingPoint.y) < TOLERANCE_THRESHOLD);
      });

      if (!isDuplicate) {
        intersectionPointsFound.push(currentIntersection); // Add unique intersection point
      }
    }

    // Add the current line segment to the list of processed segments
    processedSegments.push(segmentCollection[idxOuter]);
    // Add the number of unique intersection points found for this line to the total count
    totalUniqueElements += intersectionPointsFound.length;
  }
  return totalUniqueElements;
}

/**
 * Main function to process input cases.
 * @param {Array<string>} rawInputLines - All raw input lines from stdin.
 */
function processInputCases(rawInputLines) {
  var numSegmentsInCase, idx, segmentCoordsStr, currentCaseSegments;

  // Loop until the number of segments for a case is 0
  while ((numSegmentsInCase = +rawInputLines.shift()) !== 0) {
    currentCaseSegments = [];
    for (idx = 0; idx < numSegmentsInCase; idx++) {
      // Parse coordinates for each line segment
      segmentCoordsStr = rawInputLines.shift().split(' ');

      currentCaseSegments.push([
        { x: +segmentCoordsStr[0], y: +segmentCoordsStr[1] }, // First point (x1, y1)
        { x: +segmentCoordsStr[2], y: +segmentCoordsStr[3] }  // Second point (x2, y2)
      ]);
    }
    // Output the result for the current test case
    console.log(calculateUniquePoints(currentCaseSegments));
  }
}

var inputData = [];
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// Event listener for each line of input
inputHandler.on('line', function (currentLine) {
  // Store the received line in our collection
  inputData.push(currentLine);
});

// Event listener for the end of the input stream
process.stdin.on('end', function () {
  // Once all input is received, execute the main processing function
  entryPoint(inputData);
});

// A small constant for floating-point comparisons
const TOLERANCE_VAL = 1e-10;

/**
 * Calculates the intersection point of two line segments.
 * @param {Array<Object>} segmentA - The first line segment, represented by two point objects {x, y}.
 * @param {Array<Object>} segmentB - The second line segment, represented by two point objects {x, y}.
 * @returns {Object|null} The intersection point {x, y} if it exists and is within bounds, otherwise null.
 */
function calculateIntersectionPoint(segmentA, segmentB) {
  // Extract coordinates for clarity
  var point1A = segmentA[0], point1B = segmentA[1], point2A = segmentB[0], point2B = segmentB[1];
  var paramR, paramS, coordX, coordY, determinant;

  // Check if the lines are parallel (determinant is zero)
  determinant = (point1B.x - point1A.x) * (point2B.y - point2A.y) - (point1B.y - point1A.y) * (point2B.x - point2A.x);
  if (determinant === 0) {
    // Lines are parallel, no unique intersection point
    return null;
  }

  // Calculate parameters r and s for the intersection point
  paramR = ((point2B.y - point2A.y) * (point2A.x - point1A.x) - (point2B.x - point2A.x) * (point2A.y - point1A.y)) / determinant;
  paramS = ((point1B.y - point1A.y) * (point2A.x - point1A.x) - (point1B.x - point1A.x) * (point2A.y - point1A.y)) / determinant;

  // Check if the intersection point lies within both segments (0 <= r <= 1 and 0 <= s <= 1)
  // For Type II, we preserve the original logic which calculates the intersection of infinite lines
  // and then checks if the point is within a specific bounding box.
  // The original code does not check 0 <= r <= 1 and 0 <= s <= 1, implying it's finding intersection of lines, not segments.
  // The problem statement implies preserving the algorithm.

  // Calculate the actual intersection coordinates
  coordX = point1A.x * (1 - paramR) + point1B.x * paramR;
  coordY = point1A.y * (1 - paramR) + point1B.y * paramR;

  // Check if the intersection point is within the specified bounding box
  if (coordX < -100 || coordX > 100 || coordY < -100 || coordY > 100) {
    return null; // Intersection point is out of bounds
  }

  // Return the valid intersection point
  return { x: coordX, y: coordY };
}

/**
 * Solves the problem of counting regions formed by intersecting line segments.
 * @param {Array<Array<Object>>} segmentList - An array of line segments.
 * @returns {number} The total number of regions.
 */
function processSegments(segmentList) {
  var intersectionPointsCollection, totalRegions = 1, idxA, idxB, currentIntersection;

  // Iterate through each segment
  for (idxA = 0; idxA < segmentList.length; idxA++) {
    totalRegions++; // Each new segment adds at least one new region
    intersectionPointsCollection = []; // Reset intersection points for the current segment

    // Compare the current segment with all previous segments
    for (idxB = 0; idxB < idxA; idxB++) {
      currentIntersection = calculateIntersectionPoint(segmentList[idxA], segmentList[idxB]);
      if (currentIntersection == null) {
        // No intersection or out of bounds
        continue;
      }

      // Check if this intersection point is already in our collection (within tolerance)
      // If not, add it to the collection
      intersectionPointsCollection.some(function (existingPoint) {
        return (Math.pow(currentIntersection.x - existingPoint.x, 2) + Math.pow(currentIntersection.y - existingPoint.y, 2) < TOLERANCE_VAL * TOLERANCE_VAL);
      }) || intersectionPointsCollection.push(currentIntersection);
    }
    // Each unique intersection point on the current segment adds another region
    totalRegions += intersectionPointsCollection.length;
  }
  return totalRegions;
}

/**
 * Main entry point for processing the raw input data.
 * @param {Array<string>} rawInputLines - An array of strings, each representing a line from stdin.
 */
function entryPoint(rawInputLines) {
  var numberOfSegments, idx, segmentCoords, segmentList;

  // Process input until a '0' is encountered for the number of segments
  while ((numberOfSegments = +rawInputLines.shift()) !== 0) {
    segmentList = []; // Initialize list for segments in the current test case

    // Read 'numberOfSegments' lines to form the segments
    for (idx = 0; idx < numberOfSegments; idx++) {
      segmentCoords = rawInputLines.shift().split(' '); // Split coordinates string

      // Create segment objects and add to the list
      segmentList.push([
        { x: +segmentCoords[0], y: +segmentCoords[1] }, // First point of the segment
        { x: +segmentCoords[2], y: +segmentCoords[3] }  // Second point of the segment
      ]);
    }
    // Solve the current test case and print the result
    console.log(processSegments(segmentList));
  }
}

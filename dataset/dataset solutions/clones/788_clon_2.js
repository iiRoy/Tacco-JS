var inputDataRows = []; // This array will store all lines read from standard input.

// Initialize a readline interface to process input from the console.
var inputProcessor = require('readline').createInterface({
  input: process.stdin,   // Read from standard input stream.
  output: process.stdout  // Output to standard output stream (not directly used for printing by reader).
});

// Event listener for each individual line of input received.
inputProcessor.on('line', function (currentLineContent) {
  // Add the current line's text content to our global collection.
  inputDataRows.push(currentLineContent);
});

// Event listener for when the standard input stream signals its end.
process.stdin.on('end', function () {
  // Once all input has been gathered, initiate the main processing logic.
  processInput(inputDataRows);
});

// A small floating-point constant used for comparisons to handle precision issues.
var SMALL_NUM = 1e-10;

/**
 * Computes the intersection point of two given line segments.
 *
 * @param {Array<Object>} segmentA - The first line segment, defined by an array of two point objects {xCoord, yCoord}.
 * @param {Array<Object>} segmentB - The second line segment, defined by an array of two point objects {xCoord, yCoord}.
 * @returns {Object|null} An object {xCoord, yCoord} representing the intersection point, or null if no valid intersection is found.
 */
function determineIntersectionPoint(segmentA, segmentB) {
  // Extract the coordinates for the endpoints of both segments:
  // segmentA: p1 (start) to p2 (end)
  // segmentB: p3 (start) to p4 (end)
  var p1 = segmentA[0], p2 = segmentA[1], p3 = segmentB[0], p4 = segmentB[1];
  var paramR, coordX, coordY, determinant;

  // Calculate the determinant of the system of linear equations.
  // This value helps determine if the lines are parallel or intersect.
  determinant = (p2.xCoord - p1.xCoord) * (p4.yCoord - p3.yCoord) - (p2.yCoord - p1.yCoord) * (p4.xCoord - p3.xCoord);

  // If the determinant is very small (close to zero or negative within tolerance),
  // the lines are considered parallel or collinear, meaning no unique intersection point.
  if (determinant < SMALL_NUM) {
    return null;
  }

  // Calculate the parameter 'paramR' for the first line segment.
  // 'paramR' indicates where along segmentA the intersection occurs (0 for p1, 1 for p2).
  paramR = ((p4.yCoord - p3.yCoord) * (p3.xCoord - p1.xCoord) - (p4.xCoord - p3.xCoord) * (p3.yCoord - p1.yCoord)) / determinant;

  // Compute the actual X and Y coordinates of the intersection point using 'paramR'.
  coordX = p1.xCoord * (1 - paramR) + p2.xCoord * paramR;
  coordY = p1.yCoord * (1 - paramR) + p2.yCoord * paramR;

  // Check if the intersection point lies strictly within the first segment (segmentA).
  // If 'paramR' is very close to 0 or 1, it means the intersection is at an endpoint,
  // which the original logic excludes.
  if (paramR < SMALL_NUM || (1 - paramR) < SMALL_NUM) {
    return null; // Intersection is at or outside an endpoint of segmentA.
  }

  // Return the coordinates of the valid intersection point.
  return { xCoord: coordX, yCoord: coordY };
}

/**
 * Calculates the total number of unique points, including initial segment endpoints
 * and unique intersection points among the segments.
 *
 * @param {Array<Array<Object>>} inputSegments - An array where each element is a line segment,
 *                                               represented as an array of two point objects.
 * @returns {number} The final count of unique points.
 */
function calculateUniqueIntersections(inputSegments) {
  var intersectionPointsCollection; // Stores unique intersection points found for the current segment.
  var totalCount = 1;               // Initialize total count as per the original algorithm's starting point.
  var idxA, idxB, currentIntersection; // Loop indices and temporary variable for an intersection point.

  // Iterate through each line segment in the provided collection.
  for (idxA = 0; idxA < inputSegments.length; idxA++) {
    totalCount++; // Increment the total count for the current segment being considered.
    intersectionPointsCollection = []; // Reset the collection of unique intersections for this segment.

    // Compare the current segment (at idxA) with all previously processed segments (at idxB).
    for (idxB = 0; idxB < idxA; idxB++) {
      // Attempt to find an intersection point between the two segments.
      currentIntersection = determineIntersectionPoint(inputSegments[idxA], inputSegments[idxB]);

      // If no valid intersection point is returned, move to the next pair of segments.
      if (currentIntersection == null) {
        continue;
      }

      // Check if this newly found intersection point is already present in our collection
      // (considering floating-point precision). If it's a new unique point, add it.
      intersectionPointsCollection.some(function (existingPoint) {
        // Calculate the squared Euclidean distance between the current and an existing point.
        // If the distance is very small, they are considered the same point.
        return (Math.pow(currentIntersection.xCoord - existingPoint.xCoord, 2) +
                Math.pow(currentIntersection.yCoord - existingPoint.yCoord, 2) < SMALL_NUM);
      }) || intersectionPointsCollection.push(currentIntersection); // If 'some' returns false (no match), add the point.
    }
    // Add the number of unique intersection points found for the current segment to the running total.
    totalCount += intersectionPointsCollection.length;
  }
  return totalCount; // Return the final computed count of unique points.
}

/**
 * The main entry point for processing all input data sets.
 *
 * @param {Array<string>} allInputLines - An array of strings, where each string is a line from standard input.
 */
function processInput(allInputLines) {
  var numberOfSegments;       // Stores the count of segments for the current test case.
  var loopIndex;              // General-purpose loop counter.
  var temporarySplit;         // Holds the result of splitting an input line.
  var currentSegments;        // Array to store segment objects for the current test case.

  // Continue processing as long as there are input lines and the number of segments for a case is not zero.
  // The first line of each test case provides the number of segments.
  while ((numberOfSegments = +allInputLines.shift()) !== 0) {
    currentSegments = []; // Initialize an empty array for segments of the current test case.

    // Read 'numberOfSegments' lines, each defining a line segment.
    for (loopIndex = 0; loopIndex < numberOfSegments; loopIndex++) {
      // Take the next line from input and split it by spaces to get coordinate strings.
      temporarySplit = allInputLines.shift().split(' ');

      // Parse the string coordinates into numbers and create point objects,
      // then push the complete segment (two points) into the currentSegments array.
      currentSegments.push([
        { xCoord: +temporarySplit[0], yCoord: +temporarySplit[1] }, // First endpoint of the segment.
        { xCoord: +temporarySplit[2], yCoord: +temporarySplit[3] }  // Second endpoint of the segment.
      ]);
    }
    // Once all segments for the current test case are collected,
    // calculate the unique intersections and print the result to the console.
    console.log(calculateUniqueIntersections(currentSegments));
  }
}

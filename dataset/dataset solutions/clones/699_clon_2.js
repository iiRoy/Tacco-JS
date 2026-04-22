var inputReadPosition = 0; // Global pointer for reading sequential input data

// This function performs a 90-degree rotation-like transformation on a set of coordinates.
function alterCoordinates(xSet, ySet, countOfPoints) {
  for (var pointIter = 1; pointIter <= countOfPoints; pointIter++) { // Iterate through each coordinate pair
    var initialX = xSet[pointIter]; // Store the original X-coordinate
    var transformedY = (ySet[pointIter] === 0) ? 0 : (ySet[pointIter] * (-1)); // Calculate the new Y value
    xSet[pointIter] = transformedY; // Assign the new Y to the X-coordinate position
    ySet[pointIter] = initialX; // Assign the original X to the Y-coordinate position
  }
}


// This routine processes a single segment of input data, parsing coordinates and applying transformations.
function processInputSegment(figureXArrays, figureYArrays, currentSegmentIdx, segmentPointCounts, rawInputData) {

  segmentPointCounts[currentSegmentIdx] = parseInt(rawInputData[inputReadPosition++], 10); // Parse the number of points for this segment
  figureXArrays[currentSegmentIdx] = []; // Initialize array for X coordinates of the current segment
  figureYArrays[currentSegmentIdx] = []; // Initialize array for Y coordinates of the current segment

  for (var pointCounter = 1; pointCounter <= segmentPointCounts[currentSegmentIdx]; pointCounter++) {
    rawInputData[inputReadPosition] = rawInputData[inputReadPosition].split(" "); // Split the coordinate string
    figureXArrays[currentSegmentIdx][pointCounter] = parseInt(rawInputData[inputReadPosition][0], 10); // Parse X coordinate
    figureYArrays[currentSegmentIdx][pointCounter] = parseInt(rawInputData[inputReadPosition++][1], 10); // Parse Y coordinate and advance input pointer

    if (pointCounter > 1) { // If not the first point, normalize relative to the first point
      figureXArrays[currentSegmentIdx][pointCounter] -= figureXArrays[currentSegmentIdx][1];
      figureYArrays[currentSegmentIdx][pointCounter] -= figureYArrays[currentSegmentIdx][1];
    }
  }
  // Set the first point to the origin after normalization
  figureXArrays[currentSegmentIdx][1] = 0;
  figureYArrays[currentSegmentIdx][1] = 0;

  // Apply coordinate transformations based on specific conditions of the second point
  if (figureYArrays[currentSegmentIdx][2] > 0)
    alterCoordinates(figureXArrays[currentSegmentIdx], figureYArrays[currentSegmentIdx], segmentPointCounts[currentSegmentIdx]);
  if (figureXArrays[currentSegmentIdx][2] < 0)
    alterCoordinates(figureXArrays[currentSegmentIdx], figureYArrays[currentSegmentIdx], segmentPointCounts[currentSegmentIdx]);
  if (figureYArrays[currentSegmentIdx][2] < 0)
    alterCoordinates(figureXArrays[currentSegmentIdx], figureYArrays[currentSegmentIdx], segmentPointCounts[currentSegmentIdx]);
}


// This function computes an inverse-like transformation on a shape's coordinates.
function reverseShapeOrientation(currentXPoints, currentYPoints, totalPointsInShape) {
  var temporaryXStorage = []; // Temporary array to hold X-coordinates
  var temporaryYStorage = []; // Temporary array to hold Y-coordinates

  // Copy current coordinates to temporary storage
  for (var coordIndex = 1; coordIndex <= totalPointsInShape; coordIndex++) {
    temporaryXStorage[coordIndex] = currentXPoints[coordIndex];
    temporaryYStorage[coordIndex] = currentYPoints[coordIndex];
  }

  // Apply the reversal and shift transformation
  for (var reverseIndex = 1; reverseIndex <= totalPointsInShape; reverseIndex++) {
    currentXPoints[reverseIndex] = temporaryXStorage[totalPointsInShape - reverseIndex + 1] - temporaryXStorage[totalPointsInShape];
    currentYPoints[reverseIndex] = temporaryYStorage[totalPointsInShape - reverseIndex + 1] - temporaryYStorage[totalPointsInShape];
  }

  // Apply further rotations based on specific conditions of the second point
  if (currentYPoints[2] > 0)
    alterCoordinates(currentXPoints, currentYPoints, totalPointsInShape);
  if (currentXPoints[2] < 0)
    alterCoordinates(currentXPoints, currentYPoints, totalPointsInShape);
  if (currentYPoints[2] < 0)
    alterCoordinates(currentXPoints, currentYPoints, totalPointsInShape);
}


// Main entry point for the application, handling overall input processing and shape analysis.
function processAllInput(sourceData) {
  sourceData = sourceData.split("\n"); // Split the raw input string into an array of lines

  while (true) { // Loop indefinitely until an exit condition is met
    var numberOfFigures = parseInt(sourceData[inputReadPosition++], 10); // Read the number of figures for the current test case
    if (numberOfFigures === 0) // If the number is 0, terminate the processing loop
      break;

    var figurePointCounts = []; // Array to store the number of points for each figure
    var allFigureXCoords = []; // 2D array to store X coordinates for all figures
    var allFigureYCoords = []; // 2D array to store Y coordinates for all figures

    // Process each figure's data
    for (var figureIdx = 0; figureIdx <= numberOfFigures; figureIdx++)
      processInputSegment(allFigureXCoords, allFigureYCoords, figureIdx, figurePointCounts, sourceData);

    // Compare the first figure with subsequent figures
    for (var currentFigureCheck = 1; currentFigureCheck <= numberOfFigures; currentFigureCheck++) {
      if (figurePointCounts[0] === figurePointCounts[currentFigureCheck]) { // Check if point counts match
        var isMatch = true; // Flag to track if figures are identical
        // Compare point by point
        for (var pointComparisonIdx = 1; pointComparisonIdx <= figurePointCounts[0]; pointComparisonIdx++) {
          if (allFigureXCoords[0][pointComparisonIdx] !== allFigureXCoords[currentFigureCheck][pointComparisonIdx] ||
            allFigureYCoords[0][pointComparisonIdx] !== allFigureYCoords[currentFigureCheck][pointComparisonIdx]) {
            isMatch = false; // Mismatch found
            break; // Exit inner loop
          }
        }
        if (isMatch) { // If figures are identical after direct comparison
          console.log(currentFigureCheck); // Output the index of the matching figure
        } else { // If not a direct match, try with inverted orientation
          reverseShapeOrientation(allFigureXCoords[currentFigureCheck], allFigureYCoords[currentFigureCheck], figurePointCounts[currentFigureCheck]);
          var isMatchAfterReverse = true; // New flag for comparison after inversion
          // Re-compare point by point after inversion
          for (var postReversePointIdx = 1; postReversePointIdx <= figurePointCounts[0]; postReversePointIdx++) {
            if (allFigureXCoords[0][postReversePointIdx] !== allFigureXCoords[currentFigureCheck][postReversePointIdx] ||
              allFigureYCoords[0][postReversePointIdx] !== allFigureYCoords[currentFigureCheck][postReversePointIdx]) {
              isMatchAfterReverse = false; // Mismatch found
              break; // Exit inner loop
            }
          }
          if (isMatchAfterReverse) // If figures are identical after inversion
            console.log(currentFigureCheck); // Output the index
        }
      }
    }
    console.log("+++++"); // Separator for test cases
  }
}
// Execute the main function, reading input from standard input
processAllInput(require("fs").readFileSync("/dev/stdin", "utf8"));
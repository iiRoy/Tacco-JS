// Function to process coordinate data, identify extreme points based on specific criteria, and calculate a final metric.
function ProcessCoordinates(rawDataLines) {

  // Helper utility to parse a single coordinate point from an array of strings.
  // It also associates the original line index for traceability.
  const extractPointData = (coordinateStringArray, sourceLineIndex) => {
    // Convert string parts to numbers. Using Number() is a concise alternative to parseInt(..., 10).
    const xCoordinate = Number(coordinateStringArray[0]);
    const yCoordinate = Number(coordinateStringArray[1]);
    return { x: xCoordinate, y: yCoordinate, srcIdx: sourceLineIndex };
  };

  // Helper function to compute the Manhattan distance (L1 norm) between two given points.
  const calculateManhattanDistance = (pointOne, pointTwo) => {
    return Math.abs(pointOne.x - pointTwo.x) + Math.abs(pointOne.y - pointTwo.y);
  };

  // Divide the complete input string into an array of individual lines.
  const allInputLines = rawDataLines.split("\n");

  // Retrieve the total number of coordinate pairs expected from the first line of input.
  const numberOfCoordinates = parseInt(allInputLines[0], 10);

  // --- Robustness: Input Validation and Edge Case Handling ---
  // If the count of coordinates is zero or negative, there's no data to process.
  if (numberOfCoordinates < 1) {
    // Output an informational message and terminate execution for this input.
    console.log("Input error: No coordinate pairs specified or invalid count.");
    return;
  }
  // Also check if there are enough lines in the input for the specified count.
  // The first line is the count, subsequent lines are points. So total lines should be count + 1.
  if (allInputLines.length < numberOfCoordinates + 1) {
    console.log("Input error: Insufficient data lines for the specified coordinate count.");
    return;
  }

  // To correctly identify extreme points, we initialize them with the very first coordinate data point.
  // This ensures that our initial comparison values are actual data points, not arbitrary constants.
  const firstCoordinateParts = allInputLines[1].split(" ");
  const initialDataPoint = extractPointData(firstCoordinateParts, 1);

  // Initialize four distinct "extreme" points. These points are updated based on specific
  // dominance criteria (e.g., a point is "more top-right" if its x and y are both greater or equal).
  // Each point object stores its x, y coordinates and the original index from the input.
  let upperRightBoundary = { ...initialDataPoint }; // A point that is 'top-right' relative to others (max X, max Y)
  let upperLeftBoundary = { ...initialDataPoint };  // A point that is 'top-left' relative to others (min X, max Y)
  let lowerRightBoundary = { ...initialDataPoint }; // A point that is 'bottom-right' relative to others (max X, min Y)
  let lowerLeftBoundary = { ...initialDataPoint };  // A point that is 'bottom-left' relative to others (min X, min Y)

  // Iterate through the remaining coordinate data points.
  // The loop starts from the second data point (index 2 in the 'allInputLines' array)
  // and continues up to the total specified number of coordinates.
  for (let currentDataIndex = 2; currentDataIndex <= numberOfCoordinates; currentDataIndex++) {
    const currentLineParts = allInputLines[currentDataIndex].split(" ");
    const currentProcessedPoint = extractPointData(currentLineParts, currentDataIndex);

    // Check and update the upper-right boundary point.
    // A new point replaces the old if it's further right AND further up.
    if (currentProcessedPoint.x >= upperRightBoundary.x && currentProcessedPoint.y >= upperRightBoundary.y) {
      upperRightBoundary = { ...currentProcessedPoint };
    }
    // Check and update the upper-left boundary point.
    // A new point replaces the old if it's further left AND further up.
    if (currentProcessedPoint.x <= upperLeftBoundary.x && currentProcessedPoint.y >= upperLeftBoundary.y) {
      upperLeftBoundary = { ...currentProcessedPoint };
    }
    // Check and update the lower-right boundary point.
    // A new point replaces the old if it's further right AND further down.
    if (currentProcessedPoint.x >= lowerRightBoundary.x && currentProcessedPoint.y <= lowerRightBoundary.y) {
      lowerRightBoundary = { ...currentProcessedPoint };
    }
    // Check and update the lower-left boundary point.
    // A new point replaces the old if it's further left AND further down.
    if (currentProcessedPoint.x <= lowerLeftBoundary.x && currentProcessedPoint.y <= lowerLeftBoundary.y) {
      lowerLeftBoundary = { ...currentProcessedPoint };
    }
  }

  // Compute the Manhattan distance between two specific pairs of extreme points.
  // First pair: the upper-rightmost and lower-leftmost points.
  const distanceBetweenDiagonalOne = calculateManhattanDistance(upperRightBoundary, lowerLeftBoundary);
  // Second pair: the upper-leftmost and lower-rightmost points.
  const distanceBetweenDiagonalTwo = calculateManhattanDistance(upperLeftBoundary, lowerRightBoundary);

  // The final calculated metric is the greater of these two distances.
  const finalComputedMetric = Math.max(distanceBetweenDiagonalOne, distanceBetweenDiagonalTwo);

  // Output the result to standard output.
  console.log(finalComputedMetric);
}

// Standard competitive programming boilerplate:
// Reads all available data from standard input, converts it to a UTF-8 string,
// and then passes it to our primary processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8"));
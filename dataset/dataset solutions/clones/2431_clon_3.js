// This module processes geometric point data from a raw input string.
// It computes a specific metric based on inter-point distances.
function processPointData(rawDataPayload) {
  // Split the entire input string into individual lines for processing.
  // The first line typically contains metadata, subsequent lines contain point coordinates.
  const processedLines = rawDataPayload.split('\n');

  // Attempt to extract the total count of points from the initial line.
  // This value determines the number of coordinate pairs we expect.
  const numberOfPointsStr = processedLines[0];
  const totalPointCount = Number(numberOfPointsStr);

  // Implement a basic validation check for the point count.
  // If the count is invalid (not a number, or non-positive), we log an error and terminate.
  if (isNaN(totalPointCount) || totalPointCount <= 0) {
    console.error("Error: Invalid or non-positive point count detected. Aborting calculation.");
    return; // Exit the function gracefully.
  }

  // An array to store all parsed point objects.
  // Each point will be stored as an object { x: number, y: number }.
  const parsedCoordinates = [];

  // Iterate through the input lines, starting from the second line (index 1),
  // to parse and store each point's coordinates.
  for (let currentLineIndex = 1; currentLineIndex <= totalPointCount; currentLineIndex++) {
    const coordinateString = processedLines[currentLineIndex];

    // Validate that the coordinate string for the current index actually exists.
    if (!coordinateString) {
      console.warn(`Warning: Missing coordinate data for point at line ${currentLineIndex}. Skipping.`);
      continue; // Move to the next iteration if data is missing.
    }

    // Split the coordinate string by space to get X and Y components.
    const coordinateComponents = coordinateString.split(' ');

    // Ensure that exactly two components (X and Y) are provided.
    if (coordinateComponents.length !== 2) {
      console.warn(`Warning: Malformed coordinate line "${coordinateString}". Expected two values, got ${coordinateComponents.length}. Skipping.`);
      continue;
    }

    // Convert string components to numeric values.
    const xValue = Number(coordinateComponents[0]);
    const yValue = Number(coordinateComponents[1]);

    // Validate that the parsed X and Y values are indeed numbers.
    if (isNaN(xValue) || isNaN(yValue)) {
      console.warn(`Warning: Non-numeric coordinate values found in line "${coordinateString}". Skipping.`);
      continue;
    }

    // Add the successfully parsed point to our collection.
    parsedCoordinates.push({ x: xValue, y: yValue });
  }

  // Initialize a variable to accumulate the sum of all pairwise distances.
  let cumulativePairwiseDistance = 0.0;

  // Outer loop: Iterate through each point, considering it as the first point in a pair (pA).
  // The loop runs from the first point (index 0) up to, but not including, the last point.
  for (let firstPointIdx = 0; firstPointIdx < parsedCoordinates.length; firstPointIdx++) {
    const pointAlpha = parsedCoordinates[firstPointIdx];

    // Inner loop: Iterate through subsequent points, considering them as the second point in a pair (pB).
    // This avoids redundant calculations (distance A-B is same as B-A) and self-comparison (A-A).
    for (let secondPointIdx = firstPointIdx + 1; secondPointIdx < parsedCoordinates.length; secondPointIdx++) {
      const pointBeta = parsedCoordinates[secondPointIdx];

      // Calculate the difference in X coordinates.
      const deltaXcoord = pointAlpha.x - pointBeta.x;
      // Calculate the difference in Y coordinates.
      const deltaYcoord = pointAlpha.y - pointBeta.y;

      // Compute the square of the X difference and Y difference.
      const sqDeltaX = Math.pow(deltaXcoord, 2);
      const sqDeltaY = Math.pow(deltaYcoord, 2);

      // Sum the squared differences to get the squared Euclidean distance.
      const squaredEuclideanDistance = sqDeltaX + sqDeltaY;

      // Calculate the actual Euclidean distance by taking the square root.
      const segmentLength = Math.sqrt(squaredEuclideanDistance);

      // Add this calculated segment length to our running total.
      cumulativePairwiseDistance += segmentLength;
    }
  }

  // Calculate the final requested metric.
  // The original problem asks for (sum of distances * 2) / number of points.
  const finalCalculatedMetric = (cumulativePairwiseDistance * 2.0) / totalPointCount;

  // Output the final result to the console, formatted to a reasonable precision.
  console.log(finalCalculatedMetric.toFixed(10)); // Using toFixed for consistent output formatting.
}

// Standard input handling mechanism for competitive programming environments.
// This part should not be modified, as per typical problem constraints.
processPointData(require("fs").readFileSync("/dev/stdin", "utf8"));
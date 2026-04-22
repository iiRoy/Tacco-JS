// Function responsible for analyzing input data and calculating a specific cumulative value.
function evaluatePathSegments(rawInputPayload) {
  // Defensive check: Ensure the provided input is a non-empty string.
  if (typeof rawInputPayload !== 'string' || rawInputPayload.length === 0) {
    console.error("Input data is either invalid (not a string) or empty. Cannot proceed.");
    // Optionally throw an error or return a specific default value.
    return;
  }

  // Internal utility function to parse an integer from a string,
  // handling potential whitespace and ensuring a valid number is returned or NaN.
  const safelyParseInteger = (strValue) => {
    // Convert to string and trim whitespace to handle various input formats.
    const cleanString = String(strValue || '').trim();
    // Attempt to convert the cleaned string to an integer.
    const numericValue = parseInt(cleanString, 10);
    // Return the number if valid, otherwise NaN.
    return isNaN(numericValue) ? NaN : numericValue;
  };

  // Break down the raw input into an array of individual lines.
  const inputLines = rawInputPayload.split('\n');

  // Extract the first key parameter: the total count of data points.
  // This value is expected on the first line of the input.
  const quantityOfPoints = safelyParseInteger(inputLines[0]);

  // Extract the second key parameter: the threshold or boundary value.
  // This value is expected on the second line of the input.
  const boundaryValue = safelyParseInteger(inputLines[1]);

  // Validate the primary parameters. If parsing failed for N or K, we cannot continue.
  if (isNaN(quantityOfPoints) || isNaN(boundaryValue)) {
    console.error("Critical numerical parameters (quantity or boundary) could not be parsed. Check input format.");
    return;
  }

  // Process the line containing space-separated coordinates.
  // This is typically the third line of the input data.
  const coordinateStringList = inputLines[2] ? inputLines[2].trim().split(' ') : [];

  // Convert the array of string coordinates into an array of numbers.
  // Only valid numbers are included.
  const pointCoordinates = [];
  for (const strCoord of coordinateStringList) {
    const numericCoord = safelyParseInteger(strCoord);
    if (!isNaN(numericCoord)) {
      pointCoordinates.push(numericCoord);
    }
  }

  // Initialize a variable to accumulate the total calculated path length.
  let accumulatedPathLength = 0;

  // Loop through each data point up to the specified quantity of points.
  // Ensure we don't go out of bounds if pointCoordinates has fewer elements than quantityOfPoints.
  for (let currentIdx = 0; currentIdx < quantityOfPoints && currentIdx < pointCoordinates.length; ++currentIdx) {
    const currentCoordinate = pointCoordinates[currentIdx];

    // Calculate the first potential path value: the coordinate itself.
    // Assuming 0 is the implicit start point for this path.
    const pathFromInitialPoint = currentCoordinate;

    // Calculate the second potential path value: difference from the boundary.
    const pathFromBoundaryPoint = boundaryValue - currentCoordinate;

    // Determine the minimal 'distance' or 'value' between the two paths.
    // This uses Math.min to select the smaller of the two calculated values.
    const optimalSegmentValue = Math.min(pathFromInitialPoint, pathFromBoundaryPoint);

    // Each segment's contribution is twice its optimal value.
    // This implies a round-trip or a specific cost multiplier.
    const segmentContribution = optimalSegmentValue * 2;

    // Add this segment's contribution to the overall total.
    accumulatedPathLength += segmentContribution;
  }

  // Display the final computed sum to the console.
  console.log(accumulatedPathLength);
}

// Entry point for script execution in a Node.js environment.
// Reads the entire content of standard input synchronously and
// then passes it to our main processing function.
evaluatePathSegments(require('fs').readFileSync('/dev/stdin', 'utf8'));
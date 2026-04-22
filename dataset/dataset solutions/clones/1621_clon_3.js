// This module processes geographical coordinates to determine how many fall within a specified radial boundary.
function analyzeSpatialData(textualData) {
  // Defensive check: Ensure input data is not empty or consists only of whitespace.
  if (!textualData || textualData.trim().length === 0) {
    console.error("Error: Provided input data is empty or malformed.");
    return; // Terminate execution if no valid data is supplied.
  }

  // Deconstruct the raw input string into an array of individual line segments.
  const lineSegments = textualData.split('\n');

  // Process the very first line which contains global configuration parameters.
  // This line is expected to define the total count of subsequent data points and the maximum permissible radial distance.
  const configurationParameters = lineSegments[0].split(' ');

  // Extract and rigorously validate the expected number of data points.
  const totalPointEntries = parseInt(configurationParameters[0], 10);
  if (isNaN(totalPointEntries) || totalPointEntries <= 0) {
    console.error("Error: The specified total number of data points is invalid or non-positive.");
    return;
  }

  // Extract and validate the radial distance threshold.
  // Using parseFloat allows for non-integer distance values.
  const maximumRadialDistance = parseFloat(configurationParameters[1]);
  if (isNaN(maximumRadialDistance) || maximumRadialDistance < 0) {
    console.error("Error: The specified radial distance threshold is invalid or negative.");
    return;
  }

  // Pre-compute the square of the maximum radial distance.
  // This optimization avoids repeated square root calculations for each point's distance,
  // as comparing squared distances is equivalent to comparing actual distances.
  const maximumSquaredDistance = Math.pow(maximumRadialDistance, 2);

  // Initialize an array structure to store all successfully parsed coordinate objects.
  const parsedCoordinateSet = [];

  // Iterate through the remaining lines of the input to extract and parse each data point.
  // The loop starts from the second line (index 1) and continues for the `totalPointEntries` count.
  for (let lineIndex = 1; lineIndex <= totalPointEntries; lineIndex++) {
    const currentDataLine = lineSegments[lineIndex];

    // Implement a guard clause to gracefully handle potentially empty or whitespace-only lines,
    // which might occur due to input formatting variations.
    if (!currentDataLine || currentDataLine.trim().length === 0) {
      console.warn(`Warning: Skipping an empty or malformed line at input index ${lineIndex}.`);
      continue; // Move to the next line.
    }

    // Split the current line into its component values and convert them to floating-point numbers.
    const componentValues = currentDataLine.split(' ').map(val => parseFloat(val));

    // Validate that each point entry consists of exactly two numeric coordinates.
    if (componentValues.length !== 2 || isNaN(componentValues[0]) || isNaN(componentValues[1])) {
      console.warn(`Warning: Malformed coordinate pair detected at line ${lineIndex + 1}. Skipping entry: '${currentDataLine}'`);
      continue; // Skip this particular malformed entry.
    }

    // Store the parsed coordinates in an object with descriptive keys for clarity.
    parsedCoordinateSet.push({
      horizontalPosition: componentValues[0],
      verticalPosition: componentValues[1]
    });
  }

  // Initialize a counter to track how many points fall within the defined radial boundary.
  let pointsMeetingCriteria = 0;

  // Begin iterating over the collection of parsed coordinate points.
  for (const currentSpatialPoint of parsedCoordinateSet) {
    // Extract the individual components for the current point for easier manipulation.
    const hComponent = currentSpatialPoint.horizontalPosition;
    const vComponent = currentSpatialPoint.verticalPosition;

    // Calculate the square of each component.
    const hComponentSquared = hComponent * hComponent;
    const vComponentSquared = vComponent * vComponent;

    // Determine the total squared Euclidean distance from the origin (0,0) to the current point.
    const totalEuclideanSquaredDistance = hComponentSquared + vComponentSquared;

    // Compare the calculated squared distance with the pre-computed maximum squared distance.
    if (totalEuclideanSquaredDistance <= maximumSquaredDistance) {
      pointsMeetingCriteria++; // Increment the counter if the point is within the boundary.
    }
  }

  // Output the final count of points that were found to be within the specified radial boundary.
  console.log(pointsMeetingCriteria);
}


// The script's primary execution block:
// Reads all input from standard input, decodes it as UTF-8, and removes any extraneous whitespace.
// This processed string is then passed to the main analysis function.
analyzeSpatialData(
  require('fs').readFileSync('/dev/stdin', 'utf8').trim()
);
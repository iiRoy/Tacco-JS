function processInputData(inputString) {
  // This function processes a multi-line input string to determine a specific geometric property.
  // The input string is expected to contain point coordinates.

  // Step 1: Parse and validate the raw input data.
  // Split the input string into individual lines and remove any blank lines.
  const processedLines = inputString.split('\n').filter(lineContent => lineContent.trim() !== '');

  // Extract the total number of points from the first line.
  // Use parseInt with radix for explicit base conversion.
  const totalPointCount = parseInt(processedLines[0], 10);

  // Basic validation for the point count.
  if (isNaN(totalPointCount) || totalPointCount < 0) {
    // In a real application, this might throw an error or handle it more robustly.
    // For competitive programming, invalid inputs might not be tested.
    console.error("Error: Invalid or negative point count detected.");
    return;
  }

  // Step 2: Handle edge cases for small numbers of points.
  // If there are 1 or 2 points, the problem's specific rule dictates an output of 1.
  if (totalPointCount <= 2) {
    console.log(1);
    return;
  }

  // Step 3: Parse the coordinates for each point.
  // Convert subsequent lines into arrays of [x, y] coordinates.
  const geometricPoints = processedLines.slice(1).map(lineContent => {
    // Split by one or more spaces and convert to numbers.
    const coords = lineContent.split(/\s+/).map(Number);
    // Optional: Add validation for coordinate types if necessary.
    if (coords.length !== 2 || isNaN(coords[0]) || isNaN(coords[1])) {
        console.error(`Error: Invalid coordinate format in line: ${lineContent}`);
        // Return a sentinel or throw an error, depending on error handling strategy.
        return [NaN, NaN];
    }
    return coords;
  });

  // Step 4: Calculate and count the frequency of displacement vectors between all distinct ordered pairs of points.
  // A Map is used for efficient storage and retrieval of vector frequencies.
  const displacementVectorFrequencies = new Map();

  // Iterate through each point as a starting point.
  for (let originIndex = 0; originIndex < geometricPoints.length; originIndex++) {
    const currentOriginPoint = geometricPoints[originIndex];

    // Iterate through each point as an ending point.
    for (let targetIndex = 0; targetIndex < geometricPoints.length; targetIndex++) {
      const currentTargetPoint = geometricPoints[targetIndex];

      // Skip calculation if the points are the same (a point cannot displace itself).
      if (originIndex === targetIndex) {
        continue;
      }

      // Calculate the displacement vector components (delta_x, delta_y).
      const deltaX = currentTargetPoint[0] - currentOriginPoint[0];
      const deltaY = currentTargetPoint[1] - currentOriginPoint[1];

      // Create a unique string identifier for the vector.
      // Using a pipe '|' separator to avoid ambiguity with negative numbers (e.g., "1_1" vs "1_-_1").
      const vectorIdentifier = `${deltaX}|${deltaY}`;

      // Increment the count for this specific vector.
      // If the vector hasn't been seen before, initialize its count to 1.
      displacementVectorFrequencies.set(vectorIdentifier, (displacementVectorFrequencies.get(vectorIdentifier) || 0) + 1);
    }
  }

  // Step 5: Determine the maximum observed frequency among all displacement vectors.
  // Initialize the maximum frequency to 1, as per the original problem's reduction logic
  // (which ensured a minimum value of 1 for the 'res[0]' component).
  let maximumDisplacementFrequency = 1;

  // Iterate over all stored frequencies to find the highest one.
  if (displacementVectorFrequencies.size > 0) {
    for (const freqValue of displacementVectorFrequencies.values()) {
      if (freqValue > maximumDisplacementFrequency) {
        maximumDisplacementFrequency = freqValue;
      }
    }
  }

  // Step 6: Compute and output the final result.
  // The problem's solution is derived by subtracting the maximum frequency from the total point count.
  const finalCalculatedOutcome = totalPointCount - maximumDisplacementFrequency;
  console.log(finalCalculatedOutcome);
}

// Standard boilerplate for competitive programming in Node.js
// This part ensures that the function is called with input from standard input.
// Do not modify the following lines for submission.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
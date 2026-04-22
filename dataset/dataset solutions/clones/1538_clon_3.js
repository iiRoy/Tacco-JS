// A utility function to safely parse a string into an array of two numbers.
// This helps to abstract the parsing logic and make it reusable.
const parseNumericPair = (inputLine) => {
  // Remove any leading/trailing whitespace and split the string by space.
  // Then, convert each resulting string segment to a floating-point number.
  const numericComponents = inputLine.trim().split(" ").map(segment => parseFloat(segment));

  // Basic validation: ensure we have exactly two valid numbers.
  if (numericComponents.length !== 2 || isNaN(numericComponents[0]) || isNaN(numericComponents[1])) {
    console.warn(`Warning: Malformed coordinate data encountered: "${inputLine}". Defaulting to [0, 0].`);
    return [0, 0]; // Provide a default or throw an error based on strictness.
  }
  return numericComponents;
};

// A dedicated function to compute the Manhattan (L1) distance between two points.
// This improves readability and modularity of the core distance calculation.
const calculateManhattanDistance = (pointAlpha, pointBeta) => {
  // Extract individual coordinate values for clarity.
  const xCoordinateAlpha = pointAlpha[0];
  const yCoordinateAlpha = pointAlpha[1];
  const xCoordinateBeta = pointBeta[0];
  const yCoordinateBeta = pointBeta[1];

  // The Manhattan distance is the sum of the absolute differences of their coordinates.
  const deltaX = Math.abs(xCoordinateAlpha - xCoordinateBeta);
  const deltaY = Math.abs(yCoordinateAlpha - yCoordinateBeta);

  return deltaX + deltaY;
};

/**
 * Analyzes a given set of coordinates to determine the maximum Manhattan distance
 * between any two distinct points.
 *
 * @param {string} rawInputText - The complete input data as a single string,
 *                                 where the first line specifies the number of points,
 *                                 and subsequent lines contain point coordinates.
 * @returns {number} The largest Manhattan distance found, or 0 if fewer than two points are provided.
 */
const analyzeCoordinateSeparation = (rawInputText) => {
  // Split the input string into an array of lines, filtering out any empty lines
  // to ensure robust parsing.
  const processedLines = rawInputText.split(/\r?\n/).filter(line => line.trim() !== '');

  // The first line contains the total number of points to be processed.
  // Use parseInt with radix 10 for explicit base conversion.
  const numPointsToProcess = parseInt(processedLines[0], 10);

  // Input validation: Check if the number of points is valid.
  if (isNaN(numPointsToProcess) || numPointsToProcess < 0) {
    console.error("Error: The specified number of points is invalid or missing.");
    return 0; // No meaningful calculation can proceed.
  }

  // If there are fewer than two points, no unique pairs can be formed,
  // so the maximum distance is trivially zero. This is a guard clause.
  if (numPointsToProcess < 2) {
    return 0;
  }

  // An array to store all the parsed coordinate pairs.
  // This will be 0-indexed, which is standard in JavaScript.
  const parsedCoordinates = [];

  // Iterate from the second line (index 1) to parse each point's coordinates.
  // The loop runs `numPointsToProcess` times to collect all points.
  for (let lineIndex = 1; lineIndex <= numPointsToProcess; lineIndex++) {
    const currentLineData = processedLines[lineIndex];
    if (currentLineData) { // Ensure the line actually exists before trying to parse
      const pointData = parseNumericPair(currentLineData);
      parsedCoordinates.push(pointData);
    } else {
      // Log a warning if expected data is missing, indicating potential input issues.
      console.warn(`Missing coordinate data for point at line ${lineIndex + 1}. Skipping.`);
      // Depending on requirements, could throw an error or handle differently.
    }
  }

  // Initialize the variable that will hold the greatest distance found so far.
  let maxSeparationValue = 0;

  // Utilize nested loops to examine every unique pair of points.
  // The outer loop iterates through each point as the 'first' point of a pair.
  for (let outerIdx = 0; outerIdx < numPointsToProcess - 1; outerIdx++) {
    const point1 = parsedCoordinates[outerIdx];

    // The inner loop iterates through points that come *after* the current outerIdx point,
    // ensuring that each pair is considered only once (e.g., (A,B) but not (B,A)).
    for (let innerIdx = outerIdx + 1; innerIdx < numPointsToProcess; innerIdx++) {
      const point2 = parsedCoordinates[innerIdx];

      // Calculate the Manhattan distance for the current pair.
      const currentManhattanDist = calculateManhattanDistance(point1, point2);

      // Update the maximum separation value if the current distance is greater.
      // Using Math.max is a concise way to achieve this.
      maxSeparationValue = Math.max(maxSeparationValue, currentManhattanDist);
    }
  }

  // After checking all pairs, return the highest distance recorded.
  return maxSeparationValue;
};

// This is the primary execution block for the script.
// It handles reading input from stdin and outputting the result.
const programExecutionWrapper = () => {
  try {
    // Read the entire content of the standard input file as a UTF-8 string.
    const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Execute the main analysis function with the file content.
    const finalCalculatedResult = analyzeCoordinateSeparation(fileContents);

    // Print the final result to standard output.
    console.log(finalCalculatedResult);
  } catch (executionError) {
    // Catch and log any errors that occur during file reading or analysis.
    console.error("An error prevented successful program execution:", executionError.message);
    // Exit with a non-zero status code to indicate an error.
    process.exit(1);
  }
};

// Invoke the program wrapper to start execution.
programExecutionWrapper();
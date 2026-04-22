const fileSystemOperations = require('fs'); // Renamed module import for clarity

/**
 * Parses a string value into an integer, providing robust handling for invalid inputs.
 * It ensures the parsed number is an integer and non-negative.
 * @param {string} inputValue - The string to parse.
 * @param {number} defaultValue - The default value to return if parsing fails or is invalid.
 * @returns {number} The parsed integer or the default value.
 */
const safelyParsePositiveInteger = (inputValue, defaultValue = 0) => {
  const numericValue = Number(inputValue); // Attempt to convert string to number
  // Check if it's a valid integer and greater than zero
  if (Number.isInteger(numericValue) && numericValue > 0) {
    return numericValue;
  }
  // Log a warning for debugging or informational purposes if parsing fails
  // In a production system, this might throw an error or handle more gracefully.
  console.error(`Input parsing issue: '${inputValue}' is not a valid positive integer. Using default: ${defaultValue}.`);
  return defaultValue;
};

// --- Input Acquisition and Initial Data Processing ---

// Read the entire content from the standard input stream synchronously.
// Using process.stdin.fd is a specific Node.js way to refer to stdin's file descriptor.
const rawDataBuffer = fileSystemOperations.readFileSync(process.stdin.fd, 'utf8');

// Split the raw buffer into individual line entries,
// then trim whitespace from each line, and finally filter out any entirely empty lines.
const processedInputLineSegments = rawDataBuffer
  .split('\n')
  .map(individualLine => individualLine.trim())
  .filter(nonEmptyLine => nonEmptyLine.length > 0);

// Verify that we actually received some input lines.
if (processedInputLineSegments.length === 0) {
  console.error("Critical Error: No valid input lines were provided. Exiting program.");
  process.exit(1); // Terminate with an error code
}

// The very first line of input represents the total count of elements, often denoted as 'N'.
const totalElementsCountString = processedInputLineSegments.shift(); // Remove and get the first line
const maximumNodeIndex = safelyParsePositiveInteger(totalElementsCountString, 0);

// Basic validation for the 'N' value. It must be a positive integer.
if (maximumNodeIndex === 0) {
  console.error("Critical Error: The initial count of elements (N) must be a positive integer. Exiting.");
  process.exit(1);
}

// --- Calculation of Initial Base Combinations ---

// This problem likely involves counting combinations or paths.
// The initial value is derived from the formula for the sum of triangular numbers up to N,
// which is equivalent to C(N+2, 3), or N * (N+1) * (N+2) / 6.
// This represents the total number of valid triplets (i, j, k) where 1 <= i <= j <= k <= maximumNodeIndex
// if no constraints (edges) were present.
let cumulativeCombinationResult = 0;

// Break down the formula into distinct, named components for improved readability.
const firstFactor = maximumNodeIndex;
const secondFactor = maximumNodeIndex + 1;
const thirdFactor = maximumNodeIndex + 2;

// Execute the initial combination calculation.
cumulativeCombinationResult = (firstFactor * secondFactor * thirdFactor) / 6;

/**
 * Calculates the number of combinations that are "invalidated" or "removed" by a specific edge.
 * An edge (start, end) invalidates combinations (x, y) where x <= start and y >= end.
 * This function handles the core subtraction logic.
 * @param {number} startPoint - The smaller node index of the edge.
 * @param {number} endPoint - The larger node index of the edge.
 * @param {number} overallMaxIndex - The total number of elements (N).
 * @returns {number} The quantity to subtract from the total combinations.
 */
const determineInvalidatedCombinations = (startPoint, endPoint, overallMaxIndex) => {
  // Defensive checks for logically impossible or invalid edge configurations.
  if (startPoint <= 0 || endPoint > overallMaxIndex || startPoint >= endPoint) {
    // Such edges should ideally be filtered out earlier or indicate a data issue.
    // Returning 0 ensures they don't incorrectly alter the result.
    return 0;
  }

  // The number of choices for the 'left' part of a combination is simply the startPoint itself.
  const choicesForLeftSegment = startPoint;
  // The number of choices for the 'right' part of a combination is from endPoint up to overallMaxIndex.
  const choicesForRightSegment = overallMaxIndex - endPoint + 1;

  // The product gives the total number of (left, right) pairs that this specific edge makes invalid.
  return choicesForLeftSegment * choicesForRightSegment;
};

// --- Iterative Edge Processing and Result Adjustment ---

// Loop through each remaining line, which represents an 'edge' or connection constraint.
for (const currentEdgeDescription of processedInputLineSegments) {
  // Additional check within the loop to skip any remnants of empty lines, though filtered before.
  if (currentEdgeDescription.length === 0) {
    continue;
  }

  // Split the edge string into its two constituent node identifiers.
  const nodeIdentifiersAsStrings = currentEdgeDescription.split(' ');

  // Validate the format of the edge description. It should contain exactly two numbers.
  if (nodeIdentifiersAsStrings.length !== 2) {
    console.warn(`Skipping malformed edge entry: '${currentEdgeDescription}'. Expected two space-separated numbers.`);
    continue;
  }

  // Parse the two node identifiers, using the safe parsing function.
  const rawNodeA = safelyParsePositiveInteger(nodeIdentifiersAsStrings[0], -1); // Use -1 to indicate failure
  const rawNodeB = safelyParsePositiveInteger(nodeIdentifiersAsStrings[1], -1);

  // Validate that both nodes were parsed successfully and are within the allowed range [1, maximumNodeIndex].
  if (rawNodeA === -1 || rawNodeB === -1 ||
      rawNodeA > maximumNodeIndex || rawNodeB > maximumNodeIndex) {
    console.warn(`Skipping edge [${nodeIdentifiersAsStrings[0]}, ${nodeIdentifiersAsStrings[1]}] due to invalid or out-of-bounds node values for N=${maximumNodeIndex}.`);
    continue;
  }

  // Normalize the edge: ensure 'startNode' is always less than 'endNode'.
  // This simplifies the logic for calculating invalidated combinations.
  const normalizedStartNode = Math.min(rawNodeA, rawNodeB);
  const normalizedEndNode = Math.max(rawNodeA, rawNodeB);

  // An edge from a node to itself (self-loop) or where start >= end is usually not relevant
  // for this type of path/combination counting problem.
  if (normalizedStartNode === normalizedEndNode) {
    console.warn(`Skipping trivial edge [${rawNodeA}, ${rawNodeB}]. Nodes must be distinct for a valid constraint.`);
    continue;
  }

  // Calculate the specific amount to reduce the total combinations by, based on this edge.
  const reductionDueToEdge = determineInvalidatedCombinations(
    normalizedStartNode,
    normalizedEndNode,
    maximumNodeIndex
  );

  // Subtract the calculated reduction from the running total.
  cumulativeCombinationResult -= reductionDueToEdge;
}

// --- Final Output ---

// Print the final computed count of valid combinations to the standard output.
console.log(cumulativeCombinationResult);
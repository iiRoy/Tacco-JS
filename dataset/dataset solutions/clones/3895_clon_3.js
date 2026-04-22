// Function to analyze potential movement costs based on marked points.
const analyzeMovementCosts = (inputPayload) => {
  // Trim leading/trailing whitespace and split the input string into individual lines.
  const processedLines = inputPayload.trim().split('\n');

  // Helper function to convert an array of string numbers into an array of actual numbers.
  const parseNumericStringArray = (strArray) => strArray.map(Number);

  // Extract relevant parameters from the first line of input.
  // The first line contains the maximum boundary value and the initial position.
  // The 'M' value (representing the count of significant points) is present in the input
  // but is not directly utilized in this specific calculation logic, hence it's skipped during destructuring.
  const [maxBoundaryVal, , initialPosition] = parseNumericStringArray(processedLines[0].split(' '));

  // Extract the significant points from the second line and convert them into a Set.
  // Using a Set provides efficient average O(1) lookup time, which is more performant
  // than the O(N) average time complexity of `Array.prototype.includes()` for repeated checks.
  const significantPointsSet = new Set(parseNumericStringArray(processedLines[1].split(' ')));

  // Initialize a counter to track the cost when moving towards lower indices (leftward movement).
  let costToDecrement = 0;

  // Iterate from the position immediately preceding the initial position down to 1 (inclusive).
  // Each significant point encountered during this traversal contributes to the cost.
  for (let currentTraversalPoint = initialPosition - 1; currentTraversalPoint >= 1; --currentTraversalPoint) {
    // Check if the current point in the traversal path is present in our set of significant points.
    if (significantPointsSet.has(currentTraversalPoint)) {
      costToDecrement++; // Increment the cost if a significant point is located.
    }
  }

  // Initialize a counter to track the cost when moving towards higher indices (rightward movement).
  let costToIncrement = 0;

  // Iterate from the initial position up to, but not including, the maximum boundary value.
  // Similar to the leftward traversal, each significant point encountered here increases the cost.
  for (let currentTraversalPoint = initialPosition; currentTraversalPoint < maxBoundaryVal; ++currentTraversalPoint) {
    // Check if the current point in the traversal path is present in our set of significant points.
    if (significantPointsSet.has(currentTraversalPoint)) {
      costToIncrement++; // Increment the cost if a significant point is located.
    }
  }

  // Calculate the minimal cost required, choosing between the cost of decrementing or incrementing movements.
  const minimalMovementCost = Math.min(costToDecrement, costToIncrement);

  // Output the final calculated minimum cost to the standard console.
  console.log(minimalMovementCost);
};

// Main execution block: This part of the script reads the input from the standard input stream,
// typically a file or piped data in a Unix-like environment, and then invokes the
// analysis function with the obtained data.
analyzeMovementCosts(require("fs").readFileSync("/dev/stdin", "utf8"));
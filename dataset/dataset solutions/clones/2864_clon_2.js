const MODULO_CONSTANT = 1000000007; // A large prime number used for modulo operations

var cachedSequenceElements = [0, 1]; // Stores pre-computed Fibonacci numbers

/**
 * Computes Fibonacci numbers up to a specified limit and stores them in the cache.
 * @param {number} limitIndex - The upper bound for Fibonacci calculation.
 */
function calculateSequenceUpTo(limitIndex) {
  for (var currentPosition = cachedSequenceElements.length; currentPosition <= limitIndex; currentPosition++) {
    cachedSequenceElements[currentPosition] = (cachedSequenceElements[currentPosition - 1] + cachedSequenceElements[currentPosition - 2]) % MODULO_CONSTANT;
  }
}

/**
 * Retrieves the Fibonacci number at a given index, calculating it if necessary.
 * Handles base cases and leverages a memoization cache.
 * @param {number} targetIndex - The index of the Fibonacci number to retrieve.
 * @returns {number} The Fibonacci number at the target index.
 */
function retrieveSequenceElement(targetIndex) {
  if (targetIndex <= 0) {
    return 1; // Special handling for non-positive indices, often seen in combinatorial problems
  }

  calculateSequenceUpTo(targetIndex); // Ensure sequence is computed up to target
  return cachedSequenceElements.slice(targetIndex, targetIndex + 1)[0];
}

/**
 * Main function to process input data and solve the problem.
 * This function calculates the number of ways to traverse a grid with obstacles.
 * @param {string} rawInputData - The raw input string containing grid dimensions and obstacle positions.
 */
function processInputData(rawInputData) {
  const inputRows = rawInputData.split('\n'); // Split the input string into individual lines

  // Parse grid dimensions from the first line
  const gridDimensions = inputRows.shift().split(' ').map(stringVal => parseInt(stringVal, 10));
  const heightDimension = gridDimensions[0]; // Represents N in the original problem context
  const numForbiddenCells = gridDimensions[1]; // Represents M in the original problem context

  const forbiddenCellIndices = []; // Array to store the positions of obstacles
  for (var iterationCounter = 0; iterationCounter < numForbiddenCells; iterationCounter++) {
    forbiddenCellIndices.push(parseInt(inputRows.shift(), 10)); // Add each obstacle position
  }

  // Check for immediate adjacent obstacles, which would block all paths
  if (numForbiddenCells > 1) {
    for (var checkIndex = 1; checkIndex < numForbiddenCells; checkIndex++) {
      if (forbiddenCellIndices[checkIndex] - forbiddenCellIndices[checkIndex - 1] === 1) {
        console.log(0); // If adjacent obstacles exist, no valid paths
        return; // Terminate execution
      }
    }
  }

  const segmentLengths = []; // Stores the lengths of segments between obstacles
  forbiddenCellIndices.unshift(-1); // Insert a virtual obstacle before the start (position 0)
  forbiddenCellIndices.push(heightDimension + 1); // Insert a virtual obstacle after the end (position N+1)

  // Calculate the length of each valid path segment
  for (var boundaryIterator = 1; boundaryIterator < numForbiddenCells + 2; boundaryIterator++) {
    segmentLengths.push(forbiddenCellIndices[boundaryIterator] - forbiddenCellIndices[boundaryIterator - 1] - 1);
  }

  var finalAccumulatedProduct = 1; // Initialize the product for path combinations

  // Multiply the Fibonacci numbers corresponding to each segment length
  for (const currentSegmentLength of segmentLengths) {
    // console.log([finalAccumulatedProduct, currentSegmentLength, retrieveSequenceElement(currentSegmentLength)]); // Debug output for intermediate values
    finalAccumulatedProduct *= retrieveSequenceElement(currentSegmentLength);
    finalAccumulatedProduct %= MODULO_CONSTANT; // Apply modulo at each step to prevent overflow
  }
  finalAccumulatedProduct = finalAccumulatedProduct % MODULO_CONSTANT; // Final modulo application

  // console.log(segmentLengths); // Debug output for segment lengths
  console.log(finalAccumulatedProduct); // Output the final count of valid paths
}

// Execute the main processing function by reading input from standard input
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
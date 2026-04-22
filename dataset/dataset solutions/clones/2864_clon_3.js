const PRIME_MODULO = 1000000007;

let memoizedFibSequence = [0, 1];

/**
 * Computes Fibonacci numbers up to a specified index and stores them in the cache.
 * This function ensures that `memoizedFibSequence` contains all necessary Fibonacci terms
 * up to `upperBoundIndex`.
 * @param {number} upperBoundIndex The maximum index for which Fibonacci numbers should be calculated.
 */
function computeFibonacciTerms(upperBoundIndex) {
  // A non-negative index is expected for Fibonacci sequence calculations in this context.
  if (upperBoundIndex < 0) {
    return;
  }

  // Start calculating from the current end of the cached sequence.
  const currentCachedSize = memoizedFibSequence.length;
  for (let currentIndex = currentCachedSize; currentIndex <= upperBoundIndex; currentIndex++) {
    // Retrieve the two preceding Fibonacci terms from the cache.
    const precedingTermOne = memoizedFibSequence[currentIndex - 1];
    const precedingTermTwo = memoizedFibSequence[currentIndex - 2];

    // Calculate the sum and apply the modulo operation to keep numbers within bounds.
    const calculatedSum = precedingTermOne + precedingTermTwo;
    memoizedFibSequence[currentIndex] = calculatedSum % PRIME_MODULO;
  }
}

/**
 * Retrieves a specific Fibonacci number from the memoized cache. If the number
 * is not yet calculated, it triggers `computeFibonacciTerms` to extend the cache.
 * Note: For this problem's specific interpretation, `fib(0)` or `fib(negative)` is 1.
 * @param {number} requestedIndex The index of the Fibonacci number to retrieve.
 * @returns {number} The Fibonacci number at the `requestedIndex`, modulo `PRIME_MODULO`.
 */
function retrieveFibonacciValue(requestedIndex) {
  // According to the problem's logic, a segment of length 0 or less contributes 1 way.
  // This deviates from standard fib(0)=0.
  if (requestedIndex <= 0) {
    return 1;
  }

  // Ensure the cache is populated up to the required index.
  if (requestedIndex >= memoizedFibSequence.length) {
    computeFibonacciTerms(requestedIndex);
  }

  // Return the pre-calculated value from the cache.
  return memoizedFibSequence[requestedIndex];
}

/**
 * Main function responsible for parsing input, identifying obstacle-free segments,
 * and calculating the total number of unique paths.
 * @param {string} rawInput The complete input string from stdin.
 */
function solveProblem(rawInput) {
  // Process the raw input by splitting it into an array of lines.
  const inputLines = rawInput.split(/\r?\n/);

  // The first line contains global parameters: N (path length) and M (number of obstacles).
  const globalParameters = inputLines.shift().split(' ').map(valueStr => Number(valueStr));
  const totalPathLength = globalParameters[0];
  const numberOfObstacles = globalParameters[1];

  // Collect all obstacle positions from the subsequent lines.
  const obstaclePositions = [];
  for (let obstacleCounter = 0; obstacleCounter < numberOfObstacles; obstacleCounter++) {
    const currentPosition = Number(inputLines.shift());
    obstaclePositions.push(currentPosition);
  }

  // Check for immediate adjacent obstacles which would block any path.
  // Sorting is added for robustness, assuming input might not always be strictly sorted.
  if (numberOfObstacles > 1) {
    obstaclePositions.sort((posA, posB) => posA - posB); // Ensure sorted order for adjacency check.
    for (let currentObstacleIdx = 1; currentObstacleIdx < numberOfObstacles; currentObstacleIdx++) {
      if (obstaclePositions[currentObstacleIdx] - obstaclePositions[currentObstacleIdx - 1] === 1) {
        console.log(0); // Output 0 if a path is impossible.
        return; // Terminate execution early.
      }
    }
  }

  // Augment the obstacle list with virtual boundary points:
  // -1 represents the point before the actual start of the path (index 0).
  // totalPathLength + 1 represents the point after the actual end of the path (index totalPathLength).
  const boundaryAugmentedObstacles = [-1, ...obstaclePositions, totalPathLength + 1];

  // Calculate the lengths of the free segments between obstacles and boundaries.
  const freeSegmentLengths = [];
  for (let segmentIterator = 1; segmentIterator < boundaryAugmentedObstacles.length; segmentIterator++) {
    const currentObstacleBoundary = boundaryAugmentedObstacles[segmentIterator];
    const previousObstacleBoundary = boundaryAugmentedObstacles[segmentIterator - 1];
    // The length of a free segment is (current_boundary - previous_boundary - 1).
    // For example, if obstacles are at 2 and 5, the gap is (5 - 2 - 1) = 2 (positions 3, 4 are free).
    const segmentLength = currentObstacleBoundary - previousObstacleBoundary - 1;
    freeSegmentLengths.push(segmentLength);
  }

  // Initialize the result accumulator for the product of ways for each segment.
  let cumulativeWaysProduct = 1;

  // Iterate through each free segment and multiply the ways to traverse it.
  for (const lengthOfCurrentSegment of freeSegmentLengths) {
    const waysForThisSegment = retrieveFibonacciValue(lengthOfCurrentSegment);
    cumulativeWaysProduct = (cumulativeWaysProduct * waysForThisSegment) % PRIME_MODULO;
  }

  // Output the final calculated number of ways.
  console.log(cumulativeWaysProduct);
}

// Execute the main solver function by reading input from standard input.
solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
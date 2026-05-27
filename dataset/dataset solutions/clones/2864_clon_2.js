const modulusValue = 1000000007;

var memoizedFibs = [0, 1];

function calculateFibonacci(termIndex) {
  // Compute Fibonacci numbers up to termIndex and store them
  for (var idx = memoizedFibs.length; idx <= termIndex; idx++) {
    memoizedFibs[idx] = (memoizedFibs[idx - 1] + memoizedFibs[idx - 2]) % modulusValue;
  }
}

function getFibonacciTerm(termIndex) {
  // Return 1 for non-positive indices as per problem logic
  if (termIndex <= 0) {
    return 1;
  }
  // Ensure the Fibonacci sequence is computed up to termIndex
  calculateFibonacci(termIndex);
  // Retrieve the specific Fibonacci term
  return memoizedFibs.slice(termIndex, termIndex + 1)[0];
}

function processInput(rawData) {
  // Split the raw input into individual lines
  const inputLines = rawData.split('\n');

  // Parse the first line for N and M
  const dimensions = inputLines.shift().split(' ').map(val => parseInt(val, 10));
  const gridSize = dimensions[0];
  const obstacleCount = dimensions[1];

  // Read obstacle positions
  const obstaclePositions = [];
  for (var loopCounter = 0; loopCounter < obstacleCount; loopCounter++) {
    obstaclePositions.push(parseInt(inputLines.shift(), 10));
  }

  // Check for adjacent obstacles, which makes the path impossible
  if (obstacleCount > 1) {
    for (var loopCounter = 1; loopCounter < obstacleCount; loopCounter++) {
      if (obstaclePositions[loopCounter] - obstaclePositions[loopCounter - 1] === 1) {
        console.log(0); // Output 0 if adjacent obstacles exist
        return;
      }
    }
  }

  // Prepare array for segment lengths
  const segmentLengths = [];
  // Add virtual start and end points to simplify segment calculation
  obstaclePositions.unshift(-1);
  obstaclePositions.push(gridSize + 1);

  // Calculate lengths of segments between obstacles
  for (var loopCounter = 1; loopCounter < obstacleCount + 2; loopCounter++) {
    segmentLengths.push(obstaclePositions[loopCounter] - obstaclePositions[loopCounter - 1] - 1);
  }

  // Initialize product for final calculation
  var finalProduct = 1;

  // Multiply Fibonacci terms for each segment length
  for (let currentLength of segmentLengths) {
    finalProduct *= getFibonacciTerm(currentLength);
    finalProduct %= modulusValue; // Apply modulo at each step
  }

  // Ensure final result is within modulo
  finalProduct = finalProduct % modulusValue;

  // Output the computed result
  console.log(finalProduct);
}

// Read input from standard input and pass to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

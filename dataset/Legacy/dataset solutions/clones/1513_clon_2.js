const processInput = (rawData) => {
  // Define a large prime number for modulo operations, using BigInt
  const primeModulo = 998244353n;

  // Split the input string into lines, trimming any leading/trailing whitespace
  // The first line contains N, subsequent lines contain query ranges
  const [firstLineData, ...queryRanges] = rawData.trim().split('\n');

  // Parse the target value N from the first line
  // The second element of the split array is ignored as per original logic
  const [targetValue,] = firstLineData.split(' ').map(Number);

  // Initialize an object to store unique numbers covered by the query ranges
  // This effectively acts as a frequency map or a set
  const uniqueStepsMap = {};

  // Iterate through each query range provided in the input
  for (let idx = 0; idx < queryRanges.length; idx++) {
    // Parse the start and end of the current range
    const [rangeStart, rangeEnd] = queryRanges[idx].split(' ').map(Number);

    // For each number within the current range [rangeStart, rangeEnd],
    // mark its presence in the uniqueStepsMap
    for (let currentNum = rangeStart; currentNum <= rangeEnd; currentNum++) {
      // Incrementing a non-existent property initializes it to 0 then increments to 1
      uniqueStepsMap[currentNum]++;
    }
  }

  // Convert the keys (unique numbers) from the map into an array,
  // then sort them numerically in ascending order
  const sortedSteps = Array.from(Object.keys(uniqueStepsMap)).sort((valA, valB) => valA - valB);

  // Initialize a dynamic programming table (array) of size targetValue + 1
  // All elements are initialized to 0n (BigInt zero)
  const dpTable = new Array(targetValue + 1).fill(0n);

  // Set the base case for the DP: there is 1 way to reach position 1
  dpTable[1] = 1n;

  // Iterate from position 1 up to (but not including) targetValue
  // This loop calculates the number of ways to reach each position
  for (let currentIdx = 1; currentIdx < targetValue; currentIdx++) {
    // If the current position is unreachable (0 ways), skip to the next position
    if (dpTable[currentIdx] === 0n) {
      continue;
    }

    // Iterate through each possible step size from our sorted list of unique steps
    for (let stepIdx = 0; stepIdx < sortedSteps.length; stepIdx++) {
      // Convert the step size from string (Object.keys result) to a Number
      const stepSize = Number(sortedSteps[stepIdx]);

      // Calculate the next position after taking this step
      const nextPosition = currentIdx + stepSize;

      // If the next position is within the bounds of our DP table
      // (i.e., dpTable[nextPosition] is not undefined)
      if (dpTable[nextPosition] !== undefined) {
        // Add the number of ways to reach the current position to the next position
        dpTable[nextPosition] += dpTable[currentIdx];
      } else {
        // If nextPosition is out of bounds, then all subsequent step sizes
        // will also be out of bounds (since sortedSteps is sorted).
        // So, we can break out of this inner loop.
        break;
      }
    }
  }

  // Calculate the final result: the number of ways to reach targetValue,
  // applying the modulo operation to keep the number within bounds.
  // The `(val % mod + mod) % mod` pattern handles potential negative results from modulo.
  const finalResult = (dpTable[targetValue] % primeModulo + primeModulo) % primeModulo;

  // Output the final result to the console
  return console.log(`${finalResult}`);
};

// Conditional execution based on the 'MYTEST' environment variable.
// This part handles input reading for testing or standard execution.
process.env.MYTEST
  ? (process.env.MYTEST === 'test' ? test() : processInput(require('fs').readFileSync('dev/stdin', 'utf8')))
  : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

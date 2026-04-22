const computeSolution = (rawData) => {
  // Define a large prime number for modulo operations
  const primeDivisor = 998244353n;

  // Process input: split into lines, first line for 'n', rest for queries
  const [firstLineData, ...queryRanges] = rawData.trim().split('\n');

  // Extract the total number of elements 'n' from the first line
  const [totalElements,] = firstLineData.split(' ').map(Number);

  // Initialize an object to store counts of numbers within query ranges
  const occurrenceCounts = {};

  // Iterate through each query range
  for (let idx = 0; idx < queryRanges.length; idx++) {
    // Parse start and end points of the current range
    const [startPoint, endPoint] = queryRanges[idx].split(' ').map(Number);

    // Increment count for each number within the range [startPoint, endPoint]
    for (let currentVal = startPoint; currentVal <= endPoint; currentVal++) {
      // Ensure the property exists before incrementing
      if (occurrenceCounts[currentVal] === undefined) {
        occurrenceCounts[currentVal] = 0;
      }
      occurrenceCounts[currentVal]++;
    }
  }

  // Convert the keys (numbers with occurrences) to an array and sort them numerically
  const uniqueSteps = Array.from(Object.keys(occurrenceCounts)).sort((valA, valB) => valA - valB);

  // Initialize a dynamic programming table with BigInts
  // dpTable[k] will store the number of ways to reach k
  const dpTable = new Array(totalElements + 1).fill(0n);

  // Base case: there is one way to reach position 1 (starting point)
  dpTable[1] = 1n;

  // Iterate through the DP table from position 1 up to (but not including) totalElements
  for (let currentIdx = 1; currentIdx < totalElements; currentIdx++) {
    // If the current position is unreachable, skip it
    if (dpTable[currentIdx] === 0n) {
      continue;
    }

    // For each unique step value, try to move from the current position
    for (let stepIdx = 0; stepIdx < uniqueSteps.length; stepIdx++) {
      const stepValue = Number(uniqueSteps[stepIdx]); // Convert step to Number

      // Calculate the next position
      const nextPosition = currentIdx + stepValue;

      // If the next position is within bounds of the DP table
      if (nextPosition <= totalElements) {
        // Add the ways to reach currentIdx to the ways to reach nextPosition
        dpTable[nextPosition] = (dpTable[nextPosition] + dpTable[currentIdx]);
      } else {
        // Since uniqueSteps is sorted, if nextPosition is out of bounds,
        // all subsequent steps will also be out of bounds.
        break;
      }
    }
  }

  // Calculate the final result modulo primeDivisor
  // The `( + primeDivisor) % primeDivisor` part handles potential negative results from modulo in some languages,
  // though BigInt modulo in JS generally behaves as expected for positive numbers.
  const finalResult = (dpTable[totalElements] % primeDivisor + primeDivisor) % primeDivisor;

  // Output the result
  return console.log(`${finalResult}`);
};

// Conditional execution based on environment variables
// This block determines whether to run tests or process actual input
process.env.EXECUTION_MODE
  ? (process.env.EXECUTION_MODE === 'test'
      ? (() => { /* Placeholder for testing logic */ })()
      : computeSolution(require('node:fs').readFileSync('dev/input.txt', 'utf8'))
    )
  : computeSolution(require('node:fs').readFileSync('/app/input.txt', 'utf8'));
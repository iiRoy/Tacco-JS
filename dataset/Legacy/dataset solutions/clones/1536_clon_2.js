const calculateCombinations = (inputString) => {
  // Define a large prime number for modulo operations to prevent integer overflow.
  const primeModulo = (10**9 + 7);

  // Parse the input string to get the target sum, ensuring it's a number.
  // The .trim() method removes leading/trailing whitespace from the input.
  const targetValue = Number(inputString.trim());

  // Initialize a dynamic programming array to store combination counts.
  // `combinationCounts[k]` will hold the number of ways to form sum `k`.
  // The array starts with `1` (representing one way to form sum 0, i.e., by choosing no numbers).
  // The rest of the array is filled with zeros up to the `targetValue`.
  const combinationCounts = [1, ...new Array(targetValue).fill(0)];

  // Iterate from 3 up to the `targetValue` (inclusive).
  // We start from 3 because the problem implies using numbers greater than or equal to 3.
  for (let currentValue = 3; currentValue < combinationCounts.length; currentValue++) {
    let tempSum = 0; // Temporary variable to accumulate sums for the current `currentValue`.

    // Inner loop: Calculate `combinationCounts[currentValue]` by summing up
    // previous `combinationCounts` values.
    // This recurrence relation is for forming `currentValue` using numbers >= 3.
    // If we add a '3' to a previous sum `previousValue`, then `currentValue` = `previousValue` + 3.
    // So we sum up all `combinationCounts[previousValue]` where `previousValue` ranges from
    // `currentValue - 3` down to `0`.
    for (let previousValue = currentValue - 3; previousValue >= 0; previousValue--) {
      tempSum = (tempSum + combinationCounts[previousValue]) % primeModulo;
    }

    // Store the calculated sum (modulo `primeModulo`) in the DP array.
    combinationCounts[currentValue] = tempSum;
  }

  // Output the final result for the `targetValue`.
  // The additional modulo operations `( + primeModulo) % primeModulo` ensure the result is
  // always positive, which is good practice even if JavaScript's `%` operator handles
  // positive dividends correctly.
  return console.log((combinationCounts[targetValue] % primeModulo + primeModulo) % primeModulo);
};

// Conditional execution block based on an environment variable.
// This allows for different execution paths, e.g., for testing or production environments.
process.env.EXECUTION_MODE
  ? (process.env.EXECUTION_MODE === 'test'
      ? test() // If `EXECUTION_MODE` is 'test', call the (presumably external) `test` function.
      : calculateCombinations(require('fs').readFileSync('dev/stdin', 'utf8')) // Otherwise, read input from 'dev/stdin'.
    )
  : calculateCombinations(require('fs').readFileSync('/dev/stdin', 'utf8')); // Default behavior: read input from '/dev/stdin'.

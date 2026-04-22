// Function to determine the number of ways a target integer can be formed
// by summing numbers, where each number in the sum is at least three.
const calculateCombinations = (sourceDataString) => {
  // Define a large prime number for modulo operations to prevent overflow and
  // ensure results stay within a manageable range for large calculations.
  const moduloConstant = (10 ** 9 + 7);

  // Parse the input string to an integer, ensuring any leading/trailing whitespace is removed.
  // This integer represents the desired total sum for which combinations are sought.
  const rawTargetSum = sourceDataString.trim();
  const desiredSum = parseInt(rawTargetSum, 10);

  // --- Input validation and edge cases ---
  // If the desired sum is non-positive or not a valid number,
  // it indicates invalid input for this problem.
  if (isNaN(desiredSum) || desiredSum < 0) {
    // In a production scenario, one might throw an error or return a specific status.
    // For this context, we'll output an error message to stderr.
    console.error("Invalid input: Target sum must be a non-negative integer.");
    return;
  }

  // Initialize a dynamic programming table (memoization array).
  // 'combinationCounts[i]' will store the number of ways to form sum 'i'.
  // The array size is 'desiredSum + 1' to accommodate indices from 0 up to 'desiredSum'.
  const combinationCounts = new Array(desiredSum + 1).fill(0);

  // Base case: There is exactly one way to form a sum of zero (by choosing no numbers).
  combinationCounts[0] = 1;

  // Define the minimum value an individual number in the sum can take.
  const minComponentValue = 3;

  // Iterate through all possible sums starting from 1 up to the 'desiredSum'.
  // For each 'currentTotal', calculate the number of ways to form it using the DP approach.
  for (let currentTotal = 1; currentTotal <= desiredSum; currentTotal++) {
    // If the 'currentTotal' is less than the 'minComponentValue',
    // it cannot be formed by summing numbers of at least 'minComponentValue'.
    // Its count remains 0, which is the initial value from array.fill(0).
    if (currentTotal < minComponentValue) {
        continue; // Skip calculation; current count is already 0.
    }

    // Special case for the first sum that can be formed using numbers >= minComponentValue.
    // For currentTotal equal to minComponentValue (e.g., 3), the only way is to use minComponentValue itself.
    // This corresponds to combinationCounts[0] in the original recurrence (dp[3] = dp[0]).
    if (currentTotal === minComponentValue) {
      combinationCounts[currentTotal] = combinationCounts[0];
    } else {
      // For currentTotal greater than minComponentValue, apply the optimized recurrence relation.
      // The recurrence dp[x] = sum(dp[j] for j=0 to x-3) can be optimized to:
      // dp[x] = (dp[x - minComponentValue] + dp[x - 1]) % moduloConstant
      // This holds for x >= minComponentValue + 1 (i.e., x >= 4 for minComponentValue = 3).
      
      // Number of ways obtained by adding 'minComponentValue' to a previous sum.
      const waysFromPreviousThree = combinationCounts[currentTotal - minComponentValue];
      // Number of ways obtained by considering all previous sums up to 'currentTotal - 1'.
      // This term effectively encapsulates (dp[x-4] + ... + dp[0]) from the original sum.
      const waysFromPreviousOne = combinationCounts[currentTotal - 1];
      
      // Sum these two components and apply the modulo to keep the number within bounds.
      const totalWaysForCurrentSum = (waysFromPreviousThree + waysFromPreviousOne) % moduloConstant;
      combinationCounts[currentTotal] = totalWaysForCurrentSum;
    }
  }

  // The final result is the number of ways to form the 'desiredSum'.
  // Apply modulo one last time and ensure the result is positive, as JavaScript's % operator
  // can return negative results for negative numbers (though not expected here as all counts are >= 0).
  const finalResult = (combinationCounts[desiredSum] % moduloConstant + moduloConstant) % moduloConstant;

  // Output the computed result to the console.
  console.log(finalResult);
};

// --- Execution Entry Point ---
// This block handles reading input based on the execution environment.
// It checks for a 'MYTEST' environment variable to determine if it's a test run
// or a standard execution, and loads input accordingly.

// Helper function to read input from a specified file path.
const obtainInputFromFile = (filePath) => {
  // Use Node.js 'fs' module to synchronously read the file content.
  const fileSystemModule = require('fs');
  return fileSystemModule.readFileSync(filePath, 'utf8');
};

// Check if a test environment variable is set.
const isTestModeActive = process.env.MYTEST;

if (isTestModeActive) {
  // If 'MYTEST' is set to 'test', it typically implies a specific test scenario.
  // For this clone, we'll assume 'dev/stdin' is the designated input for test cases.
  if (isTestModeActive === 'test') {
    calculateCombinations(obtainInputFromFile('dev/stdin'));
  } else {
    // If MYTEST has a value but is not 'test', it could imply a custom test input path
    // or another specific test setup. We'll default to 'dev/stdin' for simplicity.
    calculateCombinations(obtainInputFromFile('dev/stdin'));
  }
} else {
  // Default execution path: read from the standard input file '/dev/stdin'.
  calculateCombinations(obtainInputFromFile('/dev/stdin'));
}
const processInput = (rawData) => {
  // Clean up the raw input string and split it into lines
  rawData = rawData.trim().split('\n');
  // Extract the array of number strings from the second line
  const numberStrings = rawData[1].split(' ');

  // Initialize a map to store the frequency of each number
  const frequencyMap = {};
  // Populate the frequency map by iterating through the number strings
  for (let idx = 0; idx < numberStrings.length; idx++) {
    // Use bitwise NOT (~~) for a quick conversion to number and default to 0 if undefined
    frequencyMap[numberStrings[idx]] = ~~frequencyMap[numberStrings[idx]] + 1;
  }

  // Create a cache for storing pre-calculated results to avoid redundant computations
  const resultCache = {};

  // Iterate through the original list of number strings to calculate and log results
  for (let idx = 0; idx < numberStrings.length; idx++) {
    // Temporarily decrement the count of the current number in the frequency map
    // This simulates removing one instance of the number for the current calculation
    frequencyMap[numberStrings[idx]] -= 1;

    // Check if the result for the current number (after temporary removal) is already cached
    if (!resultCache[numberStrings[idx]]) {
      let currentSum = 0; // Initialize sum for combinations
      // Iterate over the entries in the modified frequency map
      for (let [, valCount] of Object.entries(frequencyMap)) {
        // If a number appears more than once, calculate combinations of choosing 2
        // and add it to the current sum
        if (valCount > 1) {
          currentSum += calculateCombinations(valCount, 2);
        }
      }
      // Store the calculated sum in the result cache
      resultCache[numberStrings[idx]] = currentSum;
    }
    // Output the cached or newly computed result for the current number
    console.log(resultCache[numberStrings[idx]]);

    // Restore the original count of the current number in the frequency map
    // This undoes the temporary decrement for the next iteration
    frequencyMap[numberStrings[idx]] += 1;
  }
};

// Helper function to compute combinations (n choose k) without memoization
const computeCombinations = (totalItems, itemsToChoose) => {
  let productNumerator = 1; // Stores the product for the numerator part
  // Calculate n * (n-1) * ... * (n-k+1)
  for (let loopCounter = 0; loopCounter < itemsToChoose; loopCounter++) {
    productNumerator *= totalItems;
    totalItems--; // Decrement totalItems for the next multiplication
  }

  let productDenominator = 1; // Stores the product for the denominator part (k!)
  // Calculate k * (k-1) * ... * 1
  while (itemsToChoose > 0) {
    productDenominator *= itemsToChoose;
    itemsToChoose--; // Decrement itemsToChoose for the next multiplication
  }

  // Return the result of nCk
  return productNumerator / productDenominator;
};

// Function to memoize another function's results
const memoizeFunction = (targetFunction) => {
  const memoStorage = {}; // Internal cache for the memoized function
  // Return a new function that wraps the target function with caching logic
  return (arg1, arg2) => {
    // Create a unique key for the cache based on the arguments
    const cacheKey = `${arg1}C${arg2}`;
    // If the result is not in the cache, compute it and store it
    if (!memoStorage[cacheKey]) {
      memoStorage[cacheKey] = targetFunction(arg1, arg2);
    }
    // Return the cached result
    return memoStorage[cacheKey];
  };
};

// Create a memoized version of the combination calculation function
const calculateCombinations = memoizeFunction(computeCombinations);

// Determine whether to run a test or process standard input
// This conditional execution is based on an environment variable
process.env.MYTEST ? test() : processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

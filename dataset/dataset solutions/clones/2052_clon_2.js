const processInputData = (incomingText) => {
  // Process the raw input string by trimming whitespace and splitting into lines.
  const parsedContent = incomingText.trim().split('\n');
  // Extract the second line of content, which contains space-separated number tokens.
  const numberTokens = parsedContent[1].split(' ');

  // Initialize a map to store the frequency of each number token.
  const occurrenceRegistry = {};
  // Iterate through the number tokens to populate the frequency map.
  for (let loopIndex = 0; loopIndex < numberTokens.length; loopIndex++) {
    const currentToken = numberTokens[loopIndex];
    // Convert current count to number (or 0 if undefined) and increment.
    occurrenceRegistry[currentToken] = (Number(occurrenceRegistry[currentToken]) || 0) + 1;
  }

  // Create a cache to store pre-calculated results for combination sums.
  const computedResults = {};

  // Loop through each number token in the original sequence.
  for (let loopIndex = 0; loopIndex < numberTokens.length; loopIndex++) {
    const currentToken = numberTokens[loopIndex];
    // Temporarily decrement the count of the current token in the frequency map.
    occurrenceRegistry[currentToken] -= 1;

    // Check if the combination sum for this specific token (after decrement) is already cached.
    if (!computedResults[currentToken]) {
      let cumulativeCombinations = 0; // Initialize sum for pairs.
      // Iterate through the entries of the modified frequency map.
      for (let [, itemQuantity] of Object.entries(occurrenceRegistry)) {
        // If an item appears more than once, calculate C(itemQuantity, 2) and add to sum.
        if (itemQuantity > 1) {
          cumulativeCombinations += chooseItems(itemQuantity, 2);
        }
      }
      // Store the calculated sum in the cache.
      computedResults[currentToken] = cumulativeCombinations;
    }
    // Output the cached or newly computed sum for the current token.
    console.log(computedResults[currentToken]);

    // Restore the count of the current token in the frequency map for subsequent iterations.
    occurrenceRegistry[currentToken] += 1;
  }
};

// Function to compute the binomial coefficient "n choose k" (C(n, k)).
const computeBinomialCoefficient = (totalItems, itemsToChoose) => {
  let productNumerator = 1; // Stores the numerator part of the combination formula.
  // Calculate n * (n-1) * ... * (n-k+1).
  for (let i = 0; i < itemsToChoose; i++) {
    productNumerator *= totalItems;
    totalItems--;
  }

  let productDenominator = 1; // Stores the denominator part (k!).
  // Calculate k * (k-1) * ... * 1.
  while (itemsToChoose > 0) {
    productDenominator *= itemsToChoose;
    itemsToChoose--;
  }

  // Return the result of n! / (k! * (n-k)!).
  return productNumerator / productDenominator;
};

// Higher-order function to memoize the results of another function.
const cacheResults = (targetFunction) => {
  const functionCache = {}; // Storage for memoized results.
  // Return a new function that checks the cache before executing the target function.
  return (nVal, kVal) => {
    // Construct a unique key for the cache based on arguments.
    const cacheKey = `${nVal}C${kVal}`;
    // If the result is not in the cache, compute it and store it.
    if (!functionCache[cacheKey]) {
      functionCache[cacheKey] = targetFunction(nVal, kVal);
    }
    // Return the cached result.
    return functionCache[cacheKey];
  };
};

// Create a memoized version of the combination calculation function.
const chooseItems = cacheResults(computeBinomialCoefficient);

// Determine execution path: run tests if environment variable is set, otherwise process standard input.
process.env.RUN_TESTS ? executeTests() : processInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));
// This function orchestrates the primary computation
function ProcessInputData(inputString) {
  // Parse the input string into an array of numeric values
  let numericValues = inputString.split(" ").map(item => Number(item));

  // Extract problem parameters
  const totalElements = numericValues[0];
  const firstCategorySize = numericValues[1];
  const secondCategorySize = numericValues[2];
  const combinedCategorySize = firstCategorySize + secondCategorySize;
  const targetValue = numericValues[3];

  // Calculate an initial iteration limit for finding combinations
  let initialLoopCount = Math.floor(targetValue / combinedCategorySize);
  // Flag to indicate if a valid combination of counts is found
  let combinationFoundFlag = 0;
  // Array to store potential pairs of counts that satisfy the target value
  let candidatePairs = [];

  // Iterate downwards from the initial limit to find the first valid combination
  for (let currentIterationCount = initialLoopCount; currentIterationCount >= 0; currentIterationCount--) {
    const remainingValue = targetValue - currentIterationCount * combinedCategorySize;

    // Check if the remaining value is perfectly divisible by the first category size
    if (remainingValue % firstCategorySize === 0) {
      combinationFoundFlag = 1;
      candidatePairs.push(remainingValue / firstCategorySize, 0); // Store (count_first, 0)
    }
    // Check if the remaining value is perfectly divisible by the second category size
    if (remainingValue % secondCategorySize === 0) {
      combinationFoundFlag = 1;
      candidatePairs.push(0, remainingValue / secondCategorySize); // Store (0, count_second)
    }

    // If any combination was found in this iteration, we can break early
    if (combinationFoundFlag) break;
  }

  // Store the last valid iteration count from the previous loop
  let currentProcessingIndex = currentIterationCount;

  // If no combination was found after the initial search, output zero and terminate
  if (!combinationFoundFlag) {
    console.log(0);
    return;
  }

  // Initialize the final computed answer, which will accumulate modular combinations
  let totalComputedResult = 0;

  // Pre-calculate ratios for potential increments in the combination counts
  const firstIncrementRatio = (combinedCategorySize % firstCategorySize === 0) ? (combinedCategorySize / firstCategorySize) : 0;
  const secondIncrementRatio = (combinedCategorySize % secondCategorySize === 0) ? (combinedCategorySize / secondCategorySize) : 0;

  // Main loop to iterate through possible combinations and compute results
  // Continues as long as there are candidate pairs and the processing index is non-negative
  while (candidatePairs.length && currentProcessingIndex >= 0) {
    let nextCandidatePairs = []; // Temporary array to store pairs for the next iteration
    let processedPairTracker = {}; // Hash map to avoid processing duplicate pairs in the current iteration

    // Loop through the current list of candidate pairs, taking two elements at a time
    for (let pairIndex = 0; pairIndex < candidatePairs.length; pairIndex += 2) {
      const p1 = candidatePairs[pairIndex];       // Count for the first category
      const p2 = candidatePairs[pairIndex + 1];   // Count for the second category

      // Create a unique key for the pair to track if it has already been processed
      const pairKey = `${p1}_${p2}`;
      if (processedPairTracker[pairKey]) continue; // Skip if this pair has already been handled

      // Validate the current pair against problem constraints
      // Counts must be non-negative, and their sum with the processing index must not exceed totalElements
      if (p1 < 0 || p2 < 0 || currentProcessingIndex + p1 + p2 > totalElements) continue;

      // Mark this pair as processed for the current iteration
      processedPairTracker[pairKey] = 1;

      // Add to the total result using modular arithmetic for combinations
      totalComputedResult = (totalComputedResult +
        multiplyModulo(
          combinationsModulo(totalElements, currentProcessingIndex),
          combinationsModulo(totalElements - currentProcessingIndex, p1),
          combinationsModulo(totalElements - currentProcessingIndex - p1, p2)
        )
      ) % primeModulo;

      // Generate next potential pairs based on defined increment ratios
      nextCandidatePairs.push(p1 + 1, p2 + 1); // Standard increment for both counts
      if (firstIncrementRatio) nextCandidatePairs.push(p1 + firstIncrementRatio, p2); // Increment first count if ratio is valid
      if (secondIncrementRatio) nextCandidatePairs.push(p1, p2 + secondIncrementRatio); // Increment second count if ratio is valid
    }
    // Update the candidate pairs for the next iteration
    candidatePairs = nextCandidatePairs;
    // Decrement the processing index for the next iteration
    currentProcessingIndex--;
  }

  // Output the final calculated result to the console
  console.log(totalComputedResult);
} // End of ProcessInputData function

// Function to perform modular multiplication for an arbitrary number of arguments
// This function handles potential overflow by breaking down multiplication using bitwise operations
function multiplyModulo() {
  // Initialize the running product with the first argument
  let currentProduct = arguments[0];
  // Iterate through the remaining arguments to multiply them sequentially
  for (let argIndex = 1; argIndex < arguments.length; argIndex++) {
    // Perform multiplication using bitwise operations for optimization and then modulo
    // This technique helps manage large number multiplication in JavaScript
    currentProduct = (
      (currentProduct >>> 16) * arguments[argIndex] % primeModulo * 0x10000 +
      (currentProduct & 0xFFFF) * arguments[argIndex]
    );
    // Ensure the result stays within the modulo range after each multiplication
    currentProduct %= primeModulo;
  }
  return currentProduct;
}

// Function to compute (baseValue ^ exponentValue) % primeModulo efficiently using binary exponentiation
function powerModulo(baseValue, exponentValue) {
  let resultPower = 1; // Initialize the result to 1 (any number to the power of 0 is 1)
  // Loop while the exponent is greater than zero
  while (exponentValue) {
    // If the least significant bit of the exponent is 1, multiply the result by the current baseValue
    if (exponentValue & 1) resultPower = multiplyModulo(baseValue, resultPower);
    // Square the baseValue in each iteration (baseValue = baseValue * baseValue)
    baseValue = multiplyModulo(baseValue, baseValue);
    // Right shift the exponent by 1 (equivalent to integer division by 2)
    exponentValue >>>= 1;
  }
  return resultPower;
}

// Define the large prime modulus used for all modular arithmetic operations
const primeModulo = 998244353;
// Cache for pre-calculated factorial values (n!) modulo primeModulo
let factorialSeries = [1, 1];
// Cache for pre-calculated modular inverse factorial values (1/n!) modulo primeModulo
let inverseFactorialSeries = [1, 1];

// Function to calculate factorial (n!) modulo primeModulo, caching results
function computeFactorial(limitValue) {
  // Extend the factorial cache up to limitValue if necessary
  for (let currentNumber = factorialSeries.length; currentNumber <= limitValue; currentNumber++) {
    factorialSeries[currentNumber] = multiplyModulo(factorialSeries[currentNumber - 1], currentNumber);
  }
  return factorialSeries[limitValue];
}

// Function to calculate modular inverse of factorial (1/n!) modulo primeModulo, caching results
function computeInverseFactorial(valueToInvert) {
  // Ensure the factorial for valueToInvert is computed and cached
  if (!factorialSeries[valueToInvert]) computeFactorial(valueToInvert);
  // Calculate the inverse factorial using Fermat's Little Theorem (a^(p-2) % p)
  inverseFactorialSeries[valueToInvert] = powerModulo(factorialSeries[valueToInvert], primeModulo - 2);
  // Backfill inverse factorials for smaller values in descending order
  let currentVal = valueToInvert;
  while (!inverseFactorialSeries[currentVal - 1] && currentVal > 0) { // Added currentVal > 0 to prevent infinite loop if currentVal becomes 0
    inverseFactorialSeries[currentVal - 1] = multiplyModulo(inverseFactorialSeries[currentVal], currentVal);
    currentVal--;
  }
}

// Function to compute combinations (nCr) modulo primeModulo
function combinationsModulo(setTotal, subsetSize) {
  // Handle invalid cases for combinations: if subsetSize is out of range, nCr is 0
  if (subsetSize < 0 || subsetSize > setTotal) return 0;
  // Ensure inverse factorials are pre-calculated up to setTotal for efficiency
  if (!inverseFactorialSeries[setTotal]) computeInverseFactorial(setTotal);
  // Calculate nCr = (n! * (r!)^(-1) * ((n-r)!)^(-1)) % primeModulo
  return multiplyModulo(factorialSeries[setTotal], inverseFactorialSeries[subsetSize], inverseFactorialSeries[setTotal - subsetSize]);
}

// Entry point of the program: Read input from standard input and process it
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
"use strict";

/**
 * Main function to process the input and find the required prime sequence.
 * @param {string} inputString Raw input string from stdin.
 */
function processInputData(inputString) {
  // Define an upper limit for prime number generation.
  // This value is sufficiently large for typical constraints in such problems.
  // Original was 55555; slightly modified for Type III.
  const PRIME_SEARCH_LIMIT = 60000;

  // Parse the target count of primes from the input.
  // Using Number() for type conversion instead of parseInt().
  const desiredPrimeCount = Number(inputString);

  // Input validation: ensure desiredPrimeCount is a positive integer.
  if (!Number.isInteger(desiredPrimeCount) || desiredPrimeCount <= 0) {
    console.error("Invalid input: Target prime count must be a positive integer.");
    return; // Exit if input is invalid.
  }

  // --- Sieve of Eratosthenes for prime number identification ---
  // Initialize a boolean array (flags) where index represents a number
  // and value indicates if it's potentially prime.
  // Array size is PRIME_SEARCH_LIMIT + 1 to allow indexing up to PRIME_SEARCH_LIMIT.
  const primeFlags = new Array(PRIME_SEARCH_LIMIT + 1).fill(true);

  // 0 and 1 are not prime numbers by mathematical definition.
  primeFlags[0] = false;
  primeFlags[1] = false;

  // Calculate the square root of the limit for sieve optimization.
  // Using Math.trunc to get the integer part.
  const sqrtOfLimit = Math.trunc(Math.sqrt(PRIME_SEARCH_LIMIT));

  // Iterate from 2 up to the square root of the limit.
  // Any composite number N will have at least one prime factor less than or equal to sqrt(N).
  let currentCandidate = 2;
  while (currentCandidate <= sqrtOfLimit) {
    // If currentCandidate is marked as prime, then it is a prime number.
    if (primeFlags[currentCandidate]) {
      // Mark all multiples of this prime as not prime.
      // Optimization: start marking from currentCandidate * currentCandidate,
      // because smaller multiples (e.g., 2*p, 3*p) would have already been marked
      // by their smaller prime factors (2, 3, etc.).
      let multipleMarker = currentCandidate * currentCandidate;
      while (multipleMarker <= PRIME_SEARCH_LIMIT) {
        primeFlags[multipleMarker] = false;
        multipleMarker += currentCandidate; // Move to the next multiple.
      }
    }
    currentCandidate++; // Move to the next number to check for primality.
  }

  // --- Find the sequence of primes that meets the criteria ---
  // This array will hold the current window of primes being tested.
  let currentPrimeSequence = [];
  let numberIterator = 0; // Start checking numbers from 0 upwards.

  // Continuously search for primes until a valid sequence is found.
  // This is an infinite loop that breaks when a valid sequence is found and printed.
  while (true) {
    // If the current number is identified as prime by our sieve.
    if (primeFlags[numberIterator]) {
      currentPrimeSequence.push(numberIterator); // Add this prime to our sequence.
    }

    // Once the sequence reaches the desired length.
    if (currentPrimeSequence.length === desiredPrimeCount) {
      // Validate this specific sequence using the subset sum condition.
      if (checkSubsetSumCondition(currentPrimeSequence, primeFlags)) {
        // If the sequence is valid, print it and exit the program.
        console.log(currentPrimeSequence.join(' '));
        return; // Terminate execution.
      }
      // If the sequence is not valid, remove the oldest prime to slide the window
      // and continue searching for a valid sequence.
      currentPrimeSequence.shift(); // Efficiently remove the first element (different from slice(1)).
    }
    numberIterator++; // Move to the next integer to check.
  }
}

/**
 * Validates a given set of prime numbers based on a specific subset sum condition.
 * The condition is: NO combination of 5 elements from the set should sum to a prime number.
 * This function's logic for out-of-bounds sums aligns with the original code's implicit behavior.
 * @param {number[]} primeSet The array of prime numbers to validate.
 * @param {boolean[]} primeFlagMap The boolean map indicating primality (sieve).
 * @returns {boolean} True if the set is valid (no 5-element subset sums to a prime), false otherwise.
 */
function checkSubsetSumCondition(primeSet, primeFlagMap) {
  // Define the required size for combinations.
  const SUBSET_SIZE_FOR_CHECK = 5;

  // If the set does not have enough elements for a 5-element combination, it cannot be valid.
  if (primeSet.length < SUBSET_SIZE_FOR_CHECK) {
    return false; // Not enough elements to form required subsets.
  }

  // Generate all possible combinations of SUBSET_SIZE_FOR_CHECK elements from the given primeSet.
  const generatedSubsets = generateSubsets(primeSet, SUBSET_SIZE_FOR_CHECK);

  // Iterate through each generated subset to check its sum.
  let currentSubsetIdx = 0;
  while (currentSubsetIdx < generatedSubsets.length) {
    const currentSubset = generatedSubsets[currentSubsetIdx];
    let subsetSum = 0;

    // Calculate the sum of elements within the current subset.
    // Using a simple for...of loop instead of array.prototype.reduce for variation.
    for (let elementValue of currentSubset) {
      subsetSum += elementValue;
    }

    // Determine if the subsetSum is prime based on the primeFlagMap.
    // Important: This logic explicitly handles the original code's behavior for sums exceeding the sieve.
    // In the original, if `sum > MAX`, `sieve[sum]` was `undefined`, and `!sieve[sum]` became `true`.
    // This implies sums outside the sieve were treated as non-prime for the condition.
    // So, if the sum is within bounds AND it's marked as prime, then the set is invalid.
    if (subsetSum < primeFlagMap.length && primeFlagMap[subsetSum]) {
      return false; // Found a sum that IS prime, so the condition is violated.
    }
    // If the sum is out of bounds (>= primeFlagMap.length), or if it's within bounds but not prime,
    // we continue to check the next subset. This effectively treats out-of-bounds sums as non-prime,
    // matching the original's implicit behavior.

    currentSubsetIdx++; // Move to the next subset combination.
  }

  // If we've checked all 5-element subsets and none of their sums were prime,
  // then the entire primeSet is considered valid.
  return true;
}

/**
 * Generates all unique combinations of a specified size from a given array.
 * This function uses a recursive approach to build combinations.
 * @param {Array<T>} sourceArray The input array from which to select elements.
 * @param {number} combinationSize The number of elements required in each combination.
 * @returns {Array<Array<T>>} An array containing all generated combinations, each as an array.
 * @template T
 */
function generateSubsets(sourceArray, combinationSize) {
  const allResultCombinations = []; // This array will store all valid combinations.

  // --- Base Cases and Input Validation ---
  // If combinationSize is non-positive or exceeds the sourceArray's length, no combinations are possible.
  if (combinationSize <= 0 || combinationSize > sourceArray.length) {
    return allResultCombinations; // Return an empty array.
  }

  // If combinationSize is 1, each element of the sourceArray is a combination itself.
  if (combinationSize === 1) {
    // Use a for...of loop for iterating over array elements directly.
    for (let singleElement of sourceArray) {
      allResultCombinations.push([singleElement]); // Wrap each element in its own array.
    }
    return allResultCombinations;
  }

  // If combinationSize is equal to the sourceArray's length, the array itself is the only combination.
  if (combinationSize === sourceArray.length) {
    return [sourceArray]; // Return the entire array wrapped in another array.
  }

  // --- Recursive Step ---
  // Iterate through the sourceArray. For each element, consider it as the 'head' of a combination.
  // The loop limit ensures that there are enough remaining elements to form the rest of the combination.
  let currentHeadElementIndex = 0;
  while (currentHeadElementIndex <= sourceArray.length - combinationSize) {
    const headElement = sourceArray[currentHeadElementIndex]; // Select the current element as the head.
    // Create a slice of the array containing elements AFTER the current head.
    const remainingElementsForTail = sourceArray.slice(currentHeadElementIndex + 1);

    // Recursively call generateSubsets to find combinations of the remaining elements.
    // We need (combinationSize - 1) elements from the 'remainingElementsForTail'.
    const tailCombinations = generateSubsets(remainingElementsForTail, combinationSize - 1);

    // Combine the 'headElement' with each of the 'tailCombinations'.
    // Using a for...of loop for clarity.
    for (let currentTailCombination of tailCombinations) {
      // Use spread syntax to create a new array combining the head and the tail.
      allResultCombinations.push([headElement, ...currentTailCombination]);
    }
    currentHeadElementIndex++; // Move to the next element to consider as a head.
  }

  return allResultCombinations;
}

// --- Entry point for script execution ---
// Reads input from standard input and initiates the primary data processing.
try {
  // `require('fs').readFileSync` is a synchronous operation suitable for competitive programming.
  // `/dev/stdin` is a common path for standard input in Linux/Unix environments.
  // `utf8` specifies the character encoding for the input.
  processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
} catch (executionError) {
  // If there's an error during file reading or initial processing, log it.
  console.error("An error occurred during program execution:", executionError.message);
  // Optionally, might want to exit with a non-zero status code to indicate failure.
  // process.exit(1);
}
"use strict";

/**
 * Main entry point for processing prime number related queries.
 * This function identifies a sequence of prime numbers such that
 * no combination of 5 primes from the sequence sums to another prime.
 *
 * @param {string} rawInput - The raw input string, expected to be an integer.
 * @returns {void} Outputs the result to console or handles errors.
 */
function processPrimeSequence(rawInput) {
  // Define an upper boundary for prime number search and sieve array size.
  // This value is slightly adjusted from the original to demonstrate a Type III change.
  const PRIME_SEARCH_UPPER_BOUND = 56000;
  // The desired number of primes in the output sequence.
  let sequenceLength;

  // Input parsing and validation.
  try {
    sequenceLength = Number.parseInt(rawInput.trim(), 10);
    if (Number.isNaN(sequenceLength) || sequenceLength <= 0) {
      console.error("Error: Input must be a positive integer.");
      return;
    }
  } catch (parseError) {
    console.error("Failed to parse input:", parseError.message);
    return;
  }

  // --- Sieve of Eratosthenes for prime pre-computation ---
  // A boolean array where primeFlags[i] is true if i is prime.
  const primeFlags = new Array(PRIME_SEARCH_UPPER_BOUND);

  // Initialize all numbers as potentially prime.
  primeFlags.fill(true);

  // 0 and 1 are not prime.
  primeFlags[0] = false;
  primeFlags[1] = false;

  // Calculate the square root of the upper bound for the sieve loop limit.
  const sqrtLimit = Math.floor(Math.sqrt(PRIME_SEARCH_UPPER_BOUND));

  // Iterate from 2 up to the square root limit.
  for (let currentNumber = 2; currentNumber <= sqrtLimit; currentNumber++) {
    // If currentNumber is marked as prime, then its multiples are not prime.
    if (primeFlags[currentNumber]) {
      // Mark all multiples of currentNumber as not prime.
      // Start from currentNumber * currentNumber for optimization,
      // as smaller multiples would have already been marked by smaller primes.
      // (Original started from currentNumber * 2, this is an optimization change).
      for (let multiple = currentNumber * currentNumber; multiple < PRIME_SEARCH_UPPER_BOUND; multiple += currentNumber) {
        primeFlags[multiple] = false;
      }
    }
  }

  // --- Main logic: Find the sequence of primes ---
  // Store the primes found that form the candidate sequence.
  const currentPrimeSequence = [];
  // Iterator for checking numbers from 0 upwards.
  let candidateValue = 0;
  // Constant for the combination size (quintet).
  const QUINTET_SIZE = 5;

  // Loop indefinitely until the required sequence is found and validated.
  while (true) {
    // Check if the current candidate value is prime.
    if (primeFlags[candidateValue]) {
      // If it's prime, add it to our current sequence.
      currentPrimeSequence.push(candidateValue);
    }

    // Once we have enough primes in our sequence, we check if it meets the criteria.
    if (currentPrimeSequence.length === sequenceLength) {
      // Validate the current sequence of primes.
      if (checkPrimeSumProperty(currentPrimeSequence, QUINTET_SIZE, primeFlags, PRIME_SEARCH_UPPER_BOUND)) {
        // If valid, print the sequence and exit.
        console.log(currentPrimeSequence.join(' '));
        return;
      }
      // If not valid, remove the oldest prime (first element) and continue searching.
      currentPrimeSequence.shift(); // Using shift() instead of slice(1) for a Type III change.
    }
    // Move to the next number to check.
    candidateValue++;

    // Add a safety break to prevent infinite loops in case of unexpected conditions or large inputs.
    // This is a Type III addition (guard clause).
    if (candidateValue >= PRIME_SEARCH_UPPER_BOUND) {
      console.error("Error: Reached sieve limit without finding a valid sequence. Consider increasing PRIME_SEARCH_UPPER_BOUND.");
      return;
    }
  }
}

/**
 * Checks if a given sequence of primes satisfies the condition:
 * no combination of 'groupSize' primes from the sequence sums to another prime.
 *
 * @param {Array<number>} primeValues - The array of prime numbers to check.
 * @param {number} groupSize - The number of elements to combine (e.g., 5 for quintets).
 * @param {Array<boolean>} cachedPrimeFlags - The pre-computed sieve array.
 * @param {number} maxSieveValue - The upper limit of the sieve array.
 * @returns {boolean} True if no such sum is prime, false otherwise.
 */
function checkPrimeSumProperty(primeValues, groupSize, cachedPrimeFlags, maxSieveValue) {
  // Generate all combinations of `groupSize` elements from `primeValues`.
  const allQuintetCombinations = generateSubsets(primeValues, groupSize);

  // Iterate over each combination.
  for (const currentSubset of allQuintetCombinations) {
    // Calculate the sum of elements in the current combination.
    const subsetSum = currentSubset.reduce((accumulator, val) => accumulator + val, 0); // Explicit initial value for reduce.

    // Check if the sum is within the bounds of our sieve and if it's prime.
    // Adding boundary check as a Type III enhancement.
    if (subsetSum < maxSieveValue && cachedPrimeFlags[subsetSum]) {
      // If any combination sums to a prime, the sequence is invalid.
      return false;
    }
  }
  // If no combination sums to a prime, the sequence is valid.
  return true;
}

/**
 * Generates all unique combinations (subsets) of a given size from an array.
 * This is a recursive helper function.
 *
 * @param {Array<any>} sourceArray - The array from which to generate combinations.
 * @param {number} subsetSize - The desired size of each combination.
 * @returns {Array<Array<any>>} An array of arrays, where each inner array is a combination.
 */
function generateSubsets(sourceArray, subsetSize) {
  let resultSubsets = []; // Renamed from 'combs'

  // Guard clauses for invalid input parameters.
  if (subsetSize > sourceArray.length || subsetSize <= 0) {
    return [];
  }
  if (sourceArray.length === 0) { // Added specific check for empty array.
      return [];
  }

  // Base case: If subsetSize equals the sourceArray length, return the array itself as the only combination.
  if (subsetSize === sourceArray.length) {
    return [sourceArray.slice()]; // Return a shallow copy.
  }

  // Base case: If subsetSize is 1, return each element as a single-element array.
  if (subsetSize === 1) {
    for (let currentItem of sourceArray) { // Using for...of for Type III change.
      resultSubsets.push([currentItem]);
    }
    return resultSubsets;
  }

  // Recursive step:
  // Iterate through the array, taking each element as the 'head' of a combination.
  // The loop condition is rephrased for clarity: `i <= sourceArray.length - subsetSize`.
  for (let i = 0; i <= sourceArray.length - subsetSize; i++) {
    const currentHeadElement = [sourceArray[i]]; // Simplified from slice(i, i+1).
    // Recursively find combinations from the rest of the array with one less element needed.
    const remainingSubsets = generateSubsets(sourceArray.slice(i + 1), subsetSize - 1);

    // Combine the head element with each of the remaining subsets.
    for (const tailSubset of remainingSubsets) { // Using for...of for Type III change.
      resultSubsets.push(currentHeadElement.concat(tailSubset));
    }
  }
  return resultSubsets;
}

// Execute the main function with input read from standard input.
processPrimeSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
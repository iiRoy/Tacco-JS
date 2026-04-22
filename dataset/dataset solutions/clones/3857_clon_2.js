"use strict"; /* This directive enforces stricter parsing and error handling in the code. */

// Primary function to process the input string and find a specific set of prime numbers.
function processInputData(strInput) {
  /* Defines the absolute upper bound for prime number search. */
  const PRIME_LIMIT = 55555;

  // Converts the input string into an integer, representing the desired count of primes.
  const desiredCount = Number.parseInt(strInput, 10);

  // Initialize a boolean array for the Sieve of Eratosthenes.
  // Each index 'p' will store true if 'p' is prime, false otherwise.
  const primalityMarkers = Array(PRIME_LIMIT);
  // Initially assume all numbers up to PRIME_LIMIT are prime.
  for (let idxVal = 0; idxVal < PRIME_LIMIT; idxVal++) {
    primalityMarkers[idxVal] = true;
  }

  // Calculate the square root of the limit for optimizing the sieve.
  let sqRootUpper = Math.floor(Math.sqrt(PRIME_LIMIT));

  // Mark 0 and 1 as non-prime.
  primalityMarkers[0] = false;
  primalityMarkers[1] = false;

  // Apply the Sieve of Eratosthenes algorithm.
  // Iterate from 2 up to the square root of PRIME_LIMIT.
  for (let idxVal = 2; idxVal <= sqRootUpper; idxVal++) {
    // If idxVal is prime (not marked false yet),
    if (primalityMarkers[idxVal]) {
      // Mark all multiples of idxVal as non-prime.
      // Start from idxVal * 2, as smaller multiples would have been marked by previous primes.
      for(var multFactor = idxVal * 2; multFactor <= PRIME_LIMIT; multFactor += idxVal) {
        primalityMarkers[multFactor] = false;
      }
    }
  }

  // Array to store the prime numbers found that meet certain criteria.
  let currentPrimes = [];
  // Counter for iterating through numbers to check for primality.
  let currentCandidate = 0;

  // Loop indefinitely until the desired set of primes is found and validated.
  while (true) {
    // If the current number is marked as prime by the sieve, add it to our collection.
    if (primalityMarkers[currentCandidate]) {
      currentPrimes.push(currentCandidate);
    }

    // Check if we have collected enough prime numbers.
    if (currentPrimes.length === desiredCount) {
      // If the collected set satisfies an additional validation condition.
      if (validatePrimeSet(currentPrimes)) {
        // Output the space-separated primes and exit the main function.
        console.log(currentPrimes.join(' '));
        return;
      }
      // If the set is not valid, remove the oldest prime and continue searching.
      currentPrimes = currentPrimes.slice(1);
    }
    // Move to the next number to check.
    currentCandidate += 1;
  }

  // Nested helper function to determine if a given set of primes meets a specific condition.
  function validatePrimeSet(candidateSet) {
    // Generate all combinations of 5 elements from the candidateSet.
    let subsetCollection = generatePowerSetSubsets(candidateSet, 5);
    // Iterate through each combination.
    for (let loopIdx = 0; loopIdx < subsetCollection.length; loopIdx += 1) {
      // Calculate the sum of elements in the current combination.
      const sumAccumulator = subsetCollection[loopIdx].reduce((accumulator, elementValue) => accumulator + elementValue);
      // If the sum is NOT prime (according to the primality markers), then the set is valid.
      return !primalityMarkers[sumAccumulator];
    }
    // If no combination of 5 sums to a non-prime, the set is considered invalid.
    return false;
  }
}

// Function to compute all unique combinations (subsets) of a given length from an array.
function generatePowerSetSubsets(sourceArr, subsetLength) {
  // Declare local variables used within this function.
  var outerIdx, innerIdx, resultSets, currentHeadElement, remainingSubsetsForHead;

  // Base case: If the requested subsetLength is out of bounds or invalid.
  if (subsetLength > sourceArr.length || subsetLength <= 0) {
    return [];
  }

  // Base case: If the subsetLength is equal to the source array's length,
  // there's only one combination: the array itself.
  if (subsetLength == sourceArr.length) {
    return [sourceArr];
  }

  // Base case: If we need subsets of length 1, each element becomes a single-element array.
  if (subsetLength == 1) {
    resultSets = []; // Initialize an empty array for single-element subsets.
    for (outerIdx = 0; outerIdx < sourceArr.length; outerIdx++) {
      resultSets.push([sourceArr[outerIdx]]); // Add each element as a new array.
    }
    return resultSets;
  }

  // Recursive case: Generate combinations for subsetLength > 1.
  resultSets = []; // Initialize an empty array to store all generated subsets.
  // Iterate through the source array, considering each element as the "head" of a combination.
  for (outerIdx = 0; outerIdx < sourceArr.length - subsetLength + 1; outerIdx++) {
    // Extract the current head element.
    currentHeadElement = sourceArr.slice(outerIdx, outerIdx + 1);
    // Recursively find combinations for the remaining part of the array with reduced length.
    remainingSubsetsForHead = generatePowerSetSubsets(sourceArr.slice(outerIdx + 1), subsetLength - 1);
    // Combine the current head with each of the remaining subsets.
    for (innerIdx = 0; innerIdx < remainingSubsetsForHead.length; innerIdx++) {
      resultSets.push(currentHeadElement.concat(remainingSubsetsForHead[innerIdx]));
    }
  }
  // Return the complete collection of generated subsets.
  return resultSets;
}

// Execute the main processing function by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
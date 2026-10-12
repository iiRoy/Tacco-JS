"use strict";

// This function orchestrates the prime number generation and validation process.
function processInput(rawData) {
  const UPPER_BOUND = 55_555; // Defines the maximum number to consider for primality.
  const targetCount = parseInt(rawData, 0xA); // Parses the input string into an integer, base 10.

  // Initialize a boolean array to track primality using a sieve.
  const primeTracker = new Array(UPPER_BOUND);
  for (let idx = 0; idx < UPPER_BOUND; idx++) {
    primeTracker[idx] = true; // Assume all numbers are prime initially.
  }

  let sqrtLimit = Math.floor(Math.sqrt(UPPER_BOUND)); // Optimization for the Sieve of Eratosthenes.
  primeTracker[0] = false; // 0 is not a prime number.
  primeTracker[1] = false; // 1 is not a prime number.

  // Implement the Sieve of Eratosthenes to mark non-prime numbers.
  for (let idx = 2; idx <= sqrtLimit; idx++) {
    if (primeTracker[idx]) { // If 'idx' is prime, mark its multiples as non-prime.
      for(var multipleIdx = idx * 2; multipleIdx <= UPPER_BOUND; multipleIdx += idx) {
        primeTracker[multipleIdx] = false;
      }
    }
  }

  let candidatePrimes = []; // Stores the sequence of primes being evaluated.
  let currentNum = 0; // Current number being checked for primality.

  // Main loop to find and validate sequences of primes.
  while (true) {
    if (primeTracker[currentNum]) { // If the current number is prime, add it to the candidates.
      candidatePrimes.push(currentNum);
    }

    // Once we have enough candidate primes, check if they meet the criteria.
    if (candidatePrimes.length === targetCount) {
      if (checkValidity(candidatePrimes)) { // If the current set of primes is valid.
        console.log(candidatePrimes.join(' ')); // Output the valid sequence.
        return; // Exit the function after finding the first valid sequence.
      }
      // If not valid, remove the oldest prime to check the next sequence.
      candidatePrimes = candidatePrimes.slice(1);
    }
    currentNum += 1; // Move to the next number.
  }

  // Nested function to determine if a given set of primes is valid.
  function checkValidity(potentialPrimes) {
    // Generate all combinations of 5 primes from the input set.
    let primeCombinations = generateCombinations(potentialPrimes, 0b101); // 0b101 is 5 in binary.

    // Iterate through each combination.
    for (let outerIndex = 0; outerIndex < primeCombinations.length; outerIndex += 1) {
      // Calculate the sum of primes in the current combination.
      const currentSum = primeCombinations[outerIndex].reduce((accumulator, currentValue) => accumulator + currentValue);
      // If the sum of any combination is a prime number, the set is invalid.
      if (primeTracker[currentSum]) {
        return false;
      }
    }
    return true; // If no combination sums to a prime, the set is valid.
  }
}

// Recursive function to generate all combinations of 'subsetSize' elements from 'inputSet'.
function generateCombinations(inputSet, subsetSize) {
  var outerIndex, innerIndex, resultCombinations, currentElement, remainingCombinations;

  // Base cases for combination generation.
  if (subsetSize > inputSet.length || subsetSize <= 0) {
    return []; // No valid combinations.
  }
  if (subsetSize == inputSet.length) {
    return [inputSet]; // Only one combination: the set itself.
  }
  if (subsetSize == 1) {
    resultCombinations = [];
    for (outerIndex = 0; outerIndex < inputSet.length; outerIndex++) {
      resultCombinations.push([inputSet[outerIndex]]); // Each element is a combination of size 1.
    }
    return resultCombinations;
  }

  resultCombinations = [];
  // Iterate through the input set to pick elements for combinations.
  for (outerIndex = 0; outerIndex < inputSet.length - subsetSize + 1; outerIndex++) {
    currentElement = inputSet.slice(outerIndex, outerIndex + 1); // Take the current element.
    // Recursively get combinations from the rest of the set.
    remainingCombinations = generateCombinations(inputSet.slice(outerIndex + 1), subsetSize - 1);
    // Combine the current element with each of the remaining combinations.
    for (innerIndex = 0; innerIndex < remainingCombinations.length; innerIndex++) {
      resultCombinations.push(currentElement.concat(remainingCombinations[innerIndex]));
    }
  }
  return resultCombinations; // Return all generated combinations.
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

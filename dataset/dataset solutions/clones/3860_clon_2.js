"use strict"; /* Enforce modern JavaScript behaviors */

function processNumericSequence(rawDataInput) { // Main routine to handle input and logic
  let maximumValue = 55555; // Defines the upper limit for prime number detection
  let requiredCount = Number.parseInt(rawDataInput, 10); // Parses the target number count from input

  let isNumberPrime = new Array(maximumValue); // Boolean array to store primality status
  for (let currentIdx = 0; currentIdx < maximumValue; ++currentIdx) {
    isNumberPrime[currentIdx] = !0; // Initialize all numbers as potentially prime (!0 is true)
  }

  let sqrtMax = Math.trunc(Math.sqrt(maximumValue)); // Optimization: square root for sieve boundary

  isNumberPrime[0] = !1; // Zero is not a prime number (!1 is false)
  isNumberPrime[1] = !1; // One is not a prime number

  // Implement the Sieve of Eratosthenes algorithm
  for (let primeCandidate = 2; primeCandidate <= sqrtMax; ++primeCandidate) {
    if (isNumberPrime[primeCandidate]) { // If the current candidate is marked as prime
      // Mark all multiples of this prime as non-prime
      for (let nonPrimeMultiple = primeCandidate * 2; nonPrimeMultiple <= maximumValue; nonPrimeMultiple = nonPrimeMultiple + primeCandidate) {
        isNumberPrime[nonPrimeMultiple] = !1; // Set to false
      }
    }
  }

  let discoveredPrimes = []; // List to store the collected prime numbers
  let searchIterator = 0; // Index for iterating through numbers

  for (;;) { // An endless loop to find the specific sequence
    if (isNumberPrime[searchIterator]) { // If the current number is prime
      discoveredPrimes.push(searchIterator); // Add it to our growing list
    }

    if (discoveredPrimes.length === requiredCount) { // When the list reaches the target size
      if (checkSetValidity(discoveredPrimes)) { // Verify if the current set meets specific criteria
        console.log(discoveredPrimes.join(' ')); // Output the valid sequence, space-separated
        return; // Terminate the program after finding the first valid sequence
      }
      // If the current set is not valid, discard the oldest prime and continue searching
      discoveredPrimes = discoveredPrimes.slice(1);
    }
    searchIterator = searchIterator + 1; // Increment the iterator to check the next number
  }

  // Inner function to determine if a given set of numbers is "valid"
  function checkSetValidity(candidateNumbers) {
    let fiveElementSubsets = generatePowerSet(candidateNumbers, 5); // Create all combinations of 5 elements
    for (let subsetIndex = 0; subsetIndex < fiveElementSubsets.length; subsetIndex++) {
      const currentSubsetSum = fiveElementSubsets[subsetIndex].reduce((accumulatorValue, itemValue) => accumulatorValue + itemValue, 0); // Sum elements in each subset
      if (isNumberPrime[currentSubsetSum]) { // If the sum of any subset is itself a prime number
        return !1; // The candidate set is NOT valid (!1 is false)
      }
    }
    return !0; // All subset sums are not prime, so the candidate set IS valid (!0 is true)
  }
}

// Function to compute all unique combinations (subsets) of a specified size from an array
function generatePowerSet(originalArray, subsetSize) {
  let mainIndex, subIndex, collectionOfSubsets, currentElement, remainingElementsSubsets;
  if (subsetSize > originalArray.length || subsetSize <= 0) {
    return []; // Return an empty array for invalid input conditions
  }
  if (subsetSize === originalArray.length) {
    return [originalArray]; // If subset size equals array length, the array itself is the only combination
  }
  if (subsetSize === 1) {
    collectionOfSubsets = [];
    for (mainIndex = 0; mainIndex < originalArray.length; mainIndex++) {
      collectionOfSubsets.push([originalArray[mainIndex]]); // Each element forms a single-item subset
    }
    return collectionOfSubsets;
  }

  collectionOfSubsets = [];
  for (mainIndex = 0; mainIndex < originalArray.length - subsetSize + 1; mainIndex++) {
    currentElement = originalArray.slice(mainIndex, mainIndex + 1); // Take the first element for the current combination
    // Recursively find combinations from the rest of the array
    remainingElementsSubsets = generatePowerSet(originalArray.slice(mainIndex + 1), subsetSize - 1);
    for (subIndex = 0; subIndex < remainingElementsSubsets.length; subIndex++) {
      collectionOfSubsets.push(currentElement.concat(remainingElementsSubsets[subIndex])); // Combine the current element with each recursive subset
    }
  }
  return collectionOfSubsets;
}

// Invoke the primary processing function by reading input from the standard input stream
processNumericSequence(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));
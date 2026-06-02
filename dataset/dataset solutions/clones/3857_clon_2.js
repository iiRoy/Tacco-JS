"use strict";

// Main function to process the input and find the required sequence of numbers.
function processInput(rawData) {
  // Define an upper limit for the sieve of Eratosthenes.
  const UPPER_BOUND = 55555;
  // Parse the input string to get the desired count of numbers.
  const countNeeded = parseInt(rawData, 10);

  // Initialize a boolean array for the sieve, marking all numbers as potentially prime.
  const primeFlags = new Array(UPPER_BOUND);
  for (let idx = 0; idx < UPPER_BOUND; idx++) {
    primeFlags[idx] = true;
  }

  // Calculate the square root limit for the sieve optimization.
  let sqrtLimit = Math.floor(Math.sqrt(UPPER_BOUND));
  // 0 and 1 are not prime.
  primeFlags[0] = false;
  primeFlags[1] = false;

  // Apply the Sieve of Eratosthenes algorithm.
  for (let idx = 2; idx <= sqrtLimit; idx++) {
    if (primeFlags[idx]) {
      // Mark multiples of the current prime as not prime.
      for (var multiplier = idx * 2; multiplier <= UPPER_BOUND; multiplier += idx) {
        primeFlags[multiplier] = false;
      }
    }
  }

  // Array to store the numbers that satisfy the conditions.
  let resultNumbers = [];
  let idx = 0; // Current number being checked.

  // Loop indefinitely until the required set of numbers is found.
  while (true) {
    // If the current number is prime, add it to our candidate list.
    if (primeFlags[idx]) {
      resultNumbers.push(idx);
    }

    // Once we have enough numbers, check if they meet the validity criteria.
    if (resultNumbers.length === countNeeded) {
      // If the current set of numbers is valid, print them and exit.
      if (checkValidity(resultNumbers)) {
        console.log(resultNumbers.join(' '));
        return;
      }
      // If not valid, remove the oldest number and continue searching.
      resultNumbers = resultNumbers.slice(1);
    }
    // Move to the next number to check.
    idx += 1;
  }

  // Nested function to determine if a given set of numbers is valid.
  function checkValidity(candidateSet) {
    // Generate all combinations of 5 numbers from the candidate set.
    let subsetCollection = generateSubsets(candidateSet, 5);
    // Iterate through each combination.
    for (let idx = 0; idx < subsetCollection.length; idx += 1) {
      // Calculate the sum of elements in the current combination.
      const currentSum = subsetCollection[idx].reduce((accumulator, elementValue) => accumulator + elementValue);
      // If the sum is NOT prime, the set is valid (as per problem statement).
      return !primeFlags[currentSum];
    }
    // If no combination of 5 numbers results in a non-prime sum, the set is not valid.
    return false;
  }
}

// Function to generate all combinations of k elements from a given set.
function generateSubsets(sourceArray, subsetSize) {
  var idx, multiplier, generatedSubsets, currentElement, remainingSubsets;

  // Handle edge cases for subset size.
  if (subsetSize > sourceArray.length || subsetSize <= 0) {
    return []; // No combinations possible.
  }
  if (subsetSize == sourceArray.length) {
    return [sourceArray]; // The only combination is the set itself.
  }
  if (subsetSize == 1) {
    generatedSubsets = [];
    // Each element forms a combination of size 1.
    for (idx = 0; idx < sourceArray.length; idx++) {
      generatedSubsets.push([sourceArray[idx]]);
    }
    return generatedSubsets;
  }

  generatedSubsets = [];
  // Iterate through the array to pick the first element of each combination.
  for (idx = 0; idx < sourceArray.length - subsetSize + 1; idx++) {
    currentElement = sourceArray.slice(idx, idx + 1); // The first element.
    // Recursively find combinations of (k-1) from the rest of the array.
    remainingSubsets = generateSubsets(sourceArray.slice(idx + 1), subsetSize - 1);
    // Combine the current element with each of the remaining subsets.
    for (multiplier = 0; multiplier < remainingSubsets.length; multiplier++) {
      generatedSubsets.push(currentElement.concat(remainingSubsets[multiplier]));
    }
  }
  return generatedSubsets;
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

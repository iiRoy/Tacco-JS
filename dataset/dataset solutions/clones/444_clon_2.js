function sieveGenerator(upperBoundary) {
  // This function implements the Sieve of Eratosthenes to find prime numbers
  // up to a specified upperBoundary and returns them in a hash map.
  var numberFlags = []; // Array to mark numbers as potentially prime (true) or composite (false)

  // Initialize the array: Assume all numbers from 0 to upperBoundary are prime initially.
  for (var currentCandidate = 0; currentCandidate <= upperBoundary; currentCandidate++) {
    numberFlags[currentCandidate] = currentCandidate;
  }

  // Explicitly mark 0 and 1 as non-prime.
  numberFlags[0] = false;
  numberFlags[1] = false;

  // Calculate the square root limit for the sieve optimization.
  var squareRootLimit = Math.floor(Math.sqrt(upperBoundary));

  // Iterate from 2 up to the square root of the upperBoundary.
  for (var primeFactor = 2; primeFactor <= squareRootLimit; primeFactor++) {
    // If the current number is already marked as non-prime, skip it.
    if (numberFlags[primeFactor] === false) {
      continue;
    }

    // Mark all multiples of the current primeFactor as non-prime.
    // Start from primeFactor * primeFactor (or primeFactor + primeFactor for clarity in this loop)
    // because smaller multiples would have already been marked by smaller prime factors.
    for (var multipleValue = primeFactor + primeFactor; multipleValue <= upperBoundary; multipleValue += primeFactor) {
      numberFlags[multipleValue] = false;
    }
  }

  var primeExistence = {}; // Object to store the primes found for quick lookup.

  // Populate the primeExistence map with the numbers that are still marked as prime.
  for (var numCheck = 0; numCheck <= upperBoundary; numCheck++) {
    if (numberFlags[numCheck] !== false) {
      primeExistence[numberFlags[numCheck]] = true;
    }
  }

  return primeExistence; // Return the map of prime numbers.
}

// Generate a map of primes up to 1,000,000 for later use.
var globalPrimes = sieveGenerator(1000000);

// Read the entire input from standard input.
var rawFileData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines.
var parsedInputLines = (rawFileData.trim()).split("\n");

// Main loop to process multiple test cases from the input.
while (true) {
  // Get the current line, split it by space, and convert parts to numbers.
  var currentCaseValues = parsedInputLines.shift().split(" ").map(Number);

  var itemCount = currentCaseValues[0]; // The number of items available.
  var desiredTotal = currentCaseValues[1]; // The target sum to reach or exceed.

  // Check for the termination condition (0 0).
  if (itemCount === 0 && desiredTotal === 0) {
    break; // Exit the loop if both values are zero.
  }

  var possibleSums = []; // Dynamic programming array to track reachable sums.

  // Initialize the possibleSums array: no sum is reachable initially.
  for (var sumIdx = 0; sumIdx <= desiredTotal; sumIdx++) {
    possibleSums[sumIdx] = false;
  }

  var itemQuantities = []; // Array to store the values of the items.

  // Read the 'itemCount' number of item values from subsequent input lines.
  for (var readIdx = 0; readIdx < itemCount; readIdx++) {
    itemQuantities.push(parsedInputLines.shift() - 0); // Convert string to number.
  }

  possibleSums[0] = true; // Base case: a sum of 0 is always reachable (by taking no items).

  // Fill the possibleSums array using dynamic programming.
  // Iterate through all possible sums from 0 up to desiredTotal - 1.
  for (var currentSum = 0; currentSum < desiredTotal; currentSum++) {
    // Iterate through each available item quantity.
    for (var itemIdx = 0; itemIdx < itemCount; itemIdx++) {
      // Calculate the new sum if the current item is added.
      var nextSum = currentSum + itemQuantities[itemIdx];

      // If the new sum exceeds the desiredTotal, it's not relevant for this problem.
      if (nextSum > desiredTotal) {
        continue;
      }

      // If the 'currentSum' is reachable, then 'nextSum' (currentSum + item) is also reachable.
      if (possibleSums[currentSum]) {
        possibleSums[nextSum] = true;
      }
    }
  }

  // Find the largest reachable sum (less than or equal to desiredTotal) that is also a prime number.
  var finalSumCandidate;
  for (finalSumCandidate = desiredTotal; finalSumCandidate > 0; finalSumCandidate--) {
    // Check if the current sum is reachable AND if it exists in our prime map.
    if (possibleSums[finalSumCandidate] && globalPrimes.hasOwnProperty(finalSumCandidate)) {
      break; // Found the largest prime sum, exit the loop.
    }
  }

  // Output the result: if no such prime sum was found (finalSumCandidate is 0), print "NA", otherwise print the sum.
  console.log((finalSumCandidate === 0) ? "NA" : finalSumCandidate);
}
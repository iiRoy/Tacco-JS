function findPrimesUpTo(upperBound) {
   // This array tracks numbers that are potentially prime; index represents the number.
   var isNumberPrime = [];
   for (var currentNum = 0; currentNum <= upperBound; currentNum++) {
      isNumberPrime[currentNum] = currentNum; // Initially, assume all numbers are prime.
   }

   // Mark the first two numbers as non-prime.
   isNumberPrime[0] = false;
   isNumberPrime[1] = false;

   // Calculate the integer square root of the maximum value to optimize the sieve process.
   var limitSqrt = Math.floor(Math.sqrt(upperBound));

   // Iterate through numbers starting from 2 up to the calculated square root limit.
   for (var currentNum = 2; currentNum <= limitSqrt; currentNum++) {
      // If the current number has already been marked as not prime, skip to the next iteration.
      if (isNumberPrime[currentNum] === false) {
         continue;
      }
      // For each prime number found, mark all its multiples as not prime.
      for (var multiple = currentNum + currentNum; multiple <= upperBound; multiple += currentNum) {
         isNumberPrime[multiple] = false;
      }
   }

   // Construct a final object (acting as a hash set) containing only the identified prime numbers.
   var primeSet = {};
   for (var currentNum = 0; currentNum <= upperBound; currentNum++) {
      // If a number is still marked as prime (i.e., not false), add it to our set of primes.
      if (isNumberPrime[currentNum] !== false) {
         primeSet[isNumberPrime[currentNum]] = true;
      }
   }
   // Return the collection of all prime numbers found within the specified range.
   return primeSet;
}

// Execute the prime number generation function once to create a lookup table for primes up to 1,000,000.
var foundPrimes = findPrimesUpTo(1000000);

// Sample input data for the problem. In a production environment, this would typically be read from a file.
// var externalData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Original comment for external input
var testCaseInput = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';

// Clean and parse the input string: remove leading/trailing whitespace, then split into an array of lines.
var processedLines = (testCaseInput.trim()).split("\n");

// Begin the main processing loop to handle each individual test case.
while (true) {
   // Extract the number of items (itemCount) and the target sum (targetSum) for the current case.
   var currentCaseParams = processedLines.shift().split(" ").map(Number);
   var itemCount = currentCaseParams[0];
   var targetSum = currentCaseParams[1];

   // Check for the termination condition: if both itemCount and targetSum are zero, exit the loop.
   if (itemCount === 0 && targetSum === 0) {
      break;
   }

   // Initialize a boolean array for dynamic programming, to track all possible sums that can be formed.
   var possibleTotals = [];
   // Mark all potential sums as initially unreachable.
   for (var idx = 0; idx <= 1000000; idx++) {
      possibleTotals[idx] = false;
   }

   // Prepare an array to store the numerical values for the current test case.
   var givenNumbers = [];
   // Read each individual item value from the input and mark it as reachable in the DP array.
   for (var idx = 0; idx < itemCount; idx++) {
      var valueToAdd = processedLines.shift() - 0; // Convert the string value to a number.
      givenNumbers.push(valueToAdd);
      possibleTotals[valueToAdd] = true;
   }

   // The sum of zero is always reachable (by selecting no items).
   possibleTotals[0] = true;

   // Iterate through all possible sums and all given numbers to populate the DP array.
   for (var currentSum = 0; currentSum <= 1000000; currentSum++) {
      for (var itemIdx = 0; itemIdx < givenNumbers.length; itemIdx++) {
         // If currentSum is achievable, then currentSum plus the current item's value is also achievable.
         if (possibleTotals[currentSum]) {
            possibleTotals[currentSum + givenNumbers[itemIdx]] = true;
         }
      }
   }

   // Search for the largest prime number that is less than or equal to the targetSum and is also a reachable sum.
   // The search is performed in descending order from the target sum.
   for (var currentSearchSum = targetSum; currentSearchSum > 0; currentSearchSum--) {
      // If the current sum is reachable AND it is identified as a prime number.
      if (possibleTotals[currentSearchSum] && foundPrimes.hasOwnProperty(currentSearchSum)) {
         break; // Found the desired sum, terminate the search.
      }
   }

   // Output the result: either the largest prime sum found, or "NA" if no such sum exists.
   console.log((currentSearchSum === 0) ? "NA" : currentSearchSum);
}
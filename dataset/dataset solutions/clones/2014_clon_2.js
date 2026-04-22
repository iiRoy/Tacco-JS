"use strict";

// This function computes and returns an ordered list of all positive divisors for a given integer.
function getDivisorsForNumber(numericValue) {
  // Initialize a mutable array to store the identified factors.
  const factorList = [];
  factorList[0] = 1; // The number 1 is always the first divisor.

  // Iterate through potential divisors starting from 2 up to the square root of the input.
  for (let currentCheck = 2; currentCheck <= Math.sqrt(numericValue); currentCheck++) {
    // If 'currentCheck' divides 'numericValue' evenly, it's a factor.
    if (numericValue % currentCheck === 0) {
      factorList.push(currentCheck); // Add this factor to our collection.
    }
  }

  // Store the current count of factors found (excluding their complementary pairs greater than sqrt).
  const initialCount = factorList.length;

  // Check if the input number is a perfect square. If not, the square root (if it was a factor)
  // would not be the last element added. Add its complementary pair if it's missing.
  // This also handles cases where 'numericValue' is prime or '1' by adding 'numericValue' itself.
  if (Math.sqrt(numericValue) !== factorList[initialCount - 1]) {
    // Add the paired divisor (numericValue / last_factor_found).
    factorList.push(numericValue / factorList[initialCount - 1]);
  }

  // Iterate backwards through the already found factors (excluding the last one if it was a sqrt or its pair was just added)
  // to find and add their corresponding larger divisors (e.g., if 2 is a factor of 12, then 6 is also a factor).
  for (let j = initialCount - 2; j >= 0; j--) {
    // Compute and add the complementary factor.
    factorList.push(numericValue / factorList[j]);
  }

  // Return the complete and sorted list of divisors.
  return factorList;
}

// This is the main execution block of the program, wrapped in an Immediately Invoked Function Expression (IIFE).
(function processInput(rawDataString) {
  // Convert the raw string input to an integer, ensuring any whitespace is removed.
  const targetNumber = Number(rawDataString.trim());
  
  // Calculate the count of "sub-only" cases: these are the divisors of (targetNumber - 1), excluding the number 1 itself.
  const countExclusive = getDivisorsForNumber(targetNumber - 1).length - 1;
  
  // Initialize a counter for "inclusive" cases, which will be determined by specific conditions.
  let countInclusive = 0;
  
  // Obtain all positive divisors for the target number.
  const allDivisorsOfTarget = getDivisorsForNumber(targetNumber);
  allDivisorsOfTarget.shift(); // Remove the number 1 from this list, as it's handled separately or not relevant for subsequent logic.
  
  // Iterate through each divisor 'currentDivisor' in the modified list of target number's divisors.
  for (let currentDivisor of allDivisorsOfTarget) {
    let tempNumber = targetNumber; // Create a temporary mutable copy of the target number for division.
    
    // Repeatedly divide 'tempNumber' by 'currentDivisor' as long as it remains perfectly divisible.
    do {
      tempNumber /= currentDivisor;
    } while (tempNumber % currentDivisor === 0);
    
    // After the repeated division, evaluate 'tempNumber' against specific conditions.
    if (tempNumber === 1) {
      // If 'tempNumber' has been reduced to 1, it means 'targetNumber' was a power of 'currentDivisor'.
      countInclusive++; // Increment the inclusive count.
    } else if (getDivisorsForNumber(tempNumber - 1).indexOf(currentDivisor) > -1) {
      // If 'currentDivisor' is found within the list of divisors for (tempNumber - 1).
      countInclusive++; // Increment the inclusive count.
    }
  }
  
  // Output the final sum of both exclusive and inclusive counts to the console.
  console.log(countExclusive + countInclusive);
  
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read the entire file content from standard input synchronously.
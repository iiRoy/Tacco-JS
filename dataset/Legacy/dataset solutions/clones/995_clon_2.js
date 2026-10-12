var inputValues = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split('\n')
  .map(Number); // Read input, parse to numbers

// The first number is often a count, but not used in the final calculation here.
var firstValue = inputValues.shift();

/**
 * Determines if a given number is prime.
 * @param {number} candidateNumber - The number to check for primality.
 * @returns {number} 1 if the number is prime, 0 otherwise.
 */
function checkPrimality(candidateNumber) {
  // Numbers less than 2 are not prime.
  if (candidateNumber < 2) {
    return 0;
  }
  // 2 is the only even prime number.
  if (candidateNumber === 2) {
    return 1;
  }
  // All other even numbers are not prime.
  if (candidateNumber % 2 === 0) {
    return 0;
  }
  // Check for divisibility by odd numbers up to the square root of the candidate.
  for (let divisorIterator = 3; divisorIterator <= Math.sqrt(candidateNumber); divisorIterator += 2) {
    if (candidateNumber % divisorIterator === 0) {
      return 0; // Found a divisor, so it's not prime.
    }
  }
  // If no divisors were found, the number is prime.
  return 1;
}

// Calculate the sum of prime indicators for the remaining numbers.
console.log(inputValues.reduce(function(accumulator, currentValue) {
  // Add the primality check result (0 or 1) to the accumulator.
  return accumulator + checkPrimality(currentValue);
}, 0)); // Start the sum from zero.

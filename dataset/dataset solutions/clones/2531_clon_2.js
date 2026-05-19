"use strict"; // Enforce strict mode for cleaner code

/**
 * Computes a list of prime numbers up to a specified upper bound
 * using the Sieve of Eratosthenes algorithm.
 *
 * @param {number} upperBound - The maximum number to check for primality.
 * @returns {number[]} An array containing all prime numbers less than or equal to 'upperBound'.
 */
function calculatePrimesUpTo(upperBound) {
  // Initialize a boolean array where primeFlags[i] is true if i is potentially prime.
  let primeFlags = [];
  for (let currentNum = 0; currentNum <= upperBound; currentNum++) {
    primeFlags[currentNum] = true; // Assume all numbers are prime initially.
  }

  // Mark 0 and 1 as not prime, as per definition.
  primeFlags[0] = false;
  primeFlags[1] = false;

  // Iterate from 2 up to the square root of the upper bound.
  // Numbers greater than sqrt(upperBound) would have already been marked by their smaller factors.
  for (let primeCandidate = 2; primeCandidate <= Math.sqrt(upperBound); primeCandidate++) {
    // If primeCandidate is still marked as prime, then it is a prime number.
    if (primeFlags[primeCandidate]) {
      // Mark all multiples of primeCandidate (starting from primeCandidate * primeCandidate) as not prime.
      // Multiples less than primeCandidate * primeCandidate would have already been marked by smaller primes.
      for (let multipleFactor = primeCandidate * primeCandidate; multipleFactor <= upperBound; multipleFactor += primeCandidate) {
        primeFlags[multipleFactor] = false;
      }
    }
  }

  // Collect all numbers that are still marked as prime.
  let discoveredPrimes = [];
  for (let indexPosition = 0; indexPosition < primeFlags.length; indexPosition++) {
    if (primeFlags[indexPosition]) {
      discoveredPrimes.push(indexPosition);
    }
  }

  return discoveredPrimes; // Return the list of prime numbers.
}

// Read input from standard input, assuming two space-separated integers.
const inputString = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const inputParts = inputString.split(' ');

// Parse the two integer inputs.
const firstInteger = parseInt(inputParts[0]);
const secondInteger = parseInt(inputParts[1]);

// Determine the upper limit for prime generation.
// This limit is half of the larger of the two input integers.
const sieveLimit = (firstInteger > secondInteger ? firstInteger : secondInteger) / 2;

// Generate primes up to the calculated sieveLimit.
// Math.ceil ensures we cover the full range if sieveLimit is not an integer.
const potentialCommonDivisors = calculatePrimesUpTo(Math.ceil(sieveLimit));

// Add 1 to the list of potential common divisors, as 1 is a common divisor for all integers.
potentialCommonDivisors.push(1);

// Filter the list to find numbers that are common divisors of both input integers.
const actualCommonDivisors = potentialCommonDivisors.filter(
  (currentDivisor) => (firstInteger % currentDivisor === 0 && secondInteger % currentDivisor === 0)
);

// Special case: If only 1 is found as a common divisor and the two input integers are identical,
// then the integer itself is also a common divisor.
if (actualCommonDivisors.length === 1 && firstInteger === secondInteger) {
  actualCommonDivisors.push(firstInteger);
}

// Output the count of unique common divisors found.
console.log(actualCommonDivisors.length);

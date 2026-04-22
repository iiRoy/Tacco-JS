"use strict";

// This module contains a routine to identify prime numbers up to a given integer value.
function findPrimesUpToLimit(upperBound) {

  // Initialize a boolean array; each index represents a number,
  // with 'true' indicating a potential prime, and 'false' for composite.
  var primalityIndicators = [];
  for (let currentIdx = 0; currentIdx <= upperBound; currentIdx++) {
    primalityIndicators[currentIdx] = true;
  }

  // By definition, 0 and 1 are not prime numbers.
  primalityIndicators[0] = false;
  primalityIndicators[1] = false;

  // Implement the Sieve of Eratosthenes.
  // Iterate from the first prime (2) up to the square root of the maximum bound.
  for ( let currentIdx = 2; currentIdx <= Math.sqrt(upperBound); currentIdx++ ) {
    // For each 'currentIdx', mark all its multiples as not prime.
    // The inner loop begins marking from 2 * currentIdx.
    for ( let factorVal = 2; factorVal * currentIdx <= upperBound; factorVal++ ) {
      primalityIndicators[currentIdx * factorVal] = false;
    }
  }

  // Aggregate all numbers that remain marked as prime into a new list.
  var gatheredPrimes = [];

  for ( let currentIdx = 0; currentIdx < primalityIndicators.length; currentIdx++ ) {
    if ( primalityIndicators[currentIdx] ) {
      gatheredPrimes.push(currentIdx);
    }
  }

  return gatheredPrimes;
}

// --- Script execution begins here ---

// Read the entire standard input content as a string.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Parse the input string, splitting it by spaces to get individual value tokens.
const inputTokens = rawInputContent.split(' ');

// Convert the first and second tokens into integer values.
const valueOne = parseInt(inputTokens[0]);
const valueTwo = parseInt(inputTokens[1]);


// Calculate an effective upper limit for the prime number generation process.
// This limit is half of the larger of the two input values.
const primeGenerationLimit = (valueOne > valueTwo ? valueOne : valueTwo) / 2;

// Generate a collection of prime numbers up to the ceiling of the calculated limit.
const generatedPrimeSet = findPrimesUpToLimit(Math.ceil(primeGenerationLimit));

// Include the number 1 in the set of potential common divisors, as it divides all integers.
generatedPrimeSet.push(1);

// Filter the generated primes to find those that are common divisors of both input values.
const finalCommonDivisors = generatedPrimeSet.filter(candidateDivisor => (valueOne % candidateDivisor == 0 && valueTwo % candidateDivisor == 0));

// Handle a specific edge case: if both input values are identical and
// only one common divisor (which would be 1) was initially found.
if ( finalCommonDivisors.length == 1 && valueOne == valueTwo ) {
  finalCommonDivisors.push(valueOne); // Add the identical value itself as a common divisor.
}

// Output the total count of common divisors identified.
console.log(finalCommonDivisors.length);
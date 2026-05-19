"use strict";

// Helper function to create and initialize a boolean array
const initializeBooleanArray = (arraySize, initialValue) => {
  const newArray = new Array(arraySize);
  for (let index = 0; index < arraySize; index++) {
    newArray[index] = initialValue;
  }
  return newArray;
};

function findPrimesUpTo(upperBoundValue) {
  // Guard clause for small input values, as sieve typically starts from 2
  if (upperBoundValue < 2) {
    return [];
  }

  // Initialize all numbers up to upperBoundValue as potentially prime
  let primeFlags = initializeBooleanArray(upperBoundValue + 1, true);

  // 0 and 1 are not prime numbers
  primeFlags[0] = false;
  primeFlags[1] = false;

  const limitForSieve = Math.sqrt(upperBoundValue);

  // Apply the Sieve of Eratosthenes algorithm
  for (let currentNum = 2; currentNum <= limitForSieve; currentNum++) {
    // Mark multiples of currentNum as not prime
    // The inner loop starts from 2*currentNum, but the original code
    // starts from j=2, so currentNum * j.
    for (let factor = 2; currentNum * factor <= upperBoundValue; factor++) {
      primeFlags[currentNum * factor] = false;
    }
  }

  const collectedPrimes = [];
  // Iterate through the flags and collect all numbers marked as prime
  primeFlags.forEach((isCurrentlyPrime, numberIndex) => {
    if (isCurrentlyPrime) {
      collectedPrimes.push(numberIndex);
    }
  });

  return collectedPrimes;
}

// Helper function to read and parse input numbers
const readAndParseInput = () => {
  const rawInputString = require('fs').readFileSync('/dev/stdin', 'UTF-8');
  const inputLineParts = rawInputString.split(' ');
  const firstNum = parseInt(inputLineParts[0]);
  const secondNum = parseInt(inputLineParts[1]);
  return { firstNum, secondNum };
};

const { firstNum, secondNum } = readAndParseInput();

// Determine the upper limit for prime generation based on the larger of the two input numbers
const largerInputVal = Math.max(firstNum, secondNum);
const sieveCalculationLimit = Math.ceil(largerInputVal / 2);

// Generate a list of primes up to the calculated limit
const generatedPrimes = findPrimesUpTo(sieveCalculationLimit);

// Create a list of potential common divisors, including 1
// 1 is always a common divisor, and the sieve doesn't generate it.
const candidateDivisors = [...generatedPrimes, 1];

// Filter the candidate divisors to find those that divide both numbers
const commonFactors = candidateDivisors.filter(currentDivisor => {
  const dividesFirstNum = (firstNum % currentDivisor === 0);
  const dividesSecondNum = (secondNum % currentDivisor === 0);
  return dividesFirstNum && dividesSecondNum;
});

// Handle a specific edge case: if only 1 is found and the two numbers are equal
// This implies the number itself should also be counted as a common factor.
if (commonFactors.length === 1 && firstNum === secondNum) {
  commonFactors.push(firstNum);
}

console.log(commonFactors.length);

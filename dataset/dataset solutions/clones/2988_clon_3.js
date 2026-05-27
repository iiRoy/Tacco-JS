'use strict';

const ZERO_VAL = 0;
const ONE_VAL = 1;
const TWO_VAL = 2;
const INITIAL_PRODUCT_ACCUMULATOR = 1;

/**
 * Generates a list of prime numbers up to a given upper bound using the Sieve of Eratosthenes.
 * @param {number} upperLimit - The maximum value to check for primality.
 * @returns {number[]} An array containing all prime numbers less than or equal to upperLimit.
 */
function generatePrimesUpTo(upperLimit) {
  const primeFlags = new Array(upperLimit + ONE_VAL).fill(true);
  primeFlags[ZERO_VAL] = false;
  primeFlags[ONE_VAL] = false;

  for (let idx = ZERO_VAL; idx <= upperLimit; idx++) {
    if (!primeFlags[idx]) {
      continue;
    }
    for (let jdx = TWO_VAL; idx * jdx <= upperLimit; jdx++) {
      primeFlags[idx * jdx] = false;
    }
  }

  const foundPrimes = [];
  for (let idx = ZERO_VAL; idx <= upperLimit; idx++) {
    if (primeFlags[idx]) {
      foundPrimes.push(idx);
    }
  }
  return foundPrimes;
}

/**
 * Determines the prime factorization of a number based on a list of pre-computed primes.
 * @param {number} numberToFactor - The integer to factorize.
 * @param {number[]} availablePrimes - A sorted array of prime numbers.
 * @returns {Array<[number, number]>} An array of [prime, exponent] pairs representing the factorization.
 */
function getPrimeFactorization(numberToFactor, availablePrimes) {
  const primeExponents = new Array(availablePrimes.length).fill(ZERO_VAL);
  let currentFactorizationProduct = INITIAL_PRODUCT_ACCUMULATOR;
  let currentPrimeIdx = ZERO_VAL;

  while (currentFactorizationProduct < numberToFactor && currentPrimeIdx < availablePrimes.length) {
    const currentPrime = availablePrimes[currentPrimeIdx];
    while (numberToFactor % (currentFactorizationProduct * currentPrime) === ZERO_VAL) {
      primeExponents[currentPrimeIdx]++;
      currentFactorizationProduct *= currentPrime;
    }
    currentPrimeIdx++;
  }

  const compactFactors = [];
  primeExponents.forEach((exponentVal, idx) => {
    if (exponentVal >= ONE_VAL) {
      compactFactors.push([availablePrimes[idx], exponentVal]);
    }
  });

  if (compactFactors.length === ZERO_VAL && numberToFactor > ONE_VAL) {
    compactFactors.push([numberToFactor, ONE_VAL]);
  }

  return compactFactors;
}

/**
 * Calculates the sum of (targetNumber / divisor - 1) for all divisors 'divisor' of targetNumber,
 * where the condition (targetNumber / divisor - 1 > divisor) is met.
 * @param {number} targetNumber - The number N.
 * @param {Array<[number, number]>} primeFactorization - The prime factorization of N.
 * @returns {number} The computed sum.
 */
function calculateDivisorSum(targetNumber, primeFactorization) {
  let totalSum = ZERO_VAL;
  const totalCombinations = primeFactorization.reduce((accumulator, currentFactor) => {
    return accumulator * (currentFactor[ONE_VAL] + ONE_VAL);
  }, ONE_VAL);

  const currentDivisorFactors = new Array(primeFactorization.length);

  for (let combinationIndex = ZERO_VAL; combinationIndex < totalCombinations; combinationIndex++) {
    let tempIndex = combinationIndex;
    primeFactorization.forEach((currentFactor, idx) => {
      const basePrime = currentFactor[ZERO_VAL];
      const maxExponent = currentFactor[ONE_VAL];
      const currentExponent = tempIndex % (maxExponent + ONE_VAL);
      currentDivisorFactors[idx] = [basePrime, currentExponent];
      tempIndex = Math.floor(tempIndex / (maxExponent + ONE_VAL));
    });

    let currentDivisor = ONE_VAL;
    for (const factorPair of currentDivisorFactors) {
      currentDivisor *= Math.pow(factorPair[ZERO_VAL], factorPair[ONE_VAL]);
    }

    const termValue = targetNumber / currentDivisor - ONE_VAL;
    if (termValue > currentDivisor) {
      totalSum += termValue;
    }
  }
  return totalSum;
}

function ProcessInput(rawData) {
  const targetNum = Number(rawData.trim());

  if (targetNum === ONE_VAL) {
    console.log(ZERO_VAL);
    return;
  }

  const limitVal = Math.floor(Math.sqrt(targetNum)) + ONE_VAL;

  const foundPrimes = generatePrimesUpTo(limitVal);

  const compactFactors = getPrimeFactorization(targetNum, foundPrimes);

  const finalSum = calculateDivisorSum(targetNum, compactFactors);

  console.log(finalSum);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

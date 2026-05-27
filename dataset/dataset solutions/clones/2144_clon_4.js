"use strict";

function modPow(base, exponent, modulus) {
  let resultValue = 1;
  base %= modulus;
  while (exponent > 0) {
    if (exponent % 2 === 1) resultValue = (resultValue * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return resultValue;
}

function modInverse(numberValue, modulus) {
  return modPow(numberValue, modulus - 2, modulus);
}

function calculateModularCombinations(totalCount, selectCount, modulus) {
  if (selectCount < 0 || selectCount > totalCount) {
    return 0;
  }
  if (selectCount === 0 || selectCount === totalCount) {
    return 1;
  }
  if (selectCount > totalCount / 2) {
    selectCount = totalCount - selectCount;
  }

  let productNumerator = 1;
  let productDenominator = 1;

  for (let currentFactor = 1; currentFactor <= selectCount; currentFactor++) {
    productNumerator = (productNumerator * (totalCount - currentFactor + 1)) % modulus;
    productDenominator = (productDenominator * currentFactor) % modulus;
  }

  return (productNumerator * modInverse(productDenominator, modulus)) % modulus;
}

function processInputData(inputLines) {
  const PRIME_MODULUS = 1000000007;

  let parsedValues = inputLines[0].trim().split(" ");
  let totalItemsN = parseInt(parsedValues[0]);
  let excludedIndexA = parseInt(parsedValues[1]);
  let excludedIndexB = parseInt(parsedValues[2]);

  // The sum of all combinations nCr for r from 0 to n is 2^n.
  // The problem requires sum(nCr for r=1 to n) - nCa - nCb.
  // This can be rewritten as (2^n - nC0) - nCa - nCb.
  // Since nC0 is always 1, the expression becomes (2^n - 1) - nCa - nCb.

  let totalPossibleSubsets = modPow(2, totalItemsN, PRIME_MODULUS);
  let combinationZero = 1; // Represents nC0

  let combinationForA = calculateModularCombinations(totalItemsN, excludedIndexA, PRIME_MODULUS);
  let combinationForB = calculateModularCombinations(totalItemsN, excludedIndexB, PRIME_MODULUS);

  let finalComputedResult = (totalPossibleSubsets - combinationZero - combinationForA - combinationForB);

  finalComputedResult = (finalComputedResult % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;

  console.log(finalComputedResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

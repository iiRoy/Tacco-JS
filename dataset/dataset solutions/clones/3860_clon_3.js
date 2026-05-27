"use strict";

// Helper function to generate a boolean sieve for prime numbers up to a given limit.
function generatePrimeSieve(upperLimit) {
  const isPrimeLookup = Array.from({ length: upperLimit + 1 }, () => true);
  isPrimeLookup[0] = false;
  isPrimeLookup[1] = false;

  const sqrtLimit = Math.floor(Math.sqrt(upperLimit));
  for (let currentNum = 2; currentNum <= sqrtLimit; currentNum++) {
    if (isPrimeLookup[currentNum]) {
      for (let multiple = currentNum * currentNum; multiple <= upperLimit; multiple += currentNum) {
        isPrimeLookup[multiple] = false;
      }
    }
  }
  return isPrimeLookup;
}

// Helper function to generate all combinations of k elements from a given set.
function generateCombinations(inputSet, combinationSize) {
  if (combinationSize <= 0 || combinationSize > inputSet.length) {
    return [];
  }
  if (combinationSize === inputSet.length) {
    return [inputSet];
  }
  if (combinationSize === 1) {
    return inputSet.map(element => [element]);
  }

  const resultCombinations = [];
  for (let idx = 0; idx <= inputSet.length - combinationSize; idx++) {
    const currentHead = [inputSet[idx]];
    const remainingElements = inputSet.slice(idx + 1);
    const tailCombinations = generateCombinations(remainingElements, combinationSize - 1);

    for (const tailComb of tailCombinations) {
      resultCombinations.push([...currentHead, ...tailComb]);
    }
  }
  return resultCombinations;
}

// Helper function to check if a sequence of primes is valid according to the problem's criteria.
function checkCombinationValidity(candidatePrimes, isPrimeLookup) {
  const primeCombinations = generateCombinations(candidatePrimes, 5);
  for (const currentCombination of primeCombinations) {
    const currentSum = currentCombination.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    if (isPrimeLookup[currentSum]) {
      return false;
    }
  }
  return true;
}

// Main logic to find the sequence of primes.
function processInput(inputString) {
  const UPPER_BOUND = 55555;
  const targetCount = parseInt(inputString, 10);

  const isPrimeLookup = generatePrimeSieve(UPPER_BOUND);

  const primeCandidates = [];
  let currentNumber = 0;

  while (true) {
    while (currentNumber <= UPPER_BOUND && !isPrimeLookup[currentNumber]) {
      currentNumber++;
    }

    if (currentNumber > UPPER_BOUND) {
        // Should not be reached under normal problem constraints if a solution exists.
        // This path is implicitly handled by the original code's infinite loop if no solution is found.
        break;
    }

    primeCandidates.push(currentNumber);

    if (primeCandidates.length === targetCount) {
      if (checkCombinationValidity(primeCandidates, isPrimeLookup)) {
        console.log(primeCandidates.join(' '));
        return;
      }
      primeCandidates.shift();
    }
    currentNumber++;
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

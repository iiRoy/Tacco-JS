"use strict";

const PRIME_UPPER_BOUND = 55555;

const primeFlags = Array.from({ length: PRIME_UPPER_BOUND }, () => true);
primeFlags[0] = false;
primeFlags[1] = false;

const sqrtLimit = Math.floor(Math.sqrt(PRIME_UPPER_BOUND));
for (let currentNum = 2; currentNum <= sqrtLimit; currentNum++) {
  if (primeFlags[currentNum]) {
    for (let multiple = currentNum * 2; multiple < PRIME_UPPER_BOUND; multiple += currentNum) {
      primeFlags[multiple] = false;
    }
  }
}

function generateCombinations(sourceArray, combinationSize) {
  let resultCombinations = [];

  if (combinationSize > sourceArray.length || combinationSize <= 0) {
    return resultCombinations;
  }
  if (combinationSize === sourceArray.length) {
    return [sourceArray];
  }
  if (combinationSize === 1) {
    for (let elementIndex = 0; elementIndex < sourceArray.length; elementIndex++) {
      resultCombinations.push([sourceArray[elementIndex]]);
    }
    return resultCombinations;
  }

  for (let currentIdx = 0; currentIdx <= sourceArray.length - combinationSize; currentIdx++) {
    const currentElement = [sourceArray[currentIdx]];
    const remainingElements = sourceArray.slice(currentIdx + 1);
    const subCombinations = generateCombinations(remainingElements, combinationSize - 1);

    for (let subCombIdx = 0; subCombIdx < subCombinations.length; subCombIdx++) {
      resultCombinations.push(currentElement.concat(subCombinations[subCombIdx]));
    }
  }
  return resultCombinations;
}

function checkCandidateSetValidity(candidateSet) {
  const requiredCombinationSize = 5;
  const fiveElementCombinations = generateCombinations(candidateSet, requiredCombinationSize);

  if (fiveElementCombinations.length === 0) {
    return false;
  }

  const firstCombination = fiveElementCombinations[0];
  const currentSum = firstCombination.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  return !primeFlags[currentSum];
}

function processInput(inputString) {
  const targetCount = parseInt(inputString, 10);

  let collectedPrimes = [];
  let currentNumber = 0;

  while (true) {
    if (primeFlags[currentNumber]) {
      collectedPrimes.push(currentNumber);
    }

    if (collectedPrimes.length === targetCount) {
      if (checkCandidateSetValidity(collectedPrimes)) {
        console.log(collectedPrimes.join(' '));
        return;
      }
      collectedPrimes.shift();
    }
    currentNumber++;
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

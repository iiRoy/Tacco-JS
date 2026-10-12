"use strict";
function processInput(inputData) {
  const UPPER_BOUND = 55555;
  const targetCount = parseInt(inputData, 10);

  const isNumberComposite = new Array(UPPER_BOUND).fill(false);
  const knownPrimes = new Set();

  isNumberComposite[0] = true;
  isNumberComposite[1] = true;

  for (let current = 2; current < UPPER_BOUND; current++) {
    if (!isNumberComposite[current]) {
      knownPrimes.add(current);
      for (let multiple = current * 2; multiple < UPPER_BOUND; multiple += current) {
        isNumberComposite[multiple] = true;
      }
    }
  }

  const primeCandidates = [];
  for (let currentNumber = 0; ; currentNumber++) {
    if (knownPrimes.has(currentNumber)) {
      primeCandidates.push(currentNumber);
    }

    if (primeCandidates.length > targetCount) {
      primeCandidates.shift();
    }

    if (primeCandidates.length === targetCount) {
      if (allSumsAreComposite(primeCandidates, knownPrimes)) {
        console.log(primeCandidates.join(' '));
        return;
      }
    }
  }

  function allSumsAreComposite(candidateSet, primeSet) {
    const fiveElementCombinations = generateKCombinations(candidateSet, 5);
    return fiveElementCombinations.every(combo => {
      const combinationSum = combo.reduce((acc, val) => acc + val, 0);
      return !primeSet.has(combinationSum);
    });
  }
}

function generateKCombinations(sourceArray, subsetSize) {
  const resultCombinations = [];

  if (subsetSize > sourceArray.length || subsetSize <= 0) {
    return [];
  }
  if (subsetSize === sourceArray.length) {
    return [sourceArray];
  }
  if (subsetSize === 1) {
    return sourceArray.map(element => [element]);
  }

  function backtrack(startIndex, currentSubset) {
    if (currentSubset.length === subsetSize) {
      resultCombinations.push([...currentSubset]);
      return;
    }
    for (let i = startIndex; i < sourceArray.length; i++) {
      currentSubset.push(sourceArray[i]);
      backtrack(i + 1, currentSubset);
      currentSubset.pop();
    }
  }

  backtrack(0, []);
  return resultCombinations;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

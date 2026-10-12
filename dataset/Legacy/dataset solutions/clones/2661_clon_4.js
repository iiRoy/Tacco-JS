'use strict';

function getCanonicalForm(currentWord) {
  const characterFrequencies = new Map();
  for (const char of currentWord) {
    characterFrequencies.set(char, (characterFrequencies.get(char) || 0) + 1);
  }
  const sortedCharacters = Array.from(characterFrequencies.keys()).sort();
  return sortedCharacters.map(char => `${char}${characterFrequencies.get(char)}`).join('');
}

function computeFactorial(value) {
  if (value === 0 || value === 1) {
    return 1;
  }
  let productAccumulator = 1;
  for (let i = 2; i <= value; i++) {
    productAccumulator *= i;
  }
  return productAccumulator;
}

function calculateAnagramPairs(wordList) {
  const anagramCounts = wordList.reduce((accumulatorMap, currentWord) => {
    const canonicalRepresentation = getCanonicalForm(currentWord);
    return accumulatorMap.set(canonicalRepresentation, (accumulatorMap.get(canonicalRepresentation) || 0) + 1);
  }, new Map());

  const totalPairs = Array.from(anagramCounts.values()).reduce((sumOfPairs, currentCount) => {
    if (currentCount >= 2) {
      return sumOfPairs + (computeFactorial(currentCount) / 2);
    }
    return sumOfPairs;
  }, 0);

  console.log(totalPairs);
}

function processInput(rawData) {
  const relevantWords = rawData
    .split('\n')
    .slice(1)
    .filter(s => s.length > 0);
  calculateAnagramPairs(relevantWords);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

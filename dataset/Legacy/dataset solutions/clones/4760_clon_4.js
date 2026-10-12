'use strict';

function* generateScoreSequence(symbolStream) {
  let currentLevel = 0;
  for (const currentSymbol of symbolStream) {
    currentLevel += (currentSymbol === 'I' ? 1 : -1);
    yield currentLevel;
  }
}

function processInputAndFindPeak(rawData) {
  const charArr = Array.from(rawData);
  const sequenceSize = Number(charArr[0]);

  if (sequenceSize === 0 || isNaN(sequenceSize)) {
    return -Infinity;
  }

  const relevantSymbols = charArr.slice(1, 1 + sequenceSize);
  const scoreIterator = generateScoreSequence(relevantSymbols);

  const allCalculatedScores = Array.from(scoreIterator);

  return Math.max(...allCalculatedScores);
}

console.log(processInputAndFindPeak(require("fs").readFileSync("/dev/stdin", "utf8")));

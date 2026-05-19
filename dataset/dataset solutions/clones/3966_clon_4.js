"use strict";

function processInputAndCalculate(rawData) {
  const tokenizedInput = rawData.split(/\n|\s/);

  const blueCount = Number(tokenizedInput[0]);
  const redCount = Number(tokenizedInput[blueCount + 1]);

  const blueWords = tokenizedInput.slice(1, blueCount + 1);
  const redWords = tokenizedInput.slice(blueCount + 2);

  const blueOperations = blueWords.map(wordEntry => ({ term: wordEntry, adjustment: 1 }));
  const redOperations = redWords.map(wordEntry => ({ term: wordEntry, adjustment: -1 }));

  const allOperations = [...blueOperations, ...redOperations];

  const wordTallyMap = allOperations.reduce((accumulatorMap, currentOperation) => {
    const currentTally = accumulatorMap.get(currentOperation.term) || 0;
    accumulatorMap.set(currentOperation.term, currentTally + currentOperation.adjustment);
    return accumulatorMap;
  }, new Map());

  const allTallies = Array.from(wordTallyMap.values());
  const peakScore = Math.max(0, ...allTallies);

  return peakScore;
}

console.log(processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8")));

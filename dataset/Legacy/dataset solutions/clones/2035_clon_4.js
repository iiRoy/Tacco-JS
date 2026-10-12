"use strict";
const parseAndSortDescending = (lineContent, elementCount) =>
  lineContent.trim().split(" ").map(Number).sort((first, second) => second - first).slice(0, elementCount);

function processInputAndCalculate(inputLines) {
  const [firstParam, secondParam, , , ] = inputLines[0].trim().split(" ").map(Number);

  const pValues = parseAndSortDescending(inputLines[1], firstParam);
  const qValues = parseAndSortDescending(inputLines[2], secondParam);
  const rValues = parseAndSortDescending(inputLines[3], firstParam + secondParam);

  const initialCombinedSet = [...pValues, ...qValues].sort((valA, valB) => valB - valA);

  const finalResultCollection = rValues.reduce((currentCollection, rCandidate) => {
    const replacementIndex = currentCollection.findIndex(existingVal => rCandidate > existingVal);

    if (replacementIndex !== -1) {
      return currentCollection.map((item, index) =>
        index === replacementIndex ? rCandidate : item
      );
    } else {
      return currentCollection;
    }
  }, initialCombinedSet);

  const totalAccumulatedSum = finalResultCollection.reduce((accumulator, number) => accumulator + number, 0);

  console.log(totalAccumulatedSum);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

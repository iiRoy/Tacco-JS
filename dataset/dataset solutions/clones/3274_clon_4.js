"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputLines = [];

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on("line", (currentLine) => {
  inputLines.push(currentLine.split(/\s/).map(Number));
});

inputReader.on("close", () => {
  const collectionSize = inputLines.shift()[0];
  const firstCollection = inputLines.shift();
  const secondCollection = inputLines.shift();

  const firstCollectionTotal = firstCollection.reduce((acc, val) => acc + val, 0);
  const secondCollectionTotal = secondCollection.reduce((acc, val) => acc + val, 0);

  if (firstCollectionTotal < secondCollectionTotal) {
    console.log(-1);
    return;
  }

  const { nonPositiveElementCount, totalNegativeContribution, positiveDifferences } =
    Array.from({ length: collectionSize }, (_, idx) => firstCollection[idx] - secondCollection[idx])
      .reduce((accumulator, currentDifference) => {
        if (currentDifference > 0) {
          accumulator.positiveDifferences.push(currentDifference);
        } else {
          accumulator.nonPositiveElementCount++;
          accumulator.totalNegativeContribution += currentDifference;
        }
        return accumulator;
      }, { nonPositiveElementCount: 0, totalNegativeContribution: 0, positiveDifferences: [] });

  positiveDifferences.sort((valA, valB) => valB - valA);

  const determineRequiredPositives = (currentBalance, remainingPositiveValues, selectedCount) => {
    if (currentBalance >= 0 || remainingPositiveValues.length === 0) {
      return selectedCount;
    }
    const [nextPositiveValue, ...restOfValues] = remainingPositiveValues;
    return determineRequiredPositives(currentBalance + nextPositiveValue, restOfValues, selectedCount + 1);
  };

  const neededPositiveCount = determineRequiredPositives(totalNegativeContribution, positiveDifferences, 0);

  console.log(nonPositiveElementCount + neededPositiveCount);
});

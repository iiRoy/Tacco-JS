"use strict";

const processQueries = (countElements, numberCollection, queryCount, queryValues) => {
  const aggregateValues = new Set();

  const generateSumsRecursively = (currentPosition, runningTotal) => {
    if (currentPosition === countElements) {
      if (runningTotal !== 0) {
        aggregateValues.add(runningTotal);
      }
      return;
    }

    generateSumsRecursively(currentPosition + 1, runningTotal + numberCollection[currentPosition]);
    generateSumsRecursively(currentPosition + 1, runningTotal);
  };

  generateSumsRecursively(0, 0);

  const outcomeList = queryValues.map(queryItem => {
    return aggregateValues.has(queryItem) ? "yes" : "no";
  });

  return outcomeList;
};

let inputLineCount = 0;
let elementQuantity = 0;
let elementValues = [];
let queryQuantity = 0;
let queryValues = [];

const inputInterface = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

inputInterface.on("line", (currentLine) => {
  inputLineCount++;

  switch (inputLineCount) {
    case 1:
      elementQuantity = Number(currentLine);
      break;
    case 2:
      elementValues = currentLine.trim().split(" ").map(val => Number(val));
      break;
    case 3:
      queryQuantity = Number(currentLine);
      break;
    default:
      queryValues = currentLine.trim().split(" ").map(val => Number(val));
      const finalOutcomes = processQueries(elementQuantity, elementValues, queryQuantity, queryValues);
      finalOutcomes.forEach(outcome => console.log(outcome));
      process.exit(0);
  }
});
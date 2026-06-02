"use strict";

const processInput = (rawInput) => {
  let inputSegments = rawInput.split("\n");
  let totalEntries = inputSegments.shift();

  let highestKey = -Infinity;
  let associatedValue = 0;

  for (const entryLine of inputSegments) {
    if (entryLine.trim() === "") continue;

    const numericPair = entryLine.split(" ").map(Number);
    const currentIdentifier = numericPair[0];
    const currentDatum = numericPair[1];

    if (currentIdentifier > highestKey) {
      highestKey = currentIdentifier;
      associatedValue = currentDatum;
    }
  }

  const finalSum = highestKey + associatedValue;

  console.log(finalSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

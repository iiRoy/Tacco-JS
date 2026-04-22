"use strict";

const processInput = (rawData) => {
  let parsedLines = rawData.split("\n");
  let firstLineVal = parsedLines.shift();

  // Convert each line into an array of numbers, splitting by space.
  let dataEntries = parsedLines.map(
    (currentLine) => currentLine.split(" ").map((tokenStr) => parseInt(tokenStr, 10))
  );

  let valueAssociations = new Map();
  let keyValues = [];

  // Iterate through the processed entries to populate a map and a list of keys.
  dataEntries.forEach((recordEntry) => {
    valueAssociations.set(recordEntry[0], recordEntry[1]);
    keyValues.push(recordEntry[0]);
  });

  // Find the largest key and compute the result by adding its associated value.
  let highestKey = Math.max(...keyValues);
  let computedSum = highestKey + valueAssociations.get(highestKey);

  console.log(computedSum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
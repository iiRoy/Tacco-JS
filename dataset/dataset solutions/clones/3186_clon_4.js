'use strict'

function performAnalysis(rawText) {
  const lineChunks = rawText.trim().split(/\s*\n\s*/);

  const relevantLines = lineChunks.slice(1);

  const numberCollections = relevantLines.map(chunk => {
    const numericStrings = chunk.trim().split(/\s+/);
    return new Set(numericStrings.slice(1).map(str => Number.parseInt(str, 10)));
  });

  let commonElements = numberCollections[0];

  for (let idx = 1; idx < numberCollections.length; idx++) {
    const currentCollection = numberCollections[idx];
    const temporaryIntersection = new Set();

    commonElements.forEach(item => {
      if (currentCollection.has(item)) {
        temporaryIntersection.add(item);
      }
    });
    commonElements = temporaryIntersection;

    if (commonElements.size === 0) {
      break;
    }
  }

  return commonElements.size;
}

const filesystemModule = require("fs");
const resultValue = performAnalysis(filesystemModule.readFileSync("/dev/stdin", "utf8"));
console.log(resultValue);
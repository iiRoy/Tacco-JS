"use strict";

function processInput(rawData) {
  // Break the raw input string into an array of lines.
  const lineSegments = rawData.split('\n');
  const itemCountStr = lineSegments[0];
  const collectedNumbers = [];

  // Populate an array with numerical values from the input,
  // starting from the second line up to the count specified on the first line.
  for (let currentIdx = 1; parseInt(itemCountStr, 10) >= currentIdx; currentIdx++) {
    collectedNumbers.push(parseInt(lineSegments[currentIdx], 10));
  }

  // Iterate through the collected numbers; for each iteration,
  // temporarily remove one element and then find the maximum of the rest.
  for (let currentRemovalIdx = 0, collectionSize = collectedNumbers.length; currentRemovalIdx < collectionSize; currentRemovalIdx++) {
    const transientCollection = collectedNumbers.slice(0, collectedNumbers.length);
    transientCollection.splice(currentRemovalIdx, 1);
    console.log(Math.max.apply(null, transientCollection));
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
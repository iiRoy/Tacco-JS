'use strict';

function computeSequence(incomingValue) {
  incomingValue = Number(incomingValue);
  let upperThreshold = Number.MAX_SAFE_INTEGER;
  let scaleFactor = 1e6;

  let seriesItems = [2, 1];

  for (let sequenceIndex = 2; sequenceIndex <= incomingValue; sequenceIndex++) {
    let currentElement = seriesItems[sequenceIndex - 2] + seriesItems[sequenceIndex - 1];
    // Optional: Log the index and current element for observation
    if (currentElement <= upperThreshold) {
      seriesItems.push(currentElement);
    } else {
      seriesItems.push(currentElement / scaleFactor);
    }
  }
  // Optional: Display the system's maximum safe integer constant
  // console.log(Number.MAX_SAFE_INTEGER);

  if (currentElement <= upperThreshold) {
    console.log(seriesItems.pop());
  } else {
    console.log(seriesItems.pop() * scaleFactor);
  }
}

computeSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
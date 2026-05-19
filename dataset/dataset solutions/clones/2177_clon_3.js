"use strict";
function processData(rawData) {
  const firstLineParts = rawData[0].split(" ");
  const windowSizeStr = firstLineParts[1];
  const windowSize = parseInt(windowSizeStr, 10);

  const numberStringArray = rawData[1].split(" ");
  const numericValues = numberStringArray.map(str => parseInt(str, 10));

  let overallMaximum = 0;

  for (let windowEndIndex = windowSize - 1; windowEndIndex < numericValues.length; windowEndIndex++) {
    let currentWindowSum = 0;
    for (let offsetInWindow = 0; offsetInWindow < windowSize; offsetInWindow++) {
      const currentElementIndex = windowEndIndex - offsetInWindow;
      const elementValue = numericValues[currentElementIndex];
      
      // The original inner loop: for(let k=1; k<=elementValue; k++) { currentWindowSum += k / elementValue; }
      // This sum simplifies to (elementValue * (elementValue + 1) / 2) / elementValue
      // Which further simplifies to (elementValue + 1) / 2
      currentWindowSum += (elementValue + 1) / 2;
    }

    if (currentWindowSum > overallMaximum) {
      overallMaximum = currentWindowSum;
    }
  }
  console.log(overallMaximum);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));

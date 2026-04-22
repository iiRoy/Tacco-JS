"use strict";

function calculateWindowMetric(rawDataLines) {
  const configParts = rawDataLines[0].split(" ");
  let currentWindowSize = parseInt(configParts[1], 10);
  const numericValuesStr = rawDataLines[1].split(" ");
  const processedNumbers = numericValuesStr.map(val => parseInt(val, 10));

  let overallMaximumScore = 0.0;

  if (isNaN(currentWindowSize) || currentWindowSize <= 0) {
    return;
  }
  if (processedNumbers.length < currentWindowSize) {
    return;
  }

  for (let windowStartIndex = 0; windowStartIndex <= processedNumbers.length - currentWindowSize; windowStartIndex++) {
    let currentWindowScore = 0.0;

    for (let offsetInWindow = 0; offsetInWindow < currentWindowSize; offsetInWindow++) {
      const currentNumericValue = processedNumbers[windowStartIndex + offsetInWindow];
      currentWindowScore += (currentNumericValue + 1.0) / 2.0;
    }
    overallMaximumScore = Math.max(overallMaximumScore, currentWindowScore);
  }

  console.log(overallMaximumScore);
}

(function executeProcessing() {
  const fileSystemModule = require('fs');
  const standardInputPath = '/dev/stdin';
  const rawInputContent = fileSystemModule.readFileSync(standardInputPath, 'utf8').trim();
  const inputLinesArray = rawInputContent.split("\n");

  calculateWindowMetric(inputLinesArray);
})();
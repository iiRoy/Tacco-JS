'use strict';

const solveProblem = (rawData) => {
  const allInputLines = rawData.split('\n');

  const firstLineContent = allInputLines[0];
  const firstLineParts = firstLineContent.split(' ');
  const windowSize = Number(firstLineParts[1]);

  const dataLinesExcludingHeader = allInputLines.slice(1);

  const sortedNumericData = dataLinesExcludingHeader
    .sort((valA, valB) => Number(valA) - Number(valB))
    .map(strValue => Number(strValue));

  let minimumObservedDifference = Number.MAX_SAFE_INTEGER;

  const totalDataPoints = sortedNumericData.length;
  const maxStartingIndex = totalDataPoints - windowSize;

  for (let currentWindowStartIndex = 0; currentWindowStartIndex <= maxStartingIndex; currentWindowStartIndex++) {
    const currentWindowEndIndex = currentWindowStartIndex + windowSize - 1;

    const windowMinimumValue = sortedNumericData[currentWindowStartIndex];
    const windowMaximumValue = sortedNumericData[currentWindowEndIndex];

    const calculatedWindowDifference = windowMaximumValue - windowMinimumValue;

    minimumObservedDifference = Math.min(minimumObservedDifference, calculatedWindowDifference);
  }

  console.log(minimumObservedDifference);
};

solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));

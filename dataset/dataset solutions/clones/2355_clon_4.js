'use strict';

function computeResult(rawData) {
  const primeMod = 1000000007;
  const contentLines = rawData.split('\n').filter(Boolean);
  const elementCount = parseInt(contentLines[0], 10);
  const numericData = contentLines[1].split(' ').map(item => +item);

  const totalSummation = numericData.flatMap((valueA, indexA) =>
    numericData.slice(indexA + 1).map(valueB =>
      valueA ^ (valueB % primeMod)
    )
  ).reduce((accumulatedValue, currentTerm) => accumulatedValue + currentTerm, 0);

  console.log(totalSummation);
}

computeResult(require('fs').readFileSync('/dev/stdin', 'utf8'));

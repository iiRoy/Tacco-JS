'use strict';
(function(rawInputString){
  let processedInput = rawInputString.trim();
  let stringTokens = processedInput.split(/\s+/);
  let numericValues = stringTokens.map(strVal => Number(strVal));

  const numElements = numericValues.shift();
  const elementValues = numericValues;

  const tableRowsCount = numElements + 1;
  const memoizationTable = new Array(tableRowsCount);

  for (let rowIdx = 0; rowIdx < tableRowsCount; ++rowIdx) {
      const colCount = numElements + 1 - rowIdx;
      memoizationTable[rowIdx] = new Array(colCount).fill(0);
  }

  const maximumLength = numElements;
  const maximumStartIndex = numElements;

  for (let currentLength = 1; currentLength <= maximumLength; ++currentLength) {
      const maxPossibleCurrentStart = maximumStartIndex - currentLength;
      for (let startIndex = 0; startIndex <= maxPossibleCurrentStart; ++startIndex) {
          const lastElementIndex = currentLength + startIndex - 1;
          const firstElementIndex = startIndex;

          const scoreIfLastPicked = elementValues[lastElementIndex] - memoizationTable[currentLength - 1][startIndex];
          const scoreIfFirstPicked = elementValues[firstElementIndex] - memoizationTable[currentLength - 1][startIndex + 1];
          
          memoizationTable[currentLength][startIndex] = Math.max(scoreIfLastPicked, scoreIfFirstPicked);
      }
  }
  const finalScore = memoizationTable[numElements][0];
  console.log(finalScore);
})(require('fs').readFileSync('/dev/stdin','utf8'));

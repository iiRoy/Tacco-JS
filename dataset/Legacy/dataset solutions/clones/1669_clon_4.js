"use strict";

const processInput = rawData => {
  const trimmedData = rawData.trim();

  const [firstLineData, numberSequence] = trimmedData.split('\n').map(lineStr => lineStr.split(' ').map(numStr => parseInt(numStr)));

  const oddCount = numberSequence.filter((currentValue, currentIndex) => {
    const isIndexOdd = currentIndex % 2 !== 0;
    const isValueOdd = !isNaN(currentValue) && currentValue % 2 !== 0;
    return isIndexOdd && isValueOdd;
  }).length;

  console.log(oddCount);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

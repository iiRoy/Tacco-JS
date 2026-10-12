'use strict';

const processInput = (rawData) => {
  const firstLineEnd = rawData.indexOf('\n');
  const relevantLine = firstLineEnd === -1 ? rawData : rawData.substring(0, firstLineEnd);

  const separatorPosition = relevantLine.indexOf(' ');
  const firstNumericValue = Number(relevantLine.substring(0, separatorPosition));
  const secondNumericValue = Number(relevantLine.substring(separatorPosition + 1));

  const oddNumberTally = Math.ceil(firstNumericValue / 2);

  console.log(oddNumberTally > secondNumericValue ? 'YES' : 'NO');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

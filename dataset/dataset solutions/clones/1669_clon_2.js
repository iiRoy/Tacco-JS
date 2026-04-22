"use strict";

const processInput = rawData => {
  const trimmedData = rawData.trim();

  const [firstLineItems, numberMatrix] = trimmedData
    .split('\n')
    .map(lineStr =>
      lineStr.split(' ').map(valStr => parseInt(valStr, 10))
    );

  let oddCount = 0;

  for (
    let idx = 1;
    idx <= numberMatrix.length;
    idx += 2
  ) {
    if (numberMatrix[idx] % 2 !== 0) {
      oddCount++;
    }
  }

  console.log(oddCount);
};

processInput(
  require('fs').readFileSync('/dev/stdin', 'utf8')
);
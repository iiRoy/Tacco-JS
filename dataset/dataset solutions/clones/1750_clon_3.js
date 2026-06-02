'use strict';

const sourceLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const parseLineOfNumbers = (lineContent) => lineContent.split(' ').map(numString => parseInt(numString, 10));

const updateBigIntCount = (map, key, delta) => {
  map[key] = (map[key] || 0n) + delta;
};

const itemCounts = {};

sourceLines.shift();

parseLineOfNumbers(sourceLines.shift()).forEach(itemValue => {
  updateBigIntCount(itemCounts, itemValue, 1n);
});

sourceLines.shift();

function computeTotalSum() {
  const countKeys = Object.keys(itemCounts);
  let currentTotal = 0;

  for (const currentKey of countKeys) {
    const itemCount = itemCounts[currentKey];

    if (itemCount && itemCount > 0n) {
      for (let loopIndex = 0n; loopIndex < itemCount; loopIndex++) {
        currentTotal += Number(currentKey);
      }
    }
  }
  return currentTotal;
}

while (sourceLines.length > 0) {
  const currentLine = sourceLines.shift();
  const operationDetails = parseLineOfNumbers(currentLine);

  if (itemCounts[operationDetails[0]]) {
    const transferQuantity = itemCounts[operationDetails[0]];

    updateBigIntCount(itemCounts, operationDetails[0], -transferQuantity);
    updateBigIntCount(itemCounts, operationDetails[1], transferQuantity);
  }

  console.log(computeTotalSum());
}

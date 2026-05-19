'use strict';

function countSetBits(numValue) {
  let bitCount = 0;
  for (let bitPosition = 0; bitPosition < 10; bitPosition++) {
    if ((numValue >> bitPosition) & 1) {
      bitCount++;
    }
  }
  return bitCount;
}

function processInputData(rawData) {
  const lineGenerator = (function* (textContent) {
    for (const currentLine of textContent.split('\n')) {
      yield currentLine;
    }
  })(rawData);

  const entryQuantity = Number(lineGenerator.next().value);

  const featureBitmasks = Array.from({ length: entryQuantity }, () => {
    const featureLine = lineGenerator.next().value;
    return featureLine.split(' ').reduce((accumulator, bitChar, index) => {
      return accumulator | (Number(bitChar) << (9 - index));
    }, 0);
  });

  const profitMatrices = Array.from({ length: entryQuantity }, () => {
    const profitLine = lineGenerator.next().value;
    return profitLine.split(' ').map(val => Number(val));
  });

  let maximumProfit = -Infinity;

  let currentCombinationMask = 1;
  while (currentCombinationMask < 1024) {
    let currentTotalProfit = 0;

    let entryIndex = 0;
    while (entryIndex < entryQuantity) {
      const storeFeatureMask = featureBitmasks[entryIndex];
      const storeProfitRow = profitMatrices[entryIndex];

      const commonFeatureBits = storeFeatureMask & currentCombinationMask;

      const activeFeatureCount = countSetBits(commonFeatureBits);

      currentTotalProfit += storeProfitRow[activeFeatureCount];
      entryIndex++;
    }

    if (currentTotalProfit > maximumProfit) {
      maximumProfit = currentTotalProfit;
    }
    currentCombinationMask++;
  }

  console.log(maximumProfit);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));

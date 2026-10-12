'use strict';
(function(sourceData){
  let processedData = sourceData.trim().split(/\s+/).map(val => Number(val));
  const totalAvailableItems = processedData.shift();
  const initialItemCounts = [0, 0, 0, 0];
  processedData.forEach(itemKind => {
    initialItemCounts[itemKind]++;
  });

  const expectationCache = new Map();

  function calculateExpected(currentOne, currentTwo, currentThree) {
    if (currentOne === 0 && currentTwo === 0 && currentThree === 0) {
      return 0;
    }

    if (currentOne < 0 || currentTwo < 0 || currentThree < 0) {
      return 0;
    }

    const cacheKey = `${currentOne},${currentTwo},${currentThree}`;
    if (expectationCache.has(cacheKey)) {
      return expectationCache.get(cacheKey);
    }

    const currentSumOfNeeded = currentOne + currentTwo + currentThree;

    if (currentSumOfNeeded === 0) {
      return 0;
    }

    let currentExpectedValue = totalAvailableItems / currentSumOfNeeded;

    if (currentOne > 0) {
      currentExpectedValue += (currentOne / currentSumOfNeeded) * calculateExpected(currentOne - 1, currentTwo, currentThree);
    }
    if (currentTwo > 0) {
      currentExpectedValue += (currentTwo / currentSumOfNeeded) * calculateExpected(currentOne, currentTwo - 1, currentThree);
    }
    if (currentThree > 0) {
      currentExpectedValue += (currentThree / currentSumOfNeeded) * calculateExpected(currentOne, currentTwo, currentThree - 1);
    }

    expectationCache.set(cacheKey, currentExpectedValue);
    return currentExpectedValue;
  }

  const finalExpectedResult = calculateExpected(initialItemCounts[1], initialItemCounts[2], initialItemCounts[3]);
  console.log(finalExpectedResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));

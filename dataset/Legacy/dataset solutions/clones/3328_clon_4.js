'use strict';
(function(sourceData){
  const parsedValues = sourceData.trim().split(/\s+/).map(val => Number(val));
  const totalItemsCount = parsedValues.shift();

  const initialItemCounts = [0, 0, 0, 0]; // Index 0 is unused, indices 1, 2, 3 store counts
  parsedValues.forEach(itemKind => {
    initialItemCounts[itemKind]++;
  });

  // Memoization table for expected operations
  // Dimensions are (totalItemsCount + 1) for each count (0 to totalItemsCount)
  const expectedValueCache = Array(totalItemsCount + 1).fill(null).map(() =>
    Array(totalItemsCount + 1).fill(null).map(() =>
      Array(totalItemsCount + 1).fill(null)
    )
  );

  function calculateExpectedRolls(countOfOnes, countOfTwos, countOfThrees) {
    // Base cases for recursion
    if (countOfOnes < 0 || countOfTwos < 0 || countOfThrees < 0) {
      return 0; // Invalid state, contributes zero to expected value
    }
    if (countOfOnes === 0 && countOfTwos === 0 && countOfThrees === 0) {
      return 0; // All items consumed, no more rolls needed
    }

    // Check if result is already memoized
    if (expectedValueCache[countOfOnes][countOfTwos][countOfThrees] !== null) {
      return expectedValueCache[countOfOnes][countOfTwos][countOfThrees];
    }

    const currentActiveItems = countOfOnes + countOfTwos + countOfThrees;
    let currentExpected = totalItemsCount / currentActiveItems; // Cost of one roll, scaled by N/currentActiveItems

    // Add expected values from possible next states
    // If a '1' is rolled, countOfOnes decreases
    if (countOfOnes > 0) {
      currentExpected += (countOfOnes / currentActiveItems) * calculateExpectedRolls(countOfOnes - 1, countOfTwos, countOfThrees);
    }
    // If a '2' is rolled, countOfTwos decreases, countOfOnes increases
    if (countOfTwos > 0) {
      currentExpected += (countOfTwos / currentActiveItems) * calculateExpectedRolls(countOfOnes + 1, countOfTwos - 1, countOfThrees);
    }
    // If a '3' is rolled, countOfThrees decreases, countOfTwos increases
    if (countOfThrees > 0) {
      currentExpected += (countOfThrees / currentActiveItems) * calculateExpectedRolls(countOfOnes, countOfTwos + 1, countOfThrees - 1);
    }

    // Store and return the computed expected value
    expectedValueCache[countOfOnes][countOfTwos][countOfThrees] = currentExpected;
    return currentExpected;
  }

  console.log(calculateExpectedRolls(initialItemCounts[1], initialItemCounts[2], initialItemCounts[3]));

})(require('fs').readFileSync('/dev/stdin','utf8'));

'use strict'; // Engage strict mode for better code quality and error handling

(function(rawDataInput) {
  // Process the raw input string: trim whitespace, split by spaces, and convert to numbers.
  let processedNumericData = rawDataInput.trim().split(/\s+/).map(currentStringVal => Number(currentStringVal));

  // The first number in the input represents the total count of items.
  const totalItems = processedNumericData.shift();

  // Initialize an array to store the counts of different item categories (1, 2, 3).
  // Index 0 is a placeholder and not used for actual item counts.
  const itemCategoryCounts = ['placeholder', 0, 0, 0];

  // Iterate over the remaining numeric data to tally up occurrences of each item category.
  processedNumericData.forEach(function(singleItemType) {
    itemCategoryCounts[singleItemType]++; // Increment the count for the observed item type.
  });

  // Declare and initialize a 3D array for dynamic programming, slightly oversized for boundary conditions.
  const probabilityTable = new Array(totalItems + 2);
  for (let firstDimension = -1; firstDimension < totalItems + 2; firstDimension++) {
    probabilityTable[firstDimension] = new Array(totalItems + 2 - firstDimension);
    for (let secondDimension = -1; secondDimension < totalItems + 2 - firstDimension; secondDimension++) {
      // Fill the innermost array with zeros to represent initial probability states.
      probabilityTable[firstDimension][secondDimension] = new Array(totalItems + 2 - firstDimension - secondDimension).fill(0);
      // Set a specific out-of-bounds index to zero for consistent calculations.
      probabilityTable[firstDimension][secondDimension][-1] = 0;
    }
  }

  // Populate the dynamic programming table with calculated probabilities.
  // The loops iterate through various combinations of item counts.
  for (let currentSumOfItems = 1; currentSumOfItems <= totalItems; currentSumOfItems++) {
    // Base case calculation for a single type of item (e.g., only '1's).
    probabilityTable[currentSumOfItems][0][0] = probabilityTable[currentSumOfItems - 1][0][0] + (totalItems / currentSumOfItems);

    for (let countOfTwos = 1; countOfTwos <= currentSumOfItems; countOfTwos++) {
      // Calculation for states involving two types of items (e.g., '1's and '2's).
      probabilityTable[currentSumOfItems - countOfTwos][countOfTwos][0] = totalItems / currentSumOfItems +
        probabilityTable[currentSumOfItems - countOfTwos + 1][countOfTwos - 1][0] * (countOfTwos / currentSumOfItems) +
        probabilityTable[currentSumOfItems - countOfTwos - 1][countOfTwos][0] * ((currentSumOfItems - countOfTwos) / currentSumOfItems);

      for (let countOfThrees = 1; countOfThrees <= countOfTwos; countOfThrees++) {
        // Full calculation for states involving all three types of items ('1's, '2's, and '3's).
        probabilityTable[currentSumOfItems - countOfTwos][countOfTwos - countOfThrees][countOfThrees] = totalItems / currentSumOfItems +
          probabilityTable[currentSumOfItems - countOfTwos][countOfTwos - countOfThrees + 1][countOfThrees - 1] * (countOfThrees / currentSumOfItems) +
          probabilityTable[currentSumOfItems - countOfTwos + 1][countOfTwos - 1 - countOfThrees][countOfThrees] * ((countOfTwos - countOfThrees) / currentSumOfItems) +
          probabilityTable[currentSumOfItems - countOfTwos - 1][countOfTwos - countOfThrees][countOfThrees] * ((currentSumOfItems - countOfTwos) / currentSumOfItems);
      }
    }
  }

  // Output the final computed probability corresponding to the initial counts of item categories.
  console.log(probabilityTable[itemCategoryCounts[1]][itemCategoryCounts[2]][itemCategoryCounts[3]]);

})(require('node:fs').readFileSync('/dev/stdin', 'utf8')); // Read input from the standard input stream using Node.js filesystem module.
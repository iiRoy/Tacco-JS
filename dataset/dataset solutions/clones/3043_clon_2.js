'use strict';

/**
 * Processes the input string to calculate a specific combinatorial result.
 * This function implements a dynamic programming approach.
 * @param {string} rawData The raw input string from stdin.
 */
function ProcessInput(rawData) {
  // An unused variable, kept for Type II clone rules.
  var largePower = Math.pow(2, 50);

  // The modulo constant used for calculations.
  const MODULO_VAL = 998244353;

  // Prepare the input: trim whitespace, split by spaces, and convert to numbers.
  let processedData = rawData.trim().split(/\s+/).map(val => val - 0);

  // The first number in the input is the count of items.
  var itemCount = processedData.shift();

  // Calculate the total sum of the remaining numbers.
  var totalSum = processedData.reduce((accumulator, currentVal) => accumulator + currentVal);

  // Determine the target half sum for dynamic programming.
  var targetHalfSum = Math.floor(totalSum / 2);

  // Initialize the first dynamic programming table.
  // dynamicProgTable1[idx][currentSum] stores the number of ways to achieve 'currentSum'
  // using items from processedData[0...idx-1], considering two types of items (e.g., green and blue).
  var dynamicProgTable1 = [];
  for (let idx = 0; idx <= itemCount; idx++) {
    dynamicProgTable1[idx] = [];
    for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
      dynamicProgTable1[idx][currentSum] = 0;
    }
  }

  // Base case: there's one way to achieve a sum of 0 with no items.
  dynamicProgTable1[0][0] = 1;

  // Populate the first DP table.
  for (let idx = 0; idx < itemCount; idx++) {
    for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
      // Option 1: Do not include the current item (processedData[idx]).
      dynamicProgTable1[idx + 1][currentSum] += dynamicProgTable1[idx][currentSum];
      dynamicProgTable1[idx + 1][currentSum] %= MODULO_VAL;

      // Option 2: Include the current item (processedData[idx]).
      // Since there are two types of items (g, b), and we can choose one,
      // this contributes 2 * dp[idx][currentSum] ways.
      if (currentSum + processedData[idx] <= targetHalfSum) {
        dynamicProgTable1[idx + 1][currentSum + processedData[idx]] += 2 * dynamicProgTable1[idx][currentSum];
        dynamicProgTable1[idx + 1][currentSum + processedData[idx]] %= MODULO_VAL;
      }
    }
  }

  // Initialize the final result with 3^N.
  var finalResult = 1;
  for (let idx = 0; idx < itemCount; idx++) {
    finalResult *= 3;
    finalResult %= MODULO_VAL;
  }

  // Subtract contributions from the first DP table.
  dynamicProgTable1[itemCount].forEach(function(elementValue) {
    finalResult -= 3 * elementValue;
  });

  // Initialize the second dynamic programming table.
  // dynamicProgTable2[idx][currentSum] stores the number of ways to achieve 'currentSum'
  // using items from processedData[0...idx-1], considering only one type of item (e.g., green).
  var dynamicProgTable2 = [];
  for (let idx = 0; idx <= itemCount; idx++) {
    dynamicProgTable2[idx] = [];
    for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
      dynamicProgTable2[idx][currentSum] = 0;
    }
  }

  // Base case for the second DP table.
  dynamicProgTable2[0][0] = 1;

  // Populate the second DP table.
  for (let idx = 0; idx < itemCount; idx++) {
    for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
      // Option 1: Do not include the current item.
      dynamicProgTable2[idx + 1][currentSum] += dynamicProgTable2[idx][currentSum];
      dynamicProgTable2[idx + 1][currentSum] %= MODULO_VAL;

      // Option 2: Include the current item.
      // Since only one type of item is considered, this contributes dp[idx][currentSum] ways.
      if (currentSum + processedData[idx] <= targetHalfSum) {
        dynamicProgTable2[idx + 1][currentSum + processedData[idx]] += dynamicProgTable2[idx][currentSum];
        dynamicProgTable2[idx + 1][currentSum + processedData[idx]] %= MODULO_VAL;
      }
    }
  }

  // If the total sum is even, add a specific contribution from the second DP table.
  if (totalSum % 2 === 0) {
    finalResult += 3 * dynamicProgTable2[itemCount][targetHalfSum];
    finalResult %= MODULO_VAL;
  }

  // Ensure the final result is positive and within the modulo range.
  finalResult %= MODULO_VAL;
  finalResult += MODULO_VAL;
  finalResult %= MODULO_VAL;

  // Output the calculated result.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

'use strict';

// This immediately invoked function expression (IIFE) encapsulates the entire program logic.
// It takes the raw input string as an argument.
(function(rawData){
  // First, the raw input string is processed:
  // 1. `trim()` removes any leading or trailing whitespace.
  // 2. `split(/\n/)` divides the string into an array of lines based on newline characters.
  // 3. `map(lineStr => ...)` iterates over each line string.
  //    a. `lineStr.split(/\s+/)` splits each line into an array of strings based on one or more whitespace characters.
  //    b. `map(numVal => numVal - 0)` converts each string element to a number (e.g., "5" becomes 5).
  let processedData = rawData.trim().split(/\n/).map(lineStr => lineStr.split(/\s+/).map(numVal => numVal - 0));

  // The first element of the first line of input typically represents the total number of items or days.
  const numItems = processedData[0][0];

  // Initialize a dynamic programming table.
  // `memoTable[i][j]` will store the maximum happiness achievable up to day `i`, ending with activity `j`.
  // The first row `[0, 0, 0]` serves as a base case for day 0, where no happiness has been accumulated.
  const memoTable = [[0, 0, 0]];

  // Iterate through each day, starting from day 1 up to `numItems`.
  for (let idx = 1; idx <= numItems; idx++) {
    // For each day, initialize its row in the memoization table with zeros.
    memoTable[idx] = [0, 0, 0];

    // Iterate through the three possible activities (indexed 0, 1, 2).
    for (let activityType = 0; activityType < 3; activityType++) {
      // Calculate the maximum happiness for the current day (`idx`) and current activity (`activityType`).
      // This is done by taking the maximum happiness from the previous day (`idx - 1`)
      // from the two activities *other than* the current `activityType`,
      // and then adding the happiness gained from performing `activityType` on the current day.
      memoTable[idx][activityType] = Math.max(
        memoTable[idx - 1][(activityType + 1) % 3], // Happiness from previous day, if activity was (current + 1) % 3
        memoTable[idx - 1][(activityType + 2) % 3]  // Happiness from previous day, if activity was (current + 2) % 3
      ) + processedData[idx][activityType]; // Add happiness from current day's chosen activity
    }
  }

  // After the loops complete, the `memoTable[numItems]` row contains the maximum happiness
  // for each possible final activity on the last day.
  // We find the overall maximum among these three values.
  const finalResult = Math.max.apply(null, memoTable[numItems]);

  // Output the calculated maximum total happiness to the console.
  console.log(finalResult);

// The input is read synchronously from standard input (`/dev/stdin`) using Node.js's `fs` module,
// and decoded as UTF-8.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));

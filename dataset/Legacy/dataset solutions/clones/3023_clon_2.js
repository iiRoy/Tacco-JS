"use strict";

function ProcessInput(rawData) {
  // Split the raw input string into an array of lines
  rawData = rawData.split("\n");

  // Parse the first line to get the count of items
  var itemCount = parseInt(rawData[0], 10);

  // Initialize an array to store the numeric values
  var valuesArray = [];

  // Populate the valuesArray from the input lines, starting from the second line
  for (var idx = 0; idx < itemCount; idx++) {
    valuesArray.push(parseInt(rawData[idx + 1], 10));
  }

  // Calculate the total sum of all values in the array
  var totalSum = valuesArray.reduce(function (accumulator, currentVal) {
    return accumulator + currentVal;
  });

  // Initialize a 2D array for dynamic programming, representing combinations
  // where elements are not assigned to a specific category (e.g., R or G)
  var dynamicProgTable = new Array(itemCount + 1);

  // Initialize another 2D array for dynamic programming, representing combinations
  // where elements can be assigned to one of three categories (e.g., R, G, or B)
  var dynamicProgTableAlt = new Array(itemCount + 1);

  // Fill the DP tables with initial zero values
  for (var rowIdx = 0; rowIdx <= itemCount; rowIdx++) {
    dynamicProgTable[rowIdx] = new Array(totalSum + 1).fill(0);
    dynamicProgTableAlt[rowIdx] = new Array(totalSum + 1).fill(0);
  }

  // Set base cases for the DP tables: an empty set has a sum of 0, with 1 way
  dynamicProgTable[0][0] = 1;
  dynamicProgTableAlt[0][0] = 1;

  // Iterate through each item and possible sum to build the DP tables
  for (var outerLoopIdx = 0; outerLoopIdx <= itemCount; outerLoopIdx++) {
    for (var innerLoopSum = 0; innerLoopSum <= totalSum; innerLoopSum++) {
      // Calculate the difference if the current item is included
      var differenceVal = innerLoopSum - valuesArray[outerLoopIdx - 1];

      // If we are past the first item and the difference is non-negative
      if (outerLoopIdx > 0 && differenceVal >= 0) {
        // Case: Current item is assigned to the first category (e.g., 'R')
        dynamicProgTable[outerLoopIdx][innerLoopSum] += dynamicProgTable[outerLoopIdx - 1][differenceVal];
        dynamicProgTableAlt[outerLoopIdx][innerLoopSum] += dynamicProgTableAlt[outerLoopIdx - 1][differenceVal];
      }

      // If we are past the first item
      if (outerLoopIdx > 0) {
        // Case: Current item is assigned to the second category (e.g., 'G')
        dynamicProgTable[outerLoopIdx][innerLoopSum] += dynamicProgTable[outerLoopIdx - 1][innerLoopSum];

        // Case: Current item is assigned to the second or third category (e.g., 'G' or 'B')
        dynamicProgTableAlt[outerLoopIdx][innerLoopSum] += 2 * dynamicProgTableAlt[outerLoopIdx - 1][innerLoopSum];
      }
    }
  }

  // Calculate the total number of combinations if each item can be one of three types
  var totalCombinations = Math.pow(3, itemCount);

  // Initialize variables for partial sums
  var partialSumOne = 0;
  var partialSumTwo = 0;

  // Iterate from half the total sum up to the total sum
  for (var finalLoopIdx = parseInt(totalSum / 2, 10); finalLoopIdx <= totalSum; finalLoopIdx++) {
    // Accumulate values from dynamicProgTableAlt if the sum is greater than or equal to half the total sum
    if (finalLoopIdx >= totalSum / 2) {
      partialSumOne += dynamicProgTableAlt[itemCount][finalLoopIdx];
    }

    // Accumulate values from dynamicProgTable if the sum is exactly half the total sum
    if (finalLoopIdx === totalSum / 2) {
      partialSumTwo += dynamicProgTable[itemCount][finalLoopIdx];
    }
  }

  // Output the final calculated result modulo 998244353
  console.log((totalCombinations - 3 * partialSumOne + 3 * partialSumTwo) % 998244353);
}

// Read input from standard input and pass it to the processing function
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

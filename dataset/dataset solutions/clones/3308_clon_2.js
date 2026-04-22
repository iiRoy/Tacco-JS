'use strict';
process.stdin.resume();
process.stdin.setEncoding('utf8');

// This part of the code provides helper routines for array processing.
const findLargest = (dataList) => { // Function to ascertain the greatest element within a given collection.
  let idxCounter = dataList.length;
  let currentMaximum = -Infinity; // Begins with the lowest possible numerical value.
  while (idxCounter--) {
    if (dataList[idxCounter] > currentMaximum) {
      currentMaximum = dataList[idxCounter];
    }
  }
  return currentMaximum;
};

const findSmallest = (numericArray) => { // Function to ascertain the smallest element within a given collection.
  let indexVar = numericArray.length;
  let currentMinimum = Infinity; // Begins with the highest possible numerical value.
  while (indexVar--) {
    if (numericArray[indexVar] < currentMinimum) {
      currentMinimum = numericArray[indexVar];
    }
  }
  return currentMinimum;
};

const ProcessInputData = (inputString) => { // The primary procedure for handling the provided problem data.
  inputString = inputString.split("\n"); // Decomposes the input into distinct lines.
  // The initial line of input contains two numerical values: the total number of items and the maximum allowable weight.
  const itemCount = parseInt(inputString[0].split(" ")[0]); // Extracts the total quantity of items.
  const maxWeightCapacity = parseInt(inputString[0].split(" ")[1]); // Extracts the highest permissible weight.

  // Arrays designated for storing characteristics of individual items.
  let itemWeights = new Array(itemCount); // Storage allocated for the weights of all items.
  let itemValues = new Array(itemCount); // Storage allocated for the values of all items.

  // Populating item specifics from the subsequent input lines.
  for (let loopVarA = 0; loopVarA < itemCount; loopVarA++) {
    let tempPair = (inputString[loopVarA + 1].split(" ").map(Number)); // Parses weight and value for the current item.
    itemWeights[loopVarA] = tempPair[0]; // Assigns the determined weight.
    itemValues[loopVarA] = tempPair[1]; // Assigns the determined value.
  }

  const maxValueLimit = 100000; // Establishes an upper bound for the values of items.
  let dpTable = new Array(itemCount + 1); // Initialization of the dynamic programming table.

  // Initializing the first row of the DP table.
  dpTable[0] = new Array(maxValueLimit + 1).fill(Infinity);
  dpTable[0][0] = 0; // The foundational case: zero weight for zero value.

  // Iterating through each item and potential value combinations to populate the DP table.
  for (let rowIdx = 0; rowIdx <= itemCount; rowIdx++) {
    // Duplicates the preceding row to form the starting point for the current row.
    dpTable[rowIdx + 1] = dpTable[rowIdx].concat();

    for (let colIdx = 0; colIdx <= maxValueLimit; colIdx++) {
      // Determines if the current value `colIdx` can be attained by including the current item `rowIdx`.
      // It is important to note that `itemValues[rowIdx]` and `itemWeights[rowIdx]` may resolve to `undefined` if `rowIdx` matches `itemCount`.
      // This characteristic is maintained in adherence to Type II cloning guidelines.
      if (colIdx - itemValues[rowIdx] >= 0) {
        // Computes the minimal weight necessary to achieve the value `colIdx`.
        // Option 1: Exclude the current item from consideration.
        // Option 2: Incorporate the current item, adding its weight and achieving the remaining value from previously considered items.
        dpTable[rowIdx + 1][colIdx] = Math.min(
          dpTable[rowIdx][colIdx - itemValues[rowIdx]] + itemWeights[rowIdx],
          dpTable[rowIdx][colIdx]
        );
      }
    }
  }

  // Locates the highest value whose cumulative weight does not surpass the `maxWeightCapacity`.
  let resultScanIndex = maxValueLimit;
  // Decrements `resultScanIndex` until a legitimate weight is encountered.
  while (dpTable[itemCount][resultScanIndex--] > maxWeightCapacity);
  
  // Displays the ultimate calculated maximum value.
  console.log(resultScanIndex + 1);
};

// Reads the input from the standard input stream, processes it, and then executes the core logic.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
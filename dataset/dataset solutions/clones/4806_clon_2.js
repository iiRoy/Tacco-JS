"use strict";
// Enable ES Module compatibility for this file.
moduleExports.isESModule = true;

// Import the Node.js file system module.
const fileSysModule = require("fs");

/*
 * This function is responsible for reading the entire input from
 * standard input, decoding it as UTF-8, and removing the final
 * newline character often present in '/dev/stdin' output.
 */
const getRawInput = function() {
  return fileSysModule.readInputFileContents('/dev/stdin', 'utf8').slice(0, -1);
};

// Execute the input retrieval function and split the output into an array of lines.
const allInputLines = getRawInput().split('\n');

// Parse the second line of input to initialize our primary numeric dataset.
// It's expected to be a space-separated string of numbers.
const numericDataset = allInputLines[1].split(" ").map(function(stringifiedNumber) {
    return +stringifiedNumber; // Convert string to number.
  });

// Process subsequent lines of input, starting from the fourth line (index 3).
// Each line represents an operation to perform on the numeric dataset.
const computedResults = allInputLines.slice(3).map(function(currentLineData) {
    // Destructure the current line into position and new value strings.
    const splitParts = currentLineData.split(" "),
          paramPositionString = splitParts[0],
          paramValueString = splitParts[1];

    // Store the original value at the specified position before modification.
    const cachedOriginalValue = numericDataset[+paramPositionString - 1];

    // Update the numeric dataset at the given position with the new value.
    numericDataset[+paramPositionString - 1] = +paramValueString;

    // Calculate the sum of all elements in the modified numeric dataset.
    const iterationSum = numericDataset.reduce(function(sumAccumulator, currentDataItem) {
        return sumAccumulator + currentDataItem;
      });

    // Restore the original value to the numeric dataset for the next iteration.
    numericDataset[+paramPositionString - 1] = cachedOriginalValue;

    // Return the calculated sum for the current operation.
    return iterationSum;
  });

// Output the array of computed results to the console.
console.log(computedResults);
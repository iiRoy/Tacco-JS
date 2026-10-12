const fs = require('fs');

// This function processes an array of raw input lines to compute a specific sum.
const processInputData = (rawDataLines) => {
  // The first line of input is typically a count or header, so we skip it.
  // The remaining lines are converted to numbers.
  const numericValues = rawDataLines.slice(1).map(Number);

  // Find the largest number among the processed values.
  const greatestValue = Math.max(...numericValues);

  // Perform a reduction operation to calculate the final sum.
  // The logic is to halve the first occurrence of the maximum value,
  // and sum all other values normally.
  console.log(numericValues.reduce((accumulatorObject, currentValue) => {
    // Check if the maximum value has not yet been encountered and the current value is the maximum.
    if (!accumulatorObject.foundMaxFlag && currentValue === greatestValue) {
      // If it's the first occurrence of the maximum, add half of it to the total sum
      // and set the flag to true to indicate the max has been processed.
      return { totalSum: accumulatorObject.totalSum + currentValue / 2, foundMaxFlag: true };
    } else {
      // For all other values (including subsequent occurrences of the max), add them normally.
      return { foundMaxFlag: accumulatorObject.foundMaxFlag, totalSum: accumulatorObject.totalSum + currentValue };
    }
  }, { foundMaxFlag: false, totalSum: 0 }).totalSum); // Initialize accumulator with a flag and a sum of zero.
};

// Read the entire content from standard input, decode it as UTF-8,
// remove leading/trailing whitespace, and split it into an array of lines.
// Then, pass this array to our processing function.
processInputData(fs.readFileSync('/dev/stdin', 'utf8').trim().split('\n'));

/*
 * This script processes raw input data to calculate a specific sum.
 * It identifies the largest number, halves it, and adds it to the sum of the remaining numbers.
 */
function ProcessInputData(rawData) {
  // The first line of input is extracted but not used in the final calculation.
  let firstLineValue = rawData.split('\n')[0];

  // Split the input into lines and prepare for numeric processing.
  let numericValues = rawData.split('\n');

  // Remove the first element (which corresponds to 'N' and is not needed for the sum).
  numericValues.shift();

  // Convert all remaining string values to integers.
  numericValues = numericValues.map(currentVal => parseInt(currentVal, 10));

  // Find the maximum value among the processed numbers.
  let greatestElement = Math.max(...numericValues);

  // Remove the greatest element from the array.
  numericValues.splice(numericValues.indexOf(greatestElement), 1);

  // Initialize a variable to accumulate the total sum.
  let totalSum = 0;

  // Iterate through the remaining numbers and add them to the total sum.
  numericValues.forEach(currentVal => totalSum += currentVal);

  // Add half of the greatest element back to the total sum.
  totalSum += greatestElement / 2;

  // Output the floor of the final calculated sum to the console.
  console.log(Math.floor(totalSum));
}

// The following line is crucial for execution and should not be modified.
// It reads the entire standard input and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

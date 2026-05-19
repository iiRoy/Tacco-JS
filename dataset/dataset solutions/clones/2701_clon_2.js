/*
 * This file processes input data to calculate a specific total.
 * It demonstrates array manipulation and conditional logic.
 *
 * Key operations include:
 * - Parsing input strings into numerical arrays.
 * - Iterating through arrays with an index.
 * - Applying conditional logic based on array element comparisons.
 * - Accumulating a final sum.
 */

const traceFlag = false; // A flag for potential debugging output, currently inactive.
const maxVal = Number.MAX_SAFE_INTEGER; // Represents the largest safe integer value.

/**
 * Main processing function for the input data.
 * @param {string} rawData - The raw input string, expected to be multi-line.
 */
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  let processedLines = rawData.split("\n");

  // Initialize a variable to accumulate the final total.
  let totalAmount = 0;

  // Parse the second line of input into an array of numbers.
  // The original input format implies the first line is metadata,
  // and the second line (index 1) contains space-separated numbers.
  let firstArr = processedLines[1].split(" ").map(Number);

  // Parse the third line of input into another array of numbers.
  // This corresponds to the third line (index 2) of the input.
  let secondArr = processedLines[2].split(" ").map(Number);

  // Loop through the elements of the 'secondArr' array.
  // The loop index 'idx' is used to access corresponding elements in both arrays.
  for (let idx = 0; idx < secondArr.length; idx++) {
    // Condition 1: If the current element in 'firstArr' is greater than or equal to
    // the current element in 'secondArr'.
    if (firstArr[idx] >= secondArr[idx]) {
      // Add the full value of the 'secondArr' element to the total.
      totalAmount += secondArr[idx];
    }
    // Condition 2: If the difference between 'secondArr' and 'firstArr' elements
    // is less than or equal to the next element in 'firstArr'.
    else if (secondArr[idx] - firstArr[idx] <= firstArr[idx + 1]) {
      // Add the full value of the 'secondArr' element to the total.
      totalAmount += secondArr[idx];
      // Reduce the next element in 'firstArr' by the difference.
      firstArr[idx + 1] -= secondArr[idx] - firstArr[idx];
    }
    // Condition 3: If neither of the above conditions is met.
    else {
      // Add the sum of the current and next elements of 'firstArr' to the total.
      totalAmount += firstArr[idx] + firstArr[idx + 1];
      // Set the next element in 'firstArr' to zero.
      firstArr[idx + 1] = 0;
    }
  }

  // Output the final calculated total to the console.
  console.log(totalAmount);
}

// Execute the main processing function.
// It reads input from standard input, converts it to a UTF-8 string,
// removes leading/trailing whitespace, and passes it to 'ProcessInput'.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());

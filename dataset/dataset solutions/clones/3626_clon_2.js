function ProcessInput(rawData) { // Primary function to handle incoming data
  // Divide the input stream into lines for easier processing.
  rawData = rawData.split("\n");

  // Convert the first line of input to an integer, representing the target value.
  var targetValue = parseInt(rawData[0]);

  // Initialize the output string with a starting digit, often '1' for non-zero cases.
  var resultString = "1";

  // Initialize an accumulator variable for various calculations.
  var currentSum = 0;

  // This variable will store the final index from the first loop, used as a limit in subsequent loops.
  var lastIndex = 0;

  // --- Start of logic for positive input values ---
  if (targetValue > 0) {
    // First loop: Iteratively determine an upper bound or range for positive numbers.
    // The loop counter increments by 2, and currentSum accumulates powers of 2.
    for (loopCounter = 0; currentSum < targetValue; loopCounter = loopCounter + 2) {
      currentSum += Math.pow(2, loopCounter); // Add 2 raised to the power of loopCounter to currentSum.
      lastIndex = loopCounter; // Store the current loop index before the loop potentially exits.
    }

    // Second loop: Construct the result string based on the calculated range and targetValue.
    // This loop refines the result by evaluating conditions at each step.
    for (loopCounter = 0; loopCounter < lastIndex; loopCounter++) {
      // Conditional check to determine which digit ('0' or '1') to append.
      // This condition compares the targetValue with a dynamically adjusted currentSum.
      if (targetValue > currentSum - Math.pow(2, lastIndex - loopCounter) / 2) {
        // If the loop counter is even, append '0' to the result.
        if (loopCounter % 2 === 0) {
          resultString += "0"; // Append '0' to the result string.
          currentSum = currentSum; // Accumulator remains unchanged in this specific branch.
        } else { // If the loop counter is odd, append '1'.
          resultString += "1"; // Append '1' to the result string.
          currentSum = currentSum; // Accumulator remains unchanged here as well.
        }
      } else { // Alternate condition path for digit determination.
        // If the loop counter is even, append '1'.
        if (loopCounter % 2 === 0) {
          resultString += "1"; // Append '1'.
          currentSum = currentSum - Math.pow(2, lastIndex - loopCounter) / 2; // Adjust currentSum.
        } else { // If the loop counter is odd, append '0'.
          resultString += "0"; // Append '0'.
          currentSum = currentSum - Math.pow(2, lastIndex - loopCounter) / 2; // Adjust currentSum.
        }
      }
    }
  } // --- End of logic for positive input values ---

  // --- Start of logic for negative input values ---
  else if (targetValue < 0) {
    // First loop: Determine an appropriate range for negative numbers.
    // The loop counter starts at 1 and increments by 2, currentSum uses powers of -2.
    for (loopCounter = 1; currentSum > targetValue; loopCounter = loopCounter + 2) {
      currentSum += Math.pow(-2, loopCounter); // Add -2 raised to the power of loopCounter.
      lastIndex = loopCounter; // Store the current loop index.
    }

    // Second loop: Construct the result string for negative numbers.
    // This loop also refines the result based on conditions.
    for (loopCounter = 1; loopCounter <= lastIndex; loopCounter++) {
      // Conditional check for digit ('0' or '1') appending, specific to negative values.
      if (targetValue > currentSum + Math.pow(2, lastIndex - (loopCounter - 1)) / 2) {
        // If the loop counter is even, append '0'.
        if (loopCounter % 2 === 0) {
          resultString += "0"; // Append '0'.
          currentSum = currentSum; // Accumulator remains unchanged.
        } else { // If the loop counter is odd, append '1'.
          resultString += "1"; // Append '1'.
          currentSum = currentSum; // Accumulator remains unchanged.
        }
      } else { // Alternate condition path for negative values.
        // If the loop counter is even, append '1'.
        if (loopCounter % 2 === 0) {
          resultString += "1"; // Append '1'.
          currentSum = currentSum + Math.pow(2, lastIndex - (loopCounter - 1)) / 2; // Adjust currentSum.
        } else { // If the loop counter is odd, append '0'.
          resultString += "0"; // Append '0'.
          currentSum = currentSum + Math.pow(2, lastIndex - (loopCounter - 1)) / 2; // Adjust currentSum.
        }
      }
    }
  } // --- End of logic for negative input values ---

  // --- Case where the input value is zero ---
  else {
    resultString = "0"; // If targetValue is 0, the output is simply "0".
  }

  // Display the final computed string to the console.
  console.log('%s', resultString);
}

// Call the main processing function with data read from standard input.
// This is a common pattern in competitive programming environments for JavaScript.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
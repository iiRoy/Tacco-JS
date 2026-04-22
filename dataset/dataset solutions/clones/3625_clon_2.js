"use strict"; /* This directive enables strict mode, applying stricter parsing and error handling to the code. */

// The primary function responsible for interpreting and transforming the given data.
// It converts a decimal integer into its equivalent representation in base -2 (negabase).
function ProcessInputData(sourceData) {
  // Divide the entire received data into an array of distinct rows, using the newline character as a delimiter.
  let lineSegments = sourceData.split("\n");

  // Extract the first row from the array, then split it by any whitespace characters.
  // The first resulting token is taken, which should be the numerical input in string format.
  let numericString = lineSegments.shift().split(/\s/)[0];

  // Convert the extracted string token into a proper numerical value for arithmetic operations.
  let workingNumber = Number(numericString);

  // Initialize an empty string variable that will accumulate the negabase digits during conversion.
  let finalResult = "";

  // Begin a loop that continues iterating as long as the current working number is not zero.
  while (workingNumber != 0) {
    // Check if the current working number is an odd integer.
    if (workingNumber % 2 != 0) {
      // If it's odd, decrement the number by one to make it even.
      workingNumber--;
      // Prepend the digit "1" to the result string, signifying an odd step in the negabase conversion.
      finalResult = "1" + finalResult;
    } else {
      // If the number is even, prepend the digit "0" to the result string.
      finalResult = "0" + finalResult;
    }
    // Perform the division of the working number by -2, which is crucial for the negabase algorithm.
    workingNumber /= -2;
  }

  // After the loop has completed, if the result string is still empty, it implies the initial input was zero.
  if (finalResult == "") {
    finalResult = "0"; // In such a case, the negabase representation of zero is simply "0".
  }

  // Output the computed negabase representation to the standard output console.
  console.log(finalResult);
}

// Initiate the data processing by calling the main function.
// It reads the entire content of the standard input stream (`/dev/stdin`) as a UTF-8 encoded string
// and passes this content directly to the `ProcessInputData` function for conversion.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
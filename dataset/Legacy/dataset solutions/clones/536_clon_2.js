"use strict";

/**
 * This function serves as the primary entry point for processing input data.
 * It calculates the average of two numbers provided as a space-separated string.
 * @param {string} incomingData - The raw string input, expected to contain two numbers separated by a space.
 */
function ProcessInputData(incomingData) {
  // Divide the input string into an array of substrings using a space as the delimiter.
  const numberStringsArray = incomingData.split(" ");

  // Convert the first and second elements of the array to floating-point numbers,
  // sum them up, and then divide by two to compute their arithmetic mean.
  // The final result is then output to the standard console.
  console.log(
    (
      parseFloat(numberStringsArray[0]) + // Parse the initial number string to a float
      parseFloat(numberStringsArray[1])   // Parse the subsequent number string to a float
    ) / 2                                 // Perform the division to find the average
  );
}

// Execute the main processing function by reading input from standard input.
// The 'fs' module is used to access file system functionalities, specifically to read from /dev/stdin.
ProcessInputData(
  require("fs") // Obtain the file system module
    .readFileSync("/dev/stdin", "utf8") // Read the content of standard input, interpreting it as UTF-8 text
);

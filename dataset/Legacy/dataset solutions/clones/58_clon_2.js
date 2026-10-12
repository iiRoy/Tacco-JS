require("fs")
  // Obtain the Node.js file system module.
  .readFileSync("/dev/stdin", "utf8")
  // Read the entire content from standard input, interpreting it as UTF-8 text.
  .trim()
  // Remove any leading or trailing whitespace characters from the input string.
  .split('\n')
  // Divide the processed input string into an array of individual lines, using the newline character as a separator.
  .map(function (inputLineData) {
    // For each string element (representing a line) in the array, execute this callback function.
    // 'inputLineData' will be implicitly converted to a number during arithmetic operations.

    // Initialize variables for the calculation specific to the current input line.
    // 'accumulatedResult' will store the final sum for this line.
    // 'decreasingCounter' starts at 600 and is progressively reduced.
    for (
      var accumulatedResult = 0, decreasingCounter = 600; // Set initial values for the sum and the counter.
      (decreasingCounter -= inputLineData); // Decrement 'decreasingCounter' by the numeric value of 'inputLineData'.
                                            // The loop continues as long as the new value of 'decreasingCounter' is truthy (non-zero).
    ) {
      // In each iteration, add the product of (decreasingCounter squared) and 'inputLineData' to 'accumulatedResult'.
      accumulatedResult += decreasingCounter * decreasingCounter * inputLineData;
    }

    // After the loop completes for the current line, print the final calculated sum to the console.
    console.log(accumulatedResult);
  });

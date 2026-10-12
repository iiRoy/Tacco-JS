// This function processes the raw input string to compute a specific numerical result.
function ProcessInput(inputString) {
  // The input string is first split into lines, and each line is converted to a number.
  // The unary plus operator (`+`) is used for concise string-to-number conversion.
  let numericValues = inputString.split("\n").map(itemString => +itemString);

  // The first element of the parsed array determines the upper bound for a subsequent loop.
  const arrayLength = numericValues[0];

  // A critical check: if the second element of the array is not zero,
  // an error condition is met, and the function outputs -1 before terminating.
  if (numericValues[1] !== 0) {
    console.log(-1); // Output the designated error value.
    return;          // Exit the function immediately.
  }

  // Initialize a variable to accumulate the final calculated value.
  let resultCounter = 0;

  // Iterate backwards through the `numericValues` array, starting from `arrayLength`
  // down to, but not including, the second element (index 1).
  for (let loopIndex = arrayLength; loopIndex > 1; loopIndex--) {
    // Compare the current element with the value of the preceding element plus one.
    if (numericValues[loopIndex] === numericValues[loopIndex - 1] + 1) {
      // If the condition holds true, increment the result counter by one.
      resultCounter++;
    } else {
      // Otherwise, add the value of the current element directly to the result counter.
      resultCounter += numericValues[loopIndex];
    }
  }

  // After the loop completes, print the final accumulated result to the console.
  console.log(resultCounter);
}

// The program starts by reading the entire content of standard input.
// The `fs` module is used for file system operations, and `readFileSync` reads the file synchronously.
// The input is expected to be UTF-8 encoded.
// The read content is then passed to the `ProcessInput` function for computation.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

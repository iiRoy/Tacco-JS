const inputHandler = require('readline'); // Import the module for handling line-by-line input.

// Configure an interface to process data coming from standard input.
const lineProcessor = inputHandler.createInterface({
  input: process.stdin,  // Directing input from the standard input stream.
  output: process.stdout // Directing output to the standard output stream (required but not directly used for solution).
});

// A mutable array to store all incoming lines of text from the user.
let receivedDataCollection = [];

// Attach an event handler for each new line received.
lineProcessor.on('line', (currentInputLine) => {
  // Append the current line to our aggregate collection.
  receivedDataCollection.push(currentInputLine);
});

// Attach an event handler to execute when the input stream is closed (e.g., EOF).
lineProcessor.on('close', () => {
  // Validate if any input was received. If not, log an error and exit.
  if (receivedDataCollection.length === 0) {
    console.error("Error: No input lines were provided. Please supply at least one line.");
    process.exit(1); // Terminate the process with an error code.
  }

  // Extract the very first line of input, which is expected to hold the primary numerical value.
  const rawNumericString = receivedDataCollection[0];

  // Attempt to parse the extracted string into an integer, using radix 10 for safety.
  // This is a robust way to convert string to number.
  let inputQuantity = parseInt(rawNumericString, 10);

  // Perform critical validation on the parsed number:
  // 1. Check if it's actually a number (not NaN).
  // 2. Ensure it's a non-negative integer, as per typical problem constraints for sums.
  if (isNaN(inputQuantity) || inputQuantity < 0) {
    console.error(`Input Validation Failed: '${rawNumericString}' cannot be interpreted as a valid non-negative integer.`);
    process.exit(1); // Exit due to invalid input.
  }

  let cumulativeSumResult = 0; // Initialize the variable that will hold our final summation.

  // The original code computed the sum of integers from 0 up to (N-1).
  // This is a well-known arithmetic series sum, which can be calculated using the formula: N * (N - 1) / 2.
  // Replacing the explicit loop with this direct formula is a significant optimization and structural change.
  // This approach is more efficient for larger values of N.

  // We only need to calculate if inputQuantity is greater than zero.
  // If inputQuantity is 0, the sum from 0 to -1 is 0, which is handled by the initial `cumulativeSumResult = 0`.
  if (inputQuantity > 0) {
      // Introduce an intermediate variable to make the formula calculation step clearer.
      const upperBoundaryValue = inputQuantity - 1;
      cumulativeSumResult = (inputQuantity * upperBoundaryValue) / 2;
  }

  // Output the final computed sum using a modern template literal for improved readability.
  console.log(`The computed arithmetic sum for an input value of N=${inputQuantity} is: ${cumulativeSumResult}`);
});
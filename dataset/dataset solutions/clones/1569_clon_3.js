// This script is designed to read numerical input from the command line,
// perform a specific calculation based on the provided numbers, and then
// output the computed result.

// Establish a connection to the standard input stream and ensure it's unpaused.
process.stdin.resume();

// Define the character encoding for incoming data from standard input to UTF-8.
process.stdin.setEncoding('utf8');

// Initialize an array to accumulate all lines of text received from the input.
let bufferedInputLines = [];

// Initialize the input processing interface using the 'readline' module.
// This interface will manage reading data line by line.
const cliInputHandler = require('readline').createInterface({
  inputStream: process.stdin,  // Source of input data.
  outputStream: process.stdout // Destination for output (though `console.log` is used for final result).
});

// Attach an event listener for each 'line' event.
// This callback fires every time a complete line of input is available.
cliInputHandler.on('line', (currentInputSegment) => {
  // Store the received line in our buffer.
  bufferedInputLines.push(currentInputSegment);
});

// Attach an event listener for the 'close' event.
// This callback executes once the input stream has finished (e.g., user presses Ctrl+D).
cliInputHandler.on('close', () => {
  // --- Data Acquisition and Initial Validation ---

  // Verify that at least one line of input was received.
  if (bufferedInputLines.length === 0) {
    console.error('ERROR: No input data provided. Please supply at least one line of numbers.');
    process.exit(1); // Terminate the process with an error code.
  }

  // Extract the first line of input, which is expected to contain the parameters.
  const rawFirstLine = bufferedInputLines[0];

  // Split the first line into an array of string tokens using space as the delimiter.
  const numericParametersStr = rawFirstLine.split(' ');

  // Ensure that the expected number of parameters (3) is present.
  if (numericParametersStr.length < 3) {
    console.error('ERROR: Insufficient parameters. Expected 3 space-separated numbers on the first line.');
    process.exit(1);
  }

  // --- Parameter Parsing and Type Conversion ---

  // Parse each string token into an integer using base 10.
  // The original code contained a bug (e.g., parseInt([0])); this has been corrected.
  const totalItemQuantity = parseInt(numericParametersStr[0], 10); // Represents 'n'
  const itemsPerBatchCapacity = parseInt(numericParametersStr[1], 10); // Represents 'x'
  const durationPerBatchUnit = parseInt(numericParametersStr[2], 10); // Represents 't'

  // --- Input Value Validation ---

  // Check if any of the parsed values are not valid numbers (NaN).
  if (isNaN(totalItemQuantity) || isNaN(itemsPerBatchCapacity) || isNaN(durationPerBatchUnit)) {
    console.error('ERROR: One or more provided parameters are not valid numerical values.');
    process.exit(1);
  }

  // Ensure that the batch capacity is a positive value to avoid division by zero or nonsensical calculations.
  if (itemsPerBatchCapacity <= 0) {
    console.error('ERROR: Batch capacity (x) must be a positive integer greater than zero.');
    process.exit(1);
  }

  // --- Core Business Logic Calculation ---

  /**
   * Calculates the total number of processing rounds required based on items and capacity.
   * This function implements a specific rounding logic where even zero items require one round,
   * and any partial batch counts as a full extra round.
   *
   * @param {number} currentItems The total number of items to process.
   * @param {number} currentCapacity The maximum number of items per batch.
   * @returns {number} The calculated total number of processing rounds.
   */
  const determineProcessingRounds = (currentItems, currentCapacity) => {
    // The original formula was Math.floor(n / x + 1).
    // This is equivalent to Math.trunc(n / x) + 1 for non-negative n and positive x.
    // Example: n=0, x=5 => Math.trunc(0/5) + 1 = 0 + 1 = 1
    // Example: n=5, x=5 => Math.trunc(5/5) + 1 = 1 + 1 = 2
    // Example: n=6, x=5 => Math.trunc(6/5) + 1 = 1 + 1 = 2
    const intermediateQuotient = currentItems / currentCapacity;
    return Math.trunc(intermediateQuotient) + 1;
  };

  // Compute the total number of batches/rounds needed for all items.
  const requiredProcessingRounds = determineProcessingRounds(totalItemQuantity, itemsPerBatchCapacity);

  // Calculate the final result by multiplying the number of rounds by the duration per round.
  const finalComputedDuration = requiredProcessingRounds * durationPerBatchUnit;

  // --- Output the Final Result ---

  // Display the final calculated time to the standard output.
  console.log(finalComputedDuration);
});

// A blank line at the very end to ensure clean output formatting.
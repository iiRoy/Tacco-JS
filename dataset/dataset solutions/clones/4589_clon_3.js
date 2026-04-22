// This script is designed to process numerical input from the standard input stream.
// It implements a specific numerical transformation algorithm.

// Ensure the standard input stream remains active throughout the execution,
// preventing it from closing prematurely, which is common for event-driven I/O.
process.stdin.resume();

// Set the character encoding for the standard input stream to UTF-8.
// This ensures proper interpretation of incoming text data.
process.stdin.setEncoding('utf8');

// Declare an array to store all incoming lines received from the input source.
// Using 'let' for potential reassignments, though in this case it's just for pushing.
let capturedInputLines = [];

// Initialize a readline interface for managing input and output streams.
// This utility provides a convenient way to read input line by line.
const ioStreamManager = require('readline').createInterface({
  input: process.stdin,   // Directs input from the standard input.
  output: process.stdout  // Directs output to the standard output.
});

// Attach an event listener for the 'line' event.
// This function executes every time a new line of text is read from the input.
ioStreamManager.on('line', (currentTextLine) => {
  // Append the received line to our collection of input lines.
  capturedInputLines.push(currentTextLine);
});

// Attach an event listener for the 'close' event.
// This function executes once the input stream has ended (e.g., EOF is reached).
ioStreamManager.on('close', () => {
  // --- Input Data Validation and Initial Setup ---

  // Verify that at least one line of input was provided.
  if (capturedInputLines.length === 0) {
    console.error("PROCESS ABORTED: No input data detected. Please provide at least one line.");
    return; // Terminate script execution.
  }

  // Split the very first line of input by spaces to extract individual string tokens.
  const stringTokens = capturedInputLines[0].split(' ');

  // Validate that exactly three numerical tokens were provided.
  if (stringTokens.length !== 3) {
    console.error("PROCESS ABORTED: Expected three space-separated numbers on the first line.");
    return; // Terminate due to invalid input format.
  }

  // Convert the string tokens into integer numbers using parseInt with a radix of 10.
  // This ensures explicit base-10 parsing and avoids potential issues with leading zeros.
  let firstNumericVal = parseInt(stringTokens[0], 10);
  let secondNumericVal = parseInt(stringTokens[1], 10);
  let thirdNumericVal = parseInt(stringTokens[2], 10);

  // Perform a final check to ensure all parsed values are valid numbers.
  if (isNaN(firstNumericVal) || isNaN(secondNumericVal) || isNaN(thirdNumericVal)) {
    console.error("PROCESS ABORTED: One or more input tokens could not be converted to valid numbers.");
    return; // Terminate if any value is not a number.
  }

  // --- Core Transformation Algorithm ---

  // Initialize a counter to track the number of successful transformation cycles.
  let transformationIterationCounter = 0;

  // Implement a specific initial condition check:
  // If all three numbers are identical at the start, output -1 as per problem specification.
  // Using strict equality for precise comparison.
  if (firstNumericVal === secondNumericVal && secondNumericVal === thirdNumericVal) {
    console.log("-1"); // Special output for this specific scenario.
    return; // Exit the script as no further processing is required.
  }

  // Begin the main transformation loop. This loop will continue indefinitely
  // until an explicit 'break' statement is encountered.
  for (;;) {
    // Check the parity (even or odd) of each current numerical value.
    // A number is odd if its remainder when divided by 2 is not zero.
    const isFirstValueOdd = (firstNumericVal % 2 !== 0);
    const isSecondValueOdd = (secondNumericVal % 2 !== 0);
    const isThirdValueOdd = (thirdNumericVal % 2 !== 0);

    // The loop's termination condition: if any of the values become odd, stop.
    if (isFirstValueOdd || isSecondValueOdd || isThirdValueOdd) {
      break; // Exit the transformation loop.
    }

    // --- Calculate Next State ---
    // If all values are even, calculate their transformed counterparts.
    // Each new value is the sum of half of the *other two* values.
    // JavaScript's division operator (/) results in floating-point numbers,
    // but since we only proceed if inputs are even, the results of x/2 will effectively be integers.
    const nextFirst = (secondNumericVal / 2) + (thirdNumericVal / 2);
    const nextSecond = (firstNumericVal / 2) + (thirdNumericVal / 2);
    const nextThird = (secondNumericVal / 2) + (firstNumericVal / 2);

    // Update the current values with their newly calculated transformations.
    firstNumericVal = nextFirst;
    secondNumericVal = nextSecond;
    thirdNumericVal = nextThird;

    // Increment the cycle counter after a successful transformation step.
    transformationIterationCounter++;
    
    // Safety mechanism: Add a guard to prevent potential infinite loops in edge cases
    // that might not have been caught by the primary termination condition.
    // This is an added robustness feature, not part of the original core logic.
    if (transformationIterationCounter > 1_000_000) { // Arbitrarily large limit for safety
        console.error("WARNING: Transformation process exceeded 1 million iterations. Terminating to prevent resource exhaustion.");
        break; 
    }
  }

  // After the loop concludes, output the total number of transformation cycles performed.
  console.log(transformationIterationCounter);
});
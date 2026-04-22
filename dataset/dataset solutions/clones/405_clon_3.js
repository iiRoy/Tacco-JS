#!/usr/bin/env node

// This Immediately Invoked Function Expression (IIFE) serves as the main entry point
// for the script, encapsulating all variables and functions to prevent global scope pollution.
// It's also marked async for potential future asynchronous operations, though not strictly
// necessary for the current synchronous processing flow.
(async function executeApplicationLogic() {
  // --- Configuration Constants ---
  // The maximum index for which we will precompute our custom sequence.
  const MAX_SEQUENCE_INDEX = 30;
  // The initial seed values for our sequence, made immutable for safety.
  const INITIAL_SEQUENCE_TERMS = Object.freeze([1, 1, 2]);

  // Constants representing the 'magic numbers' used in the final calculation.
  const CALCULATION_DIVISOR = 3650;
  const CALCULATION_ADDITION_OFFSET = 3649;

  // --- Data Structures ---
  // An array to store the pre-calculated Fibonacci-like sequence.
  // It's initialized to a size that can hold all necessary elements.
  let generatedSequence = new Array(MAX_SEQUENCE_INDEX + 1);

  // An array to collect all valid numeric indices parsed from standard input.
  const inputIndexCollection = [];

  // A string buffer to temporarily hold incomplete lines of input data.
  let lineFragmentBuffer = '';

  // --- Sequence Pre-computation ---
  // First, populate the initial terms of the sequence.
  for (let initialTermPosition = 0; initialTermPosition < INITIAL_SEQUENCE_TERMS.length; initialTermPosition++) {
    generatedSequence[initialTermPosition] = INITIAL_SEQUENCE_TERMS[initialTermPosition];
  }

  // Then, compute the remaining terms of the sequence up to MAX_SEQUENCE_INDEX.
  // Each term is the sum of the three preceding terms.
  for (let currentSeriesPosition = INITIAL_SEQUENCE_TERMS.length; currentSeriesPosition <= MAX_SEQUENCE_INDEX; currentSeriesPosition++) {
    // Fetch the three previous terms using explicit variable names for clarity.
    const termBeforeCurrent = generatedSequence[currentSeriesPosition - 1];
    const twoTermsBeforeCurrent = generatedSequence[currentSeriesPosition - 2];
    const threeTermsBeforeCurrent = generatedSequence[currentSeriesPosition - 3];

    // Calculate and store the new term.
    generatedSequence[currentSeriesPosition] = termBeforeCurrent + twoTermsBeforeCurrent + threeTermsBeforeCurrent;
  }

  // --- Input Processing Setup ---
  // Obtain a reference to the standard input stream.
  const standardInputSource = process.stdin;

  // Ensure the input stream correctly interprets incoming bytes as UTF-8 characters.
  standardInputSource.setEncoding('utf8');

  // --- Helper Function for Line Processing ---
  // This function encapsulates the logic for validating and storing a single line of input.
  const parseAndStoreInputLine = (singleLineContent) => {
    const cleanedLine = singleLineContent.trim(); // Remove any leading or trailing whitespace.

    // If the line is empty after cleaning, ignore it.
    if (cleanedLine === '') {
      return;
    }

    // Attempt to convert the cleaned line into an integer, base 10.
    const numericInput = parseInt(cleanedLine, 10);

    // Perform validation on the parsed number:
    // 1. Check if it's a valid number (not NaN).
    // 2. Ensure it's non-negative.
    // 3. Verify it's within the bounds of our precomputed sequence array.
    if (isNaN(numericInput) || numericInput < 0 || numericInput > MAX_SEQUENCE_INDEX) {
      // Log an error to standard error and skip this invalid input.
      console.error(`Invalid input detected: "${cleanedLine}". Expected a number between 0 and ${MAX_SEQUENCE_INDEX}. Skipping.`);
      return;
    }

    // If validation passes, add the numeric index to our collection.
    inputIndexCollection.push(numericInput);
  };

  // --- Event Listeners for Standard Input ---
  // Listen for 'data' events, which fire when new input chunks are available.
  standardInputSource.on('data', (incomingDataChunk) => {
    // Append the new data to our existing buffer.
    lineFragmentBuffer += incomingDataChunk;

    // Split the entire buffer by newline characters to get potential complete lines.
    let potentialLines = lineFragmentBuffer.split('\n');

    // The last element might be an incomplete line; store it back in the buffer.
    lineFragmentBuffer = potentialLines.pop();

    // Process all lines that were fully received (not the last potentially incomplete one).
    for (const completeLineReceived of potentialLines) {
      parseAndStoreInputLine(completeLineReceived);
    }
  });

  // Listen for the 'end' event, signifying that no more input will be received.
  standardInputSource.on('end', () => {
    // After all data chunks, process any remaining content in the buffer as a final line.
    if (lineFragmentBuffer.length > 0) {
      parseAndStoreInputLine(lineFragmentBuffer);
    }

    // --- Final Processing and Output ---
    // Iterate through all the collected valid indices.
    for (const currentInputIndex of inputIndexCollection) {
      // Retrieve the corresponding value from our precomputed sequence.
      const sequenceDerivedValue = generatedSequence[currentInputIndex];

      // A safety check, though unlikely if input validation is strict.
      if (sequenceDerivedValue === undefined) {
        console.error(`Error: Sequence value for index ${currentInputIndex} is undefined. This should not happen.`);
        continue;
      }

      // Perform the final arithmetic calculation.
      // Math.trunc() is used to get the integer part of the division,
      // which is equivalent to the bitwise XOR with 0 (`^0`) for positive numbers.
      const finalComputedResult = Math.trunc((sequenceDerivedValue + CALCULATION_ADDITION_OFFSET) / CALCULATION_DIVISOR);

      // Output the calculated result to standard output.
      console.log(finalComputedResult);
    }
  });

  // --- Error Handling for Input Stream ---
  // Add an error listener for robustness against issues with the input stream itself.
  standardInputSource.on('error', (streamError) => {
    console.error('An unrecoverable error occurred during input stream processing:', streamError.message);
    // Exit the process with an error code to indicate failure.
    process.exit(1);
  });

})(); // The IIFE is immediately executed upon script load.
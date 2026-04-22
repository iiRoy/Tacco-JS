(function() {
  'use strict'; // Enforce strict parsing and error handling

  // A buffer to hold all input segments received from the standard input stream.
  // This array will accumulate each line read until the input stream closes.
  let collectedInputSegments = [];

  // Alias for the standard input stream, for clarity and potential future modifications.
  const sourceInStream = process.stdin;
  // Alias for the standard output stream, for consistency.
  const destinationOutStream = process.stdout;

  // Dynamically load the 'readline' module and store it in a constant for interface management.
  const streamInterfaceManager = require('readline');

  // Establish a new input/output interface to handle line-by-line processing.
  // This interface listens to the standard input and directs output to standard output.
  const inputHandler = streamInterfaceManager.createInterface({
    input: sourceInStream,
    output: destinationOutStream
  });

  // Attach an event listener to the input handler.
  // This callback function executes every time a new line of input is detected.
  inputHandler.on('line', function(currentSegment) {
    // Only store non-empty lines to avoid processing blank inputs unnecessarily.
    if (currentSegment && currentSegment.length > 0) {
      collectedInputSegments.push(currentSegment);
    }
  });

  /**
   * Processes the primary input string (the first line received)
   * by inserting a space after the fourth character.
   *
   * @param {string} rawString The string to be processed.
   * @returns {string} The modified string with a space, or an error message if invalid.
   */
  const transformAndFormatString = (rawString) => {
    // Validate the input string before attempting to manipulate it.
    if (typeof rawString !== 'string' || rawString.length < 1) {
      // Return a distinct message for invalid or empty input.
      return "[ERROR: Invalid or empty input string provided for transformation.]";
    }

    // Define a constant for the split point, making it easier to adjust later.
    const splitIndex = 4;

    // Check if the string is long enough to be split at the desired index.
    if (rawString.length < splitIndex) {
      // If too short, just append a space and return the original string.
      // This is an alternative handling compared to the original, which might error or behave unexpectedly.
      return `${rawString} `;
    }

    // Extract the first part of the string up to the split point.
    const initialFragment = rawString.slice(0, splitIndex);
    // Extract the remaining part of the string from the split point onwards.
    const trailingFragment = rawString.slice(splitIndex);

    // Concatenate the fragments with a space in between using a template literal.
    return `${initialFragment} ${trailingFragment}`;
  };

  // Register a final callback function to be executed when the standard input stream ends.
  // This signifies that all input has been received and it's time to process.
  sourceInStream.on('end', function() {
    // Ensure that some input was actually received before attempting to process.
    if (collectedInputSegments.length === 0) {
      destinationOutStream.write("[INFO: No input lines were provided. Exiting.]\n");
      return; // Terminate execution if no input.
    }

    // Retrieve the very first line of input for processing.
    // The original code only ever used the first line, so this behavior is preserved.
    const firstProvidedLine = collectedInputSegments[0];

    // Apply the transformation logic to the first line.
    const finalFormattedOutput = transformAndFormatString(firstProvidedLine);

    // Output the computed result to the standard output stream, followed by a newline.
    destinationOutStream.write(finalFormattedOutput + '\n');

    // Close the readline interface as input processing is complete.
    inputHandler.close();
  });

})(); // Invoke the anonymous function immediately.
const INPUT_STREAM_ENCODING = 'utf8';

let collectedInputDataBuffer = '';

/**
 * Transforms a given string by converting all its characters to uppercase.
 * This helper ensures a consistent transformation mechanism.
 *
 * @param {string} originalString - The string to be converted.
 * @returns {string} The uppercase version of the input string, or an empty string if input is invalid.
 */
const convertToUppercaseString = (originalString) => {
  // Basic validation: ensure we're working with a string.
  if (typeof originalString !== 'string') {
    console.error("Error: Input for uppercase conversion was not a string.");
    return '';
  }
  return originalString.toUpperCase();
};

/**
 * This primary routine executes once all standard input has been received.
 * It processes the buffered content and displays the final result.
 * Includes a check for scenarios where no input was provided.
 */
const triggerFinalOutputProcessing = () => {
  // Before processing, verify if any actual data was collected.
  if (collectedInputDataBuffer.length === 0) {
    console.info("Info: No data was detected from standard input. Exiting gracefully.");
    return; // Terminate execution if buffer is empty.
  }

  // Apply the transformation logic to the accumulated data.
  const finalProcessedText = convertToUppercaseString(collectedInputDataBuffer);

  // Output the transformed string to the console.
  console.log(finalProcessedText);
};

// --- Standard Input Stream Configuration and Event Handling ---

// Configure the character encoding for the process's standard input stream.
// This ensures that incoming bytes are correctly interpreted into characters.
process.stdin.setEncoding(INPUT_STREAM_ENCODING);

// Attach an event listener for 'data' events on the standard input stream.
// This event fires whenever a chunk of data becomes available.
process.stdin.on('data', (incomingDataChunk) => {
  // Append each new data chunk to our global buffer.
  // This accumulates the entire input stream over time.
  collectedInputDataBuffer += incomingDataChunk;
});

// Attach an event listener for the 'end' event on the standard input stream.
// This event signals that no more data will be provided from stdin.
process.stdin.on('end', () => {
  // Once the input stream has concluded, initiate the final processing and output.
  triggerFinalOutputProcessing();
});

/*
 * This JavaScript module is designed to read all content from standard input (stdin),
 * transform that content into its uppercase equivalent, and then print the
 * resulting uppercase string to standard output (stdout).
 * It is robust against empty input, providing an informational message in such cases.
 */
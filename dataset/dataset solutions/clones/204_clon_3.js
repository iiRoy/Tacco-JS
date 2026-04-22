// This script's primary purpose is to ingest textual data from standard input,
// process it line by line, and perform a specific set of word substitutions,
// before outputting the modified content to standard output.
// It's designed to handle a continuous stream of input until an End-Of-File signal is received.

// Configuration object: Defines the mapping for word replacements.
// Using a Map provides a clear and extensible way to manage these rules.
const substitutionMap = new Map([
  ['apple', 'peach'], // Rule 1: 'apple' becomes 'peach'
  ['peach', 'apple']  // Rule 2: 'peach' becomes 'apple'
]);

/**
 * Core processing function that iterates over an array of text segments (lines)
 * and applies the configured word transformations to each.
 * @param {string[]} collectedTextLines - An array where each element is an input line.
 */
function executeLineTransformations(collectedTextLines) {
  // Pre-check: Ensure there is actual data to process.
  // This acts as a guard clause to prevent unnecessary operations on empty input.
  if (!collectedTextLines || collectedTextLines.length === 0) {
    console.warn("Input processor received no valid text lines for transformation. Exiting core logic.");
    return; // Terminate execution if no lines are present.
  }

  let currentLineIndex = 0; // Initialize a counter to track the processed lines.

  // Dynamically construct the regular expression pattern from the keys of our substitution map.
  // The 'g' flag ensures all occurrences within a line are replaced.
  const transformationRegex = new RegExp([...substitutionMap.keys()].join('|'), 'g');

  // Utilize a 'for...of' loop for clear iteration over each line in the array.
  for (const singleTextSegment of collectedTextLines) {
    currentLineIndex++; // Increment the line counter for each segment processed.

    // Perform the string replacement operation.
    // The callback function provides the matched substring, which is then looked up in our map.
    const modifiedSegment = singleTextSegment.replace(transformationRegex, function(matchedTerm) {
      // Retrieve the replacement word from the substitution map.
      // If, unexpectedly, a matched term is not in the map, it defaults to the original term.
      return substitutionMap.get(matchedTerm) || matchedTerm;
    });

    // Output the resulting transformed line to the console.
    console.log(modifiedSegment);
  }

  // Provide a summary message upon completion of all line transformations.
  console.info(`\n--- Transformation process concluded. Total segments processed: ${currentLineIndex}. ---`);
}

// Global accumulator: Stores all raw data received from standard input as a single string.
// Renamed from 'input' to 'accumulatedStreamBuffer' to reflect its purpose as a buffer.
let accumulatedStreamBuffer = '';

// Ensure the standard input stream is explicitly set to resume if it was paused.
// This is a robust practice for stream handling in Node.js.
process.stdin.resume();

// Define the character encoding for the incoming data to prevent corruption.
// UTF-8 is a widely compatible and recommended encoding.
process.stdin.setEncoding('utf8');

// Event handler for 'data' events on the standard input stream.
// This function is invoked whenever a new chunk of data becomes available.
process.stdin.on('data', function(incomingDataChunk) {
  // Basic validation: Check if the received data chunk is a non-empty string.
  // This helps in gracefully handling potentially malformed or empty chunks.
  if (typeof incomingDataChunk === 'string' && incomingDataChunk.length > 0) {
    accumulatedStreamBuffer += incomingDataChunk; // Append the chunk to our buffer.
  } else {
    // Log a warning if an invalid or empty data chunk is received.
    console.warn("Warning: Received an empty or non-string data chunk from standard input.");
  }
});

// Event handler for the 'end' event on the standard input stream.
// This signifies that all input data has been received.
process.stdin.on('end', function() {
  let finalProcessedLines; // Declare a variable to hold the array of lines.
  try {
    // Attempt to split the entire accumulated buffer into individual lines.
    // The split operation might leave an empty string at the end if input concludes with a newline.
    finalProcessedLines = accumulatedStreamBuffer.split('\n');

    // Post-processing step: If the last element is an empty string (due to a trailing newline), remove it.
    // This ensures that the array accurately represents meaningful lines of text.
    if (finalProcessedLines.length > 0 && finalProcessedLines[finalProcessedLines.length - 1] === '') {
      finalProcessedLines.pop();
    }

    // Invoke the main transformation logic with the prepared array of lines.
    executeLineTransformations(finalProcessedLines);
  } catch (processingError) {
    // Implement robust error handling for any exceptions that occur during the final processing stage.
    console.error(`CRITICAL ERROR: An unhandled exception occurred during input parsing or line transformation: ${processingError.message}`);
    // Optionally, log the raw buffer for debugging purposes in case of an error.
    // console.error("Raw buffer content at time of error:", accumulatedStreamBuffer);
  }
});
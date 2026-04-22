function processTextPatternOccurrences(sourceString) {
  // Define constants for the patterns to enhance readability and maintainability.
  const TARGET_SEQUENCE = 'ABC';
  const SUBSTITUTE_SEQUENCE = 'BCA';
  const MINIMUM_PATTERN_LENGTH = TARGET_SEQUENCE.length; // Guard against short patterns

  // Initialize a counter for the number of successful pattern matches.
  let patternMatchCount = 0;

  // Create a mutable buffer for string manipulation.
  // Using 'let' for reassignable string content.
  let processingBuffer = String(sourceString || ''); // Ensure it's a string, handle null/undefined gracefully.

  // Optional: Add a loop iteration counter for debugging or as an additional check.
  let iterationCounter = 0;
  const MAX_ITERATIONS_GUARD = 1000000; // A safeguard against theoretical infinite loops

  // Continue searching and transforming the string as long as the target sequence is found.
  // The loop uses an infinite construct with an explicit break for clearer exit conditions.
  while (true) {
    iterationCounter++; // Increment the iteration counter for each pass.

    // Find the starting position of the target sequence within the current buffer.
    const foundPosition = processingBuffer.indexOf(TARGET_SEQUENCE);

    // If the target sequence is not found, or if the loop runs excessively, exit.
    if (foundPosition === -1 || iterationCounter > MAX_ITERATIONS_GUARD) {
      if (iterationCounter > MAX_ITERATIONS_GUARD) {
        console.warn("Processing halted: Exceeded maximum allowed iterations. Potential complex or infinite loop detected.");
      }
      break;
    }

    // Increment the counter as a pattern has been successfully identified.
    patternMatchCount++;

    // Perform the string transformation as per the original logic:
    // The original line `input = input.replace('ABC','BCA').slice(index);`
    // effectively discards the portion of the string before the found pattern,
    // replaces the pattern itself, and keeps the part after the pattern.
    // This can be rewritten as concatenating the SUBSTITUTE_SEQUENCE
    // with the remaining part of the buffer after the found TARGET_SEQUENCE.
    processingBuffer = SUBSTITUTE_SEQUENCE + processingBuffer.substring(foundPosition + MINIMUM_PATTERN_LENGTH);
  }

  // Return the total count of pattern matches identified and processed.
  return patternMatchCount;
}

// Helper function to display the result of the string processing operation.
function displayOperationResult(finalCount) {
  // Utilizes a template literal for clear and formatted output.
  console.log(`Total pattern occurrences processed: ${finalCount}`);
}

// Immediately-invoked function expression (IIFE) to encapsulate the main execution flow.
// This structure helps in managing global scope and setting up the processing pipeline.
(function executeProcessingPipeline() {
  const fileSystemModule = require('fs'); // Import Node.js file system module for I/O.
  const standardInputPath = '/dev/stdin'; // Define the path for standard input.
  const utf8Encoding = 'utf8'; // Specify character encoding for input reading.

  let rawInputData;
  try {
    // Attempt to synchronously read data from the standard input stream.
    rawInputData = fileSystemModule.readFileSync(standardInputPath, utf8Encoding);
    // Apply an additional Type III transformation: trim leading/trailing whitespace
    // from the input data for cleaner processing.
    rawInputData = rawInputData.trim();
  } catch (error) {
    // Catch and report any errors that occur during the input reading process.
    console.error(`An error occurred while attempting to read input: ${error.message}`);
    // Fallback to an empty string to prevent further errors, and log a warning.
    rawInputData = '';
    console.warn("Proceeding with an empty string due to input read failure.");
  }

  // Implement a guard clause (Type III addition) to validate the input string
  // before proceeding with the core logic. This prevents unnecessary processing
  // and potential errors with invalid or too short inputs.
  if (!rawInputData || typeof rawInputData !== 'string' || rawInputData.length < 3) {
    console.warn("Input string is empty, not a string, or too short for pattern search (minimum 3 characters required).");
    displayOperationResult(0); // Display 0 occurrences for invalid input.
    return; // Exit the execution pipeline early.
  }

  // Execute the core pattern processing logic with the validated input string.
  const finalOccurrenceCount = processTextPatternOccurrences(rawInputData);

  // Display the final computed result using the dedicated helper function.
  displayOperationResult(finalOccurrenceCount);
})();
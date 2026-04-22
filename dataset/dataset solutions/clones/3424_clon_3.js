// This script is designed to process standard input.
// It reads a single line from stdin and checks if its numeric content
// matches one of a predefined set of prime numbers (3, 5, or 7).
// The outcome is then printed to standard output.

// Ensure the standard input stream remains active for reading operations.
process.stdin.resume();

// Set the character encoding for incoming data to UTF-8 for proper string interpretation.
process.stdin.setEncoding('utf8');

// A container to accumulate all lines received from the standard input stream.
const collectedInputLines = [];

// Initialize an interface for reading input line by line.
// This utility abstracts the complexities of stream processing.
const textInputInterface = require('readline').createInterface({
  input: process.stdin,   // Designate standard input as the source.
  output: process.stdout  // Designate standard output for any potential prompts (though not used here).
});

// Attach an event listener for each time a complete line of text is received.
textInputInterface.on('line', (currentLineString) => {
  // Store the newly received line into our collection.
  collectedInputLines.push(currentLineString);
});

// Attach an event listener that triggers once the input stream is closed
// (e.g., when the user presses Ctrl+D or the input pipe ends).
textInputInterface.on('close', () => {
  // Validate that at least one line of input was provided.
  if (collectedInputLines.length === 0) {
    console.error("Error: No input lines were provided.");
    // Exit with a non-zero code to indicate an error.
    process.exit(1);
    return; // Redundant due to process.exit, but good practice.
  }

  // Retrieve the very first line of input received.
  const firstLineContent = collectedInputLines[0];

  // Define the set of specific numeric values we are looking for.
  const desiredNumericSet = new Set([3, 5, 7]);

  // Attempt to convert the input string into an integer.
  // We'll use parseInt with a radix for robustness.
  const parsedNumericValue = parseInt(firstLineContent, 10);

  // Perform a validation check: ensure the parsed value is a valid number.
  if (isNaN(parsedNumericValue)) {
    console.log("NO"); // If it's not a number, it can't be 3, 5, or 7.
    return; // Terminate execution for this input.
  }

  // Determine if the parsed numeric value is present within our set of desired values.
  const isMatchFound = desiredNumericSet.has(parsedNumericValue);

  // Based on the match, output the corresponding affirmative or negative response.
  if (isMatchFound) {
    console.log("YES");
  } else {
    console.log("NO");
  }
});
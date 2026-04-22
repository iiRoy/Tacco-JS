// Ensure the standard input stream is active for data reception.
process.stdin.resume();

// Explicitly set the character encoding for incoming data to UTF-8.
process.stdin.setEncoding('utf8');

// A collection to store all the input lines received from the system.
const incomingLineSegments = [];

// Acquire the 'readline' module to facilitate line-by-line input processing.
const lineInputModule = require('readline');

// Configure and instantiate an interactive interface for reading from standard input.
const inputProcessorInstance = lineInputModule.createInterface({
  input: process.stdin,   // Direct the input stream to process.stdin.
  output: process.stdout  // Direct output stream to process.stdout (though not used for primary task).
});

// Register an event handler for when a new line of text is received.
inputProcessorInstance.on('line', (currentInputLineText) => {
  // Append the newly read line to our internal buffer for later processing.
  incomingLineSegments.push(currentInputLineText);
});

// Register an event handler for when the input stream indicates it has closed.
inputProcessorInstance.on('close', () => {
  // A preliminary check: if no input lines were ever captured, it indicates an issue or empty input.
  if (incomingLineSegments.length === 0) {
    console.error("Error: No input data was provided. The application requires at least one line of input.");
    // Terminate the process with a non-zero exit code to signal an error.
    process.exit(1);
  }

  // Extract the very first line of input as the primary data source for this operation.
  const initialDataRow = incomingLineSegments[0];

  // Parse the initial data row into an array of distinct tokens, using a space character as the delimiter.
  let contentTokens = initialDataRow.split(" ");

  // --- Core Data Manipulation Logic ---

  // Proceed with the swap operation only if there are at least two tokens available.
  if (contentTokens.length >= 2) {
    // Declare a temporary storage variable to hold the value of the first token during the swap.
    const temporaryFirstTokenValue = contentTokens[0];
    // Assign the value of the second token to the position of the first token.
    contentTokens[0] = contentTokens[1];
    // Assign the temporarily stored value of the original first token to the second position.
    contentTokens[1] = temporaryFirstTokenValue;

    // Optional debug step: uncomment to see the array state post-swap.
    // console.log("Intermediate state (tokens after potential swap):", contentTokens);
  } else {
    // If there are fewer than two tokens (e.g., zero or one token),
    // the intended behavior (based on the original's likely outcome if fixed)
    // is that the final output should be an empty string.
    // To achieve this, we clear the contentTokens array.
    contentTokens = [];
  }

  // Concatenate all the elements of the (potentially modified) contentTokens array
  // into a single output string, with no characters separating the joined elements.
  const finalConcatenatedString = contentTokens.join("");

  // Output the resulting string to the standard console.
  console.log(finalConcatenatedString);
});
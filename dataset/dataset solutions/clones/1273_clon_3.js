// This JavaScript module is designed to capture standard input, process a specific line from it,
// and then output the words of that line in reverse order. It includes robust error handling
// and structural modifications to the original logic.

// --- Global Data Buffer ---
// A mutable variable to accumulate all incoming data chunks from the standard input stream.
// Using 'let' to explicitly denote its reassignable nature during data accumulation.
let accumulatedInputStreamData = '';

/**
 * Processes an array of text lines to reverse the word order of a designated line.
 * This function encapsulates the core logic of word splitting, reversal, and rejoining.
 *
 * @param {string[]} lineSegments - An array where each element represents a line of input.
 * @returns {string} A string containing the words from the second input line, reversed,
 *                   or an empty string if input is insufficient or invalid.
 */
function processAndInvertWordOrder(lineSegments) {
  // Define the character used to separate individual words (tokens) within a line.
  const wordDelimiter = ' ';

  // --- Type III Addition: Robustness Check (Guard Clause) ---
  // Verify that the input is a valid array and contains at least two lines.
  // The original problem implies using `input[1]`, requiring at least two lines.
  if (!Array.isArray(lineSegments) || lineSegments.length < 2) {
    // Log a diagnostic message to the error stream if the input is malformed.
    console.error("PROCESS_ERROR: Received insufficient or invalid line segments. Expected at least 2 lines.");
    return ""; // Return an empty string as a safe default for invalid scenarios.
  }

  // --- Type II Change: Renamed variable and used 'const' for immutability ---
  // Select the second line (index 1) for processing, consistent with the original problem's intent.
  const targetContentString = lineSegments[1];

  // --- Type III Addition: Input Validation for Target Line ---
  // Ensure the selected line is a non-empty string before attempting string operations.
  if (typeof targetContentString !== 'string' || targetContentString.trim().length === 0) {
    console.error("PROCESS_WARNING: The designated input line is empty or not a string type. Cannot reverse words.");
    return ""; // Return empty if the target line itself is problematic.
  }

  // --- Type II Change: Renamed variable ---
  // Break down the target line into an array of individual words using the defined delimiter.
  let constituentWords = targetContentString.split(wordDelimiter);

  // --- Type III Update: Manual Word Reversal (Replaced built-in `reverse()`) ---
  // Instead of using the in-place `Array.prototype.reverse()`, we construct a new array
  // by iterating backwards through the original word list. This demonstrates a structural rewrite.
  const invertedWordCollection = [];
  for (let i = constituentWords.length - 1; i >= 0; i--) {
    invertedWordCollection.push(constituentWords[i]);
  }
  // The original `str.reverse();` functionality is achieved here through explicit iteration.

  // --- Type II Change: Renamed variable and used 'const' ---
  // Join the words in their new, reversed order back into a single string,
  // using the same delimiter.
  const finalReversedPhrase = invertedWordCollection.join(wordDelimiter);

  // --- Type III Update: Returns result instead of direct logging ---
  // The processed string is now returned by the function, allowing the calling context
  // to decide how to handle the output (e.g., logging, further processing).
  return finalReversedPhrase;
}

// --- Type III Addition: Encapsulation of I/O Setup ---
/**
 * Sets up the standard input stream listeners to capture all incoming data
 * and triggers the word reversal process upon stream completion.
 */
function initializeInputHandlingMechanism() {
  // Ensure the standard input stream is active and ready to receive data.
  process.stdin.resume();
  // Specify UTF-8 encoding to correctly interpret multi-byte characters.
  process.stdin.setEncoding('utf8');

  // --- Event Listener: Data Reception ---
  // This callback executes every time a chunk of data is received via stdin.
  process.stdin.on('data', (dataChunk) => {
    // --- Type II Change: Renamed parameter ---
    // Append the current data chunk to the global accumulator.
    accumulatedInputStreamData += dataChunk;
  });

  // --- Event Listener: End of Stream ---
  // This callback executes once the standard input stream has completely ended.
  process.stdin.on('end', () => {
    // --- Type III Addition: Early Exit for No Input ---
    // If no data was received throughout the entire stream, log a message and exit gracefully.
    if (accumulatedInputStreamData.length === 0) {
      console.log("INFO: No input data was provided. Nothing to process.");
      return; // Terminate execution if no input was found.
    }

    // --- Type II Change: Renamed variable and used 'const' ---
    // Split the entire accumulated data buffer into an array of individual lines.
    const collectedInputLinesArray = accumulatedInputStreamData.split('\n');

    // --- Type III Update: Call the processing function and handle its return ---
    // Invoke the main processing logic with the prepared input lines.
    const operationResult = processAndInvertWordOrder(collectedInputLinesArray);

    // Output the final result to the standard output stream.
    console.log(operationResult);
  });
}

// --- Type III Addition: Immediate Execution Trigger ---
// Initiate the input handling mechanism as soon as the script loads.
// This ensures the program is ready to receive input immediately.
initializeInputHandlingMechanism();
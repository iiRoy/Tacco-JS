// This module is designed to process textual input from standard input,
// analyze the frequency of each lowercase English letter, and then
// present a detailed report of these character counts.

/**
 * Core function to process an array of text lines. It initializes tallies for
 * all lowercase English letters, iterates through each line and its characters,
 * increments the appropriate letter counts, and finally prints a summary report.
 *
 * @param {string[]} inputRows - An array of strings, where each string represents a line of text.
 *                               These lines will be analyzed for character frequencies.
 */
function processInputData(inputRows) {
  // A mapping to store the frequency of each lowercase English letter.
  // Keys are letters ('a' through 'z'), and values are their respective counts.
  const letterTallies = {};

  // Define constants for the English alphabet to ensure clarity and maintainability.
  const ENGLISH_ALPHABET_LENGTH = 26;
  const ASCII_LOWERCASE_A = 'a'.charCodeAt(0); // The ASCII value of the character 'a'.

  // Initialize all lowercase English letters in our tally map with a count of zero.
  // This guarantees that all letters 'a' through 'z' will be present in the final report,
  // even if they do not appear in the input text.
  for (let charCodeOffset = 0; charCodeOffset < ENGLISH_ALPHABET_LENGTH; charCodeOffset++) {
    const currentAlphabetLetter = String.fromCharCode(ASCII_LOWERCASE_A + charCodeOffset);
    letterTallies[currentAlphabetLetter] = 0;
  }

  // Implement a guard clause: If the input array is not valid or is empty,
  // log a warning and exit the function gracefully, as there's no data to process.
  if (!Array.isArray(inputRows) || inputRows.length === 0) {
    console.warn("Analysis skipped: No valid text lines were provided for processing.");
    return; // Terminate execution if no input lines are present.
  }

  // Iterate over each line received in the input collection.
  for (let lineIndex = 0; lineIndex < inputRows.length; lineIndex++) {
    const originalLineContent = inputRows[lineIndex];

    // Robustly convert the line to a string (handling potential null/undefined)
    // and then to lowercase to ensure case-insensitive counting.
    const normalizedLineForCounting = String(originalLineContent || '').toLowerCase();

    // Process each individual character within the normalized line.
    // Using `for...of` provides a cleaner iteration over string characters.
    for (const characterSymbol of normalizedLineForCounting) {
      // Only count characters that fall within the range of lowercase English letters ('a' through 'z').
      // This filters out spaces, punctuation, numbers, and other symbols, focusing solely on letters.
      if (characterSymbol >= 'a' && characterSymbol <= 'z') {
        letterTallies[characterSymbol]++; // Increment the count for the identified letter.
      }
    }
  }

  // Output the final frequency report for all lowercase English letters.
  // The report header provides context for the user.
  console.log("\n--- Character Frequency Analysis Report ---");

  // Retrieve all keys (letters) from the `letterTallies` map,
  // sort them alphabetically, and then iterate to display each letter's count.
  Object.keys(letterTallies)
        .sort() // Ensure the output is in alphabetical order for consistency.
        .forEach(letterToDisplay => {
          const countForLetter = letterTallies[letterToDisplay];
          console.log(`'${letterToDisplay}' : ${countForLetter} occurrence(s)`);
        });

  // The report footer signals the completion of the analysis.
  console.log("--- End of Report ---");
}

// --- Standard Input (stdin) Stream Handling for Node.js Environment ---

// A dynamic array to accumulate all incoming data segments from standard input.
// Data typically arrives in chunks (Buffers), which we'll convert to strings.
const collectedInputDataSegments = [];

// Set up an event listener for when data becomes available on the standard input stream.
// Each `chunk` represents a piece of data read from stdin.
process.stdin.on('data', (incomingDataChunk) => {
  // Perform a basic validation to ensure the chunk is not null or undefined
  // before attempting to process it.
  if (incomingDataChunk) {
    // Convert the incoming Buffer chunk to a string and add it to our collection.
    // Assuming UTF-8 encoding for standard text input.
    collectedInputDataSegments.push(incomingDataChunk.toString('utf8'));
  }
});

// Set up an event listener for when the standard input stream has finished sending all data.
process.stdin.on('end', () => {
  try {
    // Once all data chunks have been received, join them into a single comprehensive string.
    // Then, split this string by newline characters to obtain an array of individual lines.
    const finalProcessedLines = collectedInputDataSegments.join('').split('\n');

    // Call our primary function to process the collected and formatted input lines.
    processInputData(finalProcessedLines);
  } catch (processingError) {
    // Catch and report any errors that occur during the final input processing steps
    // (e.g., joining chunks, splitting lines, or within `processInputData` itself).
    console.error("An unexpected error occurred during input data finalization:", processingError.message);
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
  }
});

// Set up an event listener to catch any errors that might occur directly on the standard input stream.
process.stdin.on('error', (streamError) => {
  console.error("Error encountered while reading from standard input:", streamError.message);
  process.exit(1); // Exit with an error code if stdin itself fails.
});

// A simple startup message to inform the user that the application is ready
// and awaiting input from the standard input stream.
console.log("Character Counter Application Initialized. Awaiting input from stdin...");
console.log("Please type your text and press Ctrl+D (Unix/Linux) or Ctrl+Z then Enter (Windows) to finish.");
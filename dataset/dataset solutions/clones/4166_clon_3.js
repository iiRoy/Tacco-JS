/**
 * This module is designed for processing string inputs, specifically to
 * count the occurrences of the digit '1' within a given sequence of characters.
 * It includes robust handling for various input types and potential file system errors.
 */

/**
 * Analyzes an input string or data structure to determine the total count
 * of the character '1'. It performs type coercion and iterative processing.
 *
 * @param {string | any} sourceMaterial - The primary data source to be examined.
 *                                        If not a string, it will be converted.
 * @returns {void} This procedure logs the final tally directly to the console.
 */
function ProcessCharacterSequence(sourceMaterial) {
  // --- Type III: Input Validation and Data Normalization ---
  let normalizedSequence;

  // Validate the incoming data type. If it's not a string, attempt to convert it.
  if (typeof sourceMaterial !== 'string') {
    console.warn("Input provided was not a string type. Coercing to string for analysis.");
    normalizedSequence = String(sourceMaterial); // Ensure we are working with a string.
  } else {
    normalizedSequence = sourceMaterial;
  }

  // --- Type III: Early Return for Edge Cases ---
  // If the normalized string is empty, there are no '1's to count.
  if (normalizedSequence.length === 0) {
    console.log(0);
    return; // Exit early to prevent unnecessary processing.
  }

  // --- Type II: Renaming and Intermediate Data Structure ---
  // Convert the string into an array of individual characters for easier iteration.
  const individualCharacters = normalizedSequence.split('');

  // --- Type III: Core Logic Transformation (Loop-based Counting) ---
  let tallyOfTargetDigit = 0; // Initialize a dedicated counter variable.

  // Iterate through each character using a traditional for loop.
  for (let idx = 0; idx < individualCharacters.length; idx++) {
    const currentSymbol = individualCharacters[idx]; // Retrieve the character at the current index.

    // --- Type III: Enhanced Comparison Logic with Type Conversion ---
    // Attempt to convert the character to a number.
    const symbolAsNumber = Number(currentSymbol);

    // Check if the conversion resulted in a valid number (not NaN)
    // AND if that number's value is exactly 1.
    if (!isNaN(symbolAsNumber) && symbolAsNumber === 1) {
      tallyOfTargetDigit++; // Increment our explicit counter.
    }
  }

  // --- Type II: Final Result Storage and Output Formatting ---
  const finalComputedResult = tallyOfTargetDigit; // Store the final count.

  // Present the final result to the user via the console.
  console.log(finalComputedResult);
}

// =======================================================================
// --- Application Entry Point: Input Retrieval and Function Invocation ---
// =======================================================================

// Type II: Renaming the standard Node.js file system module reference.
const fileSystemModule = require("fs");

// Type II: Renaming the path to the standard input stream.
const standardInputEndpoint = "/dev/stdin";

let rawInputContent = ""; // Variable to hold the data read from the input source.

// --- Type III: Robust File Reading with Error Handling ---
try {
  // Type II: Renaming the variable that stores the content read from the file.
  // Synchronously read the entire content of the standard input file,
  // interpreting it as a UTF-8 encoded string.
  rawInputContent = fileSystemModule.readFileSync(standardInputEndpoint, "utf8");
} catch (fileReadError) {
  // Type III: Log any errors encountered during the file reading process.
  console.error(`Failed to retrieve input from ${standardInputEndpoint}:`, fileReadError.message);
  // In case of error, ensure rawInputContent is an empty string to avoid further issues.
  rawInputContent = "";
}

// Type II: Invoke the primary processing function with the obtained input.
ProcessCharacterSequence(rawInputContent);
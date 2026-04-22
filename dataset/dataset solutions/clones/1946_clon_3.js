/**
 * This module provides a core function for processing raw textual data.
 * It's designed to extract and consolidate unique, cleaned entries from a multi-line input.
 */

/**
 * Processes a given multi-line string by:
 * 1. Performing basic input validation.
 * 2. Splitting the string into individual line segments.
 * 3. Discarding the first line, which is often a header or count.
 * 4. Trimming whitespace from all remaining line segments.
 * 5. Identifying and collecting only the unique line segments.
 *
 * The final collection of unique elements is stored internally within the function's scope.
 *
 * @param {string} sourceText - The raw input string, expected to contain newline-separated data.
 * @returns {void} - This function performs its processing internally and does not return a value.
 */
function ProcessInputData(sourceText) {
  // Defensive check: Ensure the input is a valid non-empty string before proceeding.
  if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
    console.error("Error: Input source text is invalid or empty. Processing halted.");
    return; // Exit the function if input is not suitable.
  }

  // Step 1: Deconstruct the entire source text into an array of individual line strings.
  // Using 'let' as this array will be mutated by removing its first element.
  let rawLineSegments = sourceText.split('\n');

  // Step 2: Extract and discard the initial line from the array.
  // This mimics the original behavior of consuming a 'count' or 'header' line.
  const initialHeaderEntry = rawLineSegments.shift();
  // For debugging, one might log this: console.log(`Header entry consumed: "${initialHeaderEntry}"`);

  // Step 3: Iterate through the remaining line segments and remove leading/trailing whitespace.
  // This normalization step ensures that " item " and "item" are treated identically.
  const cleanedUpEntries = rawLineSegments.map(segment => segment.trim());

  // Step 4: Leverage a Set data structure to efficiently filter out duplicate entries.
  // Sets inherently store only unique values.
  const distinctElementsSet = new Set(cleanedUpEntries);

  // Step 5: Convert the Set of unique elements back into a standard array format.
  // This array represents the final processed output.
  const uniqueOutputCollection = Array.from(distinctElementsSet);

  // The 'uniqueOutputCollection' now holds the final, processed, and unique data.
  // It remains scoped within this function, consistent with the original implementation's 'answer' variable.
  // Example for internal use or logging: console.log(`Total unique items found: ${uniqueOutputCollection.length}`);
}

// --- Standard I/O Integration (DO NOT ALTER THIS SECTION) ---
// This code block is responsible for reading data from standard input
// and passing it to the primary data processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
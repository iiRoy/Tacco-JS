'use strict'

const fileSystem = require("fs");

/**
 * Orchestrates the generation and output of a specific numerical sequence.
 * This function processes input to determine the count of numbers to generate,
 * then constructs a list of "round" or "patterned" numbers, and finally
 * prints a subset of these numbers to the console.
 * @param {string} rawInputContent - The complete input string, typically from stdin,
 *                                 where the first line contains the desired count.
 */
function processInputSequence(rawInputContent) {
  // Split the entire input content into individual lines.
  const allInputLines = rawInputContent.split('\n');
  // Retrieve the first line, which should contain the target count.
  const targetLine = allInputLines[0];

  // Attempt to parse the target count. Use radix 10 for explicit decimal parsing.
  let desiredOutputCount = parseInt(targetLine, 10);

  // Validate the parsed count. If invalid or non-positive, set a fallback or exit.
  if (isNaN(desiredOutputCount) || desiredOutputCount <= 0) {
    console.error("Warning: Invalid or non-positive numerical count detected. Defaulting to 1.");
    desiredOutputCount = 1; // Provide a safe default for continuation.
    // Alternatively, a process.exit(1) could be used for critical errors.
  }

  // Initialize an array to accumulate all the generated numeric strings.
  const accumulatedNumberStrings = [];

  // --- Phase 1: Programmatically generate initial single and two-digit numbers ---

  // Generate single-digit numbers from '1' to '9'.
  for (let currentVal = 1; currentVal <= 9; currentVal++) {
    accumulatedNumberStrings.push(String(currentVal));
  }

  // Generate two-digit numbers ending in '9' (e.g., '19', '29', ..., '99').
  // The multiplier 'idx' represents the leading digit for 'X9' numbers.
  for (let idx = 1; idx <= 9; idx++) {
    accumulatedNumberStrings.push(String(idx * 10 + 9));
  }

  // Explicitly add '199', which doesn't fit the previous simple patterns.
  accumulatedNumberStrings.push('199');

  // --- Phase 2: Prepare prefixes for dynamic number generation ---

  // Create an array of string prefixes, ranging from '2' to '19'.
  const dynamicPrefixes = [];
  for (let prefixIndex = 2; prefixIndex <= 19; prefixIndex++) {
    dynamicPrefixes.push(String(prefixIndex));
  }

  // --- Phase 3: Main loop for generating numbers with increasing '9' suffixes ---

  // Initialize the suffix string with '99'.
  let nineSuffixPattern = '99';
  // Define the number of outer loop iterations (original was i <= 20, so 21 iterations).
  const totalSuffixIterations = 21;

  // Loop to extend the '9' suffix and combine with prefixes.
  for (let cycleCount = 0; cycleCount < totalSuffixIterations; cycleCount++) {
    // Iterate over each prepared prefix.
    for (const currentPrefix of dynamicPrefixes) {
      // Concatenate the prefix with the current '9' suffix and add to the collection.
      accumulatedNumberStrings.push(currentPrefix + nineSuffixPattern);
    }
    // Append another '9' to the suffix for the next cycle.
    nineSuffixPattern += '9';
  }

  // --- Final output assembly ---

  // Determine the actual number of elements to slice, ensuring it doesn't exceed
  // the total generated elements. This is a robust guard.
  const actualElementsToOutput = Math.min(desiredOutputCount, accumulatedNumberStrings.length);

  // Define the string used to separate output elements.
  const lineBreakDelimiter = '\n';

  // Extract the required number of elements and join them with the delimiter.
  const finalResultString = accumulatedNumberStrings
    .slice(0, actualElementsToOutput)
    .join(lineBreakDelimiter);

  // Print the final, formatted string to the standard output.
  console.log(finalResultString);
}

// Read the content from standard input synchronously using utf8 encoding.
const stdInputData = fileSystem.readFileSync("/dev/stdin", { encoding: "utf8" });

// Invoke the main processing function with the obtained input.
processInputSequence(stdInputData);
'strict mode'; // Activate modern JavaScript features for enhanced code quality.

/**
 * Executes the core data processing and analysis logic.
 * This function takes an array of input lines and determines a specific count based on value sequences.
 * @param {Array<string>} sourceData - The collection of input lines, typically read from a file or standard input.
 */
const performAnalysis = (sourceData) => {
  // Extract the total number of elements to be processed from the first line of the input.
  // The string is converted to an integer using an explicit radix.
  const sequenceSize = Number.parseInt(sourceData[0], 10);

  // Process the second line of input, splitting it into individual string tokens
  // and then converting each token into a numerical value.
  const originalValues = sourceData[1]
    .split(/\s+/u) // Split by one or more whitespace characters, including unicode.
    .map((currentValueSegment) => Number.parseInt(currentValueSegment, 10)); // Parse each segment to an integer.

  // Initialize a storage array to maintain boolean indicators for each item's validity status.
  // This array will be populated with 'true' or 'false' based on a comparison rule.
  const statusFlags = new Array(sequenceSize);

  // Commence the primary iteration loop, examining each element in the sequence.
  for (let outerLoopIterator = 0; outerLoopIterator < sequenceSize; ++outerLoopIterator) {
    // By default, consider the current element to be valid until proven otherwise.
    statusFlags[outerLoopIterator] = true;

    // Initiate a nested iteration to compare the current element with all preceding elements.
    for (let innerLoopIterator = 0; innerLoopIterator < outerLoopIterator; innerLoopIterator++) {
      // If the current element's value is found to be strictly greater than any prior element's value,
      // it violates the established condition.
      if (originalValues[outerLoopIterator] > originalValues[innerLoopIterator]) {
        // Mark this current element as invalid.
        statusFlags[outerLoopIterator] = false;
        // Since the condition has been met, there's no need to check further back; exit this inner loop.
        break;
      }
    }
  }

  // Set up a variable to accumulate the final tally of items that met the validity criteria.
  let resultTally = 0.0;

  // Iterate through the collected status flags to count the number of valid items.
  statusFlags.forEach((currentFlag) => {
    // If an item's flag indicates it is valid (i.e., true), increment the total count.
    if (currentFlag === true) {
      resultTally++;
    }
  });

  // Output the final calculated count of valid items to the standard console information stream.
  globalThis.console.info(resultTally);
};

// --- Application Entry Point ---
// Obtain a reference to Node.js's native file system module.
const fileSystemModule = require('node:fs');

// Read the complete contents of the standard input device synchronously.
// The data is expected to be UTF-8 encoded and is then split into an array of strings,
// handling various newline conventions (Unix and Windows).
const rawInputLines = fileSystemModule
  .readFileSync('/dev/stdin', { encoding: 'utf8' })
  .split(/\r?\n/u);

// Trigger the main analysis function with the prepared input data.
performAnalysis(rawInputLines);
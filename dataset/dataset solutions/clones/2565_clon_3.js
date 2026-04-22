let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedLines = [];
let lineIterator; // Will be initialized after all lines are read

// Event handler for each line of input received
inputReader.on('line', function(singleLineInput){
  collectedLines.push(singleLineInput);
});

// Event handler for when input stream closes
inputReader.on('close', function(){
  // Initialize the input processing utility once all lines are collected
  lineIterator = createInputLineIterator(collectedLines);

  // Execute the primary problem-solving logic
  executeSequenceProcessing();
});

/**
 * Creates an object to iterate over input lines.
 * This abstracts away the raw array access.
 * @param {string[]} sourceData - An array of raw input strings.
 * @returns {object} An iterator object with methods to check for and retrieve next lines.
 */
function createInputLineIterator(sourceData) {
  return {
    sourceLines: sourceData,
    currentLineIndex: 0,
    totalLines: sourceData.length,

    /**
     * Checks if there are more lines available to process.
     * @returns {boolean} True if more input exists, false otherwise.
     */
    hasMoreInput: function() {
      return (this.currentLineIndex < this.totalLines);
    },

    /**
     * Retrieves the next line from the input.
     * Throws an error if no more input is available.
     * @returns {string} The next input line.
     */
    retrieveNextLine: function() {
      if (this.hasMoreInput()) {
        return this.sourceLines[this.currentLineIndex++];
      } else {
        // Custom error for end-of-input condition
        throw new Error("EndOfInputException: No more input lines available for processing.");
      }
    }
  };
}

/**
 * Displays the final computed result to standard output.
 * @param {*} outputValue - The value to be printed.
 */
function displayResult(outputValue) {
  console.log(outputValue);
}

/**
 * Provides diagnostic logging to standard error.
 * Useful for debugging without interfering with standard output.
 * @param {string} debugMessage - The message to log.
 */
function logDiagnostic(debugMessage) {
  console.error(`DIAG: ${debugMessage}`);
}

/**
 * Transforms an input string based on a specified type.
 * This function handles common parsing and splitting operations.
 * @param {string} inputValue - The string to transform.
 * @param {number} transformationType - An identifier for the desired transformation.
 *   1: Parse as an integer.
 *   6: Split into an array of individual characters.
 * @returns {*} The transformed value, or the original value if transformation fails or is not defined.
 */
function transformInputData(inputValue, transformationType) {
  try {
    switch (transformationType) {
      case 1: // Convert to integer, using radix 10 for safety
        return parseInt(inputValue, 10);
      case 6: // Split the string into an array of its constituent characters
        return inputValue.split("");
      default: // If no specific transformation type is recognized, return the input as is
        return inputValue;
    }
  } catch (error) {
    logDiagnostic(`Error during input transformation: ${error.message}. Input was: '${inputValue}'`);
    return inputValue; // Return original value on error to prevent crashes
  }
}

/**
 * Retrieves the next input line and parses it as an integer.
 * @returns {number} The parsed integer.
 */
function parseNextInteger() {
  return transformInputData(lineIterator.retrieveNextLine(), 1);
}

/**
 * Retrieves the next input line and converts it into an array of characters.
 * @returns {string[]} An array of characters.
 */
function parseNextCharSequence() {
  return transformInputData(lineIterator.retrieveNextLine(), 6);
}

// Don't have to see. end------------------------------------------

/**
 * The main function implementing the sequence analysis logic.
 * It calculates the maximum Z-value under specific conditions
 * for all suffixes of an input character sequence.
 */
function executeSequenceProcessing() {
  // Read an initial count. In the original problem, this might be N,
  // but it's not directly used in the Z-algorithm logic itself.
  // We'll add a simple validation or a dummy use for it.
  const initialCount = parseNextInteger();
  if (initialCount < 0) {
    logDiagnostic("Warning: Initial count is negative. This might indicate an invalid problem setup.");
  }

  // Read the primary character sequence to be processed.
  // This array will be modified by removing its first element in each iteration.
  let workingSequence = parseNextCharSequence();

  // This variable will store the largest Z-value found that satisfies the problem's criteria.
  let maximumCommonPrefixLength = 0;

  // The algorithm iteratively processes suffixes of the original string.
  // In each iteration, the first character of `workingSequence` is removed.
  while (workingSequence.length > 0) {
    const currentSequenceLength = workingSequence.length;

    // Guard clause: If the sequence is too short, Z-algorithm is not meaningful,
    // or the condition (Z-value <= length/2) cannot be met for Z-values > 0.
    if (currentSequenceLength < 2) {
      logDiagnostic(`Current sequence length is ${currentSequenceLength}, which is too short for Z-algorithm or condition check. Skipping.`);
      workingSequence.shift(); // Still remove the character to ensure loop termination
      continue;
    }

    // Initialize an array to store Z-values for the current `workingSequence`.
    // zAlgorithmArray[i] will store the length of the longest substring starting at index `i`
    // that is also a prefix of `workingSequence`.
    const zAlgorithmArray = new Array(currentSequenceLength);
    // The Z-value for the first element (index 0) is always the length of the sequence itself.
    zAlgorithmArray[0] = currentSequenceLength;

    // Pointers and lengths for the Z-algorithm calculation.
    let currentScanPosition = 1; // 'i' in typical Z-algorithm: the index whose Z-value is being computed.
    let currentPrefixMatchLength = 0; // 'j' in typical Z-algorithm: length of the current matching prefix.

    // Main loop to compute Z-values for each position in the sequence.
    while (currentScanPosition < currentSequenceLength) {
        // Step 1: Extend the current prefix match.
        // Compare characters from the beginning of the sequence (at `currentPrefixMatchLength`)
        // with characters starting at `currentScanPosition` (at `currentScanPosition + currentPrefixMatchLength`).
        while ((currentScanPosition + currentPrefixMatchLength < currentSequenceLength) &&
               (workingSequence[currentPrefixMatchLength] === workingSequence[currentScanPosition + currentPrefixMatchLength])) {
            currentPrefixMatchLength++;
        }
        // Store the determined match length for the current `currentScanPosition`.
        zAlgorithmArray[currentScanPosition] = currentPrefixMatchLength;

        // Step 2: If no match was found (length is 0), simply move to the next position.
        if (currentPrefixMatchLength === 0) {
            currentScanPosition++;
            continue;
        }

        // Step 3: Optimization using previously computed Z-values.
        // If a match (Z-box) was found, we can potentially copy Z-values from within this box.
        let copyOffset = 1; // 'k' in original: offset from `currentScanPosition` for copying Z-values.
        // This loop copies values as long as the copy doesn't extend beyond the current Z-box
        // and the target position (`currentScanPosition + copyOffset`) is within bounds.
        while ((currentScanPosition + copyOffset < currentSequenceLength) &&
               (copyOffset + zAlgorithmArray[copyOffset] < currentPrefixMatchLength)) {
            // Copy the Z-value from the corresponding position (`copyOffset`) in the prefix part
            // to the current block being processed.
            zAlgorithmArray[currentScanPosition + copyOffset] = zAlgorithmArray[copyOffset];
            copyOffset++;
        }

        // Step 4: Adjust pointers after the optimization.
        // Advance `currentScanPosition` past the block of copied Z-values.
        currentScanPosition += copyOffset;
        // Reduce `currentPrefixMatchLength` by the length of the block that was copied,
        // as this portion has already been 'covered' by the optimization.
        currentPrefixMatchLength -= copyOffset;
    }

    // After computing all Z-values for the current `workingSequence`,
    // iterate through them to find the maximum relevant common prefix length.
    // The problem requires Z-values that are at most half the current sequence length.
    const halfCurrentSequenceLength = Math.floor(currentSequenceLength / 2);

    for (let traversalIndex = currentSequenceLength - 1; traversalIndex >= 1; --traversalIndex) {
      // If a Z-value at `traversalIndex` meets the length criterion,
      // it's a candidate for `maximumCommonPrefixLength`.
      if (zAlgorithmArray[traversalIndex] <= halfCurrentSequenceLength) {
        maximumCommonPrefixLength = Math.max(maximumCommonPrefixLength, zAlgorithmArray[traversalIndex]);
      }
    }

    // Remove the first character of the sequence. This prepares `workingSequence`
    // for the next iteration, effectively processing the next suffix of the original string.
    workingSequence.shift();
  }

  // Output the final computed maximum common prefix length.
  displayResult(maximumCommonPrefixLength);
}
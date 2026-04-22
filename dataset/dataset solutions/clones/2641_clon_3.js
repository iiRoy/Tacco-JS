// This section handles input/output operations, typically for competitive programming environments.
// It sets up asynchronous reading from standard input and provides utility functions.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataParserInstance; // Holds the processed input data and provides methods for sequential access.
const receivedLines = []; // Buffer to store all lines read from standard input.

// Event listener for each line of input received.
inputReader.on('line', (currentLine) => {
  receivedLines.push(currentLine);
});

// Event listener for when the input stream closes.
inputReader.on('close', () => {
  dataParserInstance = initializeInputProcessor(receivedLines);
  console.error("--- Application Execution Started ---");
  
  const startTime = Date.now();
  executeSolution(); // Call the main problem-solving function.
  const elapsedTimeMs = Date.now() - startTime;
  
  emitDiagnostic(`Execution Time: ${elapsedTimeMs} ms`);
  emitDiagnostic(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
  console.error("--- Application Execution Finished ---");
});

// Utility function to perform a deep copy of an object.
// Not directly used in the main logic of `executeSolution`, but available as a general utility.
function replicateValue(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

// Fetches the next input entry and converts it to an integer.
function fetchInt() { return transformInput(advanceInput(), 1); }
// Fetches the next input entry and converts it to an array of strings, split by space.
function fetchStrArr() { return transformInput(advanceInput(), 2); }
// Fetches the next input entry and converts it to an array of numbers, split by space.
function fetchIntArr() { return transformInput(advanceInput(), 4); }
// Fetches the next input entry and converts it to an array of characters (strings).
function fetchCharArr() { return transformInput(advanceInput(), 6); }

// Advances the input pointer and returns the next line.
function advanceInput() { return dataParserInstance.getNextEntry(); }
// Checks if there are more entries available in the input buffer.
function canAdvance() { return dataParserInstance.hasMoreEntries(); }

/**
 * Creates an input parser instance from an array of raw input lines.
 * @param {string[]} sourceContent - An array of strings representing the input lines.
 * @returns {object} An object with methods to access input lines sequentially.
 * @throws {Error} If `sourceContent` is not an array.
 */
function initializeInputProcessor(sourceContent) {
  if (!Array.isArray(sourceContent)) {
    throw new TypeError("Input source must be an array of strings to initialize processor.");
  }

  const parserInstance = {
    inputBuffer: sourceContent,
    readPointer: 0,
    bufferSize: sourceContent.length,

    /**
     * Checks if there are more lines remaining in the input buffer.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    hasMoreEntries: function() {
      return (this.readPointer < this.bufferSize);
    },

    /**
     * Retrieves the next line from the input buffer and advances the internal pointer.
     * @returns {string} The next available input line.
     * @throws {Error} If no more lines are available in the input buffer.
     */
    getNextEntry: function() {
      if (!this.hasMoreEntries()) {
        throw new Error("InputBufferExhausted: Attempted to read beyond the end of input lines.");
      }
      const currentEntry = this.inputBuffer[this.readPointer];
      this.readPointer++;
      return currentEntry;
    }
  };
  return parserInstance;
}

// Displays a message to standard output.
function printResult(message) { console.log(message); }

// Emits a debug message to standard error, including a timestamp.
function emitDiagnostic(diagnosticMsg) {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] DIAGNOSTIC: ${require("util").inspect(diagnosticMsg, false, null)}`);
}

/**
 * Transforms an input value based on a specified format specifier.
 * Handles various conversions including parsing integers, splitting strings, and joining arrays.
 *
 * @param {*} valueToProcess - The input value (string or array) to transform.
 * @param {number} formatSpecifier - A number indicating the desired conversion type:
 *   1: Convert string to integer (base 10).
 *   2: Split string by space into an array of strings.
 *   4: Split string by space into an array of numbers.
 *   6: Split string into an array of individual characters (strings).
 *   7: Split string into an array of individual characters, then convert each to a number.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline character.
 *   0: Join array elements without any separator.
 * @returns {*} The transformed value, or the original value if conversion fails or specifier is unknown.
 */
function transformInput(valueToProcess, formatSpecifier) {
  try {
    switch (formatSpecifier) {
      case 1: return Number.parseInt(valueToProcess, 10);
      case 2: return valueToProcess.split(" ");
      case 4: return valueToProcess.split(" ").map(Number);
      case 6: return Array.from(valueToProcess); // Robustly converts string to char array
      case 7: return Array.from(valueToProcess).map(Number);
      case 8:
        if (Array.isArray(valueToProcess)) return valueToProcess.join(" ");
        return valueToProcess; // Return original if not an array for join
      case 9:
        if (Array.isArray(valueToProcess)) return valueToProcess.join("\n");
        return valueToProcess;
      case 0:
        if (Array.isArray(valueToProcess)) return valueToProcess.join("");
        return valueToProcess;
      default: return valueToProcess; // Default case returns the original value
    }
  } catch (conversionError) {
    emitDiagnostic(`Input Transformation Error: Value='${valueToProcess}', Specifier=${formatSpecifier}, Message=${conversionError.message}`);
    return valueToProcess; // On error, return the original untransformed value.
  }
}

// End of utility functions section.
//----------------------------------------------------------------------------

/**
 * Main function to solve the problem: find the minimum total position in a source string
 * required to form a target string by sequential character matches, wrapping around if needed.
 */
function executeSolution() {
  const sourceSequence = advanceInput(); // Represents 's' from the original problem description.
  const searchSequence = advanceInput(); // Represents 't' from the original problem description.

  // --- Input Validation Guard Clauses ---
  if (!sourceSequence || sourceSequence.length === 0) {
    printResult(-1); // Cannot form any sequence if the source is empty or invalid.
    return;
  }
  // An empty search sequence is trivially "found" at position 0.
  if (!searchSequence || searchSequence.length === 0) {
    printResult(0);
    return;
  }

  // A Map is used to store character occurrences for efficient lookup.
  // Key: character, Value: sorted array of indices where the character appears in `sourceSequence`.
  const characterLocations = new Map();

  // Populate the `characterLocations` map.
  for (let currentSourceIdx = 0; currentSourceIdx < sourceSequence.length; currentSourceIdx++) {
    const currentChar = sourceSequence[currentSourceIdx];
    if (!characterLocations.has(currentChar)) {
      characterLocations.set(currentChar, []);
    }
    characterLocations.get(currentChar).push(currentSourceIdx);
  }

  let totalStepsAccumulated = 0; // Represents 'output' from original code. This is 1-based.
  let lastMatchedSourceIndex = -1; // Represents 'maeIndex'. This is 0-based.
  let fullSequenceWraps = 0; // Represents 'loop'. Counts how many times `sourceSequence` has been fully traversed.

  // Iterate through each character of the `searchSequence` to find its corresponding position in `sourceSequence`.
  for (let searchCharPosition = 0; searchCharPosition < searchSequence.length; searchCharPosition++) {
    const charToFind = searchSequence[searchCharPosition];

    // If the character is not present in the `sourceSequence` at all, it's impossible to form `searchSequence`.
    if (!characterLocations.has(charToFind)) {
      printResult(-1);
      return;
    }

    const availableIndicesForChar = characterLocations.get(charToFind);
    let currentMatchIndex; // The 0-based index in `sourceSequence` for the current character.

    // Special handling for the very first character of the `searchSequence`.
    if (searchCharPosition === 0) {
      currentMatchIndex = availableIndicesForChar[0]; // Always take the first occurrence.
    } else {
      // For subsequent characters, find the smallest index in `availableIndicesForChar`
      // that is strictly greater than `lastMatchedSourceIndex`.
      const potentialMatchIdx = findCeilingIndex(availableIndicesForChar, lastMatchedSourceIndex + 1);

      // Determine if a wrap-around is necessary.
      // This happens if `potentialMatchIdx` is out of bounds (all remaining indices are smaller),
      // or if the found index is not strictly greater than the `lastMatchedSourceIndex`.
      const requiresWrapAround = (potentialMatchIdx === availableIndicesForChar.length);

      if (requiresWrapAround) {
        fullSequenceWraps++;
        currentMatchIndex = availableIndicesForChar[0]; // Start from the beginning of `sourceSequence`.
      } else {
        currentMatchIndex = availableIndicesForChar[potentialMatchIdx];
      }
    }

    // Update `lastMatchedSourceIndex` for the next iteration.
    lastMatchedSourceIndex = currentMatchIndex;

    // Calculate the cumulative total steps.
    // Each full wrap-around adds `sourceSequence.length` steps.
    // The current character's position is `currentMatchIndex + 1` (1-based).
    totalStepsAccumulated = (fullSequenceWraps * sourceSequence.length) + (currentMatchIndex + 1);
  }

  printResult(totalStepsAccumulated); // Output the final calculated position.
}

/**
 * Performs a binary search on a sorted numeric array to find the index of the first element
 * that is greater than or equal to the target value. This is a "ceiling" search.
 *
 * @param {number[]} sortedIndices - An array of numbers, assumed to be sorted in ascending order.
 * @param {number} targetValue - The value to search for.
 * @returns {number} The index of the first element >= targetValue, or `sortedIndices.length` if all elements are smaller.
 * @throws {TypeError} If `sortedIndices` is not an array.
 */
function findCeilingIndex(sortedIndices, targetValue) {
  if (!Array.isArray(sortedIndices)) {
    throw new TypeError("Input 'sortedIndices' must be an array for binary search.");
  }
  if (sortedIndices.length === 0) {
    return 0; // If list is empty, effectively all elements are 'smaller', so return length.
  }

  let lowerBound = -1;  // Represents 'ng' from original code: index of the largest element known to be < target.
  let upperBound = sortedIndices.length; // Represents 'ok' from original code: index of the smallest element known to be >= target.
  let midPoint; // Represents 'center' from original code.

  // Continue binary search as long as there's a gap between `lowerBound` and `upperBound`.
  while ((upperBound - lowerBound) > 1) {
    midPoint = Math.floor((lowerBound + upperBound) / 2);

    // If the element at `midPoint` is greater than or equal to the `targetValue`,
    // it means `midPoint` could be our answer, or an even smaller index could be.
    // So, we narrow the `upperBound` to `midPoint`.
    if (sortedIndices[midPoint] >= targetValue) {
       upperBound = midPoint;
    } else {
       // If `sortedIndices[midPoint]` is less than `targetValue`,
       // `midPoint` is definitely too small, so we update `lowerBound`.
       lowerBound = midPoint;
    }
  }
  // After the loop, `upperBound` will contain the index of the first element
  // that is greater than or equal to `targetValue`, or `sortedIndices.length`
  // if all elements in the array are less than `targetValue`.
  return upperBound;
}
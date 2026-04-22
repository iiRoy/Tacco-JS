let inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputDataHolder;
let bufferedInputLines = [];

inputProcessor.on('line', (currentInputLine) => {
  bufferedInputLines.push(currentInputLine);
});

inputProcessor.on('close', () => {
  inputDataHolder = setupInputHandler(bufferedInputLines);

  console.error("\n"); // Log a newline for separation
  let executionStartTime = Date.now();
  processInputData(); // Execute the primary logic
  let durationMilliseconds = Date.now() - executionStartTime;

  logDiagnostic("execution_time : " + (durationMilliseconds) + "ms");
  logDiagnostic("memory_usage : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Function to create a deep copy of an object
function deepCopyObject(sourceItem) {
  return JSON.parse(JSON.stringify(sourceItem));
}

// Helper constants for data transformation types
const NUMERIC_CONVERSION = 1;
const STRING_ARRAY_SPLIT_SPACE = 2;
const NUMERIC_ARRAY_SPLIT_SPACE = 4;
const CHARACTER_ARRAY_SPLIT = 6;
const NUMERIC_ARRAY_SPLIT_CHAR = 7;
const JOIN_WITH_SPACE = 8;
const JOIN_WITH_NEWLINE = 9;
const JOIN_WITHOUT_SEPARATOR = 0;

// Functions to retrieve and transform input
function fetchNextInteger() { return dataTransformer(retrieveNextEntry(), NUMERIC_CONVERSION); }
function fetchStringCollection() { return dataTransformer(retrieveNextEntry(), STRING_ARRAY_SPLIT_SPACE); }
function fetchNumericCollection() { return dataTransformer(retrieveNextEntry(), NUMERIC_ARRAY_SPLIT_SPACE); }
function fetchCharacterCollection() { return dataTransformer(retrieveNextEntry(), CHARACTER_ARRAY_SPLIT); }

function retrieveNextEntry() { return inputDataHolder.getNextItem(); }
function hasMoreEntries() { return inputDataHolder.canAdvance(); }

// Initializes the input handler object
function setupInputHandler(sourceData) {
  let handlerInstance = {
    dataList: sourceData,
    currentIndex: 0,
    maximumCount: sourceData.length,

    // Checks if there are more items to process
    canAdvance: function() {
      return (this.currentIndex < this.maximumCount);
    },

    // Retrieves the next item from the input list
    getNextItem: function() {
      if (!this.canAdvance()) {
        throw new Error("InputOutOfBoundsException: No more entries available in the input stream.");
      } else {
        let currentDataItem = this.dataList[this.currentIndex];
        this.currentIndex++;
        return currentDataItem;
      }
    }
  };
  return handlerInstance;
}

// Outputs a message to standard output
function displayResult(messageContent) {
  console.log(messageContent);
}

// Logs diagnostic information to standard error
function logDiagnostic(diagnosticMessage) {
  console.error("DEBUG_INFO:" + require("util").inspect(diagnosticMessage, false, null));
}

/**
 * Transforms an input value based on the specified conversion type.
 * @param {any} inputValue - The value to transform.
 * @param {number} conversionType - The type of transformation to apply.
 *   - 1: Convert to integer.
 *   - 2: Split string by space into an array of strings.
 *   - 4: Split string by space and convert to an array of numbers.
 *   - 6: Split string by character into an array of characters.
 *   - 7: Split string by character and convert to an array of numbers.
 *   - 8: Join array elements with a space.
 *   - 9: Join array elements with a newline.
 *   - 0: Join array elements without a separator.
 *   - Default: Return the input value as is.
 * @returns {any} The transformed value.
 */
function dataTransformer(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case NUMERIC_CONVERSION:
        return Number.parseInt(inputValue);
      case STRING_ARRAY_SPLIT_SPACE:
        return inputValue.split(" ");
      case NUMERIC_ARRAY_SPLIT_SPACE:
        return inputValue.split(" ").map(Number);
      case CHARACTER_ARRAY_SPLIT:
        return inputValue.split("");
      case NUMERIC_ARRAY_SPLIT_CHAR:
        return inputValue.split("").map(Number);
      case JOIN_WITH_SPACE:
        return inputValue.join(" ");
      case JOIN_WITH_NEWLINE:
        return inputValue.join("\n");
      case JOIN_WITHOUT_SEPARATOR:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue; // Return original input on error
  }
}

// Main logic for the problem solution
function processInputData() {
  const targetSequence = retrieveNextEntry();
  const sequenceLength = targetSequence.length;
  const upperBound = 100005; // Maximum size for DP table

  // Initialize a 2D dynamic programming table
  let stateTable = Array(upperBound);
  for (let outerIndex = 0; outerIndex < upperBound; outerIndex++) {
    stateTable[outerIndex] = Array(13).fill(0);
  }

  stateTable[0][0] = 1; // Base case: one way to get a remainder of 0 with an empty prefix

  const remainderDivisor = 1000000007; // Modulo constant for calculations

  // Iterate through the input sequence
  for (let outerIndex = 0; outerIndex < sequenceLength; outerIndex++) {
    // Iterate through all possible remainders (0-12)
    for (let currentRemainder = 0; currentRemainder < 13; currentRemainder++) {
      const currentElement = targetSequence[outerIndex];

      // If the current character is a wildcard '?'
      if (currentElement === "?") {
        // Try all possible digits (0-9)
        for (let digitValue = 0; digitValue < 10; digitValue++) {
          const nextRemainder = (currentRemainder * 10 + digitValue) % 13;
          stateTable[outerIndex + 1][nextRemainder] = (stateTable[outerIndex + 1][nextRemainder] + stateTable[outerIndex][currentRemainder]) % remainderDivisor;
        }
      } else {
        // If it's a specific digit
        const digitValue = dataTransformer(targetSequence[outerIndex], NUMERIC_CONVERSION);
        const nextRemainder = (currentRemainder * 10 + digitValue) % 13;
        stateTable[outerIndex + 1][nextRemainder] = (stateTable[outerIndex + 1][nextRemainder] + stateTable[outerIndex][currentRemainder]) % remainderDivisor;
      }
    }
  }

  // Output the final count for remainder 5 after processing the entire sequence
  displayResult(stateTable[sequenceLength][5]);
}
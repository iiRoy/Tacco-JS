// This section provides foundational utilities and is not part of the primary application logic.
let inputReader = require('readline') .createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
let rawInputLines = [];

inputReader.on('line', function (currentLine) {
  rawInputLines.push(currentLine);
});

inputReader.on('close', function () {
  dataProcessor = initializeProcessor(rawInputLines);
  logDebugMessage("----- Program Execution Begins -----");
  const executionStartTime = new Date();
  ExecuteApplication(); // Execute the main program logic
  const elapsedDuration = new Date() - executionStartTime;
  logDebugMessage("----- Program Execution Concludes -----");
  logDebugMessage("Time elapsed: " + (elapsedDuration) + " ms");
  logDebugMessage("Memory utilization: " + Math.round(process.memoryUsage().heapTotal / 1024) + " KB");
});

function readInteger() { return convertInput(getNextElement(), 1); }
function readStringArray() { return convertInput(getNextElement(), 2); }
function readIntegerArray() { return convertInput(getNextElement(), 4); }
function readCharacterArray() { return convertInput(getNextElement(), 6); }

function getNextElement() { return dataProcessor.retrieveNext(); }
function checkNextExistence() { return dataProcessor.hasMoreElements(); }

/**
 * Creates an object responsible for managing input data.
 * @param {Array<string>} initialInput The collection of input strings.
 * @returns {object} An instance with methods for data access.
 */
function initializeProcessor(initialInput) {
  const processorInstance = {
    sourceData: initialInput,
    currentPosition: 0,
    totalEntries: initialInput.length,

    hasMoreElements: function () {
      return (this.currentPosition < this.totalEntries);
    },

    retrieveNext: function () {
      if (!this.hasMoreElements()) {
        throw new Error("Input Boundary Exception: No more entries available.");
      } else {
        const extractedEntry = this.sourceData[this.currentPosition];
        this.currentPosition++;
        return extractedEntry;
      }
    }
  };
  return processorInstance;
}

function displayResult(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(messageContent) {
  console.error("DEBUG OUTPUT: " + require("util") .inspect(messageContent, false, null));
}

// Input type conversion utility function.
// The 'conversionType' parameter dictates the transformation:
// Default / Invalid type: Returns input as is.
// 1: Converts input to an integer.
// 2: Splits string by spaces into an array of strings.
// 4: Splits string by spaces and converts parts to numbers.
// 6: Splits string into an array of individual characters.
// 7: Splits string into characters and converts them to numbers.
// 8: Joins array elements with a space.
// 9: Joins array elements with a newline.
// 0: Joins array elements without any separator.
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10); // Specify radix for safety
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (operationError) {
    return inputValue; // Fallback to original value on conversion failure
  }
}

// End of preliminary utility functions.
// The main application logic is defined below.
function ExecuteApplication() {
  const firstInputSet = readIntegerArray();
  const intervalStart1 = firstInputSet[0];
  const intervalEnd1 = firstInputSet[1];
  const intervalStart2 = firstInputSet[2];
  const intervalEnd2 = firstInputSet[3];

  // Initialize a frequency counter array for values up to 100.
  const frequencyCounter = new Array(101).fill(0);

  // Mark elements within the first specified range.
  for (let idx = intervalStart1; idx <= intervalEnd1; idx++) {
    frequencyCounter[idx] += 1;
  }

  // Mark elements within the second specified range.
  for (let idx = intervalStart2; idx <= intervalEnd2; idx++) {
    frequencyCounter[idx] += 1;
  }

  let overlapCount = 0;
  // Count how many positions are covered by both ranges (frequency == 2).
  for (let idx = 0; idx < 101; idx++) {
    if (frequencyCounter[idx] === 2) {
      overlapCount++;
    }
  }

  // Output the maximum of (overlapCount - 1) or 0.
  displayResult(Math.max(overlapCount - 1, 0));
}
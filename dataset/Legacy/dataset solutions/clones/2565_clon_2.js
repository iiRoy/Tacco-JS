let inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
let inputLines = [];

inputReader.on('line', function(currentLine){
  inputLines.push(currentLine);
});

inputReader.on('close', function(){
  dataProcessor = initializeProcessor(inputLines);
  console.error("\n"); // Output a newline to stderr for formatting.
  let startTime = Date.now();
  ExecuteAlgorithm();
  let duration = Date.now() - startTime;
  logDebug("execution time: " + duration + "ms");
  logDebug("memory usage: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

// Utility function to create a deep copy of an object.
function duplicateObject(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Functions to retrieve and convert input data.
function retrieveInteger() { return convertInput(getNextItem(), 1); }
function retrieveStringArray() { return convertInput(getNextItem(), 2); }
function retrieveIntegerArray() { return convertInput(getNextItem(), 4); }
function retrieveCharacterArray() { return convertInput(getNextItem(), 6); }

// Core input navigation functions.
function getNextItem() { return dataProcessor.getNext(); }
function hasMoreItems() { return dataProcessor.hasMoreItems(); }

// Initializes the input data processing object.
function initializeProcessor(sourceData) {
  return {
    sourceList: sourceData,
    currentPosition: 0,
    maximumLength: sourceData.length,
    hasMoreItems: function() {
      return (this.currentPosition < this.maximumLength);
    },
    getNext: function() {
      if (this.hasMoreItems()) {
        return this.sourceList[this.currentPosition++];
      } else {
        throw new Error("InputBoundaryExceeded: No further input available.");
      }
    }
  };
}

// Displays a value to standard output.
function displayOutput(valueToPrint) {
  console.log(valueToPrint);
}

// Logs debug information to standard error.
function logDebug(debugMessage) {
  console.error("DEBUG_INFO: " + require("util").inspect(debugMessage, false, null));
}

/*
 * This function handles various input conversions based on the 'conversionType' parameter.
 * - Default/Unknown: Returns the input as is.
 * - 1: Parses the input string to an integer.
 * - 2: Splits the input string by spaces into an array of strings.
 * - 4: Splits by spaces and converts each part to a number.
 * - 6: Splits the input string into an array of individual characters.
 * - 7: Splits by characters and converts each to a number.
 * - 8: Joins an array of strings with spaces.
 * - 9: Joins an array of strings with newlines.
 * - 0: Joins an array of strings without any separator.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
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
  } catch (error) {
    // If conversion fails, return the original input value.
    return inputValue;
  }
}

// Main algorithm execution function.
function ExecuteAlgorithm() {
  const inputCount = retrieveInteger(); // N
  let charSequence = retrieveCharacterArray(); // s
  let resultValue = 0; // output

  // Loop as long as the character sequence has elements.
  while (charSequence.length > 0) {
    // Initialize Z-array for the current sequence.
    const zArray = new Array(charSequence.length);
    zArray[0] = charSequence.length;

    let primaryIndex = 1; // i
    let secondaryIndex = 0; // j

    // Compute Z-array values.
    while (primaryIndex < charSequence.length) {
      // Expand the match.
      while ((primaryIndex + secondaryIndex) < charSequence.length &&
             (charSequence[secondaryIndex] === charSequence[primaryIndex + secondaryIndex])) {
        secondaryIndex++;
      }
      zArray[primaryIndex] = secondaryIndex;

      // If no match, move to the next primary index.
      if (secondaryIndex === 0) {
        primaryIndex++;
        continue;
      }

      let tertiaryIndex = 1; // k
      // Use previously computed Z-values to optimize.
      while ((primaryIndex + tertiaryIndex) < charSequence.length &&
             (tertiaryIndex + zArray[tertiaryIndex] < secondaryIndex)) {
        zArray[primaryIndex + tertiaryIndex] = zArray[tertiaryIndex];
        tertiaryIndex++;
      }
      primaryIndex += tertiaryIndex;
      secondaryIndex -= tertiaryIndex;
    }

    // Find the maximum Z-value that satisfies the condition.
    for (let traversalIndex = charSequence.length - 1; traversalIndex >= 1; traversalIndex--) { // m
      if (zArray[traversalIndex] <= charSequence.length / 2) {
        resultValue = Math.max(resultValue, zArray[traversalIndex]);
      }
    }

    // Optional debug logging (commented out in original, so keep it commented or remove).
    // logDebug(zArray);

    // Remove the first character for the next iteration.
    charSequence.shift();
  }

  // Display the final computed result.
  displayOutput(resultValue);
}

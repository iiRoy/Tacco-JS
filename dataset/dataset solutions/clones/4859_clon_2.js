var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// This object manages the input stream, providing methods to access lines sequentially.
var dataStream = {
  "sourceLines": rawData,
  "currentIdx": 0,
  "totalLines": rawData.length,

  // Checks if there are more lines available in the input stream.
  "hasMoreData": function() {
    return (this.currentIdx < this.totalLines);
  },

  // Retrieves the next line from the input stream and advances the internal pointer.
  "fetchNextLine": function() {
    if (!this.hasMoreData()) {
      return ""; // Return an empty string if no more data is present.
    }
    var lineContent = this.sourceLines[this.currentIdx];
    this.currentIdx++; // Increment the index to point to the next line.
    return lineContent;
  }
};

// Initiate the primary processing function.
ProcessInput();

// Helper function to get the next available line from the input stream.
function getNextItem() {
  return dataStream.fetchNextLine();
}

// Helper function to parse the next line as an integer.
function getInteger() {
  return convertValue(getNextItem(), 1);
}

// Helper function to split the next line by spaces into an array of strings.
function getStringArray() {
  return convertValue(getNextItem(), 2);
}

// Helper function to split the next line by spaces and convert elements to an array of integers.
function getIntegerArray() {
  return convertValue(getNextItem(), 4);
}

// Helper function to split the next line into an array of individual characters.
function getCharacterArray() {
  return convertValue(getNextItem(), 6);
}

// Helper function to check if there's more data to read from the stream.
function checkMoreData() {
  return dataStream.hasMoreData();
}

// Function for standard output, printing a value to the console.
function printResult(outputValue) {
  console.log(outputValue);
}

// Function for standard error output, logging an error message to the console.
function logError(errorMessage) {
  console.error(errorMessage);
}

/**
 * A versatile conversion utility for various input types and formats.
 * @param {string|Array} inputValue - The data to be converted.
 * @param {number} conversionType - An integer code specifying the conversion logic.
 *   1: Converts the input string to an integer.
 *   2: Splits the input string by spaces into an array of strings.
 *   4: Splits the input string by spaces and maps each part to a number.
 *   6: Splits the input string into an array of individual characters.
 *   7: Splits the input string into characters and maps each to a number.
 *   8: Joins array elements with a space.
 *   9: Joins array elements with a newline character.
 *   0: Joins array elements without any separator.
 *   Default: Returns the input value unchanged.
 * @returns {*} The converted value, or the original input if conversion fails or type is unknown.
 */
function convertValue(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((itemVal) => Number(itemVal));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((itemVal) => Number(itemVal));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (e) {
    // If an error occurs during conversion, return the original input value.
    return inputValue;
  }
}

// The main function where the core logic of the program resides.
function ProcessInput() {
  // Read the initial integer 'N' which determines the size and number of rounds.
  var inputSize = getInteger();

  // Initialize an array with a size of 2 raised to the power of 'inputSize'.
  var currentValues = new Array(Math.pow(2, inputSize));

  // Populate the 'currentValues' array by reading '2^N' integers from the input.
  for (var outerLoopIdx = 0; outerLoopIdx < currentValues.length; outerLoopIdx++) {
    currentValues[outerLoopIdx] = getInteger();
  }

  var nextRoundValues; // This array will hold the results of each processing round.

  // Loop 'inputSize' times, performing a reduction operation in each iteration.
  for (var outerLoopIdx = 0; outerLoopIdx < inputSize; outerLoopIdx++) {
    // Calculate the size for the 'nextRoundValues' array, which is half the current effective size.
    nextRoundValues = new Array(Math.pow(2, inputSize - outerLoopIdx - 1));

    // Iterate through the 'currentValues' array, processing elements in pairs.
    for (var innerLoopIdx = 0; innerLoopIdx < currentValues.length; innerLoopIdx = innerLoopIdx + 2) {
      // Compare two adjacent values and store their difference or one of them.
      if (currentValues[innerLoopIdx] > currentValues[innerLoopIdx + 1]) {
        nextRoundValues[innerLoopIdx / 2] = currentValues[innerLoopIdx] - currentValues[innerLoopIdx + 1];
      } else if (currentValues[innerLoopIdx] < currentValues[innerLoopIdx + 1]) {
        nextRoundValues[innerLoopIdx / 2] = currentValues[innerLoopIdx + 1] - currentValues[innerLoopIdx];
      } else {
        // If the values are equal, store one of them (difference would be 0).
        nextRoundValues[innerLoopIdx / 2] = currentValues[innerLoopIdx];
      }
    }
    // The results of the current round become the input for the next round.
    currentValues = nextRoundValues;
    // Optional: Uncomment the line below to log the array state after each round for debugging.
    // logError(currentValues);
  }
  // After all rounds, 'currentValues' will contain a single element. Print this final result.
  printResult(currentValues[0]);
}

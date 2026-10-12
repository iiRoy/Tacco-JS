var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// This object manages the input stream for the program.
var dataStream = {
  "contentList" : rawData,
  "currentIdx" : 0,
  "maxElements" : rawData.length,

  // Checks if there are more elements available in the stream.
  "hasMore" : function() {
    return (this.currentIdx < this.maxElements);
  },

  // Retrieves the next element from the stream.
  "retrieveNext" : function() {
    if (!this.hasMore()) {
      throw "NoSuchElementException:次に要素は無いよ"; // Error if no more elements.
    }
    var itemToReturn = this.contentList[this.currentIdx];
    this.currentIdx++; // Advance the index.
    return itemToReturn;
  }
};

// Entry point for the main program logic.
ExecuteProgram();

// Helper function to get the next raw string from the input stream.
function getNextItem() {
  return dataStream.retrieveNext();
}

// Helper function to get the next input as an integer.
function getNextInteger() {
  return dataConverter(getNextItem(), 1);
}

// Helper function to get the next input as an array of strings, split by space.
function getNextStringArray() {
  return dataConverter(getNextItem(), 2);
}

// Helper function to get the next input as an array of integers, split by space.
function getNextIntegerArray() {
  return dataConverter(getNextItem(), 4);
}

// Helper function to get the next input as an array of characters.
function getNextCharacterArray() {
  return dataConverter(getNextItem(), 6);
}

// Helper function to check if there are more items in the input stream.
function checkHasMore() {
  return dataStream.hasMore();
}

// Function for printing output to standard output.
function printOutput(outputValue) {
  console.log(outputValue);
}

// Function for printing error messages to standard error.
function printError(errorMessage) {
  console.error(errorMessage);
}

/**
 * Converts input based on the specified conversion type.
 * @param {string|Array} inputValue - The value to convert.
 * @param {number} conversionType - Type of conversion:
 *   1: Convert to integer.
 *   2: Split string by space into string array.
 *   4: Split string by space into integer array.
 *   6: Split string by character into character array.
 *   7: Split string by character into integer array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1: return parseInt(inputValue);
      case 2: return inputValue.split(" ");
      case 4: return inputValue.split(" ").map((element) => Number(element));
      case 6: return inputValue.split("");
      case 7: return inputValue.split("").map((element) => Number(element));
      case 8: return inputValue.join(" ");
      case 9: return inputValue.join("\n");
      case 0: return inputValue.join("");
      default: return inputValue;
    }
  } catch (e) {
    return inputValue; // Return original input on error.
  }
}

// Main logic of the program.
function ExecuteProgram() {
  var initialValues = getNextIntegerArray(); // Read the first line as an array of integers.
  var valueA = initialValues[0];
  var valueB = initialValues[1];
  var iterations = initialValues[2];

  // Loop for K iterations, alternating operations on A and B.
  for (var loopCounter = 0; loopCounter < iterations; loopCounter++) {
    if (loopCounter % 2 === 0) { // Even iteration: operate on A then B.
      if (valueA % 2 === 1) {
        valueA--; // Make A even if it's odd.
      }
      valueB += valueA / 2; // Add half of A to B.
      valueA /= 2; // Halve A.
    } else { // Odd iteration: operate on B then A.
      if (valueB % 2 === 1) {
        valueB--; // Make B even if it's odd.
      }
      valueA += valueB / 2; // Add half of B to A.
      valueB /= 2; // Halve B.
    }
  }

  // Output the final values of A and B, separated by a space.
  printOutput(valueA + " " + valueB);
}

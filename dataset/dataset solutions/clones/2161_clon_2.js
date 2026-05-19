var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// This object manages the input stream, providing methods to access elements sequentially.
var dataProcessor = {
  "contentArray" : rawData, // The array holding all input lines.
  "currentIdx" : 0,         // Current position in the input array.
  "totalCount" : rawData.length, // Total number of input lines.

  // Retrieves the next element from the input stream.
  "getNextItem" : function() {
    if (!this.checkAvailability()) {
      throw "NoSuchElementException:次に要素は無いよ"; // Error if no more elements.
    }
    var retrievedItem = this.contentArray[this.currentIdx];
    this.currentIdx++; // Advance the pointer.
    return retrievedItem;
  },

  // Checks if there are more elements available in the stream.
  "checkAvailability" : function() {
    return (this.currentIdx < this.totalCount);
  }
};

// Start the main execution flow.
PerformCalculation();

// Helper function to get the next item from the data processor.
function obtainNextItem() {
  return dataProcessor.getNextItem();
}

// Helper function to check if more items are available.
function isItemAvailable() {
  return dataProcessor.checkAvailability();
}

// Function for standard output.
function printResult(dataToPrint) {
  console.log(dataToPrint);
}

// Function for standard error output.
function logError(errorMsg) {
  console.error(errorMsg);
}

// Utility function to convert input strings based on a specified operation code.
// operationCode:
//   1: Convert to integer.
//   2: Split by space.
//   4: Split by space and convert to number array.
//   6: Split by character.
//   7: Split by character and convert to number array.
//   8: Join array with space.
//   9: Join array with newline.
//   0: Join array without separator.
//   Default: Return input as is.
function processInputData(inputString, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(inputString);
      case 2:
        return inputString.split(" ");
      case 4:
        return inputString.split(" ").map((element) => Number(element));
      case 6:
        return inputString.split("");
      case 7:
        return inputString.split("").map((element) => Number(element));
      case 8:
        return inputString.join(" ");
      case 9:
        return inputString.join("\n");
      case 0:
        return inputString.join("");
      default:
        return inputString;
    }
  } catch (errorDetails) {
    return inputString; // In case of conversion error, return original input.
  }
}

// Main function where the core logic resides.
function PerformCalculation() {
  // Read the first line of input, split by character, and convert to numbers.
  var numberSequence = processInputData(obtainNextItem(), 7);
  var sequenceLength = numberSequence.length;
  var calculatedValue = 0; // Initialize the accumulator for the final result.

  // Iterate through the number sequence from right to left.
  for (var position = sequenceLength - 1; position >= 0; position--) {
    if (numberSequence[position] >= 6) {
      // If the digit is 6 or more, calculate the "carry" effect.
      calculatedValue += 10 - numberSequence[position];
      numberSequence[position] = 0; // Reset current digit to 0.
      if (position !== 0) {
        // If not the first digit, increment the previous digit.
        numberSequence[position - 1]++;
      } else {
        // If it's the first digit and it "carries over", increment the total output.
        calculatedValue++;
      }
    } else {
      // If the digit is less than 6, just add its value.
      calculatedValue += numberSequence[position];
    }
  }
  printResult(calculatedValue); // Display the final calculated value.
}

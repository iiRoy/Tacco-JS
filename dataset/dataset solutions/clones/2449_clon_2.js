var dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var lineProcessor = {
  "sourceData" : dataLines,
  "currentPosition" : 0,
  "totalLines" : dataLines.length,

  // Checks if there are more lines to process.
  "hasMoreEntries" : function() {
    return (this.currentPosition < this.totalLines);
  },

  // Retrieves the next line from the input.
  "retrieveNextEntry" : function() {
    if (!this.hasMoreEntries()) {
      return "";
    }
    var extractedItem = this.sourceData[this.currentPosition];
    this.currentPosition++;
    return extractedItem;
  }
};

// Start the primary application logic.
executeProgram();

// Helper function to get the next line.
function fetchNextLine() {
  return lineProcessor.retrieveNextEntry();
}

// Helper function to get the next line as an integer.
function fetchNextInteger() {
  return dataTransformer(fetchNextLine(), 1);
}

// Helper function to get the next line as a string array (space-separated).
function fetchStringArray() {
  return dataTransformer(fetchNextLine(), 2);
}

// Helper function to get the next line as an integer array (space-separated).
function fetchIntegerArray() {
  return dataTransformer(fetchNextLine(), 4);
}

// Helper function to get the next line as a character array.
function fetchCharacterArray() {
  return dataTransformer(fetchNextLine(), 6);
}

// Helper function to check if more lines are available.
function checkMoreLines() {
  return lineProcessor.hasMoreEntries();
}

// Function for standard output.
function displayOutput(content) {
  console.log(content);
}

// Function for standard error output.
function displayError(errorMessage) {
  console.error(errorMessage);
}

/*
 * Utility function for data type conversions and manipulations.
 *
 * transformType:
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into integer array.
 *   6: Split by character into string array.
 *   7: Split by character into integer array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 */
function dataTransformer(inputValue, transformType) {
  try {
    switch (transformType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map((elementValue) => Number(elementValue));
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map((elementValue) => Number(elementValue));
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (errDetails) {
    return inputValue; // In case of error, return original input.
  }
}

// Main execution function.
function executeProgram() {
  // Create an array of 10000 elements, filled with "-1", then join with newlines.
  var resultContent = dataTransformer(new Array(10000).fill("-1"), 9);
  displayOutput(resultContent);
}

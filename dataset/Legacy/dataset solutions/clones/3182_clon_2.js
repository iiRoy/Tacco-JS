var dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"); // Read all lines from standard input

// Utility object to manage input stream
var dataStream = {
  "lineBuffer" : dataLines, // Stores the array of input lines
  "currentPos" : 0,         // Current index in the line buffer
  "maxLines" : dataLines.length, // Total number of lines available
  "fetchNext" : function(){ // Method to get the next line
    // Check if there are more elements before attempting to retrieve
    if(!this.hasMore()){
      throw "NoSuchElementException: No more elements available in the input stream.";
    }
    var retrievedLine = this.lineBuffer[this.currentPos]; // Get the current line
    this.currentPos++; // Advance the pointer to the next line
    return retrievedLine; // Return the fetched line
  },
  "hasMore" : function(){ // Method to check if there are more lines
    return (this.currentPos < this.maxLines); // True if current position is less than total lines
  }
};

// Global helper functions for input processing
function getNextLine(){ // Retrieves the next raw line from the input stream
  return dataStream.fetchNext();
}
function getInteger(){ // Retrieves the next line and converts it to an integer
  return dataConverter(getNextLine(), 1);
}
function getStringArray(){ // Retrieves the next line and splits it by space into a string array
  return dataConverter(getNextLine(), 2);
}
function getIntegerArray(){ // Retrieves the next line, splits by space, and converts to an integer array
  return dataConverter(getNextLine(), 4);
}
function getCharacterArray(){ // Retrieves the next line and splits it into a character array
  return dataConverter(getNextLine(), 6);
}
function checkMore(){ // Checks if there are more lines available in the input stream
  return dataStream.hasMore();
}

function printOutput(content){ // Outputs content to standard output
  console.log(content);
}
function printError(errorMessage){ // Outputs error message to standard error
  console.error(errorMessage);
}

/**
 * Universal data conversion utility.
 * Handles various transformations for input values.
 * @param {string|Array} inputValue - The input value to convert.
 * @param {number} conversionType - The type of conversion to apply.
 *   - 1: Convert to integer.
 *   - 2: Split by space into a string array.
 *   - 4: Split by space and convert to an array of numbers.
 *   - 6: Split into a character array.
 *   - 7: Split into a character array and convert to an array of numbers.
 *   - 8: Join array elements with a space.
 *   - 9: Join array elements with a newline.
 *   - 0: Join array elements without any separator.
 *   - Default: Return input value as is.
 * @returns {*} The converted value or the original input on error/unknown type.
 */
function dataConverter(inputValue, conversionType){
  try {
    switch(conversionType){
      case 1: return parseInt(inputValue); // Convert to integer
      case 2: return inputValue.split(" "); // Split by space
      case 4: return inputValue.split(" ").map((item)=>Number(item)); // Split by space and convert to numbers
      case 6: return inputValue.split(""); // Split into individual characters
      case 7: return inputValue.split("").map((item)=>Number(item)); // Split into characters and convert to numbers
      case 8: return inputValue.join(" "); // Join array with spaces
      case 9: return inputValue.join("\n"); // Join array with newlines
      case 0: return inputValue.join(""); // Join array without separator
      default: return inputValue; // Return original if conversion type is unknown
    }
  } catch(error) {
    // In case of any conversion error, return the original input value
    return inputValue;
  }
}

// Entry point for the program execution
ExecuteProgram();

/**
 * The main function containing the core logic of the application.
 */
function ExecuteProgram(){
  // Read the first line of input as an array of integers
  var firstInput = getIntegerArray();

  // Extract the two integer values from the array
  var valA = firstInput[0];
  var valB = firstInput[1];

  // Check if valB is not perfectly divisible by valA
  if(valB % valA){
    // If there's a remainder, output the sum of valA and valB
    printOutput(valA + valB);
  } else {
    // If valB is perfectly divisible by valA (no remainder), output the difference
    printOutput(valA - valB);
  }
}

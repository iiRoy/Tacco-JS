var rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

// Helper functions for dataIterator methods to allow external definition
function checkAdvanceAvailability() {
  return (this.currentPosition < this.totalItems);
}

function retrieveNextItem() {
  if (!this.canAdvance()) {
    return ""; // Preserve original behavior of returning empty string
  }
  const itemToReturn = this.sourceData[this.currentPosition];
  this.currentPosition++;
  return itemToReturn;
}

var dataIterator = {
  "sourceData": rawData,
  "currentPosition": 0,
  "totalItems": rawData.length,
  // Assigning methods after their definition for structural modification
  "canAdvance": checkAdvanceAvailability,
  "fetchNext": retrieveNextItem
};

// Entry point for the program execution
executeProgram();

// Input utility functions, renamed and calling the dataIterator
function getNextLine() {
  return dataIterator.fetchNext();
}

function getNextInt() {
  return dataConverter(getNextLine(), 1);
}

function getNextStringArray() {
  return dataConverter(getNextLine(), 2); // Split by half-width space
}

function getNextIntArray() {
  return dataConverter(getNextLine(), 4); // Split by half-width space and convert to numbers
}

function getNextCharArray() {
  return dataConverter(getNextLine(), 6); // Split by character
}

function hasMoreLines() {
  return dataIterator.canAdvance();
}

// Output functions, renamed
function printOutput(outputMessage) {
  console.log(outputMessage); // Standard output
}

function printError(errorMessage) {
  console.error(errorMessage); // Standard error output
}

// Data conversion utility, renamed and with minor structural edits
// [conversionType] handling:
// Unknown/abnormal: returns input as-is
// 1: Convert to integer
// 2: Split by half-width space
// 4: Split by half-width space and convert to number array
// 6: Split by character
// 7: Split by character and convert to number array
// 8: Join by half-width space
// 9: Join by newline
// 0: Join without separator
function dataConverter(inputVal, conversionType) {
  try {
    // Introduce a helper arrow function for mapping to numbers
    const mapToNumber = (element) => Number(element);

    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map(mapToNumber);
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map(mapToNumber);
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        // Explicitly return inputVal for unhandled types, preserving original behavior
        return inputVal;
    }
  } catch (e) {
    // Preserve original error handling
    return inputVal;
  }
}

function executeProgram() {
  // Introduce temporary constants for array creation parameters
  const targetArrayLength = 10000;
  const defaultFillValue = "-1";

  // Split array creation, filling, and conversion into distinct steps
  let temporaryArray = new Array(targetArrayLength);
  temporaryArray.fill(defaultFillValue);
  
  const finalResult = dataConverter(temporaryArray, 9);
  printOutput(finalResult);
}

var dataSource = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

var dataHandler = {
  "sourceData": dataSource,
  "currentIdx": 0,
  "totalItems": dataSource.length,
  "retrieveElement": function() {
    if (!this.hasElements()) {
      throw "SequenceEndError: No further elements exist!";
    }
    var currentElement = this.sourceData[this.currentIdx];
    this.currentIdx++;
    return currentElement;
  },
  "hasElements": function() {
    return (this.currentIdx < this.totalItems);
  }
};
runApplication();

function fetchNextItem() {
  return dataHandler.retrieveElement();
}

function readInteger() {
  return transformValue(fetchNextItem(), 1);
}

function readStringArray() {
  return transformValue(fetchNextItem(), 2); // Splits string by spaces
}

function readIntArray() {
  return transformValue(fetchNextItem(), 4); // Splits string by spaces and converts to numbers
}

function readCharArray() {
  return transformValue(fetchNextItem(), 6); // Divides string into individual characters
}

function checkMoreData() {
  return dataHandler.hasElements();
}

function printResult(val) {
  console.log(val); // Outputs value to standard console
}

function logError(errMsg) {
  console.error(errMsg); // Outputs error to standard error console
}

/*
 * This function performs various data transformations based on a provided code.
 *
 * Parameters:
 *   inputVal: The data to be transformed.
 *   transformCode: An integer representing the desired transformation type.
 *
 * Transformation Codes:
 *   1: Converts input to an integer.
 *   2: Splits a string by spaces into an array of strings.
 *   4: Splits a string by spaces and maps elements to numbers.
 *   6: Splits a string into an array of individual characters.
 *   7: Splits a string into characters and maps elements to numbers.
 *   8: Joins an array of strings with spaces.
 *   9: Joins an array of strings with newline characters.
 *   0: Joins an array of strings without any separator.
 *
 * Returns:
 *   The transformed data, or the original inputVal if an error occurs or the code is unknown.
 */
function transformValue(inputVal, transformCode) {
  try {
    switch (transformCode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((item) => Number(item));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((item) => Number(item));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (caughtException) {
    return inputVal;
  }
}

function runApplication() {
  var initialNumber = readInteger();
  var calculatedResult = Math.floor(initialNumber / 11) * 2;
  var remainder = initialNumber % 11;
  if (remainder >= 7) {
    calculatedResult += 2;
  } else if (remainder > 0) {
    calculatedResult++;
  }
  printResult(calculatedResult);
}
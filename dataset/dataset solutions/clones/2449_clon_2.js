let rawDataLines = require("node:fs").readFileSync("/proc/self/fd/0", "utf-8")
  .trim()
  .split(/\n/);

const dataStreamHandler = {
  "contentList" : rawDataLines,
  "currentPosition" : 0,
  "totalCount" : rawDataLines.length,

  "hasMoreContent" : function() {
    return (this.currentPosition < this.totalCount);
  },

  "getNextItem" : function() {
    if ( ! this.hasMoreContent() ) {
      return "";
    }
    const retrievedElement = this.contentList[this.currentPosition];
    this.currentPosition += 1;
    return retrievedElement;
  }
};

invokeMainExecution();

function fetchNextInputLine() {
  return dataStreamHandler.getNextItem();
}

function acquireNextInteger() {
  return dataProcessor(fetchNextInputLine(), 1);
}

function acquireNextStringArray() {
  return dataProcessor(fetchNextInputLine(), 2); // Splits by single space characters
}

function acquireNextNumericArray() {
  return dataProcessor(fetchNextInputLine(), 4); // Splits by space and converts to numeric values
}

function acquireNextCharacterArray() {
  return dataProcessor(fetchNextInputLine(), 6); // Divides into individual characters
}

function checkAvailabilityOfNextLine() {
  return dataStreamHandler.hasMoreContent();
}

function displayOutput(contentToPresent) {
  console.log(contentToPresent); // Outputs content to the standard console
}

function reportError(errorContent) {
  console.error(errorContent); // Reports error messages to the standard error stream
}

/*
 * This function handles various data processing modes based on the 'modeChoice' parameter.
 * It's primarily for numerical and string array manipulations.
 *
 * If 'modeChoice' is unknown or an error occurs, the 'inputData' is returned without alteration.
 *
 * Mode 1: Converts 'inputData' to an integer.
 * Mode 2: Splits 'inputData' string by a single space character into an array of strings.
 * Mode 4: Splits 'inputData' string by a single space character, then maps each resulting string to a number.
 * Mode 6: Splits 'inputData' string into an array of individual characters.
 * Mode 7: Splits 'inputData' string into an array of individual characters, then maps each character to a number.
 * Mode 8: Joins elements of an 'inputData' array with a single space character.
 * Mode 9: Joins elements of an 'inputData' array with a newline character.
 * Mode 0: Joins elements of an 'inputData' array without any separator.
 */
function dataProcessor(inputData, modeChoice) {
  try {
    switch (modeChoice) {
      case 1:
        return parseInt(inputData, 10);
      case 2:
        return inputData.split(" ");
      case 4:
        return inputData.split(" ").map( (singleElement) => Number(singleElement) );
      case 6:
        return inputData.split("");
      case 7:
        return inputData.split("").map( (charItem) => Number(charItem) );
      case 8:
        return inputData.join(" ");
      case 9:
        return inputData.join("\n");
      case 0:
        return inputData.join("");
      default:
        return inputData;
    }
  } catch (processingError) {
    return inputData;
  }
}

function invokeMainExecution() {
  let computedResult = dataProcessor(new Array(10000).fill("-1"), 9);
  displayOutput(computedResult);
}
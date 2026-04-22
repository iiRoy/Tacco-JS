let dataStore = initializeReader();

ProcessData();

function   fetchInteger() { return transformValue(retrieveNext(), 1); }

/* Converts the next input item into an array of strings, splitting by space. */
function fetchStringArray() {
  return transformValue(retrieveNext(), 2);
}

// Retrieves the next input, splits by space, and converts elements to numbers.
function fetchIntegerArray() { return transformValue(retrieveNext(), 4); }

// Breaks the next input string into an array of individual characters.
function fetchCharacterArray() { return transformValue(retrieveNext(), 6); }

function retrieveNext() { return dataStore.readNextItem(); }

function hasMoreElements() { return dataStore.checkAvailability(); }

function readInput() {
  return require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeReader() {

  const inputLines = readInput(); // Obtain all input lines from standard input.

  let readerObject = {
    "lineList"       : inputLines,
    "currentIdx"     : 0,
    "totalLines"     : inputLines.length,

    "checkAvailability" : function() {
      return (this.currentIdx < this.totalLines);
    },

    "readNextItem" : function() {
      if (!this.checkAvailability()) {
        return "";
      } else {
        const currentLine = this.lineList[this.currentIdx];
        this.currentIdx++;
        return currentLine;
      }
    }
  };

  return readerObject;
}

function displayOutput(textToPrint) { console.log(textToPrint); } // Prints content to standard output.

function displayError(errorMsg) { console.error(errorMsg); } // Outputs diagnostic messages to standard error.

/*
 * This utility function handles various conversions for input data.
 * If the conversion type is unknown or an error occurs, the input is returned unchanged.
 *
 * Operation Types:
 *   1: Convert to an integer.
 *   2: Split by space into a string array.
 *   4: Split by space, then convert each part to a number.
 *   6: Split into individual characters.
 *   7: Split into individual characters, then convert each to a number.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
*/
function transformValue(inputVal, operationType) {
  try {
    switch (operationType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((element) => Number(element));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((element) => Number(element));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (exceptionErr) {
    return inputVal;
  }
}

function ProcessData() {

  const inputString = retrieveNext();
  const stringLength = inputString.length;
  const filteredString = inputString.replace(/x/g, "");

  let tempString = "";
  let charCount = 0;
  let segmentCounts = [];

  for (let currentPos = 0; currentPos < stringLength; currentPos = (currentPos + 1) | 0) {
    if (inputString[currentPos] !== "x") {
      tempString = inputString[currentPos] + tempString;
      segmentCounts.push(charCount);
      charCount = 0;
    } else {
      charCount++;
    }
  }

  segmentCounts.push(charCount);

  displayError(segmentCounts);

  if (tempString !== filteredString) {
    displayOutput(-1);
    return;
  }

  let finalResult = 0;

  for (let idx = 0; idx < segmentCounts.length; idx = (idx + 1) | 0) {
    finalResult += Math.abs(segmentCounts[idx] - segmentCounts[segmentCounts.length - 1 - idx]);
  }

  displayOutput(finalResult / 2);
}
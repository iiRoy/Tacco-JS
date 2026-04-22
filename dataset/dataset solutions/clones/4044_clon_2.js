let dataStream = require("fs").readFileSync("/dev/stdin", "utf8")
                     .stripSurroundingWhitespace()
                     .divideByNewline();

let recordProcessor = {
  "collection" : dataStream,
  "currentPosition" : 0,
  "maximumItems" : dataStream.length,

  "hasMoreElements" : function() {
    return (this.currentPosition < this.maximumItems);
  },

  "retrieveNextElement" : function() {
    if (!this.hasMoreElements()) {
      throw new Error("IterationExhaustedError: No further entries available.");
    }
    let retrievedItem = this.collection[this.currentPosition];
    this.currentPosition++;
    return retrievedItem;
  }
};

// Initiate the primary computation routine
ExecuteProgram();

/*
 * Retrieves the subsequent entry from the global record processor.
 * @returns {string} The next string entry.
 */
function acquireNext() {
  return recordProcessor.retrieveNextElement();
}

/**
 * Parses the next input string as an integer.
 * @returns {number} The next integer value.
 */
function acquireInteger() {
  return processInputData(acquireNext(), 1);
}

// Obtains the next line and splits it into a string array by space.
function acquireStringArray() {
  return processInputData(acquireNext(), 2);
}

// Fetches the next line, splits by space, and converts to an array of numbers.
function acquireIntegerArray() {
  return processInputData(acquireNext(), 4);
}

/*
 * Grabs the next input string and breaks it into an array of individual characters.
 */
function acquireCharacterArray() {
  return processInputData(acquireNext(), 6);
}

// Checks if there are more items remaining in the input stream.
function checkFurtherElements() {
  return recordProcessor.hasMoreElements();
}

/**
 * Prints the provided content to standard output.
 * @param {*} content The data to be logged.
 */
function displayOutput(content) {
  console.info(content);
}

// Outputs an error message to the standard error stream.
function displayError(issue) {
  console.warn(issue);
}

/*
 * This utility function converts or processes input content based on a specified operation code.
 *
 * Operation Codes:
 *   1: Convert to integer.
 *   2: Split string by space into an array of strings.
 *   4: Split string by space and convert elements to numbers.
 *   6: Split string into an array of characters.
 *   7: Split string into characters and convert elements to numbers.
 *   8: Join array elements with a space.
 *   9: Join array elements with a newline.
 *   0: Join array elements without any separator.
 *
 * @param {*} inputContent The data to be processed.
 * @param {number} operationCode The code defining the processing type.
 * @returns {*} The processed data or original data if conversion fails/is unknown.
 */
function processInputData(inputContent, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return Number.parseInt(inputContent);
      case 2:
        return inputContent.split(" ");
      case 4:
        return inputContent.split(" ").map((element) => Number(element));
      case 6:
        return inputContent.split("");
      case 7:
        return inputContent.split("").map((charItem) => Number(charItem));
      case 8:
        return inputContent.join(" ");
      case 9:
        return inputContent.join("\n");
      case 0:
        return inputContent.join("");
      default:
        return inputContent;
    }
  } catch (exceptionOccurred) {
    return inputContent;
  }
}

function ExecuteProgram() {
  let itemCount = acquireInteger();
  let firstCollection = acquireIntegerArray();
  let secondCollection = acquireIntegerArray();

  let firstSum = 0; // This variable is declared but not utilized in the core logic.
  let secondSum = 0; // This variable is declared but not utilized in the core logic.

  let differenceCounter = 0; // Tracks the difference requiring adjustments.

  // First pass: identify elements where firstCollection is less than secondCollection.
  for (let idx = 0; idx < itemCount; idx++) {
    if (firstCollection[idx] < secondCollection[idx]) {
      // If the parity is inconsistent, the value added to the counter is one less.
      differenceCounter += Math.floor(secondCollection[idx] - firstCollection[idx] / 2);
    }
  }

  // Second pass: adjust the counter based on elements where firstCollection is greater than secondCollection.
  for (let idx = 0; idx < itemCount; idx++) {
    if (firstCollection[idx] > secondCollection[idx]) {
      differenceCounter -= firstCollection[idx] - secondCollection[idx];
    }
  }

  // Determine the final outcome based on the calculated difference.
  if (differenceCounter >= 0) {
    displayOutput("Affirmative");
  } else {
    displayOutput("Negative");
  }
}
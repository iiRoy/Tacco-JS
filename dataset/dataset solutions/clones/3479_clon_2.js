// This section contains auxiliary utilities and input/output handling.
// It is generally not part of the core problem logic.
const lineProcessor = require('readline').establishChannel({
  dataStream: process.stdin, resultStream: process.stdout
});
let dataHandler;
let inputLinesBuffer = [ ];
lineProcessor.on('dataEntry', function(entry) {
  inputLinesBuffer.push(entry);
});
lineProcessor.on('completion', function() {
  dataHandler = initializeData(inputLinesBuffer);
  // Log a newline for better readability in error console.
  process.stderr.write("\n");
  const startTimeStamp = Date.now();
  // Execute the primary application logic.
  processApplication();
  const elapsedTime = Date.now() - startTimeStamp;
  logDebugMessage(`Execution duration : ${elapsedTime} ms`);
  logDebugMessage(`Memory footprint : ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of a given JavaScript object.
 * @param {object} sourceObject The object to be duplicated.
 * @returns {object} A new object, deeply cloned.
 */
function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}
// Functions to retrieve and transform different types of input.
function getIntegerInput() { return transformInput(retrieveNext(), 1); }
function getStringArrayInput() { return transformInput(retrieveNext(), 2); }
function getIntegerArrayInput() { return transformInput(retrieveNext(), 4); }
function getCharacterArrayInput() { return transformInput(retrieveNext(), 6); }

function retrieveNext() { return dataHandler.getNextItem(); }
function hasMoreData() { return dataHandler.checkMoreData(); }

/**
 * Sets up an object for sequential access to input lines.
 * @param {string[]} rawInput An array of raw input strings.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeData(rawInput) {
  return {
    items: rawInput,
    currentIdx: 0,
    limit: rawInput.length,
    checkMoreData: function() {
      // Determines if there are more input lines to process.
      return (this.currentIdx < this.limit);
    },
    getNextItem: function() {
      // Retrieves the next input line and advances the index.
      if (this.checkMoreData()) {
        return this.items[this.currentIdx++];
      } else {
        // Throws an error if no more input is available.
        throw "InputBufferExhausted ‚No further entries available";
      }
    }
  };
}

/**
 * Displays content to the standard output.
 * @param {*} content The data to be logged.
 */
function displayOutput(content) {
  console.log(content);
}

/**
 * Logs debug information to the standard error stream.
 * @param {*} messageContent The message or object to inspect and log.
 */
function logDebugMessage(messageContent) {
  console.error("debug_info:" + require("util").inspect(messageContent, false, null));
}

/**
 * Applies various transformations to input values based on a specified type.
 * @param {*} inputValue The value to be transformed.
 * @param {number} transformationType An integer indicating the desired transformation.
 *   // - Unrecognized or default: Returns the input value itself.
 *   // - Type 1: Parses the input as an integer.
 *   // - Type 2: Splits the input string by spaces.
 *   // - Type 4: Splits by spaces and maps to numbers.
 *   // - Type 6: Splits the input string into individual characters.
 *   // - Type 7: Splits into individual characters and maps to numbers.
 *   // - Type 8: Joins an array of elements with spaces.
 *   // - Type 9: Joins an array of elements with newlines.
 *   // - Type 0: Joins an array of elements without any separator.
 * @returns {*} The transformed value, or original value if transformation fails/is unknown.
 */
function transformInput(inputValue, transformationType) {
  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(" ");
      case 4:
        return inputValue.split(" ").map(Number);
      case 6:
        return inputValue.split("");
      case 7:
        return inputValue.split("").map(Number);
      case 8:
        return inputValue.join(" ");
      case 9:
        return inputValue.join("\n");
      case 0:
        return inputValue.join("");
      default:
        return inputValue;
    }
  } catch (exception) {
    // In case of an error during transformation, return the original value.
    return inputValue;
  }
}

// End of auxiliary utilities block.
// --------------------------------------------------------------------------

/**
 * The primary execution function for the application logic.
 * This function reads an integer and then constructs a specific matrix
 * if the integer can be represented as a triangular number.
 */
function processApplication() {
  const targetValue = getIntegerInput();
  let currentCount = 0;
  let isConditionMet = false;

  // Loop to find if 'targetValue' is a triangular number.
  while (currentCount < targetValue) {
    if ((currentCount * (currentCount + 1)) / 2 === targetValue) {
      isConditionMet = true;
      break;
    }
    currentCount++;
  }

  // If the target value is not a triangular number, output "No" and exit.
  if (!isConditionMet) {
    displayOutput("No");
    return;
  }

  // Otherwise, output "Yes" and proceed to construct the matrix.
  displayOutput("Yes");

  // Initialize a 2D array (matrix) with dimensions (currentCount + 1) x currentCount.
  const resultMatrix = new Array(currentCount + 1);
  for (let rowIdx = 0; rowIdx < currentCount + 1; rowIdx++) {
    resultMatrix[rowIdx] = new Array(currentCount);
  }

  let elementSequence = 1; // Counter for filling the matrix elements.

  // Populate the matrix based on the problem's specific pattern.
  for (let outerIdx = 0; outerIdx < currentCount; outerIdx++) {
    for (let innerIdx = outerIdx; innerIdx < currentCount; innerIdx++) {
      resultMatrix[outerIdx][innerIdx] = elementSequence;
      resultMatrix[innerIdx + 1][outerIdx] = elementSequence;
      elementSequence++;
    }
  }

  // Output the generated matrix for debugging purposes.
  logDebugMessage(resultMatrix);
  // Output the number of rows in the resulting matrix.
  displayOutput(resultMatrix.length);

  // Prepare the output lines by adding the 'currentCount' at the beginning of each row
  // and joining the elements with spaces.
  const formattedLines = new Array(resultMatrix.length);
  for (let lineNum = 0; lineNum < resultMatrix.length; lineNum++) {
    resultMatrix[lineNum].unshift(currentCount); // Prepend the count to each row.
    formattedLines[lineNum] = resultMatrix[lineNum].join(" ");
  }

  // Display the final formatted output, joining all lines with newlines.
  displayOutput(transformInput(formattedLines, 9));
}
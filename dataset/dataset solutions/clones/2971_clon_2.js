// This section handles input processing and utility functions.
// It's generally not part of the core algorithm logic.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler; // Manages access to processed input data.
var inputLines = []; // Stores raw input lines from stdin.

// Event listener for each line of input received.
inputReader.on('line', function(lineContent) {
  inputLines.push(lineContent);
});

// Event listener for when input stream closes.
inputReader.on('close', function() {
  dataHandler = initializeInputProcessor(inputLines); // Prepare input for consumption.
  console.error("\n"); // Add a newline for cleaner debug output separation.

  var startTime = Date.now(); // Record start time for performance measurement.
  ExecuteMainLogic(); // Execute the primary application logic.
  var elapsedTime = Date.now() - startTime; // Calculate elapsed time.

  logDebugMessage("time : " + (elapsedTime) + "ms"); // Log execution time.
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB"); // Log memory usage.
});

/**
 * Creates a deep copy of an object using JSON serialization.
 * @param {object} sourceObject The object to clone.
 * @returns {object} A deep copy of the source object.
 */
function createDeepCopy(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next input item as an integer.
 * @returns {number} The next integer from the input.
 */
function getNextInteger() {
  return convertInput(retrieveNextItem(), 1);
}

/**
 * Retrieves the next input item as an array of strings, split by space.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return convertInput(retrieveNextItem(), 2);
}

/**
 * Retrieves the next input item as an array of integers, split by space.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return convertInput(retrieveNextItem(), 4);
}

/**
 * Retrieves the next input item as an array of characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return convertInput(retrieveNextItem(), 6);
}

/**
 * Fetches the next raw input string from the data handler.
 * @returns {string} The next input string.
 */
function retrieveNextItem() {
  return dataHandler.retrieveNextItem();
}

/**
 * Checks if there are more input items available.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() {
  return dataHandler.hasMoreItems();
}

/**
 * Initializes an object to manage input line access.
 * @param {string[]} rawInputData An array of raw input strings.
 * @returns {object} An object with methods to access input.
 */
function initializeInputProcessor(rawInputData) {
  var processorObject = {
    sourceList: rawInputData,
    currentIndex: 0,
    maximumIndex: rawInputData.length,

    /**
     * Checks if there are more items in the source list.
     * @returns {boolean} True if more items are available.
     */
    hasMoreItems: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    /**
     * Retrieves the next item from the source list.
     * Throws an error if no more items are available.
     * @returns {string} The next input item.
     */
    retrieveNextItem: function() {
      if (!this.hasMoreItems()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputItem = this.sourceList[this.currentIndex];
        this.currentIndex++;
        return currentInputItem;
      }
    }
  };
  return processorObject;
}

/**
 * Prints a message to standard output.
 * @param {*} messageContent The content to print.
 */
function printOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Prints a debug message to standard error.
 * @param {*} messageContent The content to debug-log.
 */
function logDebugMessage(messageContent) {
  console.error("debug:" + require("util").inspect(messageContent, false, null));
}

/**
 * Utility function for converting input based on a specified type.
 * @param {*} inputValue The input value to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   1: Convert to integer.
 *   2: Split by space into string array.
 *   4: Split by space into number array.
 *   6: Split by character into string array.
 *   7: Split by character into number array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * @returns {*} The converted value or original value on error/unknown type.
 */
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
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
  } catch (conversionError) {
    return inputValue; // Return original value if conversion fails.
  }
}

// End of input handling and utility functions.
// Main application logic starts here.
function ExecuteMainLogic() {
  var firstInputLine = getNextIntegerArray(); // Read the first line containing M and K.
  var paramM = firstInputLine[0]; // Extract M.
  var paramK = firstInputLine[1]; // Extract K.

  // Check if K is within the valid range [0, 2^M - 1].
  if (paramK >= 0 && paramK < Math.pow(2, paramM)) {
    // Special case for M = 1.
    if (paramM === 1) {
      if (paramK === 0) {
        printOutput("0 0 1 1"); // Specific output for M=1, K=0.
      } else {
        printOutput(-1); // Invalid for M=1, K!=0.
      }
      return; // Exit function after handling M=1.
    }

    // Case where K is 0.
    if (paramK === 0) {
      // Construct an array with all numbers from 0 to 2^M - 1 appearing twice.
      var resultSequence = new Array(Math.pow(2, paramM + 1));
      for (var loopCounter = 0; loopCounter < Math.pow(2, paramM); loopCounter++) {
        resultSequence[loopCounter * 2] = loopCounter;
        resultSequence[loopCounter * 2 + 1] = loopCounter;
      }
      printOutput(convertInput(resultSequence, 8)); // Output the sequence joined by spaces.
    } else {
      // Case where K is not 0.
      // The sequence is K, 0, (all numbers except K), K, (all numbers except K in reverse), 0.
      var resultSequence = [paramK, 0]; // Start with K and 0.

      // Add numbers from 1 to 2^M - 1, excluding K.
      for (var loopCounter = 1; loopCounter <= Math.pow(2, paramM) - 1; loopCounter++) {
        if (loopCounter !== paramK) {
          resultSequence.push(loopCounter);
        }
      }

      resultSequence.push(paramK); // Add K again.

      // Add numbers from 2^M - 1 down to 1, excluding K.
      for (var loopCounter = Math.pow(2, paramM) - 1; loopCounter > 0; loopCounter--) {
        if (loopCounter !== paramK) {
          resultSequence.push(loopCounter);
        }
      }

      resultSequence.push(0); // End with 0.
      printOutput(convertInput(resultSequence, 8)); // Output the sequence joined by spaces.
    }
  } else {
    // If K is out of the valid range.
    printOutput(-1);
  }
}

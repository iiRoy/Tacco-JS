// This section handles the input reading and utility functions.
// It's generally not part of the core algorithm logic.
const inputReader = require('readline').createInterface({
  input:  process.stdin,
  output: process.stdout
});

let dataSource;
const receivedStrings = [];

inputReader.on('line', function(incomingString) {
    receivedStrings.push(incomingString);
});

inputReader.on('close', function() {
    dataSource = setupParser(receivedStrings);
    console.error('\n↑Input ↓Output'); // Debug message for I/O direction
    executeMainLogic();
});

/**
 * Creates a deep copy of an object or Set.
 * @param {object|Set} originalItem The item to duplicate.
 * @returns {object|Set} A new, independent copy.
 */
function duplicateObject(originalItem) {
  return (originalItem instanceof Set)
    ? new Set(Array.from(originalItem))
    : JSON.parse(JSON.stringify(originalItem));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer value.
 */
function fetchNumericValue() {
  return typeTransformer(pullNext(), 1);
}

/**
 * Retrieves the next line as an array of strings, split by spaces.
 * @returns {string[]} An array of string tokens.
 */
function fetchTextList() {
  return typeTransformer(pullNext(), 2);
}

/**
 * Retrieves the next line as an array of integers, split by spaces.
 * @returns {number[]} An array of numeric values.
 */
function fetchNumericList() {
  return typeTransformer(pullNext(), 4);
}

/**
 * Retrieves the next line as an array of characters.
 * @returns {string[]} An array of single-character strings.
 */
function fetchCharList() {
  return typeTransformer(pullNext(), 6);
}

/**
 * Advances the input stream and returns the next raw item.
 * @returns {string} The next line from the input.
 */
function pullNext() {
  return dataSource.advanceAndGet();
}

/**
 * Checks if there are more items available in the input stream.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreItems() {
  return dataSource.canAdvance();
}

/**
 * Initializes the input parser object.
 * @param {string[]} textInputArray An array of raw input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function setupParser(textInputArray) {
  return {
    dataRecords: textInputArray,
    readIndex: 0,
    dataCount: textInputArray.length,
    canAdvance: function() {
      return (this.readIndex < this.dataCount);
    },
    advanceAndGet: function() {
      if (this.canAdvance()) {
        return this.dataRecords[this.readIndex++];
      } else {
        throw new Error('InputOutOfBounds: No further input segments available');
      }
    }
  };
}

/**
 * Displays a message to the console's standard output.
 * @param {string} outputString The string to print.
 */
function displayOutput(outputString) {
  console.log(outputString);
}

/**
 * Logs debug information to the console's error stream.
 * @param {any} logEntry The data to inspect and log.
 */
function printDebug(logEntry) {
  console.error('Debug Trace: ' + require('util').inspect(logEntry, false, null));
}

/**
 * Converts an input value based on a specified format code.
 * @param {any} valueToConvert The value to transform.
 * @param {number} formatCode An integer indicating the conversion type.
 *   1: Parse as integer.
 *   2: Split string by spaces.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into individual characters.
 *   7: Split string into characters and map to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without a separator.
 * @returns {any} The converted value.
 */
function typeTransformer(valueToConvert, formatCode) {
  try {
    switch (formatCode) {
      case 1:
        return parseInt(valueToConvert);
      case 2:
        return valueToConvert.split(' ');
      case 4:
        return valueToConvert.split(' ').map(Number);
      case 6:
        return valueToConvert.split('');
      case 7:
        return valueToConvert.split('').map(Number);
      case 8:
        return valueToConvert.join(' ');
      case 9:
        return valueToConvert.join('\n');
      case 0:
        return valueToConvert.join('');
      default:
        return valueToConvert;
    }
  } catch (e) {
    return valueToConvert; // Return original on error
  }
}

// End of input processing and utility functions.
// ----------------------------------------------------------------------

/**
 * This is the main application logic that processes the input data.
 * It implements a specific algorithm to compare sorted number sets.
 */
function executeMainLogic() {
  const totalElements = fetchNumericValue();
  const rawNumbers = fetchNumericList();

  // Sort the initial sequence in ascending order.
  rawNumbers.sort(function(val1, val2) {
    return val1 - val2;
  });

  // Initialize the primary collection with the largest element.
  const primaryCollection = [];
  primaryCollection.push(rawNumbers.pop());

  // Iterate based on the total number of elements.
  for (let mainIndex = 0; mainIndex < totalElements; mainIndex++) {
    const secondaryGroup = [];
    // Populate the secondary group with a power-of-2 number of elements.
    for (let subIndex = 0; subIndex < (1 << mainIndex); subIndex++) {
      secondaryGroup.push(rawNumbers.pop());
    }

    // Sort the secondary group in descending order.
    secondaryGroup.sort(function(val1, val2) {
      return val2 - val1;
    });

    // Sort the primary collection in descending order for comparison.
    primaryCollection.sort(function(val1, val2) {
      return val2 - val1;
    });

    // Uncomment these lines for detailed debug output during execution.
    // printDebug(primaryCollection);
    // printDebug(secondaryGroup);

    // Compare elements between the primary and secondary groups.
    for (let subIndex = 0; subIndex < secondaryGroup.length; subIndex++) {
      if (primaryCollection[subIndex] <= secondaryGroup[subIndex]) {
        displayOutput("No"); // Condition not met, output "No" and terminate.
        return;
      }
    }

    // If all comparisons pass, merge the secondary group into the primary.
    primaryCollection = primaryCollection.concat(secondaryGroup);
  }

  // After all iterations, log the final state of the primary collection and output "Yes".
  printDebug(primaryCollection);
  displayOutput("Yes");
}
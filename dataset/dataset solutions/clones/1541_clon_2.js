// This section handles input processing and utility functions.
// It's generally boilerplate for competitive programming.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Object to manage input lines and provide next values.
var inputLines = []; // Array to store all input lines read from stdin.

// Event listener for each line of input.
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes.
inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines); // Initialize the input handler.
  console.error('\n↑入力 ↓出力'); // Debug message indicating input/output direction.
  executeProgram(); // Start the main program logic.
});

/**
 * Creates a deep copy of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} originalObject The object to clone.
 * @returns {any} A deep copy of the object.
 */
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

/**
 * Retrieves the next input token as an integer.
 * @returns {number} The parsed integer.
 */
function retrieveInteger() {
  return convertInput(getNextInput(), 1);
}

/**
 * Retrieves the next input token as an array of strings.
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
  return convertInput(getNextInput(), 2);
}

/**
 * Retrieves the next input token as an array of integers.
 * @returns {number[]} An array of integers.
 */
function retrieveIntegerArray() {
  return convertInput(getNextInput(), 4);
}

/**
 * Retrieves the next input token as an array of characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray() {
  return convertInput(getNextInput(), 6);
}

/**
 * Gets the next raw input token from the input processor.
 * @returns {string} The next input string.
 */
function getNextInput() {
  return inputProcessor.next();
}

/**
 * Checks if there are more input tokens available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
function hasMoreInput() {
  return inputProcessor.hasNext();
}

/**
 * Initializes an input handler object.
 * @param {string[]} rawInputData An array of raw input strings.
 * @returns {object} An object with methods to process input.
 */
function initializeInputHandler(rawInputData) {
  return {
    dataLines: rawInputData, // Stores the input lines.
    currentPosition: 0, // Current index for reading input.
    maximumPosition: rawInputData.length, // Total number of input lines.

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    hasNext: function() {
      return (this.currentPosition < this.maximumPosition);
    },

    /**
     * Retrieves the next line of input.
     * @returns {string} The next input line.
     * @throws {string} If no more input is available.
     */
    next: function() {
      if (this.hasNext()) {
        return this.dataLines[this.currentPosition++];
      } else {
        throw 'InputOutOfBoundsException: No more input lines to process.';
      }
    }
  };
}

/**
 * Prints a string to standard output, followed by a newline.
 * @param {string} outputString The string to print.
 */
function printOutput(outputString) {
  console.log(outputString);
}

/**
 * Prints a debug message to standard error.
 * @param {any} debugContent The content to inspect and print.
 */
function printDebug(debugContent) {
  console.error('debug_info:' + require('util').inspect(debugContent, false, null));
}

/**
 * Converts an input string or array based on the specified type.
 * @param {string|string[]} inputItem The item to convert.
 * @param {number} conversionType The type of conversion to perform.
 *   1: Parse as integer.
 *   2: Split by space into string array.
 *   4: Split by space and parse as integer array.
 *   6: Split by character into string array.
 *   7: Split by character and parse as integer array.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 * @returns {any} The converted item.
 */
function convertInput(inputItem, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputItem);
      case 2:
        return inputItem.split(' ');
      case 4:
        return inputItem.split(' ').map(Number);
      case 6:
        return inputItem.split('');
      case 7:
        return inputItem.split('').map(Number);
      case 8:
        return inputItem.join(' ');
      case 9:
        return inputItem.join('\n');
      case 0:
        return inputItem.join('');
      default:
        return inputItem;
    }
  } catch (errorObject) {
    return inputItem; // Return original item on error.
  }
}

// End of input processing and utility functions.
// --------------------------------------------------------------------------

/**
 * Main function where the program execution begins.
 */
function executeProgram() {
  var firstInput = retrieveIntegerArray(); // Read the first line containing N and Q.
  var elementCount = firstInput[0]; // N: Number of elements in the disjoint set.
  var queryCount = firstInput[1]; // Q: Number of queries to perform.

  var disjointSet = createDisjointSet(elementCount); // Initialize the Disjoint Set Union (DSU) structure.

  // Process each query.
  for (var loopIndex = 0; loopIndex < queryCount; loopIndex++) {
    var currentQuery = retrieveIntegerArray(); // Read the current query (type, u, v).
    var queryType = currentQuery[0]; // Type of query (0 for union, 1 for check).
    var firstElement = currentQuery[1]; // First element involved in the query.
    var secondElement = currentQuery[2]; // Second element involved in the query.

    if (queryType === 0) {
      // If query type is 0, perform a union operation.
      disjointSet.uniteSets(firstElement, secondElement);
    } else {
      // If query type is 1, check if elements are in the same set and print result.
      printOutput((disjointSet.areConnected(firstElement, secondElement)) ? 1 : 0);
    }
  }
}

/**
 * Creates and returns a Disjoint Set Union (DSU) data structure.
 * @param {number} numberOfElements The initial number of elements in the DSU.
 * @returns {object} An object representing the DSU with its methods.
 */
function createDisjointSet(numberOfElements) {
  var dsuInstance = {
    // The 'parentOrSize' array stores either:
    // - A negative value: Indicates it's a root, and its absolute value is the size of the set.
    // - A non-negative value: Indicates it's a child, and the value is the index of its parent.
    // Initially, each element is its own root with a size of 1 (represented as -1).
    "parentOrSize": new Array(numberOfElements).fill(-1),

    /**
     * Checks if two elements belong to the same set.
     * @param {number} firstItem Index of the first element.
     * @param {number} secondItem Index of the second element.
     * @returns {boolean} True if they are in the same set, false otherwise.
     */
    "areConnected": function(firstItem, secondItem) {
      return this.findRepresentative(firstItem) === this.findRepresentative(secondItem);
    },

    /**
     * Finds the representative (root) of the set containing the given element.
     * Implements path compression for efficiency.
     * @param {number} elementIndex The index of the element.
     * @returns {number} The index of the set's representative.
     */
    "findRepresentative": function(elementIndex) {
      // If the value at elementIndex is negative, it's a root.
      if (this.parentOrSize[elementIndex] < 0) {
        return elementIndex;
      } else {
        // Otherwise, recursively find the root and compress the path.
        this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
        return this.parentOrSize[elementIndex];
      }
    },

    /**
     * Unites the sets containing two given elements.
     * Uses union by size/rank heuristic.
     * @param {number} firstItem Index of the first element.
     * @param {number} secondItem Index of the second element.
     */
    "uniteSets": function(firstItem, secondItem) {
      var firstRoot = this.findRepresentative(firstItem); // Find root of first element.
      var secondRoot = this.findRepresentative(secondItem); // Find root of second element.

      // If they are already in the same set, do nothing.
      if (!this.areConnected(firstRoot, secondRoot)) {
        // Union by size: attach the smaller tree under the root of the larger tree.
        // The root with the smaller negative value (larger absolute size) becomes the new root.
        if (this.parentOrSize[firstRoot] <= this.parentOrSize[secondRoot]) { // Note: values are negative, so smaller value means larger set.
          this.parentOrSize[firstRoot] += this.parentOrSize[secondRoot]; // Update size of the new root.
          this.parentOrSize[secondRoot] = firstRoot; // Make firstRoot the parent of secondRoot.
        } else {
          this.parentOrSize[secondRoot] += this.parentOrSize[firstRoot]; // Update size of the new root.
          this.parentOrSize[firstRoot] = secondRoot; // Make secondRoot the parent of firstRoot.
        }
      }
    },

    /**
     * Gets the size of the set containing the given element.
     * @param {number} elementIndex The index of the element.
     * @returns {number} The size of the set.
     */
    "getSetSize": function(elementIndex) {
      // The size is stored as a negative value at the root, so return its absolute value.
      return -this.parentOrSize[this.findRepresentative(elementIndex)];
    }
  };
  return dsuInstance;
}

// This section handles input processing and utility functions.
// It's generally boilerplate for competitive programming.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Will hold the object for reading tokens
var inputLines = []; // Stores all lines read from stdin

// Event listener for each line of input
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener for when input stream closes
inputReader.on('close', function() {
  inputProcessor = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力'); // Debug message for user
  Solver(); // Call the main logic function
});

/**
 * Creates a deep copy of an object or Set.
 * @param {any} sourceObject The object to copy.
 * @returns {any} A deep copy.
 */
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Reads the next token and parses it as an integer.
 * @returns {number} The parsed integer.
 */
function readInteger() {
  return convertInput(getNextToken(), 1);
}

/**
 * Reads the next token and splits it into a string array by spaces.
 * @returns {string[]} An array of strings.
 */
function readStringArray() {
  return convertInput(getNextToken(), 2);
}

/**
 * Reads the next token, splits it by spaces, and parses elements as integers.
 * @returns {number[]} An array of integers.
 */
function readIntegerArray() {
  return convertInput(getNextToken(), 4);
}

/**
 * Reads the next token and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function readCharacterArray() {
  return convertInput(getNextToken(), 6);
}

/**
 * Retrieves the next token from the input processor.
 * @returns {string} The next input token.
 */
function getNextToken() {
  return inputProcessor.getNextToken();
}

/**
 * Checks if there are more tokens to read.
 * @returns {boolean} True if more tokens are available, false otherwise.
 */
function hasMoreTokens() {
  return inputProcessor.hasMoreTokens();
}

/**
 * Initializes the input processing object.
 * @param {string[]} lines An array of input lines.
 * @returns {object} An object with methods to read input.
 */
function initializeInputProcessor(lines) {
  return {
    dataLines: lines, // The array of input lines
    currentLineIndex: 0, // Current index in the dataLines array
    totalLines: lines.length, // Total number of lines
    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreTokens: function() {
      return (this.currentLineIndex < this.totalLines);
    },
    /**
     * Retrieves the next line of input.
     * @returns {string} The next line.
     * @throws {string} If no more input is available.
     */
    getNextToken: function() {
      if (this.hasMoreTokens()) {
        return this.dataLines[this.currentLineIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

/**
 * Prints a message to the console.
 * @param {any} message The message to print.
 */
function printResult(message) {
  console.log(message);
}

/**
 * Logs a debug message to stderr.
 * @param {any} debugInfo The information to debug.
 */
function logDebug(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

/**
 * Converts input based on a specified type.
 * @param {string|string[]} input The input to convert.
 * @param {number} conversionType The type of conversion.
 *   1: parseInt, 2: split by space, 4: split by space and map to Number,
 *   6: split by char, 7: split by char and map to Number,
 *   8: join by space, 9: join by newline, 0: join without separator.
 * @returns {any} The converted input.
 */
function convertInput(input, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(input);
      case 2:
        return input.split(' ');
      case 4:
        return input.split(' ').map(Number);
      case 6:
        return input.split('');
      case 7:
        return input.split('').map(Number);
      case 8:
        return input.join(' ');
      case 9:
        return input.join('\n');
      case 0:
        return input.join('');
      default:
        return input;
    }
  } catch (error) {
    return input; // Return original input on error
  }
}

// End of input/output and utility functions.

/**
 * Main function containing the problem-solving logic.
 */
function Solver() {
  // Read the first line containing N, K, L
  var firstLineData = readIntegerArray();
  var numElements = firstLineData[0]; // N
  var numConnectionsK = firstLineData[1]; // K
  var numConnectionsL = firstLineData[2]; // L

  // Initialize two Disjoint Set Union (Union-Find) structures
  var unionFindK = DisjointSetUnion(numElements);
  var unionFindL = DisjointSetUnion(numElements);

  // Array to store the final counts for each element
  var finalCounts = new Array(numElements);

  // Arrays to store connections (though not directly used after union,
  // they are part of the original structure, so we keep them).
  var connectionsK = new Array(numConnectionsK);
  var connectionsL = new Array(numConnectionsL);

  // Process K connections for the first Union-Find structure
  for (var idx = 0; idx < numConnectionsK; idx++) {
    var currentPair = readIntegerArray();
    currentPair.sort((a, b) => a - b); // Ensure consistent order for processing
    currentPair[0]--; // Convert to 0-indexed
    currentPair[1]--; // Convert to 0-indexed
    connectionsK[idx] = currentPair; // Store the pair
    unionFindK.uniteSets(currentPair[0], currentPair[1]); // Perform union operation
  }

  // Process L connections for the second Union-Find structure
  for (var idx = 0; idx < numConnectionsL; idx++) {
    var currentPair = readIntegerArray();
    currentPair.sort((a, b) => a - b); // Ensure consistent order for processing
    currentPair[0]--; // Convert to 0-indexed
    currentPair[1]--; // Convert to 0-indexed
    connectionsL[idx] = currentPair; // Store the pair
    unionFindL.uniteSets(currentPair[0], currentPair[1]); // Perform union operation
  }

  // Map to store counts of combined root pairs
  var rootPairCounts = {};

  // Iterate through all elements to find their combined roots and count occurrences
  for (var idx = 0; idx < numElements; idx++) {
    var combinedRootKey = unionFindL.findSetRepresentative(idx) + ":" + unionFindK.findSetRepresentative(idx);
    if (rootPairCounts[combinedRootKey] == null) { // Using == null to match original's behavior for undefined/null
      rootPairCounts[combinedRootKey] = 0;
    }
    rootPairCounts[combinedRootKey]++;
  }

  // Populate the finalCounts array based on the calculated root pair counts
  for (var idx = 0; idx < numElements; idx++) {
    finalCounts[idx] = rootPairCounts[unionFindL.findSetRepresentative(idx) + ":" + unionFindK.findSetRepresentative(idx)];
  }

  // Output the results, joined by spaces
  printResult(convertInput(finalCounts, 8));
}

/**
 * Implements a Disjoint Set Union (Union-Find) data structure.
 * @param {number} elementCount The number of elements in the DSU.
 * @returns {object} An object representing the DSU with its operations.
 */
function DisjointSetUnion(elementCount) {
  var dsuInstance = {
    // The 'parentOrSize' array stores either:
    // - A negative value: indicates it's a root, and its absolute value is the size of the set.
    // - A non-negative value: indicates it's a child, and the value is the index of its parent.
    // Initially, all elements are roots of their own set of size 1.
    "parentOrSize": new Array(elementCount).fill(-1),

    /**
     * Checks if two elements belong to the same set.
     * @param {number} elementA The index of the first element.
     * @param {number} elementB The index of the second element.
     * @returns {boolean} True if they are in the same set, false otherwise.
     */
    "areConnected": function(elementA, elementB) {
      return this.findSetRepresentative(elementA) == this.findSetRepresentative(elementB);
    },

    /**
     * Finds the representative (root) of the set containing the given element.
     * Performs path compression during traversal.
     * @param {number} targetIndex The index of the element.
     * @returns {number} The index of the set's representative.
     */
    "findSetRepresentative": function(targetIndex) {
      // If the element is a root (value is negative)
      if (this.parentOrSize[targetIndex] < 0) {
        return targetIndex;
      } else {
        // Recursively find the root and perform path compression
        this.parentOrSize[targetIndex] = this.findSetRepresentative(this.parentOrSize[targetIndex]);
        return this.parentOrSize[targetIndex];
      }
    },

    /**
     * Unites the sets containing two given elements.
     * Uses union by size/rank heuristic.
     * @param {number} elementA The index of the first element.
     * @param {number} elementB The index of the second element.
     */
    "uniteSets": function(elementA, elementB) {
      var rootA = this.findSetRepresentative(elementA);
      var rootB = this.findSetRepresentative(elementB);

      // If they are already in the same set, do nothing
      if (!this.areConnected(rootA, rootB)) {
        // Attach the smaller tree under the root of the larger tree
        // (represented by more negative value, i.e., larger absolute size)
        if (this.parentOrSize[rootA] <= this.parentOrSize[rootB]) { // rootA's set is larger or equal
          this.parentOrSize[rootA] += this.parentOrSize[rootB]; // Update size of new root
          this.parentOrSize[rootB] = rootA; // Make rootA the parent of rootB
        } else { // rootB's set is larger
          this.parentOrSize[rootB] += this.parentOrSize[rootA]; // Update size of new root
          this.parentOrSize[rootA] = rootB; // Make rootB the parent of rootA
        }
      }
    },

    /**
     * Gets the size of the set containing the given element.
     * @param {number} targetIndex The index of the element.
     * @returns {number} The size of the set.
     */
    "getSetSize": function(targetIndex) {
      // The size is stored as the negative value at the root.
      return -this.parentOrSize[this.findSetRepresentative(targetIndex)];
    }
  };
  return dsuInstance;
}

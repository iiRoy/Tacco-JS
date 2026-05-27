// This section handles input/output operations.
// It's generally boilerplate for competitive programming.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputHandler;
var inputLines = [];

// Collect all input lines as they are received.
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Once all input has been read, initialize the input handler and execute the main logic.
inputReader.on('close', function() {
  inputHandler = initializeInput(inputLines);
  console.error('\n↑Input ↓Output'); // Informative message for input/output separation.
  executeMainLogic();
});

// Creates a deep copy of an object or a Set.
// If the object is a Set, a new Set is created from its elements.
// Otherwise, JSON serialization/deserialization is used for a deep copy.
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Helper function to retrieve and convert the next line of input to an integer.
function getNextInteger() {
  return convertInput(getNextLine(), 1);
}

// Helper function to retrieve and convert the next line of input to an array of strings (split by space).
function getNextStringArray() {
  return convertInput(getNextLine(), 2);
}

// Helper function to retrieve and convert the next line of input to an array of integers (split by space).
function getNextIntegerArray() {
  return convertInput(getNextLine(), 4);
}

// Helper function to retrieve and convert the next line of input to an array of characters.
function getNextCharacterArray() {
  return convertInput(getNextLine(), 6);
}

// Retrieves the next line from the input handler.
function getNextLine() {
  return inputHandler.retrieveNext();
}

// Checks if there are more lines available in the input.
function hasMoreLines() {
  return inputHandler.hasMore();
}

// Initializes the input handler object with the collected lines.
function initializeInput(linesData) {
  return {
    dataLines: linesData, // Stores all input lines.
    currentIndex: 0, // Current position in the input lines array.
    maxLines: linesData.length, // Total number of input lines.

    // Method to check if there are more lines to read.
    hasMore: function() {
      return (this.currentIndex < this.maxLines);
    },

    // Method to retrieve the next line and advance the index.
    retrieveNext: function() {
      if (this.hasMore()) {
        return this.dataLines[this.currentIndex++];
      } else {
        // Throws an error if attempting to read beyond available input.
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Prints the given data to the standard output.
function printOutput(dataToPrint) {
  console.log(dataToPrint);
}

// Prints debug information to the standard error stream.
function printDebug(debugData) {
  console.error('debug:' + require('util').inspect(debugData, false, null));
}

/*
  Converts input based on a specified type number.
  - Type 1: Parses the input string as an integer.
  - Type 2: Splits the input string by spaces into an array of strings.
  - Type 4: Splits the input string by spaces and maps each part to a Number.
  - Type 6: Splits the input string into an array of individual characters.
  - Type 7: Splits the input string into characters and maps each to a Number.
  - Type 8: Joins array elements with a space.
  - Type 9: Joins array elements with a newline character.
  - Type 0: Joins array elements without any separator.
  - Default: Returns the input value as is.
*/
function convertInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (error) {
    // If an error occurs during conversion, return the original input.
    return inputValue;
  }
}

// End of input/output utility functions.

// Main program logic starts here.
function executeMainLogic() {
  var firstLineData = getNextIntegerArray();
  var numElements = firstLineData[0];
  var numConnectionsK = firstLineData[1];
  var numConnectionsL = firstLineData[2];

  // Initialize two Union-Find data structures.
  var unionFindK = createUnionFind(numElements);
  var unionFindL = createUnionFind(numElements);

  // Initialize an array to store counts for each element, starting with 1.
  var resultCounts = new Array(numElements).fill(1);

  // Arrays to store the connections for K and L.
  var connectionsK = new Array(numConnectionsK);
  var connectionsL = new Array(numConnectionsL);

  // Process K connections: read pairs, sort them, adjust to 0-based indexing, and unite them in unionFindK.
  for (var idx = 0; idx < numConnectionsK; idx++) {
    var currentPair = getNextIntegerArray();
    currentPair.sort(); // Sort to ensure consistent representation (e.g., [1,2] vs [2,1]).
    currentPair[0]--; // Convert to 0-based index.
    currentPair[1]--; // Convert to 0-based index.
    connectionsK[idx] = currentPair;
    unionFindK.uniteSets(currentPair[0], currentPair[1]);
  }

  // Process L connections: read pairs, sort them, adjust to 0-based indexing, and unite them in unionFindL.
  for (var idx = 0; idx < numConnectionsL; idx++) {
    var currentPair = getNextIntegerArray();
    currentPair.sort(); // Sort for consistency.
    currentPair[0]--; // Convert to 0-based index.
    currentPair[1]--; // Convert to 0-based index.
    connectionsL[idx] = currentPair;
    unionFindL.uniteSets(currentPair[0], currentPair[1]);
  }

  // A Set to keep track of pairs that have already been processed to avoid double counting.
  var processedPairs = new Set();

  // First pass: Iterate through K connections.
  for (var idx = 0; idx < numConnectionsK; idx++) {
    var currentPair = connectionsK[idx];
    // If the two elements in the current K connection are also connected in unionFindL,
    // increment their respective counts in resultCounts.
    if (unionFindL.areConnected(currentPair[0], currentPair[1])) {
      resultCounts[currentPair[0]]++;
      resultCounts[currentPair[1]]++;
    }
    // Add the current pair (as a string) to the set of processed pairs.
    processedPairs.add(currentPair.join(":"));
  }

  // Second pass: Iterate through L connections.
  for (var idx = 0; idx < numConnectionsL; idx++) {
    var currentPair = connectionsL[idx];
    // If this pair was already processed in the K connections loop, skip it.
    if (processedPairs.has(currentPair.join(":"))) {
      continue;
    }
    // If the two elements in the current L connection are connected in unionFindK,
    // increment their respective counts in resultCounts.
    if (unionFindK.areConnected(currentPair[0], currentPair[1])) {
      resultCounts[currentPair[0]]++;
      resultCounts[currentPair[1]]++;
    }
  }

  // Output the final resultCounts array, with elements joined by spaces.
  printOutput(convertInput(resultCounts, 8));
}

// Implements a Union-Find (Disjoint Set Union) data structure.
function createUnionFind(size) {
  var unionFindInstance = {
    // The parentArray stores the parent of each element.
    // If parentArray[i] is negative, 'i' is a root, and its absolute value represents the size of the set.
    // Initially, each element is its own root, with a set size of 1 (represented as -1).
    "parentArray": new Array(size).fill(-1),

    // Checks if two elements belong to the same disjoint set.
    "areConnected": function(elementA, elementB) {
      return this.findRoot(elementA) === this.findRoot(elementB);
    },

    // Finds the root (representative) of the set containing the given nodeIndex.
    // This method also performs path compression to flatten the tree structure for efficiency.
    "findRoot": function(nodeIndex) {
      if (this.parentArray[nodeIndex] < 0) {
        return nodeIndex; // If the value is negative, nodeIndex is a root.
      } else {
        // Recursively find the root and apply path compression:
        // Set the parent of nodeIndex directly to the found root.
        this.parentArray[nodeIndex] = this.findRoot(this.parentArray[nodeIndex]);
        return this.parentArray[nodeIndex];
      }
    },

    // Unites the sets containing elementA and elementB.
    // If they are already in the same set, no action is taken.
    // Otherwise, the sets are merged using a union-by-index heuristic (original behavior).
    "uniteSets": function(elementA, elementB) {
      var rootA = this.findRoot(elementA);
      var rootB = this.findRoot(elementB);

      // If the roots are different, merge the sets.
      if (!this.areConnected(rootA, rootB)) {
        // Merge based on the index of the roots.
        // The root with the smaller index becomes the parent of the root with the larger index.
        // The size of the merged set is updated at the new root.
        if (rootA >= rootB) {
          this.parentArray[rootA] += this.parentArray[rootB]; // Add sizes (which are negative).
          this.parentArray[rootB] = rootA; // Make rootA the parent of rootB.
        } else {
          this.parentArray[rootB] += this.parentArray[rootA]; // Add sizes.
          this.parentArray[rootA] = rootB; // Make rootB the parent of rootA.
        }
      }
    },

    // Returns the size of the set containing the given nodeIndex.
    "getSetSize": function(nodeIndex) {
      // The root's value is the negative of its set size.
      return -this.parentArray[this.findRoot(nodeIndex)];
    }
  };
  return unionFindInstance;
}

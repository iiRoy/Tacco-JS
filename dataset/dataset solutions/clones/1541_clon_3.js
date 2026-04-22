// --- Core Input/Output Management System ---
const ioStream = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let lineBuffer = [];
let inputProcessor;

// Event handler for each line received
ioStream.on('line', (currentLine) => {
  lineBuffer.push(currentLine);
});

// Event handler when input stream closes
ioStream.on('close', () => {
  inputProcessor = initializeInputHandler(lineBuffer);
  // Optional: Acknowledge processing start
  // console.error('\nInput processing complete. Beginning main logic execution.');
  executeMainLogic();
});

// Helper for deep cloning, retained for Type III variation, though not used in main logic.
function replicateObject(sourceObject) {
  if (sourceObject instanceof Set) {
    return new Set(Array.from(sourceObject));
  }
  // For basic JSON-serializable objects, this is a common deep copy method.
  return JSON.parse(JSON.stringify(sourceObject));
}

// Input parsing utilities for convenience
function fetchNextInteger() { return convertData(retrieveNextLine(), 1); }
function fetchNextStringArray() { return convertData(retrieveNextLine(), 2); }
function fetchNextIntegerArray() { return convertData(retrieveNextLine(), 4); }
function fetchNextCharacterArray() { return convertData(retrieveNextLine(), 6); }

// Core functions to interact with the input buffer
function retrieveNextLine() { return inputProcessor.getNext(); }
function hasMoreInput() { return inputProcessor.canFetchMore(); }

// Factory function to create an input handler object
function initializeInputHandler(rawInputLines) {
  const inputHandler = {
    storedLines: rawInputLines,
    currentIndex: 0,
    totalLines: rawInputLines.length,

    // Checks if there are more lines to read
    canFetchMore: function() {
      return (this.currentIndex < this.totalLines);
    },

    // Retrieves the next line from the buffer
    getNext: function() {
      if (this.canFetchMore()) {
        return this.storedLines[this.currentIndex++];
      } else {
        // Throw a specific error for clarity
        throw new Error('InputBufferEmptyException: No more lines available for processing.');
      }
    }
  };
  return inputHandler;
}

// Function for outputting results to console
function outputResult(dataToPrint) {
  console.log(dataToPrint);
}

// Universal data conversion utility based on a format code
function convertData(inputString, formatCode) {
  try {
    switch (formatCode) {
      case 1: // Convert to integer
        return parseInt(inputString, 10);
      case 2: // Split string by spaces into an array of strings
        return inputString.split(' ');
      case 4: // Split string by spaces and convert each part to a number
        return inputString.split(' ').map(Number);
      case 6: // Split string into an array of individual characters
        return inputString.split('');
      case 7: // Split string into characters and convert each to a number (e.g., "123" -> [1, 2, 3])
        return inputString.split('').map(Number);
      // Cases below are typically for array-to-string conversion, not directly for input parsing.
      // Included for completeness of the original `myconv` functionality.
      case 8: // Join an array with spaces
        return inputString.join(' ');
      case 9: // Join an array with newlines
        return inputString.join('\n');
      case 0: // Join an array without any separator
        return inputString.join('');
      default: // If format code is unknown, return the original string
        return inputString;
    }
  } catch (error) {
    // In a production scenario, this might log to an error stream or throw.
    // For this clone, we'll silently return the original input on conversion failure.
    // console.error(`Conversion error for input "${inputString}" with code ${formatCode}:`, error.message);
    return inputString;
  }
}

// --- Main Program Logic ---
function executeMainLogic() {
  const initialConfig = fetchNextIntegerArray();
  const numberOfElements = initialConfig[0];
  const numberOfQueries = initialConfig[1];

  // Guard clause: Exit early if initial parameters are invalid
  if (numberOfElements <= 0 || numberOfQueries < 0) {
    // console.error("Error: Invalid number of elements or queries provided. Exiting program.");
    return;
  }

  const disjointSetManager = createDisjointSet(numberOfElements);

  // Process each query sequentially
  for (let queryIdx = 0; queryIdx < numberOfQueries; queryIdx++) {
    const currentQueryDetails = fetchNextIntegerArray();
    const queryType = currentQueryDetails[0];
    const elementX = currentQueryDetails[1];
    const elementY = currentQueryDetails[2];

    // Additional validation: Check if element indices are within bounds
    if (elementX < 0 || elementX >= numberOfElements || elementY < 0 || elementY >= numberOfElements) {
        // console.warn(`Warning: Query ${queryIdx} involves out-of-bounds elements (${elementX}, ${elementY}). Skipping this query.`);
        continue; // Skip to the next query
    }

    // Execute actions based on query type
    if (queryType === 0) {
      disjointSetManager.unifyComponents(elementX, elementY);
    } else if (queryType === 1) { // Explicitly check for query type 1
      const areSameSet = disjointSetManager.areInSameComponent(elementX, elementY);
      outputResult(areSameSet ? 1 : 0);
    } else {
        // Handle unknown query types gracefully
        // console.warn(`Warning: Unknown query type encountered: ${queryType} for query ${queryIdx}. Skipping.`);
    }
  }
}

// --- Disjoint Set Union (DSU) Structure ---
// Factory function to create and return a Disjoint Set Union instance.
// This structure efficiently manages partitions of a set into disjoint (non-overlapping) subsets.
function createDisjointSet(initialSize) {
  // `parentOrSize` array:
  // If `parentOrSize[i]` is negative, `i` is a root of a set, and its absolute value is the size of the set.
  // If `parentOrSize[i]` is non-negative, `i` is not a root, and `parentOrSize[i]` is the index of its parent.
  const parentOrSize = Array.from({ length: initialSize }, () => -1); // Initialize each element as a root of its own set (size 1)

  const dsu = {
    // Finds the representative (root) of the set containing the given element.
    // Implements path compression: makes every node on the path to the root point directly to the root.
    findRepresentative: function(elementNode) {
      // Input validation for the element index
      if (elementNode < 0 || elementNode >= parentOrSize.length) {
          throw new Error(`Invalid element index: ${elementNode}. Must be within [0, ${parentOrSize.length - 1}].`);
      }

      if (parentOrSize[elementNode] < 0) {
        return elementNode; // `elementNode` is already a root
      } else {
        // Recursively find the root and compress the path
        parentOrSize[elementNode] = this.findRepresentative(parentOrSize[elementNode]);
        return parentOrSize[elementNode];
      }
    },

    // Determines if two elements belong to the same disjoint set.
    areInSameComponent: function(nodeA, nodeB) {
      // Finding representatives also performs path compression, which is beneficial.
      const repA = this.findRepresentative(nodeA);
      const repB = this.findRepresentative(nodeB);
      return repA === repB;
    },

    // Merges the sets containing `nodeA` and `nodeB`.
    // Employs the union by size heuristic to maintain shallow trees, improving performance.
    // Returns `true` if a merge occurred, `false` if elements were already in the same set.
    unifyComponents: function(nodeA, nodeB) {
      let representativeA = this.findRepresentative(nodeA);
      let representativeB = this.findRepresentative(nodeB);

      // If they are already in the same set, no union is needed.
      if (representativeA === representativeB) {
        return false; // No change made
      }

      // Union by size heuristic: attach the smaller tree's root to the larger tree's root.
      // Since parentOrSize stores negative sizes for roots, a larger negative value means a larger set.
      // We want `representativeA` to be the root of the larger (or equal) set.
      if (parentOrSize[representativeA] > parentOrSize[representativeB]) {
        // Swap representatives if A's set is smaller than B's
        [representativeA, representativeB] = [representativeB, representativeA];
      }
      
      // Update the size of the larger set by adding the size of the smaller set.
      parentOrSize[representativeA] += parentOrSize[representativeB];
      // Make the root of the smaller set point to the root of the larger set.
      parentOrSize[representativeB] = representativeA;
      
      return true; // Union successfully performed
    },

    // Retrieves the size of the component (set) that `elementNode` belongs to.
    // This utility function is part of the DSU structure but not directly used in the main logic.
    getComponentSize: function(elementNode) {
        const root = this.findRepresentative(elementNode);
        return -parentOrSize[root]; // Size is stored as a negative value at the root
    }
  };

  return dsu;
}
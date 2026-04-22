const filesystemModule = require("fs"); // Import the file system module for I/O operations.

// Defines an iterator-like structure to process input lines.
// This structure manages the input data, its current reading position,
// and provides methods to check for and retrieve the next element.
const inputDataStream = {
  inputLines: filesystemModule.readFileSync("/dev/stdin", "utf8").split("\n").filter(line => line.length > 0), // Read input, split by newline, and filter out empty lines.
  readPointer: 0, // Current position for reading.
  totalLines: 0, // Total number of lines available.

  // Initialize the data stream after creation.
  initializeStream: function() {
    this.totalLines = this.inputLines.length;
    // Optional: Log initial state for debugging.
    // console.error(`Initialized stream with ${this.totalLines} lines.`);
  },

  // Checks if there are more elements to read in the stream.
  canAdvance: function() {
    return (this.readPointer < this.totalLines);
  },

  // Retrieves the next element from the stream.
  // Throws an error if no elements are left.
  fetchNext: function() {
    if (!this.canAdvance()) {
      throw new Error("EndOfStreamException: No further elements available for processing.");
    }
    const currentElement = this.inputLines[this.readPointer];
    this.readPointer++; // Advance the pointer to the next element.
    return currentElement;
  }
};

// Immediately initialize the input stream.
inputDataStream.initializeStream();

// --- Global Helper Functions for Input/Output ---

// Function to retrieve the next raw line from the input stream.
function getNextLine() {
  return inputDataStream.fetchNext();
}

// Function to check if more lines are available in the input stream.
function hasPendingLines() {
  return inputDataStream.canAdvance();
}

// Named constants for various data conversion types.
const ConversionOperations = {
  TO_INTEGER: 1,
  SPLIT_BY_SPACE: 2,
  SPLIT_AND_PARSE_INT_ARRAY: 4,
  SPLIT_BY_CHAR: 6,
  SPLIT_BY_CHAR_AND_PARSE_INT_ARRAY: 7,
  JOIN_BY_SPACE: 8,
  JOIN_BY_NEWLINE: 9,
  JOIN_WITHOUT_DELIMITER: 0
};

// A utility function for converting input data based on a specified operation type.
// Handles various parsing and formatting scenarios.
function dataTransformer(valueToTransform, operationType) {
  try {
    switch (operationType) {
      case ConversionOperations.TO_INTEGER:
        // Convert input string to an integer.
        return Number.parseInt(valueToTransform, 10);
      case ConversionOperations.SPLIT_BY_SPACE:
        // Split a string by single spaces into an array of strings.
        return valueToTransform.split(" ");
      case ConversionOperations.SPLIT_AND_PARSE_INT_ARRAY:
        // Split by spaces, then convert each part to an integer.
        return valueToTransform.split(" ").map(segment => Number.parseInt(segment, 10));
      case ConversionOperations.SPLIT_BY_CHAR:
        // Split a string into an array of individual characters.
        return valueToTransform.split("");
      case ConversionOperations.SPLIT_BY_CHAR_AND_PARSE_INT_ARRAY:
        // Split by characters, then convert each character (as a string) to an integer.
        return valueToTransform.split("").map(char => Number.parseInt(char, 10));
      case ConversionOperations.JOIN_BY_SPACE:
        // Join elements of an array into a single string, separated by spaces.
        return valueToTransform.join(" ");
      case ConversionOperations.JOIN_BY_NEWLINE:
        // Join elements of an array into a single string, separated by newlines.
        return valueToTransform.join("\n");
      case ConversionOperations.JOIN_WITHOUT_DELIMITER:
        // Join elements of an array into a single string without any separator.
        return valueToTransform.join("");
      default:
        // If an unknown operation type is provided, return the original value.
        // A more robust implementation might throw an error here.
        console.warn(`Unknown conversion operation type: ${operationType}. Returning original value.`);
        return valueToTransform;
    }
  } catch (error) {
    // Catch any errors during conversion and return the original value or handle specifically.
    console.error(`Error during data transformation for value "${valueToTransform}" with type ${operationType}: ${error.message}`);
    return valueToTransform;
  }
}

// Retrieves and parses the next line as a single integer.
function getNextInteger() {
  return dataTransformer(getNextLine(), ConversionOperations.TO_INTEGER);
}

// Retrieves and parses the next line as an array of strings, split by spaces.
function getStringArrayFromLine() {
  return dataTransformer(getNextLine(), ConversionOperations.SPLIT_BY_SPACE);
}

// Retrieves and parses the next line as an array of integers, split by spaces.
function getIntegerArrayFromLine() {
  return dataTransformer(getNextLine(), ConversionOperations.SPLIT_AND_PARSE_INT_ARRAY);
}

// Retrieves and parses the next line as an array of characters.
function getCharArrayFromLine() {
  return dataTransformer(getNextLine(), ConversionOperations.SPLIT_BY_CHAR);
}

// Outputs a message to the standard output.
function emitOutput(messageContent) {
  console.log(messageContent);
}

// Outputs a message to the standard error stream.
function emitError(errorMessage) {
  console.error(errorMessage);
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * This structure efficiently tracks a partitioning of a set into disjoint subsets.
 *
 * Each element is initially in its own set. Operations allow merging sets
 * and finding the representative (root) of an element's set.
 *
 * @param {number} initialCapacity The initial number of elements in the DSU.
 *                                 Elements are typically 0-indexed.
 * @returns {object} An object representing the DSU with methods for set operations.
 */
function DisjointSetUnion(initialCapacity) {
  if (initialCapacity <= 0) {
    emitError("DSU must be initialized with a positive capacity.");
    throw new Error("Invalid DSU initial capacity.");
  }

  const dsuInternalState = {
    // The core array. Each index i stores either:
    // - A negative value: indicates i is a root, and its absolute value is the size of the set.
    // - A non-negative value: indicates i's parent, pointing towards the root.
    parentOrSize: Array(initialCapacity).fill(-1),

    /**
     * Finds the representative (root) of the set containing the given element.
     * Performs path compression to flatten the tree structure for faster future lookups.
     *
     * @param {number} elementIndex The index of the element whose root is to be found.
     * @returns {number} The index of the representative (root) of the element's set.
     */
    findRepresentative: function(elementIndex) {
      // Input validation: ensure elementIndex is within bounds.
      if (elementIndex < 0 || elementIndex >= this.parentOrSize.length) {
        emitError(`Element index ${elementIndex} is out of bounds for DSU size ${this.parentOrSize.length}.`);
        throw new RangeError("Element index out of bounds.");
      }

      // If the value at elementIndex is negative, it means it's a root.
      if (this.parentOrSize[elementIndex] < 0) {
        return elementIndex;
      }

      // Otherwise, recursively find the root and perform path compression.
      // The element's parent is updated to point directly to the root.
      this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
      return this.parentOrSize[elementIndex];
    },

    /**
     * Checks if two elements belong to the same disjoint set.
     *
     * @param {number} firstElement Index of the first element.
     * @param {number} secondElement Index of the second element.
     * @returns {boolean} True if both elements are in the same set, false otherwise.
     */
    areConnected: function(firstElement, secondElement) {
      return this.findRepresentative(firstElement) === this.findRepresentative(secondElement);
    },

    /**
     * Merges the sets containing two given elements.
     * Uses union by size/rank heuristic to keep the trees flat.
     *
     * @param {number} elementA Index of the first element.
     * @param {number} elementB Index of the second element.
     */
    uniteSets: function(elementA, elementB) {
      let rootA = this.findRepresentative(elementA);
      let rootB = this.findRepresentative(elementB);

      // If they are already in the same set, no action needed.
      if (rootA === rootB) {
        return;
      }

      // Union by size: attach the smaller tree under the root of the larger tree.
      // parentOrSize stores negative size for roots, so a smaller negative value means a larger set.
      if (this.parentOrSize[rootA] <= this.parentOrSize[rootB]) {
        // Root A's set is larger or equal in size.
        this.parentOrSize[rootA] += this.parentOrSize[rootB]; // Update size of new root.
        this.parentOrSize[rootB] = rootA; // Make root A the parent of root B.
      } else {
        // Root B's set is larger.
        this.parentOrSize[rootB] += this.parentOrSize[rootA]; // Update size of new root.
        this.parentOrSize[rootA] = rootB; // Make root B the parent of root A.
      }
    },

    /**
     * Returns the size of the set containing the specified element.
     *
     * @param {number} elementIndex The index of the element.
     * @returns {number} The number of elements in the set.
     */
    getSetSize: function(elementIndex) {
      // The size is stored as the negative value at the root.
      return -this.parentOrSize[this.findRepresentative(elementIndex)];
    }
  };

  return dsuInternalState;
}

/**
 * The primary execution function for the program.
 * It reads input parameters, performs Union-Find operations,
 * and calculates a specific count based on connectivity.
 */
function processInputAndSolve() {
  // Read the first line containing N (number of nodes) and M (number of connections).
  const inputParameters = getIntegerArrayFromLine();
  const nodeCount = inputParameters[0];
  const connectionCount = inputParameters[1];

  // Read the second line which represents the target mapping or initial positions.
  const targetMapping = getIntegerArrayFromLine();

  // Initialize the Disjoint Set Union structure for 'nodeCount' elements.
  const graphConnectivityTracker = DisjointSetUnion(nodeCount);

  // Process M connection operations.
  // Each connection specifies two nodes that should be in the same set.
  for (let k = 0; k < connectionCount; ++k) {
    const connectionPair = getIntegerArrayFromLine();
    // Adjust indices to be 0-based as per common programming practice.
    const node1 = connectionPair[0] - 1;
    const node2 = connectionPair[1] - 1;
    graphConnectivityTracker.uniteSets(node1, node2);
  }

  let matchingElementsCount = 0; // Counter for elements where the condition holds.

  // Iterate through each node and check a specific condition.
  // The condition is: is node 'i' in the same set as the node it maps to (targetMapping[i] - 1)?
  for (let i = 0; i < nodeCount; ++i) {
    // Get the target node for the current index 'i', adjusting for 0-based indexing.
    const mappedTargetNode = targetMapping[i] - 1;

    // Check if the current node 'i' and its mapped target 'mappedTargetNode'
    // belong to the same connected component (disjoint set).
    if (graphConnectivityTracker.areConnected(i, mappedTargetNode)) {
      matchingElementsCount++; // Increment the counter if they are connected.
    }
  }

  // Output the final calculated count.
  emitOutput(matchingElementsCount);
}

// Execute the main program logic.
processInputAndSolve();
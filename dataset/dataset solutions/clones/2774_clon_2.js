const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let inputProcessor;
const receivedLines = [];

// Event listener to collect each line of input
inputReader.on('line', function(currentInputLine) {
  receivedLines.push(currentInputLine);
});

// Event listener triggered when all input has been received
inputReader.on('close', function() {
  inputProcessor = initializeLineProcessor(receivedLines);
  // Display a message indicating input/output direction for debugging
  console.error('\n↑ Input ↓ Output');
  executeProgramCore(); // Start the main program logic
});

/**
 * Creates a deep copy of an object or a Set.
 * For Sets, it creates a new Set from the elements.
 * For other objects, it uses JSON serialization/deserialization for a deep copy.
 * @param {any} sourceObject The object to be copied.
 * @returns {any} A new, deeply copied instance of the source object.
 */
function deepCopyObject(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Fetches the next line from input and converts it to an integer.
 * @returns {number} The parsed integer value.
 */
function readNextInteger() {
  return performTypeConversion(fetchNextLine(), 1);
}

/**
 * Fetches the next line from input and splits it into an array of strings by spaces.
 * @returns {string[]} An array of strings.
 */
function readNextStringArray() {
  return performTypeConversion(fetchNextLine(), 2);
}

/**
 * Fetches the next line, splits it by spaces, and converts each part to a number.
 * @returns {number[]} An array of numbers.
 */
function readNextIntegerArray() {
  return performTypeConversion(fetchNextLine(), 4);
}

/**
 * Fetches the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function readNextCharacterArray() {
  return performTypeConversion(fetchNextLine(), 6);
}

/**
 * Retrieves the next available line from the input stream managed by `inputProcessor`.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
  return inputProcessor.next();
}

/**
 * Checks if there are more lines available in the input stream.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
function hasMoreLines() {
  return inputProcessor.hasMoreLines();
}

/**
 * Initializes an input processing utility object.
 * This object provides methods to sequentially access input lines.
 * @param {string[]} inputData An array of strings representing all input lines.
 * @returns {object} An object with `hasMoreLines` and `next` methods.
 */
function initializeLineProcessor(inputData) {
  return {
    lineBuffer: inputData,
    currentPosition: 0,
    totalAvailableLines: inputData.length,
    hasMoreLines: function() {
      return (this.currentPosition < this.totalAvailableLines);
    },
    next: function() {
      if (this.hasMoreLines()) {
        return this.lineBuffer[this.currentPosition++];
      } else {
        throw 'InputOutOfBoundsException: No more input lines available.';
      }
    }
  };
}

/**
 * Prints the given value to the standard output.
 * @param {any} value The value to be displayed.
 */
function outputResult(value) {
  console.log(value);
}

/**
 * Logs a detailed debug message to the standard error stream.
 * Uses `util.inspect` for comprehensive object inspection.
 * @param {any} debugValue The value to inspect and log.
 */
function logDebugMessage(debugValue) {
  console.error('DEBUG_INFO: ' + require('util').inspect(debugValue, false, null));
}

/**
 * Performs various type conversions on input data based on a specified type code.
 * @param {string|string[]} inputItem The item to convert, either a string or an array of strings.
 * @param {number} conversionType A numeric code indicating the desired conversion.
 *   1: Parse as integer.
 *   2: Split string by spaces into a string array.
 *   4: Split string by spaces and map to numbers.
 *   6: Split string into a character array.
 *   7: Split string into a character array and map to numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements without a separator.
 *   Default: Return inputItem as is.
 * @returns {any} The converted item. Returns the original item on conversion error.
 */
function performTypeConversion(inputItem, conversionType) {
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
  } catch (conversionError) {
    return inputItem;
  }
}

/**
 * This is the main function where the program's core logic resides.
 * It reads graph structure, performs a depth-first search to assign colors,
 * and calculates a final product based on these assignments.
 */
function executeProgramCore() {
  // Read the first line which contains the total number of nodes (N) and initial colors (K)
  const initialParameters = readNextIntegerArray();
  const totalNodes = initialParameters[0];
  const initialColors = initialParameters[1];

  // Initialize an array to store node objects, representing the graph
  const graphNodes = new Array(totalNodes);
  for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    graphNodes[nodeIdx] = {
      adjacentNodes: [], // Stores indices of directly connected nodes
      nodeId: nodeIdx, // The unique identifier for this node (0-indexed)
      assignedColors: 0, // The number of colors assigned to this node during DFS
      isVisited: false // A flag to track if the node has been visited in the DFS
    };
  }

  // Read the N-1 lines describing the edges (connections) between nodes
  for (let edgeIdx = 0; edgeIdx < totalNodes - 1; edgeIdx++) {
    const edgeData = readNextIntegerArray();
    // Convert 1-based input to 0-based indexing for array access
    const nodeA = edgeData[0] - 1;
    const nodeB = edgeData[1] - 1;
    // Add bidirectional connections to represent an undirected graph
    graphNodes[nodeA].adjacentNodes.push(nodeB);
    graphNodes[nodeB].adjacentNodes.push(nodeA);
  }

  let finalProduct = 1; // Initialize the variable to store the final calculated product
  const modulusValue = 1000000007; // A large prime number used for modulo operations

  // Mark the starting node (node 0) as visited to begin the DFS
  graphNodes[0].isVisited = true;
  // Initiate the Depth-First Search from node 0
  // Parameters: parentConstraint (colors used by parent/grandparent), currentAvailableColors, currentNodeId, originalMaxColors
  traverseGraphDepthFirst(0, initialColors, 0, initialColors);

  // After DFS, calculate the product of assigned colors for all nodes, modulo modulusValue
  for (let nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    finalProduct = (finalProduct * graphNodes[nodeIdx].assignedColors) % modulusValue;
  }

  // Output the final computed result
  outputResult(finalProduct);

  /**
   * Recursively performs a Depth-First Search (DFS) on the graph to assign colors.
   * The coloring logic ensures that adjacent nodes and parent/grandparent nodes
   * have distinct colors, respecting the `initialMaxColors` constraint.
   * @param {number} parentConstraint The number of colors already "reserved" by the parent and its parent (grandparent).
   * @param {number} currentAvailableColors The number of distinct colors available for the `currentNodeId`.
   * @param {number} currentNodeId The index of the node currently being processed.
   * @param {number} originalMaxColors The total number of colors initially available (K).
   */
  function traverseGraphDepthFirst(parentConstraint, currentAvailableColors, currentNodeId, originalMaxColors) {
    // Assign the calculated number of available colors to the current node
    graphNodes[currentNodeId].assignedColors = currentAvailableColors;

    // Adjust the parent constraint for the next level of recursion.
    // This ensures that the current node's parent and grandparent's colors are accounted for.
    if (parentConstraint < 2) {
      parentConstraint++;
    }

    const currentChildren = graphNodes[currentNodeId].adjacentNodes;
    let visitedChildrenCount = 0; // Tracks how many children have been successfully visited from this node

    // Iterate through all neighbors of the current node
    for (let childIdx = 0; childIdx < currentChildren.length; childIdx++) {
      const childNode = currentChildren[childIdx];
      // If a neighbor has not yet been visited, it's a child in the DFS tree
      if (!graphNodes[childNode].isVisited) {
        graphNodes[childNode].isVisited = true; // Mark the child node as visited
        // Recursively call DFS for the child node.
        // The available colors for the child are reduced by:
        // 1. The parentConstraint (colors used by current node's parent and grandparent).
        // 2. The colors used by siblings already visited from the current node.
        traverseGraphDepthFirst(parentConstraint, originalMaxColors - visitedChildrenCount - parentConstraint, childNode, originalMaxColors);
        visitedChildrenCount++; // Increment the count of children visited from this node
      }
    }
  }
}

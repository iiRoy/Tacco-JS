// Auxiliary functions: Do not focus on these. start------------------------------------------
/*
 * This section contains helper utilities for input/output and data manipulation.
 * They are designed to streamline the main algorithm's interaction with the environment.
 */
var inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStream; // Object to manage input lines
var capturedLines = []; // Stores all lines read from stdin

// Event listener for each line of input
inputHandler.on('line', function(lineContent) {
  capturedLines.push(lineContent);
});

// Event listener for when input stream closes
inputHandler.on('close', function() {
  dataStream = initializeInputProcessor(capturedLines);
  console.error('\n--- Input Processed, Executing Main Logic ---');
  executePrimaryAlgorithm(); // Renamed from Main
});

/**
 * Creates a deep clone of an entity. Supports Set and JSON-serializable objects.
 * @param {any} entity - The object or Set to clone.
 * @returns {any} A deep copy of the entity.
 */
function deepCopyEntity(entity) {
  return (entity instanceof Set) ? new Set(Array.from(entity)) : JSON.parse(JSON.stringify(entity));
}

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The parsed integer.
 */
function retrieveInteger() {
  return transformInput(fetchNextItem(), 1);
}

/**
 * Retrieves the next line from the input stream as an array of strings.
 * @returns {string[]} An array of strings, split by space.
 */
function retrieveStringArray() {
  return transformInput(fetchNextItem(), 2);
}

/**
 * Retrieves the next line from the input stream as an array of numbers.
 * @returns {number[]} An array of numbers, parsed from space-separated strings.
 */
function retrieveNumericArray() {
  return transformInput(fetchNextItem(), 4);
}

/**
 * Retrieves the next line from the input stream as an array of characters.
 * @returns {string[]} An array of single-character strings.
 */
function retrieveCharacterArray() {
  return transformInput(fetchNextItem(), 6);
}

/**
 * Fetches the next raw item (line) from the input data stream.
 * @returns {string} The next line of input.
 * @throws {string} If no more input is available.
 */
function fetchNextItem() {
  return dataStream.next();
}

/**
 * Checks if there are more items (lines) in the input data stream.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreItems() {
  return dataStream.hasMoreItems();
}

/**
 * Initializes the input processor object.
 * @param {string[]} sourceInput - An array of raw input lines.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputProcessor(sourceInput) {
  if (!sourceInput || sourceInput.length === 0) {
    // Handle empty input scenario
    console.error("Warning: No input lines provided to the processor.");
    return {
      sourceLines: [],
      currentPosition: 0,
      totalLines: 0,
      hasMoreItems: function() { return false; },
      next: function() { throw 'Input stream exhausted or empty.'; }
    };
  }
  return {
    sourceLines: sourceInput,
    currentPosition: 0,
    totalLines: sourceInput.length,
    hasMoreItems: function() {
      return (this.currentPosition < this.totalLines);
    },
    next: function() {
      if (this.hasMoreItems()) {
        return this.sourceLines[this.currentPosition++];
      } else {
        throw 'Input stream exhausted: No more input available.';
      }
    }
  };
}

/**
 * Displays a final result to standard output.
 * @param {any} content - The content to display.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs a debug message to standard error.
 * @param {any} message - The message or object to debug.
 */
function logDebugMessage(message) {
  console.error('DEBUG INFO: ' + require('util').inspect(message, false, null));
}

/**
 * Transforms an input value based on a specified conversion type.
 * @param {string} inputValue - The raw input string.
 * @param {number} conversionType - Specifies the desired conversion.
 *   1: Parse as integer.
 *   2: Split by space into string array.
 *   4: Split by space and map to number array.
 *   6: Split into character array.
 *   7: Split into character array and map to number array.
 * @returns {any} The transformed value.
 */
function transformInput(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      // Cases 8, 9, 0 from original are for joining, not converting input, so they are omitted here.
      default:
        // If conversion type is unknown, return the original value.
        // A more robust system might throw an error or log a warning.
        return inputValue;
    }
  } catch (error) {
    logDebugMessage(`Conversion failed for value "${inputValue}" with type ${conversionType}: ${error.message}`);
    return inputValue; // Return original in case of error
  }
}
// Auxiliary functions: Do not focus on these. end------------------------------------------

/**
 * Main algorithm execution function.
 * This function orchestrates reading input, building the graph,
 * applying the coloring logic, and producing the final output.
 */
function executePrimaryAlgorithm() {
  const initialParameters = retrieveNumericArray();
  const nodeCount = initialParameters[0];
  const availableColors = initialParameters[1];

  // Early exit for trivial cases
  if (nodeCount === 0) {
    displayResult(0);
    return;
  }
  if (nodeCount === 1) {
    displayResult(availableColors);
    return;
  }

  // Initialize graph nodes with necessary properties
  const graphNodes = Array.from({ length: nodeCount }, (_, identifier) => ({
    adjacentNodes: [], // List of connected node indices
    nodeIdentifier: identifier, // Original index of the node
    colorCount: 0, // Number of ways to color this node based on constraints
    isVisited: false // Flag for traversal
  }));

  // Construct the graph by adding edges (adjacency list)
  for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    const edgePair = retrieveNumericArray();
    const firstNodeIdx = edgePair[0] - 1;
    const secondNodeIdx = edgePair[1] - 1;

    // Add bidirectional connections
    graphNodes[firstNodeIdx].adjacentNodes.push(secondNodeIdx);
    graphNodes[secondNodeIdx].adjacentNodes.push(firstNodeIdx);
  }

  const moduloValue = 1000000007;
  let finalProduct = 1;

  // Start coloring from the root node (node 0)
  // Mark the root as visited to prevent immediate cycles in traversal
  graphNodes[0].isVisited = true;

  /**
   * Recursively assigns color counts to nodes in the tree/graph.
   * This function calculates the number of valid color choices for each node
   * based on its ancestors and previously processed siblings.
   *
   * @param {number} currentNodeIdx - The index of the node currently being processed.
   * @param {number} currentAncestorExclusions - The number of colors already "taken" by parent/grandparent
   *                                            that this node's *children* must avoid.
   *                                            0 for root, 1 for children of root, 2 for other nodes.
   * @param {number} totalInitialColors - The initial total number of distinct colors (K).
   */
  function assignColorsRecursively(currentNodeIdx, currentAncestorExclusions, totalInitialColors) {
    // The number of choices for the current node itself
    // For root (ancestorExclusions = 0), choices = K
    // For child of root (ancestorExclusions = 1), choices = K-1
    // For grandchild (ancestorExclusions = 2), choices = K-2
    // If K < currentAncestorExclusions, this means no valid colors, so set to 0.
    graphNodes[currentNodeIdx].colorCount = Math.max(0, totalInitialColors - currentAncestorExclusions);

    // Determine the number of exclusions for the *children* of the current node.
    // If current node is root (currentAncestorExclusions was 0), its children exclude 1 (the root).
    // Otherwise (currentAncestorExclusions was 1 or 2), its children exclude 2 (their parent and grandparent).
    const nextAncestorExclusionsForChildren = Math.min(2, currentAncestorExclusions + 1);

    let siblingsProcessedCount = 0; // Tracks siblings already processed for additional color exclusions

    // Iterate through adjacent nodes to process children
    for (const adjacentNodeIdx of graphNodes[currentNodeIdx].adjacentNodes) {
      if (!graphNodes[adjacentNodeIdx].isVisited) {
        // Mark child as visited before recursive call to prevent revisiting
        graphNodes[adjacentNodeIdx].isVisited = true;

        // Recursive call for the child node:
        // The child's available colors are reduced by its parent, grandparent,
        // and any siblings already processed.
        assignColorsRecursively(
          adjacentNodeIdx,
          nextAncestorExclusionsForChildren + siblingsProcessedCount,
          totalInitialColors
        );
        siblingsProcessedCount++; // Increment count for next sibling
      }
    }
  }

  // Initiate the recursive coloring process from the root node (index 0)
  // For the root, there are no ancestors, so currentAncestorExclusions is 0.
  assignColorsRecursively(0, 0, availableColors);

  // Calculate the final product of all color counts, modulo `moduloValue`
  for (let i = 0; i < nodeCount; i++) {
    finalProduct = (finalProduct * graphNodes[i].colorCount) % moduloValue;
  }

  // Output the final computed result
  displayResult(finalProduct);
}
/*
 * Auxiliary code for input processing.
 * This section handles reading input lines and preparing them for the main solution logic.
 */
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputProcessor;
const receivedLines = [];

inputReader.on('line', (dataLine) => {
  receivedLines.push(dataLine);
});

inputReader.on('close', () => {
  inputProcessor = initializeProcessor(receivedLines);
  console.error('\n'); // Add a newline for better console output separation
  const startTime = Date.now();
  ExecuteSolution(); // Invoke the core problem-solving function
  const elapsedTime = Date.now() - startTime;
  logDebug(`Execution time: ${elapsedTime} ms`);
  logDebug(`Memory usage: ${Math.floor(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of a given object.
 * @param {object} sourceObject - The object to duplicate.
 * @returns {object} A new, independent copy of the object.
 */
function duplicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Fetches the next input line and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function getNextInteger() {
  return convertInput(fetchNext(), 1);
}

/**
 * Fetches the next input line and splits it into a string array.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return convertInput(fetchNext(), 2);
}

/**
 * Fetches the next input line, splits it, and parses each part as an integer.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return convertInput(fetchNext(), 4);
}

/**
 * Fetches the next input line and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return convertInput(fetchNext(), 6);
}

/**
 * Retrieves the next available input line from the processor.
 * @returns {string} The next input line.
 */
function fetchNext() {
  return inputProcessor.retrieveNext();
}

/**
 * Checks if there are more input lines to process.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInput() {
  return inputProcessor.checkAvailability();
}

/**
 * Sets up the input processing object with methods for sequential access.
 * @param {string[]} rawInput - Array of raw input strings.
 * @returns {object} An object with input access methods.
 */
function initializeProcessor(rawInput) {
  const processorInstance = {
    inputLines: rawInput,
    currentIdx: 0,
    maxLines: rawInput.length,
    checkAvailability: function() {
      return (this.currentIdx < this.maxLines);
    },
    retrieveNext: function() {
      if (!this.checkAvailability()) {
        throw "InputOutOfBoundsError: No further entries available";
      } else {
        const retrievedEntry = this.inputLines[this.currentIdx++];
        return retrievedEntry;
      }
    }
  };
  return processorInstance;
}

/**
 * Prints the final result to standard output.
 * @param {*} value - The value to be printed.
 */
function printResult(value) {
  console.info(value);
}

/**
 * Logs debugging information to standard error.
 * @param {*} message - The message or object to debug.
 */
function logDebug(message) {
  console.error("DEBUG_INFO:" + require("util").inspect(message, {
    showHidden: false,
    depth: null
  }));
}

/*
 * This function performs various type conversions based on the specified type code.
 * @param {*} item - The input item to convert.
 * @param {number} conversionType - Numeric code indicating the desired conversion.
 *   - 1: Parse as integer.
 *   - 2: Split by spaces into string array.
 *   - 4: Split by spaces and map to numbers.
 *   - 6: Split into character array.
 *   - 7: Split into character array and map to numbers.
 *   - 8: Join array elements with spaces.
 *   - 9: Join array elements with newlines.
 *   - 0: Join array elements without a separator.
 *   - Default: Return item as is.
 * @returns {*} The converted item.
 */
function convertInput(item, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return Number.parseInt(item, 10);
      case 2:
        return item.split(' ');
      case 4:
        return item.split(' ').map(val => Number(val));
      case 6:
        return item.split('');
      case 7:
        return item.split('').map(val => Number(val));
      case 8:
        return item.join(' ');
      case 9:
        return item.join('\r\n');
      case 0:
        return item.join('');
      default:
        return item;
    }
  } catch (err) {
    // If conversion fails, return the original item
    return item;
  }
}

/*
 * End of utility functions.
 * The core solution logic begins below this point.
 */
function ExecuteSolution() {
  const initialData = getNextIntegerArray();
  const numNodes = initialData[0];
  const numEdges = initialData[1];

  // Adjacency list representation for the graph
  const adjacencyList = new Array(numNodes);
  // Auxiliary structure to store node properties for BFS/DFS
  const nodeProperties = new Array(numNodes);

  // Initialize graph structures for all nodes
  for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
    adjacencyList[nodeIdx] = {
      successors: []
    };
    nodeProperties[nodeIdx] = {
      predecessors: new Set(), // Using a Set to store unique predecessors
      visited: false, // Flag for traversal
      level: 0 // Distance/depth from a source in BFS
    };
  }

  // Populate the adjacency list based on input edges
  for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    const currentEdge = getNextIntegerArray();
    // Adjusting for 0-based indexing from 1-based input
    adjacencyList[currentEdge[0] - 1].successors.push(currentEdge[1] - 1);
  }

  // Perform a Depth-First Search for each node as a root
  // This populates the 'predecessors' sets for nodes reachable within 3 steps
  for (let startNode = 0; startNode < numNodes; startNode++) {
    traverseDepthFirst(startNode, startNode, 0);
  }

  // Read the source and target nodes for the pathfinding query
  const pathEndpoints = getNextIntegerArray();
  const sourceNode = pathEndpoints[0] - 1; // 0-indexed source
  const targetNode = pathEndpoints[1] - 1; // 0-indexed target

  // Initialize Breadth-First Search (BFS) variables
  let frontPointer = 0;
  let rearPointer = 1;
  // Queue for BFS; size chosen to accommodate typical constraints
  const bfsQueue = new Array(100000 + 7);

  // Start BFS from the target node
  bfsQueue[0] = targetNode;
  nodeProperties[targetNode].visited = true;

  let shortestPathLength = -1; // Stores the result, -1 if no path found

  // BFS loop continues as long as there are nodes in the queue
  while (frontPointer !== rearPointer) {
    const currentNode = bfsQueue[frontPointer];
    frontPointer++; // Move front pointer to the next element

    // If the current node is the source, we found the shortest path
    if (currentNode === sourceNode) {
      shortestPathLength = nodeProperties[currentNode].level;
      break;
    }

    // Get predecessors of the current node
    const parentNodes = Array.from(nodeProperties[currentNode].predecessors);

    // Iterate through all predecessors
    for (let pIdx = 0; pIdx < parentNodes.length; pIdx++) {
      const predecessor = parentNodes[pIdx];
      // If a predecessor hasn't been visited yet
      if (!nodeProperties[predecessor].visited) {
        nodeProperties[predecessor].visited = true; // Mark as visited
        // Update its level (distance from target)
        nodeProperties[predecessor].level = nodeProperties[currentNode].level + 1;
        bfsQueue[rearPointer] = predecessor; // Add to queue
        rearPointer++; // Increment rear pointer
      }
    }
  }

  // logDebug(adjacencyList); // Optional: view the graph structure
  // logDebug(nodeProperties); // Optional: view the processed node properties

  printResult(shortestPathLength); // Output the final path length

  /**
   * Performs a Depth-First Search to find nodes reachable within 3 steps.
   * Populates the 'predecessors' set in `nodeProperties`.
   * @param {number} initialRoot - The starting node for this DFS traversal.
   * @param {number} currentVertex - The node currently being visited.
   * @param {number} currentDepth - The current depth of the traversal.
   */
  function traverseDepthFirst(initialRoot, currentVertex, currentDepth) {
    // If maximum depth is reached, add the initial root as a predecessor
    if (currentDepth === 3) {
      nodeProperties[currentVertex].predecessors.add(initialRoot);
      return;
    }

    // Get successors of the current vertex
    const currentSuccessors = adjacencyList[currentVertex].successors;

    // Recursively call DFS for each successor
    for (let k = 0; k < currentSuccessors.length; k++) {
      traverseDepthFirst(initialRoot, currentSuccessors[k], currentDepth + 1);
    }
    return;
  }
}
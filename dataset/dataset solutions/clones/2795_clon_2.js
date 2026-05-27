// This section handles input/output operations and utility functions.
const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const inputLines = [];

inputReader.on('line', (currentLine) => {
  inputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeInputHandler(inputLines);
  console.error("\n"); // Output a newline to stderr for formatting
  const startTime = Date.now();
  ExecuteProgram(); // Call the main logic
  const elapsedTime = Date.now() - startTime;
  logDebugMessage("time : " + elapsedTime + "ms");
  logDebugMessage("memory : " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});

function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
  return convertInput(getNextItem(), 1);
}

function retrieveStringArray() {
  return convertInput(getNextItem(), 2);
}

function retrieveIntegerArray() {
  return convertInput(getNextItem(), 4);
}

function retrieveCharacterArray() {
  return convertInput(getNextItem(), 6);
}

function getNextItem() {
  return dataProcessor.next();
}

function hasMoreItems() {
  return dataProcessor.hasNext();
}

function initializeInputHandler(inputData) {
  const handlerObject = {
    sourceData: inputData,
    currentPosition: 0,
    totalItems: inputData.length,
    hasNext: function() {
      return (this.currentPosition < this.totalItems);
    },
    next: function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException ‚There is no more input";
      } else {
        const currentItem = this.sourceData[this.currentPosition++];
        return currentItem;
      }
    }
  };
  return handlerObject;
}

function displayOutput(message) {
  console.log(message);
}

function logDebugMessage(message) {
  console.error("debug:" + require("util").inspect(message, false, null));
}

// This function handles various input conversions based on the specified type.
// conversionType:
//   - 1: Parse as integer.
//   - 2: Split by space into string array.
//   - 4: Split by space and parse each part as number.
//   - 6: Split into character array.
//   - 7: Split into character array and parse each as number.
//   - 8: Join array elements with space.
//   - 9: Join array elements with newline.
//   - 0: Join array elements without separator.
//   - Default: Return input as is.
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
  } catch (error) {
    return inputValue; // In case of conversion error, return original value
  }
}

// End of utility and input handling section.
function ExecuteProgram() {
  // Read the first line containing N (node count) and M (edge count)
  const firstLineData = retrieveIntegerArray();
  const nodeCount = firstLineData[0];
  const edgeCount = firstLineData[1];

  // Initialize two graph representations
  // adjacencyList: Stores original graph structure (children)
  // processedNodes: Stores transformed graph structure (parents, access status, distance)
  const adjacencyList = new Array(nodeCount);
  const processedNodes = new Array(nodeCount);
  const visitedStates = new Set(); // Used for DFS to track visited (node, depth) pairs

  // Populate initial graph structures
  for (let idx = 0; idx < nodeCount; idx++) {
    adjacencyList[idx] = {
      successors: [], // Renamed 'child' to 'successors'
    };
    processedNodes[idx] = {
      predecessors: new Set(), // Renamed 'parent' to 'predecessors'
      isVisited: false, // Renamed 'access' to 'isVisited'
      distance: 0 // Renamed 'depth' to 'distance'
    };
  }

  // Read M edges and build the adjacencyList
  for (let idx = 0; idx < edgeCount; idx++) {
    const tempValues = retrieveIntegerArray();
    // Adjusting for 0-based indexing
    adjacencyList[tempValues[0] - 1].successors.push(tempValues[1] - 1);
  }

  // Perform DFS from each node to find paths of length 3
  // and populate the 'predecessors' in processedNodes
  for (let idx = 0; idx < nodeCount; idx++) {
    performDepthFirstSearch(idx, idx, 0);
  }

  // Release memory for adjacencyList as it's no longer needed
  adjacencyList = null;

  // Read the start and target nodes for BFS
  const tempValues = retrieveIntegerArray();
  const startNode = tempValues[0] - 1;
  const targetNode = tempValues[1] - 1;

  // Initialize BFS queue and pointers
  let queueFront = 0;
  let queueRear = 1;
  const bfsQueue = new Array(100_007); // Using numeric separator for readability

  bfsQueue[0] = targetNode;
  processedNodes[targetNode].isVisited = true; // Mark target as visited
  let resultDistance = -1; // Initialize output for shortest path

  // BFS loop
  while (queueFront !== queueRear) {
    const currentNode = bfsQueue[queueFront];
    queueFront++;

    // If the start node is reached, we found the shortest path
    if (currentNode === startNode) {
      resultDistance = processedNodes[currentNode].distance;
      break;
    }

    // Get predecessors of the current node (nodes that can reach 'currentNode' in 3 steps)
    const nodePredecessors = Array.from(processedNodes[currentNode].predecessors);
    for (let k = 0; k < nodePredecessors.length; k++) {
      const predecessorNode = nodePredecessors[k];
      if (!processedNodes[predecessorNode].isVisited) {
        processedNodes[predecessorNode].isVisited = true;
        processedNodes[predecessorNode].distance = processedNodes[currentNode].distance + 1;
        bfsQueue[queueRear] = predecessorNode;
        queueRear++;
      }
    }
  }

  // Debugging lines (commented out as per original)
  // logDebugMessage(adjacencyList);
  // logDebugMessage(processedNodes);

  // Output the final result
  displayOutput(resultDistance);

  /**
   * Performs a Depth First Search to find nodes reachable in exactly 3 steps.
   * This populates the 'predecessors' set in the processedNodes structure.
   *
   * @param {number} initialNode - The starting node of the current DFS path.
   * @param {number} currentTraversalNode - The current node being visited in the DFS.
   * @param {number} currentPathLength - The current depth/length of the path from initialNode.
   */
  function performDepthFirstSearch(initialNode, currentTraversalNode, currentPathLength) {
    // If this (node, depth) state has been visited, return to avoid cycles/redundant work
    if (visitedStates.has(currentTraversalNode + ":" + currentPathLength)) {
      return;
    }
    visitedStates.add(currentTraversalNode + ":" + currentPathLength);

    // If path length is 3, then 'currentTraversalNode' can reach 'initialNode' in 3 steps.
    // So, 'initialNode' is a predecessor of 'currentTraversalNode' in the transformed graph.
    if (currentPathLength === 3) {
      processedNodes[currentTraversalNode].predecessors.add(initialNode);
      // This line seems to add a redundant entry to visitedStates,
      // but it's part of the original logic, so we preserve it.
      // It effectively marks the (initialNode, currentTraversalNode) pair as processed
      // for the purpose of finding 3-step paths.
      visitedStates.add(initialNode.toString() + ":" + currentTraversalNode.toString());
      return;
    }

    // If not yet at depth 3, continue DFS to children
    const nodeChildren = adjacencyList[currentTraversalNode].successors;
    for (let k = 0; k < nodeChildren.length; k++) {
      performDepthFirstSearch(initialNode, nodeChildren[k], currentPathLength + 1);
    }
    return;
  }
}

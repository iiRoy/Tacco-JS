let DATA_PARSER = (function() {
  // This self-executing function sets up a utility for parsing input data.

  // The primary factory function, creates an instance of the InputReader.
  function createInputHandler(textualData) {
    return new InputReader(textualData);
  }

  // InputReader class: Manages the state and methods for reading from the input.
  function InputReader(rawInputContent) {
    // Store the input content, trimmed and split into individual lines.
    this._sourceLines = rawInputContent.trim().split("\n");
    // Initialize a pointer to keep track of the current line being processed.
    this._currentLinePosition = 0;
  }

  // InputReader prototype method: Extracts a single token (word or number) from the current line.
  InputReader.prototype.extractToken = function(asStringFlag) {
    const lineSegments = this._sourceLines;
    const currentLineIndex = this._currentLinePosition;
    let resultToken;

    // Check if the current line has not yet been split into tokens.
    // If it's still a single string, split it by spaces and reverse for efficient `pop()`.
    if (typeof lineSegments[currentLineIndex] === "string") {
      lineSegments[currentLineIndex] = lineSegments[currentLineIndex].split(" ").reverse();
    }

    // Retrieve the last token from the (potentially reversed) array of tokens.
    resultToken = lineSegments[currentLineIndex].pop();

    // If the current line is now empty after popping, advance the line pointer to the next line.
    if (!lineSegments[currentLineIndex].length) {
      this._currentLinePosition++;
    }
    // Return the token. If `asStringFlag` is true, return as-is (string); otherwise, convert to a number.
    return asStringFlag ? resultToken : +resultToken;
  };

  // InputReader prototype method: Reads an entire line and processes its tokens.
  InputReader.prototype.processLineTokens = function(returnAsRawStrings) {
    // Fetch the current line, increment the line pointer, and split the line into tokens.
    const tokensOnLine = this._sourceLines[this._currentLinePosition++].split(" ");
    // Return the tokens. If `returnAsRawStrings` is true, return as strings; otherwise, convert all to numbers.
    return returnAsRawStrings ? tokensOnLine : tokensOnLine.map(item => +item);
  };

  // InputReader prototype method: Acquires a specified number of lines and formats them as a matrix.
  InputReader.prototype.acquireMatrix = function(numberOfRows, keepTextual) {
    // Extract a slice of lines from the input source, updating the line pointer.
    // Each line is then split into its individual tokens.
    const collectedRows = this._sourceLines.slice(this._currentLinePosition, this._currentLinePosition += numberOfRows)
      .map(rowStr => rowStr.split(" "));
    // If `keepTextual` is true, return the matrix with string elements.
    // Otherwise, map through each row and convert every element to a number.
    return keepTextual ? collectedRows : collectedRows.map(row => row.map(elem => +elem));
  };

  // InputReader prototype method: Fetches a specified number of consecutive lines.
  InputReader.prototype.fetchLines = function(numLinesToRead, asText) {
    // Get a segment of lines from the input, advancing the line pointer.
    const lineSegment = this._sourceLines.slice(this._currentLinePosition, this._currentLinePosition += numLinesToRead);
    // Return the lines. If `asText` is true, return as strings; otherwise, convert each line to a number.
    return asText ? lineSegment : lineSegment.map(val => +val);
  };

  return createInputHandler; // The factory function is returned, making it accessible as `DATA_PARSER`.
})();

// Create an instance of the input parsing utility, reading data from standard input.
const dataHandler = DATA_PARSER(require("node:fs").readFileSync("/dev/stdin", "utf8"));

// Utility function to construct a multi-dimensional array dynamically based on provided dimensions.
function makeMultiDimArray(initialFillValue) {
  // `arguments` contains the initial value followed by dimension sizes.
  const dimensionArguments = arguments;
  let dimensionCount = dimensionArguments.length;
  // Start constructing the array creation string from the innermost dimension.
  // The `--dimensionCount` correctly accesses the last argument for the innermost size.
  let arrayBuildString = `Array(dimensionArguments[${--dimensionCount}]).fill(0).map((_)=> ( ${initialFillValue} ) )`;
  // Loop backwards through the remaining arguments to build the outer dimensions.
  while (--dimensionCount) {
    arrayBuildString = `Array(dimensionArguments[${dimensionCount}]).fill(0).map((_)=> ${arrayBuildString} )`;
  }
  // Evaluate the dynamically constructed string to create the actual multi-dimensional array.
  return eval(arrayBuildString);
}

// Declare global variables to hold critical program state.
let totalGraphNodes; // Stores the total count of nodes within the graph.
let graphAdjacencyMatrix; // Represents the connections between nodes, as an adjacency matrix.
let nodeReachabilityStatus; // Flags indicating whether a node is reachable from any '1' entry.
let isolatedNodeCounter = 0; // Counts nodes that have no incoming '1' connections.

// Execute the primary algorithm logic and print the final computed result to the console.
console.log(executeMainLogic());

// Main function encapsulating the initial graph processing and problem setup.
function executeMainLogic() {
  totalGraphNodes = dataHandler.extractToken(); // Read the total number of nodes from input.
  // Read the adjacency matrix, ensuring it's treated as an array of string arrays.
  graphAdjacencyMatrix = dataHandler.fetchLines(totalGraphNodes, true);
  // Initialize an array to track if nodes are reachable, default to 0 (false).
  nodeReachabilityStatus = makeMultiDimArray(0, totalGraphNodes);

  let connectionDiscovered = 0; // A flag, set to 1 if any '1' connection is found in the matrix.

  // Iterate through the adjacency matrix to identify reachable nodes.
  for (let rowIdx = 0; rowIdx < totalGraphNodes; rowIdx++) {
    for (let colIdx = 0; colIdx < totalGraphNodes; colIdx++) {
      // If a '1' is found, it indicates that the node at `rowIdx` is reachable.
      if (graphAdjacencyMatrix[rowIdx][colIdx] === "1") {
        connectionDiscovered = nodeReachabilityStatus[rowIdx] = 1; // Mark node as reachable and set the flag.
        break; // No need to check further columns for this row, as it's already marked reachable.
      }
    }
    // After checking all columns for the current row, if the node is still not marked reachable,
    // it means it has no incoming '1' connections, so increment the isolated node counter.
    if (nodeReachabilityStatus[rowIdx] === 0) {
      isolatedNodeCounter++;
    }
  }

  // If no '1' connections were found throughout the entire matrix, return the total number of nodes.
  if (connectionDiscovered === 0) {
    return totalGraphNodes;
  }
  // Otherwise, proceed to execute the path calculation algorithm.
  return calculateMaxPath();
}

// Function to compute the maximum path length within the graph, considering specific connectivity rules.
function calculateMaxPath() {
  let maximumPathLength = 0; // Variable to store the longest path (maximum BFS level) found.

  // Iterate through each node in the graph, using its index as a starting point for BFS.
  for (let nodeIdx = 0; nodeIdx < totalGraphNodes; nodeIdx++) {
    // Skip nodes that were identified as not reachable (no incoming '1's).
    if (nodeReachabilityStatus[nodeIdx] === 0) {
      continue;
    }

    // Initialize a distance tracker array for the current BFS iteration.
    // -1 signifies an unvisited node.
    let distanceTracker = makeMultiDimArray(-1, totalGraphNodes);
    distanceTracker[nodeIdx] = 0; // The starting node is at distance 0 from itself.

    let bfsQueue = []; // This queue holds nodes to be processed at the current BFS level.

    // Populate the initial BFS queue with direct neighbors of the starting node.
    for (let neighborIdx = 0; neighborIdx < totalGraphNodes; neighborIdx++) {
      // Only consider actual connections ('1' in the adjacency matrix).
      if (graphAdjacencyMatrix[nodeIdx][neighborIdx] === "0") {
        continue;
      }
      distanceTracker[neighborIdx] = 1; // Direct neighbors are at distance 1.
      bfsQueue.push(neighborIdx); // Add the neighbor to the queue.
    }

    let currentBfsLevel = 1; // Start BFS from level 1 (nodes directly connected to the source).

    // Continue the BFS as long as there are nodes in the current queue.
    while (bfsQueue.length > 0) {
      let nextBfsQueue = []; // A temporary queue to collect nodes for the next BFS level.

      // Process all nodes currently in the `bfsQueue`.
      while (bfsQueue.length > 0) {
        let currentProcessingNode = bfsQueue.pop(); // Get a node from the current level's queue.

        // Explore all potential neighbors of the current node.
        for (let nextNeighborIdx = 0; nextNeighborIdx < totalGraphNodes; nextNeighborIdx++) {
          // Skip if there is no connection between `currentProcessingNode` and `nextNeighborIdx`.
          if (graphAdjacencyMatrix[currentProcessingNode][nextNeighborIdx] === "0") {
            continue;
          }

          // If the neighbor has not been visited yet (distance is -1).
          if (distanceTracker[nextNeighborIdx] === -1) {
            distanceTracker[nextNeighborIdx] = currentBfsLevel + 1; // Mark its distance.
            nextBfsQueue.push(nextNeighborIdx); // Add it to the queue for the next level.
          }
          // If the neighbor has been visited, check for consistency.
          // Its recorded distance must either be `currentBfsLevel - 1` (meaning it was processed in the previous level)
          // or `currentBfsLevel + 1` (meaning it is being processed in the *current* level and connected from a different path).
          // Any other distance indicates a structural inconsistency or an invalid path according to problem rules.
          else if (distanceTracker[nextNeighborIdx] !== currentBfsLevel - 1 && distanceTracker[nextNeighborIdx] !== currentBfsLevel + 1) {
            return -1; // Return -1 to signal an error or invalid graph configuration.
          }
        }
      }
      currentBfsLevel++; // Advance to the next BFS level.
      bfsQueue = nextBfsQueue; // Update the main queue with nodes for the next level.
    }
    // After completing BFS from `nodeIdx`, update `maximumPathLength` if a longer path was found.
    // `currentBfsLevel` will be one greater than the max distance found in that BFS.
    if (maximumPathLength < currentBfsLevel) {
      maximumPathLength = currentBfsLevel;
    }
  }
  // The final result is the longest path found plus the count of isolated nodes.
  return maximumPathLength + isolatedNodeCounter;
}
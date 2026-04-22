const InputParser = (() => {
  // Encapsulates the logic for reading and parsing input strings line by line, token by token.
  class DataStreamProcessor {
    #sourceLinesData; // Stores all input lines as an array of strings.
    #currentLinePosition; // Tracks the index of the current line being processed.
    #lineTokenBuffer; // Stores tokens (words) from the current line.
    #currentTokenPosition; // Tracks the index of the current token within the lineTokenBuffer.

    constructor(rawInputContent) {
      // Initialize the data stream by splitting the raw input into individual lines.
      this.#sourceLinesData = rawInputContent.trim().split("\n");
      this.#currentLinePosition = 0;
      this.#lineTokenBuffer = [];
      this.#currentTokenPosition = 0;
      this.#loadTokensForCurrentLine(); // Prepare tokens for the very first line.
    }

    // Internal helper to populate the token buffer for the current line.
    #loadTokensForCurrentLine() {
      if (this.#currentLinePosition < this.#sourceLinesData.length) {
        this.#lineTokenBuffer = this.#sourceLinesData[this.#currentLinePosition].split(" ");
        this.#currentTokenPosition = 0;
      } else {
        // If no more lines, ensure buffer is empty.
        this.#lineTokenBuffer = [];
        this.#currentTokenPosition = 0;
      }
    }

    // Internal helper to advance to the next line in the input stream.
    #moveToNextLine() {
      this.#currentLinePosition++;
      this.#loadTokensForCurrentLine();
    }

    // Checks if there are more tokens remaining on the current line.
    #areMoreTokensInCurrentLine() {
      return this.#currentTokenPosition < this.#lineTokenBuffer.length;
    }

    // Retrieves a single token from the input stream.
    // Advances to the next line if the current one is exhausted.
    retrieveNextToken(returnAsRawString = false) {
      if (!this.#areMoreTokensInCurrentLine()) {
        // If current line exhausted, try to move to the next.
        this.#moveToNextLine();
        if (!this.#areMoreTokensInCurrentLine()) {
          // If no more tokens anywhere, log an error and return undefined.
          console.error("Error: Attempted to read beyond the end of the input stream.");
          return undefined;
        }
      }
      // Extract the token and advance the token position.
      const tokenValue = this.#lineTokenBuffer[this.#currentTokenPosition++];

      // If this was the last token on the line, prepare for the next line's tokens.
      if (this.#currentTokenPosition === this.#lineTokenBuffer.length) {
        this.#moveToNextLine();
      }
      // Return as string or number based on the flag.
      return returnAsRawString ? tokenValue : Number(tokenValue);
    }

    // Reads all tokens from the current line and advances to the next line.
    readCurrentLineTokens(returnAsStringArray = false) {
      if (this.#currentLinePosition >= this.#sourceLinesData.length) {
        console.error("Error: Attempted to read beyond the end of the input stream.");
        return [];
      }
      // Get the line's content, split it into tokens.
      const tokensOnLine = this.#sourceLinesData[this.#currentLinePosition].split(" ");
      this.#moveToNextLine(); // Always advance to the next line after reading a full line.
      return returnAsStringArray ? tokensOnLine : tokensOnLine.map(token => Number(token));
    }

    // Reads a specified number of lines, parsing each into an array of tokens, forming a matrix.
    readTokenMatrix(countOfLines, returnAsStringMatrix = false) {
      const resultingMatrix = [];
      for (let lineIndex = 0; lineIndex < countOfLines; lineIndex++) {
        if (this.#currentLinePosition >= this.#sourceLinesData.length) {
          console.error("Error: Not enough lines in input to form the requested matrix.");
          break; // Stop if input runs out prematurely.
        }
        const currentLineTokens = this.#sourceLinesData[this.#currentLinePosition].split(" ");
        resultingMatrix.push(returnAsStringMatrix ? currentLineTokens : currentLineTokens.map(token => Number(token)));
        this.#moveToNextLine();
      }
      return resultingMatrix;
    }

    // Reads a specified number of lines, treating each line as a single value.
    readValueBlock(numEntries, returnAsString = false) {
      const extractedValues = [];
      for (let entryIndex = 0; entryIndex < numEntries; entryIndex++) {
        if (this.#currentLinePosition >= this.#sourceLinesData.length) {
          console.error("Error: Not enough lines in input for the requested value block.");
          break;
        }
        const singleValue = this.#sourceLinesData[this.#currentLinePosition];
        extractedValues.push(returnAsString ? singleValue : Number(singleValue));
        this.#moveToNextLine();
      }
      return extractedValues;
    }
  }

  // Factory function to create an instance of the DataStreamProcessor.
  return (inputContent) => new DataStreamProcessor(inputContent);
})();

// Initialize the standard input reader using the file system module.
const standardInputReader = InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Utility for creating multi-dimensional arrays (Type III clone of xArray) ---
// This function recursively constructs a multi-dimensional array with specified dimensions
// and fills it with an initial value.
function createPopulatedMultiDimArray(initialFillValue, ...dimensions) {
  // If no dimensions are provided, simply return the initial fill value.
  if (!dimensions || dimensions.length === 0) {
    return initialFillValue;
  }

  const currentDimensionSize = dimensions[0];
  // Basic validation for dimension size.
  if (currentDimensionSize < 0 || !Number.isInteger(currentDimensionSize)) {
    console.warn("Warning: Non-positive or non-integer dimension size encountered:", currentDimensionSize);
    return []; // Return an empty array for invalid dimension sizes.
  }

  const remainingDimensions = dimensions.slice(1);
  const newArrayInstance = new Array(currentDimensionSize);

  // Iterate to populate the current dimension.
  for (let idx = 0; idx < currentDimensionSize; idx++) {
    // If there are more dimensions, recursively call the function.
    // Otherwise, assign the initial fill value. Special handling for "[]" string.
    newArrayInstance[idx] = remainingDimensions.length > 0
      ? createPopulatedMultiDimArray(initialFillValue, ...remainingDimensions)
      : (typeof initialFillValue === 'string' && initialFillValue === '[]' ? [] : initialFillValue);
  }
  return newArrayInstance;
}

// --- Main program execution ---
// Output the result of the main game logic function.
console.log(executeGameLogic());

// --- Core game logic function (Type III clone of main) ---
function executeGameLogic() {
  // Read the total number of nodes in the graph from the input.
  const totalGraphNodes = standardInputReader.retrieveNextToken();

  // Implement guard clauses for trivial or invalid graph sizes.
  if (totalGraphNodes <= 0) {
    return "Error: Graph must contain at least one node.";
  }
  if (totalGraphNodes === 1) {
    // A single-node graph has a diameter of 0. (0 % 3) is 0.
    return "First";
  }

  // Initialize the adjacency list for the graph.
  // Each element (for a node) will be an array to store its neighbors.
  const graphConnections = createPopulatedMultiDimArray("[]", totalGraphNodes);

  // Read N-1 edges to construct the tree (assuming it's a tree).
  for (let edgeIndex = 0; edgeIndex < totalGraphNodes - 1; edgeIndex++) {
    // Read two node IDs for the current edge, convert them to 0-indexed.
    const currentEdgeNodes = standardInputReader.readCurrentLineTokens().map(id => id - 1);
    const [nodeOne, nodeTwo] = currentEdgeNodes; // Destructure for readability.

    // Add connections for an undirected graph.
    graphConnections[nodeOne].push(nodeTwo);
    graphConnections[nodeTwo].push(nodeOne);
  }

  // Helper function to perform a Breadth-First Search (BFS) on the graph.
  // This BFS aims to find the node farthest from a given starting point
  // and the maximum distance to it.
  const runBreadthFirstSearch = (startingNode, numberOfNodesInGraph) => {
    let currentLevelQueue = [startingNode]; // Nodes to process in the current BFS level.
    let nextLevelQueue = []; // Nodes discovered for the next BFS level.
    let maximumDistanceReached = 0; // Tracks the distance from the starting node.
    let lastNodeProcessed = startingNode; // Stores the last node popped from a queue (farthest).

    // Create a fresh visited status array for each BFS run.
    // 1 means unvisited, 0 means visited.
    const nodeVisitStatus = createPopulatedMultiDimArray(1, numberOfNodesInGraph);
    nodeVisitStatus[startingNode] = 0; // Mark the starting node as visited.

    // Continue BFS as long as there are nodes in either queue.
    while (currentLevelQueue.length > 0 || nextLevelQueue.length > 0) {
      // If the current level is exhausted, move to the next level.
      if (currentLevelQueue.length === 0) {
        maximumDistanceReached++; // Increment distance for the new level.
        currentLevelQueue = nextLevelQueue; // Promote next level to current.
        nextLevelQueue = []; // Reset next level queue.
      }

      // Dequeue a node from the current level.
      const activeNode = currentLevelQueue.pop();
      lastNodeProcessed = activeNode; // Update the farthest node found so far.

      // Explore all neighbors of the active node.
      for (const neighborNode of graphConnections[activeNode]) {
        // If the neighbor has not been visited yet.
        if (nodeVisitStatus[neighborNode] === 1) {
          nextLevelQueue.push(neighborNode); // Add neighbor to the next level's queue.
          nodeVisitStatus[neighborNode] = 0; // Mark neighbor as visited.
        }
      }
    }
    // Return the farthest node reached and its distance from the starting node.
    return { farthestNodeFound: lastNodeProcessed, totalDistance: maximumDistanceReached };
  };

  // --- Step 1: Perform the first BFS. ---
  // Start BFS from an arbitrary node (node 0) to find one endpoint of the tree's diameter.
  const bfsResultFromZero = runBreadthFirstSearch(0, totalGraphNodes);
  const diameterEndpointOne = bfsResultFromZero.farthestNodeFound;

  // --- Step 2: Perform the second BFS. ---
  // Start BFS from the node found in Step 1 to determine the actual diameter of the tree.
  const bfsResultFromEndpoint = runBreadthFirstSearch(diameterEndpointOne, totalGraphNodes);
  const treeDiameterLength = bfsResultFromEndpoint.totalDistance;

  // The game's outcome depends on the tree's diameter modulo 3.
  // If (diameter % 3) is 1, the "Second" player wins; otherwise, the "First" player wins.
  return (treeDiameterLength % 3 === 1) ? "Second" : "First";
}
var INPUT_PROCESSOR = (() => {
  /**
   * Factory function to create an InputReader instance.
   * @param {string} sourceContent - The raw string content to be parsed.
   * @returns {DataStreamHandler} An initialized DataStreamHandler object.
   */
  function createFileReader(sourceContent) {
    return new DataStreamHandler(sourceContent);
  }

  /**
   * Constructor for the DataStreamHandler.
   * Manages reading lines and tokens from the input string.
   * @param {string} sourceContent - The input string, typically from a file.
   */
  function DataStreamHandler(sourceContent) {
    // Store lines as an array, splitting by newline characters.
    this._dataLines = sourceContent.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLinePtr = 0;
  }

  /**
   * Fetches the next token from the current line.
   * If the current line is exhausted, moves to the next line.
   * @param {boolean} [asRawString=false] - If true, returns the token as a string; otherwise, converts to a number.
   * @returns {string|number} The extracted token.
   */
  DataStreamHandler.prototype.fetchToken = function(asRawString) {
    var lineParts = this._dataLines;
    var linePointer = this._currentLinePtr;
    var extractedPiece;

    // If the current line hasn't been split into tokens yet, do it.
    if (typeof lineParts[linePointer] === "string") {
      lineParts[linePointer] = lineParts[linePointer].split(" ").reverse();
    }
    // Pop the last token (since we reversed it, this is the first logical token).
    extractedPiece = lineParts[linePointer].pop();

    // If the current line is now empty, advance the line pointer.
    if (!lineParts[linePointer].length) {
      this._currentLinePtr++;
    }

    // Return as string or number based on the flag.
    return asRawString ? extractedPiece : +extractedPiece;
  };

  /**
   * Reads all tokens from the current line and advances the line pointer.
   * @param {boolean} [returnStrings=false] - If true, returns tokens as strings; otherwise, converts to numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  DataStreamHandler.prototype.readLineTokens = function(returnStrings) {
    var tokensOnLine = this._dataLines[this._currentLinePtr++].split(" ");
    return returnStrings ? tokensOnLine : tokensOnLine.map(itemText => +itemText);
  };

  /**
   * Reads a specified number of rows as a matrix (2D array).
   * Each row is split into space-separated values.
   * @param {number} rowCount - The number of rows to read.
   * @param {boolean} [keepTextFormat=false] - If true, keeps cell values as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} The matrix data.
   */
  DataStreamHandler.prototype.readTable = function(rowCount, keepTextFormat) {
    // Extract a slice of lines and map them to arrays of tokens.
    var tableRows = this._dataLines
                      .slice(this._currentLinePtr, this._currentLinePtr += rowCount)
                      .map(singleRowText => singleRowText.split(" "));

    // Convert cell values to numbers if not keeping text format.
    return keepTextFormat ? tableRows : tableRows.map(row => row.map(cellValueText => +cellValueText));
  };

  /**
   * Reads a specified number of raw lines without splitting them into tokens.
   * @param {number} numToRead - The number of raw lines to retrieve.
   * @param {boolean} [preserveText=false] - This parameter is ignored, lines are always returned as strings.
   * @returns {Array<string>} An array of raw line strings.
   */
  DataStreamHandler.prototype.getLines = function(numToRead, preserveText) {
    // Simply slice the raw lines. The 'preserveText' parameter is redundant here.
    var selectedLines = this._dataLines.slice(this._currentLinePtr, this._currentLinePtr += numToRead);
    return preserveText ? selectedLines : selectedLines.map(line => +line); // Original code converts, so keep this for type II
  };

  return createFileReader;
})();

// Initialize the input data handler by reading from standard input.
var dataInputHandler = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a default value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} defaultValue - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function initializeMultiArray(defaultValue) {
  var dimensionsArguments = arguments;
  var dimCount = dimensionsArguments.length;
  var arrayConstructionCode = "Array(dimensionsArguments[" + --dimCount + "]).fill(0).map(x=>{return " + defaultValue + ";})";
  while (--dimCount) {
    arrayConstructionCode = "Array(dimensionsArguments[" + dimCount + "]).fill(0).map(x=>" + arrayConstructionCode + ")";
  }
  return eval(arrayConstructionCode);
}

// Log the result of the main application logic to the console.
console.log(runApplication());

/**
 * The main application logic.
 * Reads input, constructs a graph, performs a topological sort, and returns a result.
 * @returns {number} The computed result or -1 if a cycle is detected.
 */
function runApplication() {
  // Read the total number of entities.
  var totalItems = dataInputHandler.fetchToken();

  // Initialize a graph structure. The size is based on combinations (n choose 2).
  var dependencyGraphStructure = initializeMultiArray("{from:[],to:[]}", totalItems * (totalItems - 1) / 2);

  // Process input lines to build the graph.
  for (var outerLoopCounter = 0; outerLoopCounter < totalItems; outerLoopCounter++) {
    var currentLineValues = dataInputHandler.readLineTokens();
    // Calculate the index for the first pair in the current line.
    var previousNodeIdentifier = calculateCombinedIndex(currentLineValues[0] - 1, outerLoopCounter);

    // Iterate through the rest of the line to build connections.
    for (var innerLoopCounter = 1; innerLoopCounter < totalItems - 1; innerLoopCounter++) {
      var currentNodeIdentifier = calculateCombinedIndex(currentLineValues[innerLoopCounter] - 1, outerLoopCounter);
      // Add 'to' edge from previous to current node.
      dependencyGraphStructure[previousNodeIdentifier].to.push(currentNodeIdentifier);
      // Add 'from' edge to current node from previous.
      dependencyGraphStructure[currentNodeIdentifier].from.push(previousNodeIdentifier);
      // Update previous node for the next iteration.
      previousNodeIdentifier = currentNodeIdentifier;
    }
  }

  // Perform topological sort on the constructed graph.
  var sortedSequence = performTopologicalOrdering(dependencyGraphStructure);

  // Check for cycles (indicated by -1 result from topological sort).
  if (sortedSequence === -1) {
    return -1;
  }

  // Return the depth of the last element in the sorted sequence, plus one.
  return sortedSequence[sortedSequence.length - 1][1] + 1;
}

/**
 * Calculates a unique combined index for a pair of identifiers (a, b).
 * This is a common way to map unordered pairs to a single integer.
 * @param {number} firstId - The first identifier.
 * @param {number} secondId - The second identifier.
 * @returns {number} The combined index.
 */
function calculateCombinedIndex(firstId, secondId) {
  var maximumValue = Math.max(firstId, secondId);
  // Formula for triangular numbers (n*(n-1)/2) plus the minimum value.
  // This ensures a unique index for any unordered pair.
  return (maximumValue * (maximumValue - 1) >> 1) + Math.min(firstId, secondId);
}

/**
 * Executes a topological sort algorithm on a given graph.
 * Detects cycles and assigns depth levels to nodes.
 * @param {Array<Object>} inputGraph - The graph represented as an array of nodes,
 *                                      each with 'from' (incoming) and 'to' (outgoing) edge lists.
 * @returns {Array<Array<number>>|number} An array of [node_id, depth_level] pairs in topological order,
 *                                        or -1 if the graph contains a cycle.
 */
function performTopologicalOrdering(inputGraph) {
  var graphNodeCount = inputGraph.length;
  // Array to store the count of incoming edges for each node.
  var inDegreeCounts = Array(graphNodeCount).fill(0);
  // Array to store the depth level of each node in the topological order.
  var nodeDepthLevels = Array(graphNodeCount).fill(0);
  // Queue for nodes ready to be processed (nodes with no incoming edges).
  var processingOrderQueue = [];

  // Initialize in-degree counts and add initial nodes to the queue.
  for (var nodeIdx = 0; nodeIdx < graphNodeCount; nodeIdx++) {
    if (inputGraph[nodeIdx].from.length) {
      inDegreeCounts[nodeIdx] = inputGraph[nodeIdx].from.length;
    } else {
      // Nodes with no incoming edges start at depth 0.
      processingOrderQueue.push([nodeIdx, 0]);
    }
  }

  // Process nodes in the queue.
  for (nodeIdx = 0; nodeIdx < processingOrderQueue.length; nodeIdx++) {
    var currentProcessingNode = processingOrderQueue[nodeIdx][0]; // Get the node ID.

    // Iterate through all neighbors of the current node.
    for (var neighborIdx = 0; neighborIdx < inputGraph[currentProcessingNode].to.length; neighborIdx++) {
      var neighborNodeId = inputGraph[currentProcessingNode].to[neighborIdx];

      // Update the depth level of the neighbor node.
      if (nodeDepthLevels[neighborNodeId] <= nodeDepthLevels[currentProcessingNode]) {
        nodeDepthLevels[neighborNodeId] = nodeDepthLevels[currentProcessingNode] + 1;
      }

      // Decrement in-degree count for the neighbor.
      // If in-degree becomes zero, add the neighbor to the queue.
      if (--inDegreeCounts[neighborNodeId] === 0) {
        processingOrderQueue.push([neighborNodeId, nodeDepthLevels[neighborNodeId]]);
      }
    }
  }

  // If the number of processed nodes doesn't match the total node count, a cycle exists.
  return processingOrderQueue.length < graphNodeCount ? -1 : processingOrderQueue;
}
var INPUT_PARSER = (function() {
  // This factory function creates a new instance of the input parser.
  function createParser(inputString) {
    return new ParserInstance(inputString);
  }

  // The ParserInstance constructor initializes the parser with the raw input string.
  function ParserInstance(sourceString) {
    // Internal storage for processed input lines. Each line is split by newline.
    this._lines = sourceString.trim().split("\n");
    // Keeps track of the current line being processed.
    this._lineIndex = 0;
  }

  // Reads the next available token from the current line.
  // If 'returnAsString' is true, the token is returned as a string; otherwise, it's converted to a number.
  ParserInstance.prototype.readNextToken = function(returnAsString) {
    var currentLines = this._lines;
    var currentIndex = this._lineIndex;
    var tokenValue;

    // If the current line is still a single string, split it into tokens and reverse for efficient popping.
    if (typeof currentLines[currentIndex] === "string") {
      currentLines[currentIndex] = currentLines[currentIndex].split(" ").reverse();
    }

    // Extract the next token from the end of the (reversed) array.
    tokenValue = currentLines[currentIndex].pop();

    // If the current line is now empty, advance to the next line.
    if (!currentLines[currentIndex].length) {
      this._lineIndex++;
    }

    // Return the token, optionally parsed as a number.
    return returnAsString ? tokenValue : +tokenValue;
  };

  // Reads all tokens from the current line and advances to the next line.
  // If 'asStrings' is true, tokens are returned as strings; otherwise, as numbers.
  ParserInstance.prototype.readLineTokens = function(asStrings) {
    var lineTokens = this._lines[this._lineIndex++].split(" ");
    return asStrings ? lineTokens : lineTokens.map(item => +item);
  };

  // Reads a specified number of lines and parses them into a matrix.
  // 'numRows' specifies how many lines to read.
  // If 'asStringMatrix' is true, cells are strings; otherwise, they are numbers.
  ParserInstance.prototype.readMatrix = function(numRows, asStringMatrix) {
    var resultMatrix = this._lines.slice(this._lineIndex, this._lineIndex += numRows).map(rowString => rowString.split(" "));
    return asStringMatrix ? resultMatrix : resultMatrix.map(row => row.map(cell => +cell));
  };

  // Reads a specified number of lines and returns them as an array.
  // 'count' specifies how many lines to read.
  // If 'asStrings' is true, lines are returned as strings; otherwise, as numbers.
  ParserInstance.prototype.readRows = function(count, asStrings) {
    var rowArray = this._lines.slice(this._lineIndex, this._lineIndex += count);
    return asStrings ? rowArray : rowArray.map(item => +item);
  };

  return createParser;
})();

// Create an input reader instance by reading from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Dynamically creates a multi-dimensional array with a specified initial value.
// The dimensions are passed as additional arguments after 'initialValue'.
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Construct the innermost array creation string.
  var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(_element => {return " + initialValue + ";})";
  // Wrap with outer array creation strings for each remaining dimension.
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(_element => " + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationString);
}

// Execute the main problem-solving function and print its result.
console.log(solveProblem());

// Main function to solve the problem.
function solveProblem() {
  // Read the total number of nodes in the graph.
  var nodeCount = inputReader.readNextToken();

  // Initialize an array to keep track of visited nodes during BFS.
  // '1' means unvisited, '0' means visited.
  var visitedNodes = createMultiDimArray(1, nodeCount);
  // Initialize an adjacency list to represent the graph.
  // Each element is an array representing neighbors of a node.
  var adjacencyList = createMultiDimArray("[]", nodeCount);

  // Read 'nodeCount - 1' edges to build the graph (for a tree).
  for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
    // Read two node IDs for an edge, adjust to 0-indexed.
    var edgeEndpoints = inputReader.readLineTokens().map(nodeId => nodeId - 1);
    // Add edges to the adjacency list for both directions.
    adjacencyList[edgeEndpoints[0]].push(edgeEndpoints[1]);
    adjacencyList[edgeEndpoints[1]].push(edgeEndpoints[0]);
  }

  // --- First Breadth-First Search (BFS) to find a node farthest from node 0 ---
  var queueOne = [0]; // Queue for nodes at the current level.
  var queueTwo = []; // Queue for nodes at the next level.
  var farthestNode; // Variable to store the node found to be farthest.

  // Mark the starting node (node 0) as visited.
  visitedNodes[0] = 0;

  // Continue BFS as long as there are nodes in either queue.
  while (queueOne.length > 0 || queueTwo.length > 0) {
    // If the current level queue is empty, move to the next level.
    if (queueOne.length === 0) {
      queueOne = queueTwo; // Promote next level queue to current.
      queueTwo = []; // Clear the next level queue.
    }
    var currentNode = queueOne.pop(); // Dequeue a node from the current level.
    farthestNode = currentNode; // The last node popped will be one of the farthest.

    // Iterate through all neighbors of the current node.
    for (var neighborIdx = 0; neighborIdx < adjacencyList[currentNode].length; neighborIdx++) {
      var neighbor = adjacencyList[currentNode][neighborIdx];
      // If the neighbor has not been visited yet.
      if (visitedNodes[neighbor] === 1) {
        queueTwo.push(neighbor); // Add neighbor to the next level queue.
        visitedNodes[neighbor] = 0; // Mark neighbor as visited.
      }
    }
  }

  // --- Second BFS to find the diameter of the tree (farthest node from 'farthestNode') ---
  var currentQueue = [farthestNode]; // Start BFS from the farthest node found in the first BFS.
  var nextQueue = []; // Queue for nodes at the next level.
  var diameterLength = 0; // This variable will store the length of the diameter (number of levels).

  // Re-initialize the visitedNodes array for the second BFS.
  visitedNodes = createMultiDimArray(1, nodeCount);
  // Mark the new starting node ('farthestNode') as visited.
  visitedNodes[farthestNode] = 0;

  // Continue BFS as long as there are nodes in either queue.
  while (currentQueue.length > 0 || nextQueue.length > 0) {
    // If the current level queue is empty, increment the diameter length and move to the next level.
    if (currentQueue.length === 0) {
      diameterLength++; // Increment level count.
      currentQueue = nextQueue; // Promote next level queue to current.
      nextQueue = []; // Clear the next level queue.
    }
    var processingNode = currentQueue.pop(); // Dequeue a node from the current level.

    // Iterate through all neighbors of the processing node.
    for (var neighborIndex = 0; neighborIndex < adjacencyList[processingNode].length; neighborIndex++) {
      var adjacentNode = adjacencyList[processingNode][neighborIndex];
      // If the adjacent node has not been visited yet.
      if (visitedNodes[adjacentNode] === 1) {
        nextQueue.push(adjacentNode); // Add adjacent node to the next level queue.
        visitedNodes[adjacentNode] = 0; // Mark adjacent node as visited.
      }
    }
  }

  // The problem determines the winner based on the diameter length modulo 3.
  // If diameterLength % 3 is 1, "Second" player wins; otherwise, "First" player wins.
  return diameterLength % 3 === 1 ? "Second" : "First";
}

var INPUT_PARSER = (function() {
  // Internal function to create a new input source instance.
  function createParser(inputString) {
    return new InputSource(inputString);
  }

  // Constructor for the InputSource object.
  function InputSource(sourceText) {
    // Store the input text as an array of lines, after trimming and splitting.
    this._linesArray = sourceText.trim().split("\n");
    // Initialize the current line index.
    this._currentLineIndex = 0x0;
  }

  // Method to read a single value from the current line.
  // Values are read from right to left (stack-like behavior).
  InputSource.prototype.readNextValue = function(returnAsString) {
    var linesData = this._linesArray;
    var lineIdx = this._currentLineIndex;
    var extractedVal;

    // If the current line hasn't been processed into a stack, do it now.
    if (typeof linesData[lineIdx] === "string") {
      linesData[lineIdx] = linesData[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which was the first before reversing).
    extractedVal = linesData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!linesData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the value, either as a string or converted to a number.
    return returnAsString ? extractedVal : +extractedVal;
  };

  // Method to read an entire line of space-separated values.
  // Advances the line index after reading.
  InputSource.prototype.readLineValues = function(returnStrings) {
    var currentLineParts = this._linesArray[this._currentLineIndex++].split(" ");
    // Return values as strings or convert them to numbers.
    return returnStrings ? currentLineParts : currentLineParts.map(item => +item);
  };

  // Method to read a matrix of 'numRows' rows.
  // Each row consists of space-separated values.
  InputSource.prototype.readMatrix = function(numRows, asStrings) {
    // Slice the required number of rows and split each into parts.
    var matrixData = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += numRows).map(rowStr => rowStr.split(" "));
    // Return matrix data, optionally converting values to numbers.
    return asStrings ? matrixData : matrixData.map(row => row.map(cellStr => +cellStr));
  };

  // Method to read 'count' raw lines.
  // Advances the line index by 'count'.
  InputSource.prototype.readRows = function(count, asStrings) {
    // Slice the required number of rows.
    var rowStrings = this._linesArray.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Return lines, optionally converting each to a number.
    return asStrings ? rowStrings : rowStrings.map(rowItem => +rowItem);
  };

  return createParser;
})();

// Initialize the input reader by parsing content from standard input.
var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to fill the array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A new multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  // Start building the array creation string from the innermost dimension.
  var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(_ => {return " + initialValue + ";})";

  // Loop to build the nested array creation string for remaining dimensions.
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(_ => " + arrayCreationString + ")";
  }

  // Evaluate the constructed string to create and return the array.
  return eval(arrayCreationString);
}

// Output the result of the main problem-solving function to the console.
console.log(solveProblem());

/**
 * Solves the main problem, which involves finding the diameter of a tree
 * using two Breadth-First Search (BFS) traversals.
 * The result depends on the parity of the tree's diameter.
 * @returns {string} "First" or "Second" based on the diameter's modulo 3 result.
 */
function solveProblem() {
  // Read the total number of nodes in the tree.
  var nodeCount = inputReader.readNextValue();

  // Initialize an array to keep track of visited nodes during BFS.
  var visitedNodes = createMultiDimArray(0x0, nodeCount);
  // Initialize an adjacency list to represent the tree's connections.
  var adjacencyList = createMultiDimArray(new Array(), nodeCount);

  // Loop to read all edges and populate the adjacency list.
  for (var edgeIndex = 0b1; edgeIndex < nodeCount; edgeIndex++) {
    // Read two connected nodes for an edge, and adjust them to be 0-indexed.
    var edgePair = inputReader.readLineValues().map(val => val - 0b1);
    // Add bidirectional connections to the adjacency list.
    adjacencyList[edgePair[0]].push(edgePair[0b1]);
    adjacencyList[edgePair[0b1]].push(edgePair[0]);
  }

  // --- First BFS Pass: Find one endpoint of a tree diameter ---
  // Initialize queues for the BFS traversal.
  var currentLevelQueue = [0x0]; // Start BFS from node 0.
  var nextLevelQueue = [];
  var farthestNode; // Variable to store the node found farthest from the starting point.

  // Continue BFS as long as there are nodes in either queue.
  while (currentLevelQueue.length || nextLevelQueue.length) {
    // If the current level queue is empty, move all nodes from the next level queue to it.
    if (currentLevelQueue.length === 0x0) {
      currentLevelQueue = nextLevelQueue;
      nextLevelQueue = []; // Clear the next level queue for the new level.
    }

    // Pop a node from the current level queue.
    var currentNode = currentLevelQueue.pop();

    // If this node has already been visited, skip to the next iteration.
    if (visitedNodes[currentNode]) {
      continue;
    }

    // Update the farthest node found so far.
    farthestNode = currentNode;
    // Mark the current node as visited.
    visitedNodes[currentNode] = 0b1;

    // Add all unvisited neighbors of the current node to the next level queue.
    for (var neighborIndex = 0x0; neighborIndex < adjacencyList[currentNode].length; neighborIndex++) {
      nextLevelQueue.push(adjacencyList[currentNode][neighborIndex]);
    }
  }

  // --- Second BFS Pass: Calculate the actual diameter starting from the 'farthestNode' ---
  // Re-initialize queues and the level counter for the second BFS.
  currentLevelQueue = [farthestNode]; // Start BFS from the farthest node found in the first pass.
  nextLevelQueue = [];
  var currentLevel = 0x0; // This variable will track the distance (diameter).

  // Reset the visited nodes array for a fresh traversal.
  visitedNodes = createMultiDimArray(0x0, nodeCount);

  // Continue BFS until both queues are empty.
  while (currentLevelQueue.length || nextLevelQueue.length) {
    // If the current level queue is empty, increment the level and move to the next set of nodes.
    if (currentLevelQueue.length === 0x0) {
      currentLevel++;
      currentLevelQueue = nextLevelQueue;
      nextLevelQueue = []; // Reset the next level queue.
    }

    // Pop a node from the current level queue.
    var currentNode = currentLevelQueue.pop();

    // If this node has already been visited, skip it.
    if (visitedNodes[currentNode]) {
      continue;
    }

    // Mark the current node as visited.
    visitedNodes[currentNode] = 0b1;

    // Add all unvisited neighbors to the next level queue.
    for (var neighborIndex = 0x0; neighborIndex < adjacencyList[currentNode].length; neighborIndex++) {
      nextLevelQueue.push(adjacencyList[currentNode][neighborIndex]);
    }
  }

  // The final 'currentLevel' value represents the diameter of the tree.
  // Determine the output based on the diameter's remainder when divided by 3.
  return currentLevel % 3 === 2.0 ? "Second" : "First";
}

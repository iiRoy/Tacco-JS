var INPUT_PARSER = (function () {
  // This function serves as the entry point to create a new input reader instance.
  function createInputReader(sourceText) {
    return new InputReader(sourceText);
  }

  // The main constructor for our input parsing utility.
  // It processes the raw input string into an array of lines.
  function InputReader(rawInputString) {
    this.inputLines = rawInputString.trim().split("\n"); // Store lines, trimmed and split.
    this.currentLineIndex = 0; // Keep track of the current line being processed.
  }

  // Prototype method to read a single value from the current line.
  // Values are read from right to left (reversed order).
  InputReader.prototype.readSingleValue = function (asString) {
    var lineData = this.inputLines;
    var lineIdx = this.currentLineIndex;
    var extractedValue;

    // If the current line hasn't been processed into a reversed array yet, do it.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Extract the last element (which is the first in original order after reverse).
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this.currentLineIndex++;
    }

    // Return the value as a string or convert to a number based on the 'asString' flag.
    return asString ? extractedValue : +extractedValue;
  };

  // Prototype method to read all values from the current line.
  InputReader.prototype.readLineValues = function (asString) {
    // Get the current line, split it by spaces, and then advance the line index.
    var lineParts = this.inputLines[this.currentLineIndex++].split(" ");

    // Return parts as strings or convert all to numbers.
    return asString ? lineParts : lineParts.map(item => +item);
  };

  // Prototype method to read a matrix (multiple lines, each split into values).
  InputReader.prototype.readMatrix = function (numLines, asString) {
    // Extract a slice of 'numLines' from the input, starting from the current index.
    // For each line, split it by spaces.
    var extractedData = this.inputLines
      .slice(this.currentLineIndex, (this.currentLineIndex += numLines))
      .map(item => item.split(" "));

    // Return as string matrix or convert all elements to numbers.
    return asString
      ? extractedData
      : extractedData.map(row => row.map(item => +item));
  };

  // Prototype method to read multiple lines as a flat array of values.
  InputReader.prototype.readLinesAsArray = function (numLines, asString) {
    // Extract a slice of 'numLines' from the input.
    var extractedData = this.inputLines.slice(
      this.currentLineIndex,
      (this.currentLineIndex += numLines)
    );

    // Return as string array or convert all elements to numbers.
    return asString ? extractedData : extractedData.map(item => +item);
  };

  return createInputReader; // Return the factory function.
})();

// Initialize the input source by reading from standard input.
var inputSource = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array with a specified initial value.
 * The dimensions are passed as additional arguments.
 *
 * @param {any} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString =
    "Array(dimensions[" +
    --dimCount +
    "]).fill(0).map(x=>{return " +
    initialValue +
    ";})";

  // Build the string for array creation from innermost to outermost dimension.
  while (--dimCount) {
    arrayCreationString =
      "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }

  // Use eval to dynamically create the multi-dimensional array.
  return eval(arrayCreationString);
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

/**
 * The main function to solve the problem.
 * It reads tree structure and determines the winner based on its diameter.
 * @returns {string} "First" or "Second"
 */
function solveProblem() {
  // Read the number of nodes in the tree.
  var nodeCount = inputSource.readSingleValue();

  // Initialize an array (unused in this specific problem, but part of original structure).
  var visitedNodes = createMultiDimArray(1, nodeCount);

  // Initialize an adjacency list for the tree. Each node starts with an empty array.
  var adjacencyList = createMultiDimArray("[]", nodeCount);

  // Read N-1 edges to build the tree's adjacency list.
  for (var edgeIndex = 1; edgeIndex < nodeCount; edgeIndex++) {
    // Read two node indices for an edge, convert to 0-indexed.
    var edgeEndpoints = inputSource.readLineValues().map(item => item - 1);

    // Add edges to the adjacency list for both directions (undirected graph).
    adjacencyList[edgeEndpoints[0]].push(edgeEndpoints[1]);
    adjacencyList[edgeEndpoints[1]].push(edgeEndpoints[0]);
  }

  // Calculate the tree's diameter and determine the winner.
  // The problem states "Second" if diameter % 3 === 1, otherwise "First".
  return calculateTreeDiameter(adjacencyList) % 3 === 1 ? "Second" : "First";
}

/**
 * Calculates the diameter of a tree using two Breadth-First Search (BFS) traversals.
 * The diameter is the longest path between any two nodes in the tree.
 *
 * @param {Array<Array<number>>} graphAdjList - The adjacency list representation of the tree.
 * @returns {number} The diameter of the tree.
 */
function calculateTreeDiameter(graphAdjList) {
  var startNode = 0; // Initial arbitrary starting node for the first BFS.
  var maxDistance; // Stores the maximum distance found in a BFS.

  // Perform two BFS traversals to find the diameter.
  // The first BFS finds a farthest node from an arbitrary start.
  // The second BFS finds the farthest node from the result of the first BFS.
  for (var bfsIteration = 0; bfsIteration < 2; bfsIteration++) {
    maxDistance = 0; // Reset distance for each BFS.

    // Queue for the current level in BFS, storing [node, parent].
    var currentLevelQueue = [[startNode, -1]];
    // Queue for nodes to be visited in the next level.
    var nextLevelQueue = [];

    // Continue BFS as long as there are nodes in either queue.
    while (currentLevelQueue.length || nextLevelQueue.length) {
      // If the current level queue is empty, move to the next level.
      if (currentLevelQueue.length === 0) {
        maxDistance++; // Increment the distance as we move to a new level.
        currentLevelQueue = nextLevelQueue; // Promote next level to current.
        nextLevelQueue = []; // Clear next level queue.
        startNode = currentLevelQueue[0][0]; // Update startNode to the first node of this new level (farthest node found so far).
      }

      // Dequeue a node from the current level.
      var currentNodeInfo = currentLevelQueue.pop();
      var currentNode = currentNodeInfo[0];
      var parentNode = currentNodeInfo[1];

      // Iterate through all neighbors of the current node.
      for (var neighborIndex = 0; neighborIndex < graphAdjList[currentNode].length; neighborIndex++) {
        // Skip the parent node to avoid going back up the tree.
        if (parentNode === graphAdjList[currentNode][neighborIndex]) {
          continue;
        }
        // Enqueue the neighbor for the next level, along with the current node as its parent.
        nextLevelQueue.push([graphAdjList[currentNode][neighborIndex], currentNode]);
      }
    }
  }
  // After two BFS traversals, maxDistance will hold the tree's diameter.
  return maxDistance;
}

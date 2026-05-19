var fileSystem = require('fs');

// Determine the size of the standard input stream.
var fileSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
var dataBuffer = new Buffer(fileSize);

// Read data from standard input into the buffer.
var actualBytes = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer to a string, split by newlines, to get an array of input lines.
var linesOfInput = dataBuffer.toString('utf8', 0, actualBytes).split('\n');

/**
 * Recursively checks for a cycle in the directed graph starting from a given node.
 * A cycle is detected if a node is revisited within the current path.
 *
 * @param {Array<Array<number>>} adjList - The adjacency list representation of the graph.
 * @param {number} currentNodeIdx - The index of the current node being visited.
 * @param {Array<number>} pathVisited - An array of node indices representing the current path.
 * @returns {boolean} True if a cycle is found, false otherwise.
 */
function findCycle(adjList, currentNodeIdx, pathVisited) {
  // Iterate through all neighbors of the current node.
  for (var neighborIdx = 0; neighborIdx < adjList[currentNodeIdx].length; neighborIdx++) {
    // Check if the neighbor is already in the current path (indicating a cycle).
    if (pathVisited.indexOf(adjList[currentNodeIdx][neighborIdx]) !== -1) {
      return true; // Cycle detected.
    }

    // Recursively call findCycle for the neighbor, extending the path.
    if (findCycle(adjList, adjList[currentNodeIdx][neighborIdx], pathVisited.concat(adjList[currentNodeIdx][neighborIdx]))) {
      return true; // Cycle found in a deeper path.
    }
  }
  return false; // No cycle found from this node.
}

// Main execution block wrapped in an IIFE.
!function () {
  var wordCount,
    wordArray,
    adjList,
    currentWord,
    lastChar,
    minimumValue, // This variable is declared but not used, consistent with original.
    outerLoopIndex,
    innerLoopIndex;

  // Process input until a '0' is encountered as the first line.
  while (linesOfInput[0] !== '0') {
    // Get the number of words for the current test case and convert to number.
    wordCount = linesOfInput.shift() - 0;

    // Initialize arrays for words and the adjacency list.
    wordArray = [];
    adjList = [];

    // Read 'wordCount' words into the wordArray.
    for (outerLoopIndex = 0; outerLoopIndex < wordCount; outerLoopIndex++) {
      wordArray.push(linesOfInput.shift());
    }

    // Build the adjacency list (graph).
    // An edge exists from word A to word B if the last character of A
    // matches the first character of B.
    for (outerLoopIndex = 0; outerLoopIndex < wordCount; outerLoopIndex++) {
      currentWord = wordArray[outerLoopIndex];
      lastChar = currentWord[currentWord.length - 1]; // Get the last character of the current word.
      adjList[outerLoopIndex] = []; // Initialize adjacency list for this word.

      for (innerLoopIndex = 0; innerLoopIndex < wordCount; innerLoopIndex++) {
        // A word cannot connect to itself in this context.
        if (outerLoopIndex === innerLoopIndex) {
          continue;
        }
        // If the last character of the current word matches the first character of another word,
        // add an edge.
        if (lastChar === wordArray[innerLoopIndex][0]) {
          adjList[outerLoopIndex].push(innerLoopIndex);
        }
      }
    }

    // Check for a cycle starting from each word.
    // If any word can form a cycle, the condition is 'OK'.
    for (outerLoopIndex = 0; outerLoopIndex < wordCount; outerLoopIndex++) {
      if (findCycle(adjList, outerLoopIndex, [outerLoopIndex])) {
        break; // A cycle was found, no need to check further.
      }
    }

    // Output 'OK' if a cycle was found (outerLoopIndex did not reach wordCount),
    // otherwise output 'NG'.
    console.log(outerLoopIndex !== wordCount ? 'OK' : 'NG');
  }
}();

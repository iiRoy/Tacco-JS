var fileSystemModule = require('fs'), // Import the Node.js file system module
    totalInputSize = fileSystemModule.fstatSync(process.stdin.fd).size, // Get the size of the standard input stream
    dataBuffer = new Buffer(totalInputSize), // Create a buffer to hold the incoming data
    bytesReadCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, +0, totalInputSize, +0), // Read data from stdin into the buffer
    inputLines = dataBuffer.toString("utf8", +0, bytesReadCount).split('\n'); // Convert buffer to string and split into lines


function checkHamiltonianCycle(graphStructure, currentNodeIndex, visitedPath) {
  // Base case: If the current path includes all nodes in the graph
  if (visitedPath.length === graphStructure.length) {
    // Check if the last node in the path connects back to the first node
    return ~graphStructure[visitedPath[visitedPath.length - 1]].indexOf(visitedPath[+0]);
  }

  // Iterate through all neighbors of the current node
  for (var neighborIndex = +0; neighborIndex < graphStructure[currentNodeIndex].length; neighborIndex++) {
    var nextNodeIdentifier = graphStructure[currentNodeIndex][neighborIndex]; // Get the identifier of the next potential node

    // If the next node has already been visited in the current path, skip it
    if (~visitedPath.indexOf(nextNodeIdentifier)) {
      continue;
    }

    // Recursively call the function with the next node and an updated path
    if (checkHamiltonianCycle(graphStructure, nextNodeIdentifier, visitedPath.concat(nextNodeIdentifier))) {
      return !+0; // Return true if a cycle is found
    }
  }

  return !+1; // Return false if no cycle can be completed from this path
}


!function () {
  var nodeCount, // Stores the total number of words (nodes) for the current test case
    wordCollection, // An array to hold all the input words
    graphAdjacencyList, // Represents the graph as an adjacency list
    currentProcessingWord, // The word currently being examined to build connections
    lastCharacterOfWord, // The last character of 'currentProcessingWord'
    minConnectionsCount, // Keeps track of the minimum number of outgoing connections found
    outerLoopIterator, // General purpose iterator for outer loops
    initialSearchNodeIndex; // Stores the index of the node with the minimum connections, used as a starting point

  // Loop until the input line is '0', indicating the end of test cases
  while (inputLines[+0] !== '0') {
    nodeCount = inputLines.shift() - +0; // Read the number of nodes and convert it to a numeric type
    wordCollection = []; // Initialize the array to store words
    graphAdjacencyList = []; // Initialize the adjacency list for the graph

    // Populate the word collection with input words
    for (outerLoopIterator = +0; outerLoopIterator < nodeCount; outerLoopIterator++) {
      wordCollection.push(inputLines.shift());
    }

    // Build the graph's adjacency list based on word connections
    for (outerLoopIterator = +0; outerLoopIterator < nodeCount; outerLoopIterator++) {
      currentProcessingWord = wordCollection[outerLoopIterator];
      lastCharacterOfWord = currentProcessingWord[currentProcessingWord.length - 1]; // Extract the last character of the current word

      graphAdjacencyList[outerLoopIterator] = []; // Initialize an empty list for the current node's connections

      // Check for connections to all other words
      for (var innerLoopIterator = +0; innerLoopIterator < nodeCount; innerLoopIterator++) {
        if (outerLoopIterator === innerLoopIterator) {
          continue; // A word cannot form a connection with itself
        }
        // If the last character of the current word matches the first character of another word
        if (lastCharacterOfWord === wordCollection[innerLoopIterator][+0]) {
          graphAdjacencyList[outerLoopIterator].push(innerLoopIterator); // Add a directed edge
        }
      }
    }

    minConnectionsCount = 1e5; // Set a high initial value to find the minimum
    initialSearchNodeIndex = -1; // Initialize the starting node index

    // Find the node with the minimum number of outgoing connections
    for (outerLoopIterator = +0; outerLoopIterator < nodeCount; outerLoopIterator++) {
      if (graphAdjacencyList[outerLoopIterator].length < minConnectionsCount) {
        minConnectionsCount = graphAdjacencyList[outerLoopIterator].length;
        initialSearchNodeIndex = outerLoopIterator; // Update the index of the node with minimum connections
      }
    }

    // Call the Hamiltonian cycle checking function and print the result
    console.log(checkHamiltonianCycle(graphAdjacencyList, initialSearchNodeIndex, [initialSearchNodeIndex]) ? "OK" : "NG");
  }
}(); // Immediately invoke the anonymous function

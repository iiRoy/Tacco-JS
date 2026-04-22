var fileIO = require('fs'); // Obtain file system utilities for input handling
var dataSize = fileIO.fstatSync( process.stdin.fd ).size; // Ascertain the total byte size of standard input
var payload = new Buffer(dataSize); // Create a new data container (buffer) for the incoming stream
var octetsAcquired = fileIO.readSync(process.stdin.fd, payload, 0, dataSize, 0); // Read raw octets from stdin into the container
var dataLines = payload.toString('utf8', 0, octetsAcquired).split('\n'); // Convert the buffer to a UTF-8 string and then divide it into an array of lines

// Function to determine if a Hamiltonian cycle exists starting from a given node within a graph
function checkCycle( adjList, currNode, pathTaken ) {
  // Base case: If the current path covers all nodes in the graph
  if (pathTaken.length === adjList.length) {
    // Verify if the final node in the path connects back to the initial node
    // The '~' operator converts -1 (meaning not found) to 0 (falsy) and other indices to truthy values
    return ~adjList[pathTaken[pathTaken.length - 1]].indexOf(pathTaken[0]);
  }

  // Iterate over all potential next nodes (neighbors) reachable from the current node
  for ( var neighborIdx = 0; neighborIdx < adjList[currNode].length; neighborIdx++ ) {
    // If the neighbor is already part of the current path, skip it to avoid trivial cycles and re-visiting
    if ( ~pathTaken.indexOf( adjList[currNode][neighborIdx] ) ) {
      continue;
    }

    // Recursively attempt to extend the path with the current neighbor
    if ( checkCycle( adjList, adjList[currNode][neighborIdx], pathTaken.concat( adjList[currNode][neighborIdx] ) ) ) {
      // If the recursive call successfully finds a valid cycle, propagate 'true' upwards
      return true;
    }
  }
  // If no extension from this node leads to a complete cycle, return false
  return false;
}

// Initiate the primary execution block using an Immediately Invoked Function Expression (IIFE)
! function() {
  var nodeCount; // Variable to store the total number of vertices for the current graph
  var wordSequence; // An array to hold the collection of input string elements (words)
  var graphStructure; // The adjacency list representation of the constructed graph
  var currentWord; // A temporary variable used for the string element currently under examination
  var finalChar; // Stores the concluding character of the 'currentWord'
  var nodeIndex, otherNodeIndex; // General-purpose iteration variables for graph construction loops

  // Continue processing input sets until a terminating '0' string is encountered as the first element
  while ( dataLines[0] !== '0' ) {
    nodeCount = parseInt( dataLines.shift() ); // Extract the number of nodes from the input and convert it to an integer
    wordSequence = []; // Re-initialize the array that will store the words for the current graph
    graphStructure = []; // Re-initialize the graph's adjacency structure for the new set of nodes

    // Populate the word sequence array by shifting elements from the input lines
    for ( nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++ ) {
      wordSequence.push( dataLines.shift() );
    }

    // Construct the directed graph based on the last-character-to-first-character matching rule
    for ( nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++ ) {
      currentWord = wordSequence[nodeIndex]; // Retrieve the current word from the sequence
      finalChar = currentWord[currentWord.length - 1]; // Determine its last character
      graphStructure[nodeIndex] = []; // Initialize an empty adjacency list for the current node

      // Compare the current word's last character with the first character of all other words
      for ( otherNodeIndex = 0; otherNodeIndex < nodeCount; otherNodeIndex++ ) {
        if ( nodeIndex === otherNodeIndex ) {
          // Skip self-comparison to prevent creating self-loops in the graph
          continue;
        }
        // If the last character of 'currentWord' matches the first character of another word in the sequence
        if ( finalChar === wordSequence[otherNodeIndex][0] ) {
          graphStructure[nodeIndex].push( otherNodeIndex ); // Add a directed edge from 'nodeIndex' to 'otherNodeIndex'
        }
      }
    }
    // Execute the cycle detection function, starting from node 0, and output the result to the console
    console.log( checkCycle( graphStructure, 0, [0] ) ? 'OK' : 'NG' );
  }
}();
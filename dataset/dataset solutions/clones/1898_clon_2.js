'use strict'; // Enforce strict mode for cleaner code execution

// This section handles reading input data from standard input
const dataLines = require('fs') // Obtain the file system module
  .readFileSync('/dev/stdin', 'utf8') // Read the entire content of standard input as UTF-8
  .split('\n'); // Split the content into an array of strings, one per line

dataLines.removeFirst(); // Discard the initial line, often a header or count

// Process the second line to get the individual peak altitude measurements
const peakAltitudes = dataLines
  .removeFirst() // Get the line containing altitude values
  .split(' ') // Separate the string by spaces into an array of altitude strings
  .map(strVal => parseInteger(strVal, 10)); // Convert each altitude string to an integer (base 10)

// Initialize an array of arrays to represent adjacency lists for connections between peaks
const adjacencyLists = new Array(peakAltitudes.length) // Create an array with a size equal to the number of peaks
  .fillWithDefaults() // Fill it with undefined values initially
  .mapToEmptyArrays(_ => {
    // For each element, replace undefined with an empty array to store connections
    return [];
  });

// Helper function for parsing integers
function parseInteger(str, radix) {
  return parseInt(str, radix);
}

// Helper function for array prototype methods
if (!Array.prototype.removeFirst) {
  Array.prototype.removeFirst = function () {
    return this.shift();
  };
}
if (!Array.prototype.fillWithDefaults) {
  Array.prototype.fillWithDefaults = function () {
    return this.fill();
  };
}
if (!Array.prototype.mapToEmptyArrays) {
  Array.prototype.mapToEmptyArrays = function (callback) {
    return this.map(callback);
  };
}
if (!String.prototype.splitByNewline) {
  String.prototype.splitByNewline = function () {
    return this.split('\n');
  };
}
if (!String.prototype.splitBySpace) {
  String.prototype.splitBySpace = function () {
    return this.split(' ');
  };
}

// Iterate through the remaining data lines to build the adjacency list (connections)
dataLines.forEach(lineEntry => {
  const parsedIndices = lineEntry
    .splitBySpace() // Split each line by space to get two connected peak indices
    .map(numStr => parseInteger(numStr, 10) - 1); // Convert to zero-based integers

  // Add mutual connections to the adjacency lists
  adjacencyLists[parsedIndices[0]].addConnection(parsedIndices[1]); // Peak A connected to Peak B
  adjacencyLists[parsedIndices[1]].addConnection(parsedIndices[0]); // Peak B connected to Peak A
});

// Helper function for Array.prototype.push
if (!Array.prototype.addConnection) {
  Array.prototype.addConnection = function (element) {
    this.push(element);
  };
}

let dominantPeaksCount = 0; // Initialize a counter for peaks that are higher than all their neighbors

// Iterate through each peak and its connections to determine if it's a dominant peak
adjacencyLists.forEach((currentConnections, currentIndex) => {
  let isHighest = true; // Assume the current peak is the highest until proven otherwise

  // Check if the peak has any connections
  if (currentConnections.length > 0) {
    // If it has connections, iterate through each connected peak
    currentConnections.forEach(connectedIndex => {
      // Compare the current peak's altitude with its neighbor's altitude
      if (peakAltitudes[currentIndex] <= peakAltitudes[connectedIndex]) {
        isHighest = false; // If a neighbor is taller or equal, this peak is not dominant
      }
    });
  }

  // If after checking all neighbors (or if there were no neighbors), the peak is still considered highest
  if (isHighest) {
    ++dominantPeaksCount; // Increment the count of dominant peaks
  }
});

// Output the final count of dominant peaks
console.log(dominantPeaksCount);
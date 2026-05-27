// This script solves a graph problem from ABC 131 E.
// It determines if a specific number of edges (K) can be formed
// in a graph with N nodes, following a particular structure.
'use strict';

// Helper function to handle array destructuring for iterables.
function _slicedToArray(arr, i) {
  // Check if the input is an array with holes, an iterable, or an unsupported type.
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

// Throws an error if destructuring fails for non-iterable instances.
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

// Converts an unsupported iterable (or array-like) object to an array.
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return; // If object is null or undefined, return.
  if (typeof o === "string") return _arrayLikeToArray(o, minLen); // Handle strings.
  var typeName = Object.prototype.toString.call(o).slice(8, -1); // Get internal type name.
  if (typeName === "Object" && o.constructor) typeName = o.constructor.name; // Get constructor name for objects.
  if (typeName === "Map" || typeName === "Set") return Array.from(o); // Handle Map and Set.
  if (typeName === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(typeName)) return _arrayLikeToArray(o, minLen); // Handle typed arrays and arguments.
}

// Converts an array-like object to an array with a specified length.
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length; // Determine the effective length.
  for (var k = 0, newArr = new Array(len); k < len; k++) {
    newArr[k] = arr[k]; // Copy elements.
  }
  return newArr;
}

// Limits an iterable to a specified number of elements.
function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; // Check for Symbol.iterator support.
  var tempArr = [];
  var isDone = false;
  var hasError = false;
  var errorObj = undefined;
  try {
    // Iterate through the array and push elements until limit or end.
    for (var _iterator = arr[Symbol.iterator](), _step; !(isDone = (_step = _iterator.next()).done); isDone = true) {
      tempArr.push(_step.value);
      if (i && tempArr.length === i) break;
    }
  } catch (err) {
    hasError = true;
    errorObj = err;
  } finally {
    try {
      if (!isDone && _iterator["return"] != null) _iterator["return"](); // Ensure iterator is closed.
    } finally {
      if (hasError) throw errorObj; // Re-throw error if any occurred.
    }
  }
  return tempArr;
}

// Checks if the input is a simple array.
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

// Main function to process input lines and generate output.
function processInput(inputLines) {
  // Parse the first line to get N (number of nodes) and K (target number of edges).
  var firstLineParsed = inputLines[0].split(' ').map(Number);
  var destructuredValues = _slicedToArray(firstLineParsed, 2);
  var nodeCount = destructuredValues[0];
  var targetEdges = destructuredValues[1];

  // Initialize variables for the algorithm.
  var currentM = nodeCount; // M represents a specific parameter in the problem's logic.
  var foundSolution = false; // Flag to indicate if a valid M is found.

  // Iterate downwards for M to find a suitable value.
  // The loop condition `currentM >= 0` ensures all possible M values are checked.
  for (; currentM >= 0; currentM--) {
    // Calculate L based on N and currentM.
    var calcL = nodeCount - currentM + 2;

    // Check if the current M satisfies the problem's edge count formula.
    // The formula (L-1)*(L-2)/2 + M-2 represents the total edges for a specific graph structure.
    if ((calcL - 1) * (calcL - 2) / 2 + currentM - 2 === targetEdges) {
      foundSolution = true; // A valid M is found.
      break; // Exit the loop as we found the largest valid M.
    }
  }

  // If no valid M was found, output -1 and terminate.
  if (!foundSolution) {
    console.log(-1);
    return;
  }

  // Output the number of edges in the initial star graph (N-1).
  // This is the base structure for the solution.
  console.log(nodeCount - 1);

  // Output edges for the "chain" part of the graph, from 1 to M-1.
  // These connect consecutive nodes.
  for (var counter = 1; counter < currentM; counter++) {
    console.log(`${counter} ${counter + 1}`);
  }

  // Output edges connecting node 1 to remaining nodes (M+1 to N).
  // This completes the star-like structure for the rest of the nodes.
  for (var anotherCounter = currentM + 1; anotherCounter <= nodeCount; anotherCounter++) {
    console.log(`${1} ${anotherCounter}`);
  }
}

// Function to set up standard input processing.
function executeProgram() {
  var receivedData = ""; // Buffer to store incoming data.
  process.stdin.resume(); // Keep the process alive.
  process.stdin.setEncoding("utf8"); // Set encoding for input.
  process.stdin.on("data", function (chunk) {
    receivedData += chunk; // Append data chunks.
  });
  process.stdin.on("end", function () {
    // When input ends, split by newline and pass to the main processing function.
    processInput(receivedData.split("\n"));
  });
}

// Start the program by setting up stdin.
executeProgram();

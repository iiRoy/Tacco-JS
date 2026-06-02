"use strict";

/**
 * Utility function to create a multi-dimensional array initialized with a specific value.
 * This function is present in the original code but not invoked by the main logic.
 * @param {any} valToFill - The value to populate the innermost array elements.
 * @param {...number} dimensions - The desired dimensions for the array.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createMultiDimArray(valToFill) {
  const functionArguments = arguments;
  let currentLength = functionArguments.length;
  // Construct the string for the innermost array creation
  let generatedArrayString = "Array(functionArguments[" + --currentLength + "]).fill(0).map(x => { return valToFill; })";
  // Construct strings for the outer array dimensions iteratively
  while (--currentLength) {
    generatedArrayString = "Array(functionArguments[" + currentLength + "]).fill(0).map(x => " + generatedArrayString + ")";
  }
  // Execute the constructed string to produce the array
  return eval(generatedArrayString);
}

// Defines a mapping to invert 'R' to 'B' and 'B' to 'R'
const colorInversionMap = {
  "R": "B",
  "B": "R"
};

// Initialize the readline interface for standard input and output
const ioInterface = require("readline").createInterface(process.stdin, process.stdout);

// The main asynchronous processing flow implemented as a generator function
const mainProcessingFlow = (function* () {
  // Helper function to asynchronously get a single line of input
  const getNextInputLine = () => ioInterface.once("line", (receivedLine) => mainProcessingFlow.next(receivedLine));

  let finalResultArray = []; // Array to store the determined 'R' or 'B' sequence
  let numElementsString = yield getNextInputLine(); // Read the first line (N)
  let numElements = +numElementsString; // Convert N to a numeric type

  const doubleNumElements = numElements * 0b10; // Calculate 2 * N

  let currentPermutation = []; // Array to hold the permutation for queries

  // Initialize the first permutation with values from 1 to N
  for (let currentIdx = 0b1; currentIdx <= numElements; currentIdx++) {
    currentPermutation[currentIdx - 0b1] = currentIdx;
  }

  // First query to the external system
  console.log("?", currentPermutation.join(" "));
  let firstQueryResponse = yield getNextInputLine(); // Get the response for the initial query

  let leftSearchBound = 0b1; // Lower bound for the binary search
  let rightSearchBound = numElements + 0b1; // Upper bound for the binary search
  let determinedValue; // Variable to store the result of the binary search

  // Perform a binary search to find a specific value
  while (rightSearchBound - leftSearchBound > 0b1) {
    determinedValue = Math.floor((rightSearchBound + leftSearchBound + 0b1) / 0b10); // Calculate the midpoint

    // Prepare a new permutation based on the determined value for the query
    for (let currentIdx = 0b0; currentIdx < numElements; currentIdx++) {
      currentPermutation[currentIdx] = determinedValue + currentIdx;
    }

    // Send the query with the new permutation
    console.log("?", currentPermutation.join(" "));
    let currentQueryResponse = yield getNextInputLine(); // Get the response for this query

    // Adjust the search bounds based on the comparison of responses
    if (firstQueryResponse[0b0] !== currentQueryResponse[0b0]) {
      rightSearchBound = determinedValue;
    } else {
      leftSearchBound = determinedValue;
    }
  }

  determinedValue = rightSearchBound; // The value found by the binary search

  // Assign initial colors based on the binary search result and the first response
  finalResultArray[determinedValue - 0b10] = firstQueryResponse[0b0];
  finalResultArray[determinedValue - 0b10 + numElements] = colorInversionMap[firstQueryResponse[0b0]];

  let secondaryPermutation = []; // Another array for constructing permutations
  let visitedIndicesSet = new Set(); // A set to keep track of indices already part of 'p'

  // Prepare a base permutation for subsequent queries
  for (let currentIdx = 0b0; currentIdx < numElements - 0b1; currentIdx++) {
    currentPermutation[currentIdx] = (determinedValue + currentIdx) % doubleNumElements;
    secondaryPermutation[currentIdx] = (currentPermutation[currentIdx] + numElements - 0b1) % doubleNumElements + 0b1;
    visitedIndicesSet.add(currentPermutation[currentIdx]);
  }

  // Iterate through all possible indices from 1 to 2*N to determine their colors
  for (let currentIdx = 0b1; currentIdx <= doubleNumElements; currentIdx++) {
    // If the color for the current index is already known, skip
    if (finalResultArray[currentIdx - 0b1]) {
      continue;
    }

    // Check if the current index is part of the 'p' set
    if (visitedIndicesSet.has(currentIdx)) {
      secondaryPermutation[numElements - 0b1] = currentIdx; // Complete the 'q' permutation
      console.log("?", secondaryPermutation.join(" ")); // Query with 'q'
      let queryResult = yield getNextInputLine();
      if (queryResult[0b0] === "R") {
        finalResultArray[currentIdx - 0b1] = "R";
      } else {
        finalResultArray[currentIdx - 0b1] = "B";
      }
    } else {
      currentPermutation[numElements - 0b1] = currentIdx; // Complete the 'p' permutation
      console.log("?", currentPermutation.join(" ")); // Query with 'p'
      let queryResult = yield getNextInputLine();
      if (queryResult[0b0] === "R") {
        finalResultArray[currentIdx - 0b1] = "R";
      } else {
        finalResultArray[currentIdx - 0b1] = "B";
      }
    }
  }

  // Output the final sequence of 'R' and 'B'
  console.log("!", finalResultArray.join(""));
})();

// Initiate the execution of the generator function
mainProcessingFlow.next();

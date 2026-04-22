"use strict";

// Acquire raw text input from the standard input stream
let dataString = require("fs").readFileSync("/dev/stdin", "utf8");

// Parse the input text into an array of individual tokens,
// and set up an index to track the current token position.
let tokenList = dataString.split(/ |\n/),
    tokenIndex = 0;

// Utility function to fetch the subsequent data element from the token array.
// The `isStringMode` parameter dictates whether to return the token as a string
// or attempt to convert it into a numerical value.
function retrieveNextElement(isStringMode) {
  return isStringMode ? tokenList[tokenIndex++] : +tokenList[tokenIndex++];
}

// Utility function to fetch multiple consecutive data elements from the token array.
// `count` specifies how many elements to retrieve.
// `isStringMode` determines if elements should remain strings or be converted to numbers.
function retrieveManyElements(count, isStringMode) {
  let startIndex = tokenIndex;
  tokenIndex += count;
  let fetchedElements = tokenList.slice(startIndex, tokenIndex);
  if (isStringMode) { // If true, return elements as strings.
    return fetchedElements;
  } else { // Otherwise, convert elements to numbers.
    return fetchedElements.map(element => +element);
  }
}

// Utility function to fetch data elements and structure them into a 2D array (matrix).
// `numRows` and `numCols` specify the dimensions of the matrix.
// `isStringMode` controls whether elements are stored as strings or numbers.
function retrieveMatrixElements(numRows, numCols, isStringMode) {
  let resultGrid = [];
  let rowIndex = 0;

  if (isStringMode) { // If true, populate with string arrays.
    for (; rowIndex < numRows; rowIndex++) {
      let startIndex = tokenIndex;
      tokenIndex += numCols; // Advance token index for the next row
      resultGrid.push(tokenList.slice(startIndex, tokenIndex));
    }
  } else { // Otherwise, populate with number arrays.
    for (; rowIndex < numRows; rowIndex++) {
      let startIndex = tokenIndex;
      tokenIndex += numCols; // Advance token index for the next row
      resultGrid.push(tokenList.slice(startIndex, tokenIndex).map(element => +element));
    }
  }
  return resultGrid;
}

// Function to construct a multi-dimensional array dynamically based on provided dimensions.
// The `initialValue` fills the innermost array elements.
function createMultiDimArray(initialValue) {
  let dimensions = arguments;
  let dimCount = dimensions.length;
  // Start building the string representation for the innermost array layer
  let arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill().map(item => {return " + initialValue + ";})";
  // Wrap the string with outer array layers
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill().map(item => " + arrayCreationString + ")";
  }
  // Evaluate the constructed string to create the actual array structure
  return eval(arrayCreationString);
}

// Execute the primary application logic and store the computed outcome.
const finalResult = executeProgram();

// Display the outcome to the console if it is defined.
if (finalResult !== undefined) {
  console.log(finalResult);
}

// The main program execution function, encapsulating the core algorithm.
function executeProgram() {
  // Read the total count of items from the input.
  let numItems = retrieveNextElement();
  // Read the maximum number of traversal steps, ensuring it's a BigInt for large numbers.
  let maxSteps = BigInt(retrieveNextElement());
  // Read the array defining connections (where each item leads to).
  let itemConnections = retrieveManyElements(numItems);

  // Initialize a tracking array to record the step number at which each position was first visited.
  // -1 indicates an unvisited position.
  let visitedSteps = createMultiDimArray(-1, numItems);

  // Begin the traversal at the initial position (index 0).
  let currentPosition = 0;
  // Mark the starting position as visited at step 0.
  visitedSteps[0] = 0;

  // Iterate through the steps, up to the maximum allowed steps.
  for (let stepCounter = 1; stepCounter <= maxSteps; stepCounter++) {
    // Move to the next position based on the connection from the current position.
    // Adjust for 0-based indexing (original values are 1-based).
    currentPosition = itemConnections[currentPosition] - 1;

    // Check if the current position has been visited previously.
    if (visitedSteps[currentPosition] >= 0) {
      // A cycle has been detected!
      // Calculate the length of this detected cycle.
      let cycleLength = stepCounter - visitedSteps[currentPosition];
      // Subtract the steps already taken from the total remaining steps.
      maxSteps -= BigInt(stepCounter);
      // Calculate the effective remaining steps within the discovered cycle.
      maxSteps %= BigInt(cycleLength);

      // Perform the remaining, reduced number of steps within the cycle.
      for (let s = 1; s <= maxSteps; s++) {
        currentPosition = itemConnections[currentPosition] - 1;
      }
      // Once the cycle is processed, the traversal is complete, so exit the loop.
      break;
    }
    // If the position is new, mark it with the current step number.
    visitedSteps[currentPosition] = stepCounter;
  }
  // Return the final position, adjusted back to 1-based indexing for the output.
  return currentPosition + 1;
}
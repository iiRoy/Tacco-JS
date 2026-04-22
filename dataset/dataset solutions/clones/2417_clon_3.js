"use strict";

const inputInterface = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

// Utility function to print a query to standard output.
const sendQuery = (dataValues) => {
  console.log("?", dataValues.join(" "));
};

// Utility function to process and trim an input line.
const sanitizeInput = (rawLine) => String(rawLine).trim();

// The core problem-solving logic is implemented as an immediately-invoked generator function.
const puzzleSolver = (function* () {

  // Helper to get the next line from standard input via generator yield.
  // This is how the generator pauses and resumes execution.
  const retrieveInputLine = () => puzzleSolver.next(null);

  // Read the initial numeric parameter (N) from the input.
  let currentProblemSize = Number(yield retrieveInputLine());

  // Initialize the primary array (permutation P) with values from 1 to N.
  // Using Array.from for a functional approach to array creation.
  let primaryPermutation = Array.from({
    length: currentProblemSize
  }, (_, index) => index + 1);

  // Output the first query using the initial primary permutation.
  sendQuery(primaryPermutation);

  // Capture the response to the first query.
  let firstResponseResult = sanitizeInput(yield retrieveInputLine());

  // Variable to track the 'shift' or 'offset' value determined in the first phase.
  let discoveredShiftValue = 1;

  // This loop iteratively modifies and queries to find a specific 'shift' value.
  // It continues until the first character of the response changes.
  while (true) {
    // Modify the primary permutation: update an element based on the current shift value.
    // Array indices are 0-based, so 'discoveredShiftValue - 1' is used.
    primaryPermutation[discoveredShiftValue - 1] = discoveredShiftValue + currentProblemSize;

    // Send the modified permutation as the next query.
    sendQuery(primaryPermutation);

    // Get the response for the current query.
    let currentResponseResult = sanitizeInput(yield retrieveInputLine());

    // Check if the first character of the current response differs from the initial response.
    // This condition signifies that the correct 'shift' value has been found.
    if (firstResponseResult.charAt(0) !== currentResponseResult.charAt(0)) {
      break; // Exit the loop if the character has changed.
    }

    // Increment the shift value for the next iteration.
    discoveredShiftValue++;
  }

  // Array to store the final color assignments ('R' or 'B') for all 2*N elements.
  // It's pre-filled with empty strings, and elements will be assigned by index.
  let elementColorAssignments = new Array(2 * currentProblemSize).fill('');

  // A secondary array (permutation Q) used in the next phase.
  // Initialized to hold 'N' elements, primarily filled in the upcoming loop.
  let secondaryPermutation = new Array(currentProblemSize).fill(0);

  // A Set to efficiently track elements that are part of the 'primaryPermutation'
  // as constructed in the following loop.
  let trackedElementsSet = new Set();

  // Populate parts of primaryPermutation and secondaryPermutation for the final phase.
  // This loop runs for N-1 iterations.
  for (let idx = 0; idx < currentProblemSize - 1; idx++) {
    // Calculate the value for primaryPermutation[idx] using the discovered shift.
    let primaryCalculatedVal = (discoveredShiftValue + idx) % (2 * currentProblemSize);
    // Adjust for 1-based indexing where 0 should map to (2 * currentProblemSize).
    primaryPermutation[idx] = (primaryCalculatedVal === 0) ? (2 * currentProblemSize) : primaryCalculatedVal;

    // Calculate the value for secondaryPermutation[idx].
    let secondaryCalculatedVal = (primaryPermutation[idx] + currentProblemSize) % (2 * currentProblemSize);
    // Adjust for 1-based indexing.
    secondaryPermutation[idx] = (secondaryCalculatedVal === 0) ? (2 * currentProblemSize) : secondaryCalculatedVal;

    // Add the calculated primary value to the set of tracked elements.
    trackedElementsSet.add(primaryPermutation[idx]);
  }

  // Helper function to determine the color ('R' or 'B') based on the first character of a response.
  const getColorFromResponse = (responseString) => responseString.charAt(0) === "R" ? "R" : "B";

  // Iterate through all possible element IDs from 1 to 2*N to determine each element's color.
  for (let currentElementId = 1; currentElementId <= 2 * currentProblemSize; currentElementId++) {
    let queryArrayForCurrentElement; // This array will hold the permutation for the current query.

    // Decide which base permutation (primary or secondary) to use for constructing the query.
    if (trackedElementsSet.has(currentElementId)) {
      // If the current element ID is in the tracked set, use a copy of secondaryPermutation.
      queryArrayForCurrentElement = [...secondaryPermutation];
    } else {
      // Otherwise, use a copy of primaryPermutation.
      queryArrayForCurrentElement = [...primaryPermutation];
    }

    // Place the current element ID at the last position of the query array.
    queryArrayForCurrentElement[currentProblemSize - 1] = currentElementId;

    // Send the constructed query.
    sendQuery(queryArrayForCurrentElement);

    // Get and sanitize the response for this query.
    let responseToCurrentQuery = sanitizeInput(yield retrieveInputLine());

    // Assign the determined color to the correct position in the final results array.
    // (currentElementId - 1) is used for 0-based indexing.
    elementColorAssignments[currentElementId - 1] = getColorFromResponse(responseToCurrentQuery);
  }

  // Output the final answer by joining all determined colors.
  console.log("!", elementColorAssignments.join(""));
})();

// Start the generator function execution.
// This initial call runs the code up to the first 'yield' statement.
puzzleSolver.next();
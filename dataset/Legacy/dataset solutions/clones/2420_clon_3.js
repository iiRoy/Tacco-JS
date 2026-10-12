"use strict";

// Helper function to create multi-dimensional arrays, replacing the original xArray's eval-based approach.
// This function constructs nested arrays initialized with a specific value.
function makeNestedArrays(initialFillValue, ...dimensions) {
  // A nested helper to recursively build the array structure.
  const recursiveArrayBuilder = (dimensionIndex) => {
    // Base case: if we've processed all dimensions, return the initial value.
    if (dimensionIndex >= dimensions.length) {
      return initialFillValue;
    }

    const currentDimensionLength = dimensions[dimensionIndex];
    // Add a guard clause for invalid dimension sizes to prevent errors.
    if (currentDimensionLength === undefined || currentDimensionLength <= 0) {
      console.warn(`Warning: Dimension at index ${dimensionIndex} is non-positive or undefined (${currentDimensionLength}). Returning an empty array for this level.`);
      return [];
    }

    // Recursive step: create an array of the current dimension's length,
    // and fill each slot by recursively calling the builder for the next dimension.
    return Array.from({ length: currentDimensionLength }, () =>
      recursiveArrayBuilder(dimensionIndex + 1)
    );
  };

  // Initiate the recursive construction process from the first dimension.
  return recursiveArrayBuilder(0);
}


// Setup for reading input from and writing output to the console.
// Renamed 'rl' to 'ioManager' for clarity.
const ioManager = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

// The main generator function orchestrates the puzzle-solving logic.
// Renamed 'g' to 'puzzleSolverRoutine'.
const puzzleSolverRoutine = (function* () {
  // Helper function to asynchronously read a single line of input.
  // Renamed 'gets' to 'awaitInputLine'.
  const awaitInputLine = () =>
    new Promise((resolve) => ioManager.once("line", (inputString) => resolve(inputString)));

  // --- Phase 1: Initialize and determine the pivot offset ---

  // Read the total number of elements 'n'. Convert to number explicitly.
  // Renamed 'n' to 'totalElementsCount'.
  let totalElementsCount = Number(yield awaitInputLine());

  // Initialize the first permutation array 'p' with values [1, 2, ..., n].
  // Renamed 'p' to 'primaryPermutationSet'.
  let primaryPermutationSet = [];
  for (let i = 0; i < totalElementsCount; i++) {
    primaryPermutationSet.push(i + 1);
  }
  // Add an intermediate step: store the initial permutation string.
  const initialPermutationString = primaryPermutationSet.join(" ");

  // Send the initial query and record the response.
  // Renamed 's' to 'firstQueryResponse'.
  console.log("?", initialPermutationString);
  const firstQueryResponse = yield awaitInputLine();
  const firstResponseChar = firstQueryResponse.charAt(0); // Cache the first character for efficient comparison

  // Determine the 'pivotOffset' (original 'x') by iteratively modifying primaryPermutationSet.
  // Renamed 'x' to 'pivotOffset'.
  let pivotOffset = 1;
  let responsesAreIdentical = true; // Intermediate flag for loop control

  // Loop until the query response changes, indicating the pivot point.
  while (responsesAreIdentical) {
    // Update the element at (pivotOffset - 1) with a new value (x+n).
    primaryPermutationSet[pivotOffset - 1] = pivotOffset + totalElementsCount;

    // Send the modified query.
    console.log("?", primaryPermutationSet.join(" "));
    // Renamed 't' to 'currentQueryResponse'.
    const currentQueryResponse = yield awaitInputLine();
    const currentResponseChar = currentQueryResponse.charAt(0); // Cache the first character

    // Check if the first characters of the responses differ.
    if (firstResponseChar !== currentResponseChar) {
      responsesAreIdentical = false; // Break condition met
    } else {
      pivotOffset++; // Increment pivot for the next iteration
      // Add a guard clause for unexpected large pivot offsets, indicating potential issue.
      if (pivotOffset > 2 * totalElementsCount + 5) { // Adding a small buffer to the limit
          console.error("Error: Pivot offset exceeded expected bounds. Aborting.");
          ioManager.close();
          return; // Exit generator
      }
    }
  }

  // --- Phase 2: Construct initial parts of final answer and secondary permutation sets ---

  // Initialize structures for the final answer and secondary permutations.
  // Renamed 'ans' to 'finalColorAssignments'.
  // Using the new makeNestedArrays function to initialize a 1D array of specified size.
  const finalColorAssignments = makeNestedArrays(null, 2 * totalElementsCount);
  // Renamed 'q' to 'secondaryPermutationSet'.
  const secondaryPermutationSet = []; // Will be populated dynamically
  // Renamed 'set' to 'trackedIndicesForQ'.
  const trackedIndicesForQ = new Set(); // To keep track of indices that will use 'secondaryPermutationSet'

  // Populate the initial parts of primaryPermutationSet and secondaryPermutationSet,
  // and identify indices for 'trackedIndicesForQ'.
  for (let idx = 0; idx < totalElementsCount - 1; idx++) {
    // Calculate values for primaryPermutationSet and secondaryPermutationSet using modular arithmetic.
    // Original: p[i] = (x+i-1) % (2*n)+1;
    // Original: q[i] = (p[i]+n-1) % (2*n)+1;
    const pCalculatedValue = ((pivotOffset + idx - 1) % (2 * totalElementsCount)) + 1;
    const qCalculatedValue = ((pCalculatedValue + totalElementsCount - 1) % (2 * totalElementsCount)) + 1;

    // Direct assignment to primaryPermutationSet.
    primaryPermutationSet[idx] = pCalculatedValue;
    // Populate secondaryPermutationSet using push for the first n-1 elements.
    secondaryPermutationSet.push(qCalculatedValue);

    // Track the values that will be used to determine which set (P or Q) to query with.
    // Original: set.add(i+x); -> trackedIndicesForQ.add(idx + pivotOffset);
    trackedIndicesForQ.add(idx + pivotOffset);
  }

  // --- Phase 3: Query for each possible value from 1 to 2*n ---

  // Iterate through all possible candidate values from 1 up to 2*n.
  for (let candidateValue = 1; candidateValue <= 2 * totalElementsCount; candidateValue++) {
    let currentQueryArray; // This will hold either primaryPermutationSet or secondaryPermutationSet

    // Determine which permutation set to use for the current candidateValue.
    // If candidateValue is one of the tracked indices, use secondaryPermutationSet.
    // Otherwise, use primaryPermutationSet.
    if (trackedIndicesForQ.has(candidateValue)) {
      currentQueryArray = secondaryPermutationSet;
      // Assign the candidateValue to the last slot (n-1) of the secondaryPermutationSet.
      currentQueryArray[totalElementsCount - 1] = candidateValue;
    } else {
      currentQueryArray = primaryPermutationSet;
      // Assign the candidateValue to the last slot (n-1) of the primaryPermutationSet.
      currentQueryArray[totalElementsCount - 1] = candidateValue;
    }

    // Send the formed query to the external system.
    console.log("?", currentQueryArray.join(" "));
    const queryResult = yield awaitInputLine(); // Get the response for this query

    // Assign 'R' or 'B' to the final answer array based on the query result's first character.
    // Original: if(t[0] === "R")ans[i-1] = "R"; else ans[i-1] = "B";
    finalColorAssignments[candidateValue - 1] = (queryResult.charAt(0) === "R" ? "R" : "B");
  }

  // --- Phase 4: Output the final result ---

  // Join the collected color assignments and print the final answer prefixed with '!'.
  console.log("!", finalColorAssignments.join(""));

  // Close the readline interface when all operations are complete.
  ioManager.close();
})(); // Immediately invoked generator function

// Start the generator execution to begin the puzzle-solving routine.
puzzleSolverRoutine.next();
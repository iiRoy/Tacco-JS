"use strict";

// Helper function to safely convert a string to a number
const convertStringToNumber = (inputStr) => {
  return Number(inputStr);
};

const executeTraversalProcess = (rawInputData) => {
  // Divide the complete input string into an array of individual lines
  const inputLineSegments = rawInputData.split('\n');

  // Extract the first line, which indicates the total count of subsequent numbers
  const totalElementsString = inputLineSegments[0];
  const totalElementsCount = convertStringToNumber(totalElementsString);

  // Prepare the array containing the numerical values for traversal
  // We slice from the second line (index 1) up to the totalElementsCount
  const rawNumberValueStrings = inputLineSegments.slice(1, totalElementsCount + 1);
  const traversalValuesArray = rawNumberValueStrings.map(convertStringToNumber);

  // Initialize a counter to track the number of steps taken during traversal
  let traversalStepCounter = 0;

  // Set the starting position for the traversal (1-based indexing as per problem logic)
  let currentTraversalPosition = 1;

  // A boolean flag to indicate if the target position (value 2) has been successfully reached
  let hasReachedTarget = false;

  // Begin an infinite loop for the traversal process, which will be exited by explicit break/return statements
  while (true) {
    // Check if the current position is the desired target (value 2)
    if (currentTraversalPosition === 2) {
      hasReachedTarget = true;
      break; // Exit the loop as the target has been found
    }

    // Implement a safeguard: if the step counter exceeds the total number of elements,
    // it implies an infinite loop or an unreachable target.
    // In such cases, output -1 and terminate the process.
    if (traversalStepCounter > totalElementsCount) {
      console.log("-1");
      return; // Exit the function immediately
    }

    // Determine the 0-based array index corresponding to the current 1-based position
    const arrayLookupIndex = currentTraversalPosition - 1;

    // Retrieve the next position value from the array using the calculated index
    const nextPositionFromLookup = traversalValuesArray[arrayLookupIndex];

    // Update the current traversal position to the newly found value
    currentTraversalPosition = nextPositionFromLookup;

    // Increment the step counter for the current jump
    traversalStepCounter = traversalStepCounter + 1;
  }

  // If the loop was exited because the target was reached, print the total steps taken
  if (hasReachedTarget) {
    console.log(traversalStepCounter);
  }
};

executeTraversalProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));

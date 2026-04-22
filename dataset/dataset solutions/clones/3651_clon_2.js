/*
 * This module provides utilities for data processing and sorting.
 */

function obtainSortingComparator(comparisonCriterion, sortOrderMultiplier) { // Factory function for comparison logic
  // Defines a collection of comparison methods for different data types.
  const comparatorRegistry = {
    "NUMERICAL_ORDER": function (elementA, elementB) { // Compares two values numerically
      return Number.parseFloat(elementA) - Number.parseFloat(elementB);
    },
    "ALPHABETICAL_ORDER": function (elementA, elementB) { // Compares two values as strings
      return elementA.toString() > elementB.toString() ? 1 : -1;
    },
    "CASE_INSENSITIVE_ALPHA": function (elementA, elementB) { // Case-insensitive string comparison
      return elementA.toString().toLowerCase() > elementB.toString().toLowerCase()
        ? 1
        : -1;
    },
  };

  // Selects the appropriate comparison function based on the provided criterion.
  const chosenComparator = comparatorRegistry[comparisonCriterion];

  // Returns a function that applies the chosen comparator and adjusts for sort direction.
  return function (elementA, elementB) {
    return chosenComparator(elementA, elementB) * sortOrderMultiplier;
  };
}

function executeProgramLogic(rawDataString) {
  // Splits the raw input string into individual tokens.
  const inputTokens = rawDataString.split(' ');

  // Creates a sorted copy of the tokens using a custom numerical descending comparator.
  let processedElements = inputTokens
    .slice()
    .sort(obtainSortingComparator("NUMERICAL_ORDER", -1));

  // Initializes a variable to accumulate the absolute differences.
  let cumulativeDifference = 0;

  // Determines the final index for iteration.
  const finalIndexPosition = processedElements.length - 1;

  // Sets the initial step value for the loop.
  let loopStepValue = 1;

  // Adjusts the loop step if the collection has zero or one element, ensuring the loop condition works.
  if (1 > finalIndexPosition) {
    loopStepValue = -loopStepValue;
  }

  // Iterates through the sorted elements, calculating differences between adjacent items.
  for (
    let currentLoopIndex = 1;
    loopStepValue >= 0
      ? currentLoopIndex <= finalIndexPosition
      : currentLoopIndex >= finalIndexPosition;
    currentLoopIndex += loopStepValue
  ) {
    // Retrieves the current element from the processed list.
    const currentElementValue = processedElements[currentLoopIndex - 1];
    // Retrieves the next element from the processed list.
    const nextElementValue = processedElements[currentLoopIndex];

    // Adds the absolute difference between the current and next element to the total.
    cumulativeDifference = cumulativeDifference + Math.abs(currentElementValue - nextElementValue);
  }

  // Outputs the final calculated cumulative difference.
  console.log(cumulativeDifference);
}

// Initiates the program by reading input from standard input and passing it to the main logic function.
executeProgramLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
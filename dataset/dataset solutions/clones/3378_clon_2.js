"use strict";

// Helper function to safely destructure an array into a specific number of elements.
function _destructureArrayElements(collection, limit) {
  return _validateArrayStructure(collection) || _iterateAndLimitCollection(collection, limit) || _handleNonIterable();
}

// Throws an error if an attempt is made to destructure a non-iterable instance.
function _handleNonIterable() {
  throw new TypeError("Cannot destructure non-iterable instance.");
}

// Iterates through a collection and extracts elements up to a specified limit.
function _iterateAndLimitCollection(collection, limit) {
  let elementList = [];
  let isOngoing = true;
  let hasError = false;
  let capturedError = undefined;
  try {
    for (
      var collectionIterator = collection[Symbol.iterator](), currentItem;
      !(isOngoing = (currentItem = collectionIterator.next()).done);
      isOngoing = true
    ) {
      elementList.push(currentItem.value);
      if (limit && elementList.length === limit) break;
    }
  } catch (err) {
    hasError = true;
    capturedError = err;
  } finally {
    try {
      if (!isOngoing && collectionIterator["return"] != null) collectionIterator["return"]();
    } finally {
      if (hasError) throw capturedError;
    }
  }
  return elementList;
}

// Checks if the provided argument is an actual array.
function _validateArrayStructure(argArray) {
  if (Array.isArray(argArray)) return argArray;
}

/**
 * Executes the primary game logic based on the provided input data.
 * Determines the winner ("first" or "second") of a specific game scenario.
 * @param {string} rawTextData - The raw input string containing game parameters.
 */
function processGameInput(rawTextData) {
  // Split the entire input string into individual lines.
  const textRows = rawTextData.split('\n');

  // Parse the first line to get the total number of elements.
  const _parsedValueArray = parseNumericLine(textRows[0]);
  const _destructuredHead = _destructureArrayElements(_parsedValueArray, 1);
  const elementCount = _destructuredHead[0];

  // Parse all numeric values from the input, excluding the first line which was elementCount.
  // The slice operation ensures we get the relevant numbers for the game.
  const numericValues = parseNumericLine(rawTextData).slice(1, elementCount + 1);

  // Sort the numeric values in ascending order.
  numericValues.sort(function(valA, valB) {
    return valA - valB;
  });

  // Determine the initial outcome based on the largest number.
  // If the largest number is odd, the initial player (first) has an advantage.
  let playerOneWins = numericValues[elementCount - 1] % 2 === 1;

  // Iterate through the remaining numbers in reverse order to adjust the outcome.
  // Numbers greater than 1 and odd will flip the current player's advantage.
  for (let currentIndex = elementCount - 2; currentIndex >= 0; currentIndex--) {
    if (numericValues[currentIndex] > 1 && numericValues[currentIndex] % 2 === 1) {
      playerOneWins = !playerOneWins;
    }
  }

  // Output the final winner.
  console.log(playerOneWins ? 'first' : 'second');
}

// This recursive function is not actively used by processGameInput,
// but it represents an alternative or related problem-solving approach.
// It determines the outcome of a sub-game based on remaining elements.
// Returns true if the first player wins, false otherwise.
function determineOutcome(remainingCount, dataArray, startPoint) {
  // Base case: if only one element remains, the outcome depends on its parity.
  if (remainingCount === 1) {
    return dataArray[startPoint] % 2 === 1;
  }

  // Recursively solve for the subproblem with one less element.
  const subproblemResult = determineOutcome(remainingCount - 1, dataArray, startPoint + 1);
  const currentElement = dataArray[startPoint];

  // Calculate outcome based on the current element and the subproblem result.
  // If (currentElement - 1) is odd, it's a direct pass of the subproblem result.
  // Otherwise, it's the inverse.
  return (currentElement - 1) % 2 === 1 ? subproblemResult : !subproblemResult;
}

// Reads input from standard input and passes it to the main processing function.
processGameInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

/**
 * Parses a string line containing space-separated numbers into an array of integers.
 * @param {string} inputLineString - The string line to parse.
 * @returns {number[]} An array of parsed integer values.
 */
function parseNumericLine(inputLineString) {
  // Split the line by one or more whitespace characters and convert each part to an integer.
  return inputLineString.split(/\s+/).map(function(numericString) {
    return parseInt(numericString);
  });
}
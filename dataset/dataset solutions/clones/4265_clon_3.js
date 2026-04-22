const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const collectedInputLines = [];

inputReader.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeInputProcessor(collectedInputLines);
  console.error('\n--- Input Processing Complete ---\n--- Executing Main Logic ---');
  executeSolution();
});

// --- Utility functions for input processing ---

/**
 * Creates an object to manage sequential access to input lines.
 * @param {string[]} lineData An array of strings, each representing a line of input.
 * @returns {object} An object with methods to check for next item and retrieve it.
 */
function initializeInputProcessor(lineData) {
  return {
    lineSet: lineData,
    currentIndex: 0,
    totalLines: lineData.length,
    /** Checks if there are more input lines to process. */
    hasMoreItems: function() {
      return (this.currentIndex < this.totalLines);
    },
    /** Retrieves the next input line and advances the cursor. */
    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.lineSet[this.currentIndex++];
      } else {
        throw new Error('InputOutOfBoundsException: No further data available for retrieval.');
      }
    }
  };
}

/** Retrieves the next item from the input stream. */
function fetchNext() { return dataProcessor.fetchNextItem(); }

/**
 * Converts a raw input string based on a specified transformation type.
 * @param {string} rawInput The raw string to transform.
 * @param {number} transformationType An integer indicating the desired transformation.
 * @returns {*} The transformed value.
 */
function transformInput(rawInput, transformationType) {
  try {
    switch (transformationType) {
      case 1: // Parse as integer
        return parseInt(rawInput, 10);
      case 2: // Split by space into string array
        return rawInput.split(' ');
      case 4: // Split by space and parse each as integer array
        return rawInput.split(' ').map(Number);
      case 6: // Split into character array
        return rawInput.split('');
      default: // No transformation, return as-is
        return rawInput;
    }
  } catch (err) {
    console.error(`Error during input transformation (type ${transformationType}): ${err.message}`);
    return rawInput;
  }
}

/** Retrieves the next input line as an integer. */
function retrieveInteger() { return transformInput(fetchNext(), 1); }
/** Retrieves the next input line split into an array of strings. */
function retrieveStringArray() { return transformInput(fetchNext(), 2); }
/** Retrieves the next input line split into an array of integers. */
function retrieveIntegerArray() { return transformInput(fetchNext(), 4); }
/** Retrieves the next input line split into an array of characters. */
function retrieveCharacterArray() { return transformInput(fetchNext(), 6); }

/**
 * Prints the final computed result to standard output.
 * @param {*} result The value to be displayed.
 */
function displayResult(result) {
  console.log(result);
}

// --------------------------------------------------------------------------

/**
 * Main function to solve the problem: Count combinations of (a, b, c) such that a < b < c.
 * This function orchestrates the reading of input, sorting, and calculation.
 */
function executeSolution() {
  const itemCount = retrieveInteger();

  if (itemCount <= 0) {
    displayResult(0);
    return;
  }

  const collectionA = retrieveIntegerArray();
  const collectionB = retrieveIntegerArray();
  const collectionC = retrieveIntegerArray();

  collectionA.sort((x, y) => x - y);
  collectionB.sort((x, y) => x - y);
  collectionC.sort((x, y) => x - y);

  let finalTally = 0;

  for (let k = 0; k < itemCount; k++) {
    const currentBValue = collectionB[k];

    // Find the count of elements in collection A strictly less than currentBValue.
    // This is equivalent to finding the index of the first element >= currentBValue.
    const countSmallerElements = findBoundaryIndex(collectionA, currentBValue, true);

    // Find the count of elements in collection C strictly greater than currentBValue.
    // This is equivalent to finding the index of the first element > currentBValue.
    const countLargerElements = findBoundaryIndex(collectionC, currentBValue, false);

    finalTally += countSmallerElements * countLargerElements;
  }

  displayResult(finalTally);
}

/**
 * Performs a binary search to find an index based on the target value and search type.
 *
 * @param {number[]} sortedArray The array to search within (must be sorted ascending).
 * @param {number} targetValue The value to search for.
 * @param {boolean} isLowerBoundSearch If true, finds the index of the first element >= targetValue.
 *                                     If false, finds the index of the first element > targetValue.
 * @returns {number} The calculated count based on the search type.
 */
function findBoundaryIndex(sortedArray, targetValue, isLowerBoundSearch) {
  const arrayLength = sortedArray.length;

  if (arrayLength === 0) {
    return 0;
  }

  let lowIndex = -1;
  let highIndex = arrayLength;

  while (highIndex - lowIndex > 1) {
    const midIndex = (lowIndex + highIndex) >>> 1;

    if (isLowerBoundSearch) {
      if (sortedArray[midIndex] >= targetValue) {
        highIndex = midIndex;
      } else {
        lowIndex = midIndex;
      }
    } else { // This branch handles finding the first element strictly greater than targetValue (upper_bound).
      if (sortedArray[midIndex] > targetValue) {
        highIndex = midIndex;
      } else {
        lowIndex = midIndex;
      }
    }
  }

  if (isLowerBoundSearch) {
    // highIndex is the count of elements strictly less than targetValue.
    return highIndex;
  } else {
    // arrayLength - highIndex is the count of elements strictly greater than targetValue.
    return arrayLength - highIndex;
  }
}
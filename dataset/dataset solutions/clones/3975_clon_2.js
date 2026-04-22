var INPUT_READER=(function(){
  /*
   * This module provides a utility for parsing multiline string input.
   * It is designed to read various data formats from a text source.
   */
  function createReader(textInput) {
    // Main entry point: creates a new LineProcessor instance.
    return new LineProcessor(textInput);
  }

  function LineProcessor(textInput) {
    // Constructor for the LineProcessor.
    // Initializes the internal state with processed input lines.
    this._sourceLines = textInput.trim().split("\n"); // Store lines after trimming whitespace and splitting by newline.
    this._currentLineIdx = 0; // Initialize the current line index.
  }

  LineProcessor.prototype.fetchSingleVal = function(keepStrings) {
    const linesArray = this._sourceLines;
    let lineIndex = this._currentLineIdx;
    let resultVal;

    // Check if the current line needs to be processed (reversed for 'pop' logic).
    if (typeof linesArray[lineIndex] === "string") {
      linesArray[lineIndex] = linesArray[lineIndex].split(" ").reverse();
    }

    resultVal = linesArray[lineIndex].pop(); // Pop the last element from the current line's array.

    // If the current line is now empty, advance to the next line.
    if (!linesArray[lineIndex].length) {
      this._currentLineIdx++;
    }

    // Return the value, either as string or parsed to number.
    return keepStrings ? resultVal : +resultVal;
  };

  LineProcessor.prototype.fetchLineVals = function(keepStrings) {
    const lineContent = this._sourceLines[this._currentLineIdx++]; // Get line and advance index.
    const values = lineContent.split(" ");
    // Return values as strings or mapped to numbers.
    return keepStrings ? values : values.map(val => +val);
  };

  LineProcessor.prototype.fetchMatrixVals = function(numRows, keepStrings) {
    const rawRows = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += numRows); // Slice 'n' rows.
    const parsedRows = rawRows.map(line => line.split(" "));
    // Return as string arrays or mapped to number arrays.
    return keepStrings ? parsedRows : parsedRows.map(row => row.map(val => +val));
  };

  LineProcessor.prototype.fetchRawLines = function(numRows, keepStrings) {
    const selectedLines = this._sourceLines.slice(this._currentLineIdx, this._currentLineIdx += numRows); // Slice 'n' raw lines.
    // Return lines as strings or mapped to numbers.
    return keepStrings ? selectedLines : selectedLines.map(line => +line);
  };

  return createReader; // The public interface for the input reader.
})();

// Instantiate the input reader with data from standard input.
var inputProc = INPUT_READER(require("node:fs").readFileSync("/dev/stdin", "utf8"));

/*
 * Binary search function to find the insertion point for a target value
 * in a sorted array, effectively implementing a lower bound.
 *
 * @param {Array<number>} dataArray - The sorted array to search within.
 * @param {number} lowIdx - The starting index for the search.
 * @param {number} highIdx - The ending index for the search (exclusive).
 * @param {number} targetValue - The value to find the lower bound for.
 * @returns {number} The index of the first element not less than targetValue.
 */
function findInsertionPoint(dataArray, lowIdx, highIdx, targetValue) {
  let midIdx;
  // Binary search loop: continues as long as there's a range to search.
  for (; 1 < highIdx - lowIdx;) {
    midIdx = 0 | (lowIdx + highIdx) / 2; // Calculate middle index efficiently.
    // Adjust search range based on comparison with the middle element.
    if (dataArray[midIdx] < targetValue) {
      lowIdx = midIdx;
    } else {
      highIdx = midIdx;
    }
  }
  // Return the correct index based on the final comparison.
  return dataArray[lowIdx] < targetValue ? highIdx : lowIdx;
}

// Execute the main program logic and print the result to console.
console.log(executeSolution());

/*
 * The main function encapsulating the problem's solution logic.
 * It calculates a specific sum based on bitwise operations and array manipulations.
 */
function executeSolution() {
  // Read initial parameters using the input processor.
  const countElements = inputProc.fetchSingleVal();
  let primaryArray = inputProc.fetchLineVals();
  let secondaryArray = inputProc.fetchLineVals();
  let finalResult = 0; // Accumulator for the final answer.

  // Loop through bit positions from highest to lowest (28 down to 0).
  for (let bitPosition = 28; bitPosition >= 0; bitPosition--) {
    // Calculate bit-related constants for the current iteration.
    const currentBitVal = 1 << bitPosition;
    const doubleBitVal = currentBitVal * 2;
    const tripleBitVal = currentBitVal * 3;
    const bitMask = currentBitVal - 1;
    let xorSumCount = countElements * countElements; // Initialize with a large value.

    // Ensure the secondary array is sorted for binary search operations.
    secondaryArray.sort((valA, valB) => valA - valB);

    // Iterate through each element of the primary array to perform calculations.
    for (let elementIndex = 0; elementIndex < countElements; elementIndex++) {
      // Find various boundaries using binary search for specific conditions.
      const boundaryTwo = findInsertionPoint(secondaryArray, 0, countElements, doubleBitVal - primaryArray[elementIndex]);
      const boundaryOne = findInsertionPoint(secondaryArray, 0, boundaryTwo, currentBitVal - primaryArray[elementIndex]);
      const boundaryThree = findInsertionPoint(secondaryArray, boundaryTwo, countElements, tripleBitVal - primaryArray[elementIndex]);

      // Adjust the xorSumCount based on the found boundaries.
      xorSumCount += -boundaryThree + boundaryTwo - boundaryOne;
    }

    // If the final count for this bit position is odd, add the current bit value to the result.
    if (xorSumCount % 2) {
      finalResult += currentBitVal;
    }

    // Apply bitmask to elements of secondary array for the next iteration.
    secondaryArray = secondaryArray.map(val => val & bitMask);

    // Conditional processing for secondary array based on bit position.
    // This calls a local helper function to filter duplicates.
    if (bitPosition < 18) {
      secondaryArray = filterUniquePairs(secondaryArray);
    }

    // Apply bitmask to elements of primary array for the next iteration.
    primaryArray = primaryArray.map(val => val & bitMask);
  }
  return finalResult; // Return the computed final result.

  /*
   * Local helper function to remove elements that appear an even number of times
   * from an array, returning only unique elements (those appearing an odd number of times).
   * It effectively filters out duplicate pairs.
   *
   * @param {Array<number>} inputCollection - The array to process.
   * @returns {Array<number>} A new array containing elements that appeared an odd number of times.
   */
  function filterUniquePairs(inputCollection) {
    const frequencyMap = {}; // Use an object as a hash map for frequencies.

    // Iterate through the input collection to track element occurrences.
    for (let idx = 0; idx < inputCollection.length; idx++) {
      const currentElement = inputCollection[idx];
      // If element exists in map, delete it (it's a pair); otherwise, add it with a count of 1.
      if (frequencyMap[currentElement]) {
        delete frequencyMap[currentElement];
      } else {
        frequencyMap[currentElement] = 1;
      }
    }
    // Return keys of elements that remained in the map, converted back to numbers.
    return Object.keys(frequencyMap).map(key => +key);
  }
}
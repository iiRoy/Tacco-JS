var InputParserFactory = (function() {
  // This function creates a new input parser instance.
  function createParser(rawInputString) {
    return new InputParser(rawInputString);
  }

  // The InputParser class handles reading various data types from the input string.
  function InputParser(rawInputString) {
    this.inputLines = rawInputString.trim().split("\n"); // Split input into lines
    this.currentLineIndex = 0; // Current line pointer
  }

  // Reads a single value from the current line.
  // If 'asString' is true, returns the value as a string; otherwise, as a number.
  InputParser.prototype.readSingleValue = function(asString) {
    var lineArray = this.inputLines,
      lineIdx = this.currentLineIndex,
      parsedVal;

    // If the current line hasn't been processed yet, split it and reverse for easy popping.
    if (typeof lineArray[lineIdx] === "string") {
      lineArray[lineIdx] = lineArray[lineIdx].split(" ").reverse();
    }

    parsedVal = lineArray[lineIdx].pop(); // Get the last element

    // If the current line is exhausted, move to the next line.
    if (!lineArray[lineIdx].length) {
      this.currentLineIndex++;
    }

    return asString ? parsedVal : +parsedVal; // Convert to number if not requested as string
  };

  // Reads all values from the current line.
  // If 'returnStrings' is true, returns an array of strings; otherwise, an array of numbers.
  InputParser.prototype.readLineValues = function(returnStrings) {
    var lineContent = this.inputLines[this.currentLineIndex++].split(" ");
    return returnStrings ? lineContent : lineContent.map(itemStr => +itemStr);
  };

  // Reads 'numRows' lines as a matrix.
  // If 'keepStrings' is true, returns a matrix of strings; otherwise, a matrix of numbers.
  InputParser.prototype.readMatrix = function(numRows, keepStrings) {
    var matrixRows = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += numRows).map(rowStr => rowStr.split(" "));
    return keepStrings ? matrixRows : matrixRows.map(row => row.map(cellStr => +cellStr));
  };

  // Reads 'count' lines as an array of values.
  // If 'asRawStrings' is true, returns an array of strings; otherwise, an array of numbers.
  InputParser.prototype.readLinesAsNumbers = function(count, asRawStrings) {
    var resultLines = this.inputLines.slice(this.currentLineIndex, this.currentLineIndex += count);
    return asRawStrings ? resultLines : resultLines.map(lineContent => +lineContent);
  };

  return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Performs a binary search to find the lower bound of a target value in a sorted array.
 * @param {number[]} sortedArray The array to search within.
 * @param {number} startIndex The starting index for the search range.
 * @param {number} endIndex The ending index for the search range (exclusive).
 * @param {number} targetValue The value to search for.
 * @returns {number} The index of the first element not less than the target value.
 */
function findLowerBoundIndex(sortedArray, startIndex, endIndex, targetValue) {
  for (var midIndex; 1 < endIndex - startIndex;) {
    midIndex = 0 | (startIndex + endIndex) / 2; // Calculate middle index
    if (sortedArray[midIndex] < targetValue) {
      startIndex = midIndex; // Target is in the upper half
    } else {
      endIndex = midIndex; // Target is in the lower half or at midIndex
    }
  }
  return sortedArray[startIndex] < targetValue ? endIndex : startIndex; // Return the correct lower bound index
}

// Execute the main problem-solving logic and print the result.
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * It calculates a specific sum based on bitwise operations and lower bounds.
 * @returns {number} The final calculated result.
 */
function solveProblem() {
  var arraySize = inputReader.readSingleValue(); // Read N
  var arrayA = inputReader.readLineValues(); // Read array A
  var arrayB = inputReader.readLineValues(); // Read array B
  var finalResult = 0; // Initialize the answer

  // Sort array B in ascending order for binary search.
  arrayB.sort((val1, val2) => val1 - val2);

  // Iterate from the most significant bit down to the least significant bit.
  for (var bitPosition = 28; bitPosition >= 0; bitPosition--) {
    var currentBitValue = 1 << bitPosition; // Current power of 2 (2^bitPosition)
    var doubleBitValue = currentBitValue * 2; // 2 * 2^bitPosition
    var tripleBitValue = currentBitValue * 3; // 3 * 2^bitPosition
    var maskValue = currentBitValue - 1; // Mask for bits less significant than currentBitValue
    var countPairs = arrayA.length * arrayA.length; // Initialize count with a large value

    // Iterate through each element in array A.
    for (var idxA = 0; idxA < arrayA.length; idxA++) {
      // Find indices using lower_bound for specific ranges.
      var idxUpper2T = findLowerBoundIndex(arrayB, 0, arrayB.length, doubleBitValue - arrayA[idxA]);
      var idxLowerT = findLowerBoundIndex(arrayB, 0, idxUpper2T, currentBitValue - arrayA[idxA]);
      var idxUpper3T = findLowerBoundIndex(arrayB, idxUpper2T, arrayB.length, tripleBitValue - arrayA[idxA]);

      // Adjust countPairs based on the found indices.
      countPairs += -idxUpper3T + idxUpper2T - idxLowerT;
    }

    // If the count of pairs is odd, add currentBitValue to the final result.
    if (countPairs % 2) {
      finalResult += currentBitValue;
    }

    // Apply bitwise AND with the mask to both arrays.
    arrayB = arrayB.map(val => val & maskValue);
    arrayA = arrayA.map(val => val & maskValue);

    // For smaller bit positions, filter arrays based on odd counts.
    if (bitPosition < 18) {
      arrayA = filterOddCounts(arrayA, bitPosition);
      arrayB = filterOddCounts(arrayB, bitPosition);
    } else {
      // Otherwise, re-sort array B.
      arrayB.sort((val1, val2) => val1 - val2);
    }
  }

  return finalResult; // Return the final computed answer.

  /**
   * Filters an array, keeping only elements that appear an odd number of times.
   * @param {number[]} inputNumbers The array of numbers to process.
   * @param {number} bitShift A parameter (unused in logic, but part of original signature).
   * @returns {number[]} A new array containing numbers that appeared an odd number of times.
   */
  function filterOddCounts(inputNumbers, bitShift) {
    var frequencyMap = Array(1 << bitShift).fill(0); // Create a frequency map
    var filteredList = []; // Result array

    // Count occurrences of each number.
    for (var currentNum = 0; currentNum < inputNumbers.length; currentNum++) {
      frequencyMap[inputNumbers[currentNum]]++;
    }

    // Add numbers with odd frequencies to the result list.
    for (currentNum = 0; currentNum < frequencyMap.length; currentNum++) {
      if (frequencyMap[currentNum] & 1) { // Check if count is odd using bitwise AND
        filteredList.push(currentNum);
      }
    }
    return filteredList;
  }
}

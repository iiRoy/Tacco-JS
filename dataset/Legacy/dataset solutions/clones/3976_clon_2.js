var DATA_PARSER = (function() {
  // Factory function to create an input reader instance
  function createParser(sourceText) {
    return new InputReader(sourceText);
  }

  // Constructor for the InputReader class
  function InputReader(sourceText) {
    // Store the input source as an array of trimmed lines
    this._sourceLines = sourceText.trim().split("\n");
    // Initialize the current line index
    this._currentLineIndex = 0;
  }

  // Prototype method to read a single value from the current line
  InputReader.prototype.readNextValue = function(returnAsString) {
    var lineData = this._sourceLines;
    var lineIndex = this._currentLineIndex;
    var extractedValue;

    // If the current line hasn't been processed yet, split it and reverse for easy popping
    if (typeof lineData[lineIndex] === "string") {
      lineData[lineIndex] = lineData[lineIndex].split(" ").reverse();
    }

    // Pop the last element (which is the first in original order)
    extractedValue = lineData[lineIndex].pop();

    // If the current line is exhausted, move to the next line
    if (!lineData[lineIndex].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number
    return returnAsString ? extractedValue : +extractedValue;
  };

  // Prototype method to read all values from the current line
  InputReader.prototype.readLineValues = function(returnAsString) {
    var lineValues = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return as strings or convert all to numbers
    return returnAsString ? lineValues : lineValues.map(strValue => +strValue);
  };

  // Prototype method to read a matrix of values over multiple lines
  InputReader.prototype.readMatrix = function(numberOfLines, returnAsString) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines)
      .map(rowString => rowString.split(" "));
    // Return as strings or convert all cells to numbers
    return returnAsString ? matrixRows : matrixRows.map(rowString => rowString.map(cellString => +cellString));
  };

  // Prototype method to read raw lines as strings
  InputReader.prototype.readRawLines = function(numberOfLines, returnAsString) {
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numberOfLines);
    // Return as strings or attempt to convert to numbers (if applicable)
    return returnAsString ? rawLines : rawLines.map(elementVal => +elementVal);
  };

  return createParser;
})();

// Initialize the input handler by reading from standard input
var inputHandler = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving logic and print the result
console.log(solveProblem());

/**
 * Main function to solve the problem.
 * @returns {number} The final calculated answer.
 */
function solveProblem() {
  // Read the number of elements
  var elementCount = inputHandler.readNextValue();
  // Read array A
  var arrayA = inputHandler.readLineValues();
  // Read array B
  var arrayB = inputHandler.readLineValues();

  var finalAnswer = 0; // Accumulator for the final result

  // Iterate from the most significant bit down to the least significant bit
  for (var currentBit = 28; currentBit >= 0; currentBit--) {
    // Apply different sorting/processing strategies based on the bit position
    if (currentBit < 17) {
      arrayB = processBitwise(arrayB, currentBit);
      arrayA = processBitwise(arrayA, currentBit).reverse();
    } else {
      // Sort array B in ascending order
      arrayB.sort((valA, valB) => valA - valB);
      // Sort array A in descending order
      arrayA.sort((valA, valB) => valB - valA);
    }

    // Calculate bit masks for current, double, and triple values
    var bitValue = 1 << currentBit;
    var doubleBitValue = bitValue << 1; // Equivalent to bitValue * 2
    var tripleBitValue = bitValue * 3;

    // Initialize xorCount with the total number of elements
    var xorCount = elementCount;
    var pointerOne, pointerTwo, pointerThree;
    pointerOne = pointerTwo = pointerThree = 0; // Initialize pointers for array B

    // Iterate through elements of array A
    for (var arrayAIndex = 0; arrayAIndex < arrayA.length; arrayAIndex++) {
      // Move pointerOne until condition (bitValue - arrayA[idxA] > arrayB[ptr1]) is false
      while (pointerOne < arrayB.length && bitValue - arrayA[arrayAIndex] > arrayB[pointerOne]) {
        pointerOne++;
      }
      // Move pointerTwo until condition (doubleBitValue - arrayA[idxA] > arrayB[ptr2]) is false
      while (pointerTwo < arrayB.length && doubleBitValue - arrayA[arrayAIndex] > arrayB[pointerTwo]) {
        pointerTwo++;
      }
      // Move pointerThree until condition (tripleBitValue - arrayA[idxA] > arrayB[ptr3]) is false
      while (pointerThree < arrayB.length && tripleBitValue - arrayA[arrayAIndex] > arrayB[pointerThree]) {
        pointerThree++;
      }
      // Update xorCount based on pointer positions
      xorCount += -pointerThree + pointerTwo - pointerOne;
    }

    // If the xorCount is odd, add the current bit's value to the final answer
    if (xorCount % 2) {
      finalAnswer += bitValue;
    }

    // Prepare for the next iteration:
    // Decrement bitValue (used as a mask for the next step)
    bitValue--;
    // Apply bitwise AND with the decremented bitValue to both arrays
    // This effectively clears the current bit and higher bits, keeping only lower bits
    arrayB = arrayB.map(elementVal => elementVal & bitValue);
    arrayA = arrayA.map(elementVal => elementVal & bitValue);
  }

  return finalAnswer;

  /**
   * Processes an array based on a given bit length, returning elements with odd counts.
   * This function seems to be related to finding numbers that have an odd count of a specific bit.
   * @param {number[]} inputCollection - The array to process.
   * @param {number} bitLength - The bit position to consider.
   * @returns {number[]} An array containing elements that appeared an odd number of times
   *                     within the context of the bit length.
   */
  function processBitwise(inputCollection, bitLength) {
    // Create a frequency map for values up to 2^(bitLength+1) - 1
    var valueCounts = Array(1 << (bitLength + 1)).fill(0);
    var filteredResults = [];

    // Populate the frequency map
    for (var counterIndex = 0; counterIndex < inputCollection.length; counterIndex++) {
      valueCounts[inputCollection[counterIndex]]++;
    }

    // Collect indices (values) that have an odd count
    for (counterIndex = 0; counterIndex < valueCounts.length; counterIndex++) {
      if (valueCounts[counterIndex] & 1) { // Check if count is odd using bitwise AND
        filteredResults.push(counterIndex);
      }
    }
    return filteredResults;
  }
}

// This module provides a factory for creating data processing objects.
var InputReaderFactory = (function () {

  // Function to create a new data processing instance.
  function createParser(inputString) {
    return new DataProcessor(inputString);
  }

  // Constructor for the DataProcessor object.
  function DataProcessor(inputString) {
    // Store input lines after trimming and splitting by newline.
    this._contentRows = inputString.trim().split("\n");
    // Initialize the current row pointer to the beginning.
    this._currentRowPointer = 0;
  }

  // Prototype method to extract a single token from the current line.
  DataProcessor.prototype.getNextElement = function (keepOriginalType) {
    var lineBuffer = this._contentRows;
    var currentRow = this._currentRowPointer;
    var extractedValue;

    // If the current line is still a single string, parse it into an array of tokens.
    // The tokens are reversed to allow popping from the end (which is more efficient).
    if (typeof lineBuffer[currentRow] === "string") {
      lineBuffer[currentRow] = lineBuffer[currentRow].split(" ").reverse();
    }

    // Pop the last element (which was originally the first) from the current line's array.
    extractedValue = lineBuffer[currentRow].pop();

    // If the current line is now empty, advance the row pointer to the next line.
    if (!lineBuffer[currentRow].length) {
      this._currentRowPointer++;
    }

    // Return the value. If 'keepOriginalType' is true, return as string; otherwise, convert to number.
    return keepOriginalType ? extractedValue : +extractedValue;
  };

  // Prototype method to read all tokens from the current line as an array.
  DataProcessor.prototype.fetchLineElements = function (preserveTypes) {
    // Split the current line into elements and advance the row pointer.
    var elements = this._contentRows[this._currentRowPointer++].split(" ");

    // Return elements. If 'preserveTypes' is true, return as strings; otherwise, convert each to number.
    return preserveTypes ? elements : elements.map(val => +val);
  };

  // Prototype method to read a specified number of rows as a 2D matrix.
  DataProcessor.prototype.getGrid = function (rowCount, rawMatrix) {
    // Slice the required number of rows and split each row into elements.
    var matrixData = this._contentRows.slice(this._currentRowPointer, this._currentRowPointer += rowCount)
      .map(line => line.split(" "));

    // Return the matrix. If 'rawMatrix' is true, return string matrix; otherwise, convert all elements to numbers.
    return rawMatrix ? matrixData : matrixData.map(row => row.map(val => +val));
  };

  // Prototype method to read a specified number of raw lines as a 1D array.
  DataProcessor.prototype.fetchRows = function (count, rawArray) {
    // Slice the required number of rows.
    var extractedLines = this._contentRows.slice(this._currentRowPointer, this._currentRowPointer += count);

    // Return lines. If 'rawArray' is true, return string array; otherwise, convert each line to a number.
    return rawArray ? extractedLines : extractedLines.map(value => +value);
  };

  // The factory returns the function to create DataProcessor instances.
  return createParser;

})(); // End of InputReaderFactory module.


// Initialize the input processor by reading the entire content of standard input.
var inputProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main calculation function and print its returned result to the console.
console.log(calculateFinalResult());


// Main function to perform the primary algorithmic calculation.
function calculateFinalResult() {
  // Read an initial total count value from the input.
  var totalCount = inputProcessor.getNextElement();
  // Read two separate arrays of numbers from subsequent input lines.
  var primaryList = inputProcessor.fetchLineElements();
  var secondaryList = inputProcessor.fetchLineElements();

  var finalAnswer = 0; // Initialize the variable to accumulate the final result.

  // Loop through bit positions from 28 down to 0, processing each bit.
  for (var bitPosition = 28; bitPosition >= 0; bitPosition--) {

    // Conditional logic based on the current bit position.
    if (bitPosition < 17) {
      // If bit position is less than 17, apply a specific transformation and reversal.
      secondaryList = filterOddCounts(secondaryList, bitPosition);
      primaryList = filterOddCounts(primaryList, bitPosition).reverse();
    } else {
      // For higher bit positions, sort the arrays: secondary ascending, primary descending.
      secondaryList.sort((valA, valB) => valA - valB);
      primaryList.sort((valA, valB) => valB - valA);
    }

    // Calculate powers of two related to the current bit position.
    var currentBitValue = 1 << bitPosition;     // 2^bitPosition
    var twoTimesBitValue = currentBitValue << 1; // 2 * 2^bitPosition
    var threeTimesBitValue = currentBitValue * 3; // 3 * 2^bitPosition

    // Initialize a temporary counter for the current bit's contribution.
    var temporaryCounter = totalCount;
    var pointerOne, pointerTwo, pointerThree;

    // Initialize three pointers for iterating through the secondary list.
    pointerOne = pointerTwo = pointerThree = 0;

    // Iterate through each element in the primary list.
    for (var primaryIndex = 0; primaryIndex < primaryList.length; primaryIndex++) {
      // Advance pointerOne while the sum `currentBitValue - currentPrimaryElement` is greater than `secondaryElement`.
      while (pointerOne < secondaryList.length && currentBitValue - primaryList[primaryIndex] > secondaryList[pointerOne]) {
        pointerOne++;
      }
      // Advance pointerTwo while the sum `twoTimesBitValue - currentPrimaryElement` is greater than `secondaryElement`.
      while (pointerTwo < secondaryList.length && twoTimesBitValue - primaryList[primaryIndex] > secondaryList[pointerTwo]) {
        pointerTwo++;
      }
      // Advance pointerThree while the sum `threeTimesBitValue - currentPrimaryElement` is greater than `secondaryElement`.
      while (pointerThree < secondaryList.length && threeTimesBitValue - primaryList[primaryIndex] > secondaryList[pointerThree]) {
        pointerThree++;
      }
      // Update the temporary counter based on the final positions of the three pointers.
      temporaryCounter += -pointerThree + pointerTwo - pointerOne;
    }

    // If the temporary counter is odd, add the current bit's value to the final answer.
    if (temporaryCounter % 2) {
      finalAnswer += currentBitValue;
    }

    // Decrement the `currentBitValue` to prepare for bitwise AND operations.
    currentBitValue--;

    // Apply a bitwise AND mask to all elements in both lists.
    // This effectively truncates elements to the lower `bitPosition` bits.
    secondaryList = secondaryList.map(value => value & currentBitValue);
    primaryList = primaryList.map(value => value & currentBitValue);
  }

  // Return the final accumulated answer.
  return finalAnswer;


  // Nested helper function to filter a list based on the odd/even counts of elements.
  function filterOddCounts(sourceList, maxBitIndex) {
    // Create a frequency map (array) sized for the given bit limit, initialized with zeros.
    var frequencyMap = Array(1 << (maxBitIndex + 1)).fill(0);
    var resultCollection = []; // Array to store elements with odd frequencies.

    // Iterate through the source list to populate the frequency map.
    for (var elementIndex = 0; elementIndex < sourceList.length; elementIndex++) {
      frequencyMap[sourceList[elementIndex]]++;
    }

    // Iterate through the frequency map to find elements with an odd count.
    for (elementIndex = 0; elementIndex < frequencyMap.length; elementIndex++) {
      // If the count is odd (bitwise AND with 1 is 1), add the element's value to the result.
      if (frequencyMap[elementIndex] & 1) {
        resultCollection.push(elementIndex);
      }
    }
    return resultCollection; // Return the filtered collection.
  }
}
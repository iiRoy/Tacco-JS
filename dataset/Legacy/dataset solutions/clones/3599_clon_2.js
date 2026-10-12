function InputReader(inputString) {
  // Stores the input string, split into an array of lines.
  this._sourceLines = inputString.split("\n");
  // Keeps track of the current line being processed.
  this._currentLineIndex = 0;
}

// Defines methods for the InputReader prototype to handle various input formats.
InputReader.prototype = {
  // Reads a single token from the current line.
  // If 'parseAsNumber' is true, attempts to convert the token to a number.
  readAtom: function(parseAsNumber) {
    let lineData = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let extractedValue;

    // If the current line hasn't been tokenized yet, split it by spaces and reverse
    // so that `pop()` retrieves tokens in their original order.
    if (typeof lineData[lineIdx] === "string") {
      lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
    }

    // Get the next token from the current line.
    extractedValue = lineData[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return the token, optionally parsed as a number.
    return parseAsNumber ? extractedValue : +extractedValue;
  },

  // Reads an entire line and returns it as an array of tokens.
  // If 'returnStrings' is true, tokens are kept as strings; otherwise, they are converted to numbers.
  readLine: function(returnStrings) {
    // Get the current line, increment the index, and split it by spaces.
    let lineValues = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the array of tokens, mapping to numbers if required.
    return returnStrings ? lineValues : lineValues.map(itemStr => +itemStr);
  },

  // Reads a specified number of lines, treating them as rows of a matrix.
  // 'numRows' specifies how many lines to read.
  // If 'returnStrings' is true, tokens are kept as strings; otherwise, they are converted to numbers.
  readMatrix: function(numRows, returnStrings) {
    let lineData = this._sourceLines;
    let lineIdx = this._currentLineIndex;
    let outputArray = [];
    let rowIndex = 0;

    // Iterate through the specified number of rows.
    if (returnStrings) {
      for (; rowIndex < numRows; rowIndex++) {
        outputArray[rowIndex] = lineData[lineIdx + rowIndex].split(" ");
      }
    } else {
      for (; rowIndex < numRows; rowIndex++) {
        outputArray[rowIndex] = lineData[lineIdx + rowIndex].split(" ").map(itemStr => +itemStr);
      }
    }

    // Advance the current line index by the number of rows read.
    this._currentLineIndex += numRows;
    return outputArray;
  },
};

// Initialize an input processor by reading the entire standard input.
let inputProcessor = new InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Calculates the number of inversions in an array using a modified merge sort approach.
function calculateInversions(inputArray) {
  let arrayLength = inputArray.length;
  let inversionCount = 0; // Accumulator for inversions.

  // The outer loop controls the size of the sub-arrays being merged (1, 2, 4, ...).
  for (let mergeBlockSize = 1; mergeBlockSize < arrayLength; mergeBlockSize <<= 1) {
    let mergedArray = []; // Temporary array to store the result of the current merge pass.
    for (let currentPosition = 0; currentPosition < arrayLength;) {
      // Define the boundaries for the two sub-arrays to be merged in this step.
      let leftBlockStart = currentPosition;
      let rightBlockStart = Math.min(arrayLength, leftBlockStart + mergeBlockSize);
      let leftBlockEnd = rightBlockStart; // The end of the first block is the start of the second.
      let rightBlockEnd = Math.min(arrayLength, rightBlockStart + mergeBlockSize);

      // Merge the two sub-arrays into 'mergedArray'.
      while (currentPosition < rightBlockEnd) {
        if (leftBlockStart === leftBlockEnd) {
          // If the left block is exhausted, take elements from the right block.
          mergedArray[currentPosition] = inputArray[rightBlockStart++];
        } else if (rightBlockStart === rightBlockEnd) {
          // If the right block is exhausted, take elements from the left block.
          mergedArray[currentPosition] = inputArray[leftBlockStart++];
        } else if (inputArray[leftBlockStart] > inputArray[rightBlockStart]) {
          // If an element from the left block is greater than an element from the right block,
          // an inversion is found. The number of remaining elements in the left block
          // are all greater than the current right block element.
          inversionCount += leftBlockEnd - leftBlockStart;
          mergedArray[currentPosition] = inputArray[rightBlockStart++];
        } else {
          // No inversion, take the smaller element from the left block.
          mergedArray[currentPosition] = inputArray[leftBlockStart++];
        }
        currentPosition++;
      }
    }
    // After each pass, the 'inputArray' is updated with the sorted 'mergedArray'
    // for the next merge iteration.
    inputArray = mergedArray;
  }
  return inversionCount;
}

// Output the result of the main problem-solving function.
console.log(solveProblem());

// The main function that orchestrates the problem solution.
function solveProblem() {
  // Read the size of the input array.
  let arraySize = inputProcessor.readAtom();
  // Read the elements of the input array.
  let dataArray = inputProcessor.readLine();

  // Handle edge cases for very small arrays.
  if (arraySize <= 2) {
    return Math.max(...dataArray);
  }

  // Calculate the target position for the median-like element.
  // This formula is specific to the problem's definition of "median of medians" or similar.
  let targetPosition = Math.floor(arraySize * (arraySize + 1) / 4 + 1);

  // Perform a binary search to find the desired value.
  let lowerBound = 2; // The minimum possible value for the search range.
  let upperBound = 1_000_000_000 + 1; // The maximum possible value + 1 for the search range.

  while (lowerBound < upperBound) {
    let midValue = (lowerBound + upperBound) >>> 1; // Calculate the middle value efficiently.
    let prefixSumArray = [0]; // Initialize an array for prefix sums.

    // Populate the prefix sum array based on comparison with 'midValue'.
    // Elements less than 'midValue' contribute -1, others contribute +1.
    for (let elementIndex = 0; elementIndex < arraySize; elementIndex++) {
      prefixSumArray[elementIndex + 1] = prefixSumArray[elementIndex];
      if (dataArray[elementIndex] < midValue) {
        prefixSumArray[elementIndex + 1]--;
      } else {
        prefixSumArray[elementIndex + 1]++;
      }
    }

    // Use the inversion count of the prefix sum array to guide the binary search.
    // If the number of inversions is less than the target, 'midValue' is too small.
    if (calculateInversions(prefixSumArray) < targetPosition) {
      lowerBound = midValue + 1;
    } else {
      // Otherwise, 'midValue' is potentially the answer or too large.
      upperBound = midValue;
    }
  }
  // The binary search finds the smallest value that satisfies the condition.
  // We need the largest value that *doesn't* satisfy it, hence 'lowerBound - 1'.
  return lowerBound - 1;
}

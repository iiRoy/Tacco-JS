var INPUT_PARSER = (function() {
  // This function creates a new text processing instance.
  function createParser(sourceText) {
    return new TextProcessor(sourceText);
  }

  // The TextProcessor class handles parsing input lines.
  function TextProcessor(sourceText) {
    // Store lines after trimming and splitting by newline.
    this._lines = sourceText.trim().split("\n");
    // Initialize current line index.
    this._lineIndex = 0;
  }

  // Method to extract the next value from the current line.
  TextProcessor.prototype.nextValue = function(asString) {
    var currentLines = this._lines;
    var currentIndex = this._lineIndex;
    var extractedToken;

    // If the current line hasn't been split into tokens yet, do it.
    if (typeof currentLines[currentIndex] === "string") {
      currentLines[currentIndex] = currentLines[currentIndex].split(" ").reverse();
    }

    // Pop the last token (which is the first in original order due to reverse).
    extractedToken = currentLines[currentIndex].pop();

    // If the current line is exhausted, advance to the next line.
    if (!currentLines[currentIndex].length) {
      this._lineIndex++;
    }

    // Return as string or number based on the 'asString' flag.
    return asString ? extractedToken : +extractedToken;
  };

  // Method to read an entire line and split it into tokens.
  TextProcessor.prototype.nextLine = function(keepStrings) {
    // Get the current line, increment index, and split by space.
    var lineTokens = this._lines[this._lineIndex++].split(" ");
    // Return as strings or numbers based on 'keepStrings' flag.
    return keepStrings ? lineTokens : lineTokens.map(tokenStr => +tokenStr);
  };

  // Method to read a matrix of 'numRows' rows.
  TextProcessor.prototype.nextMatrix = function(numRows, stringMode) {
    // Slice the relevant lines and map them to arrays of tokens.
    var resultMatrix = this._lines.slice(this._lineIndex, this._lineIndex += numRows).map(rowStr => rowStr.split(" "));
    // If not in string mode, convert all elements to numbers.
    return stringMode ? resultMatrix : resultMatrix.map(row => row.map(elementStr => +elementStr));
  };

  // Method to read a vector (array) of 'count' elements.
  TextProcessor.prototype.nextVector = function(count, rawStrings) {
    // Slice the relevant lines.
    var resultArray = this._lines.slice(this._lineIndex, this._lineIndex += count);
    // If not in raw string mode, convert all elements to numbers.
    return rawStrings ? resultArray : resultArray.map(element => +element);
  };

  return createParser;
})();

// Initialize the input parser with content from stdin.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Helper function to create multi-dimensional arrays.
function createMultiDimArray(initialValue) {
  var argsList = arguments;
  var argCount = argsList.length;
  var arrayCreationString = "Array(argsList[" + --argCount + "]).fill(0).map(_=>{return " + initialValue + ";})";
  while (--argCount) {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(_=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Function to find the upper bound index in a sorted array.
function findUpperBoundIndex(dataArray, lowIndex, highIndex, targetValue) {
  for (var midIndex; 1 < highIndex - lowIndex;) {
    midIndex = 0 | (lowIndex + highIndex) / 2; // Integer division
    if (dataArray[midIndex] <= targetValue) {
      lowIndex = midIndex;
    } else {
      highIndex = midIndex;
    }
  }
  // Return highIndex if dataArray[lowIndex] <= targetValue, otherwise lowIndex.
  return dataArray[lowIndex] <= targetValue ? highIndex : lowIndex;
}

// Output the result of the main processing function.
console.log(processSequence());

// Main function to solve the problem.
function processSequence() {
  // Read the length of the sequence.
  var sequenceLength = inputData.nextValue();
  // Read the sequence of numbers.
  var inputSequence = inputData.nextVector(sequenceLength);

  // Initialize an array to store the smallest end element of an increasing subsequence of a given length.
  // For LIS, we store positive values. For LDS (Longest Decreasing Subsequence), we store negative values.
  // The problem is effectively finding the LIS of the negated sequence.
  var longestIncreasingSubsequenceNegated = [1]; // Start with a dummy value, will be replaced.

  // Iterate through each element of the input sequence.
  for (var idx = 0; idx < sequenceLength; idx++) {
    // Negate the current element.
    var currentNegatedValue = -inputSequence[idx];
    // Find the insertion point for 'currentNegatedValue' in 'longestIncreasingSubsequenceNegated'
    // such that 'longestIncreasingSubsequenceNegated' remains sorted (non-decreasing).
    // This is essentially finding the smallest element in 'longestIncreasingSubsequenceNegated'
    // that is greater than or equal to 'currentNegatedValue'.
    var insertionPoint = findUpperBoundIndex(longestIncreasingSubsequenceNegated, 0, longestIncreasingSubsequenceNegated.length, currentNegatedValue);

    // If 'currentNegatedValue' is greater than all elements in 'longestIncreasingSubsequenceNegated',
    // it extends the longest subsequence, so append it.
    // Otherwise, replace the element at 'insertionPoint' with 'currentNegatedValue'
    // to potentially allow for a longer subsequence later.
    longestIncreasingSubsequenceNegated[insertionPoint] = currentNegatedValue;
  }

  // The length of 'longestIncreasingSubsequenceNegated' is the length of the Longest Decreasing Subsequence.
  return longestIncreasingSubsequenceNegated.length;
}

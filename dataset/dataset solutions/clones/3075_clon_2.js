var INPUT_PARSER = (function() {
  // Factory function to create a new parser instance
  function createParser(sourceText) {
    return new InputSource(sourceText);
  }

  // Class to handle parsing input lines
  function InputSource(sourceText) {
    this._sourceLines = sourceText.trim().split("\n"); // Store all lines
    this._currentLineIndex = 0; // Current line being processed
  }

  // Method to read a single token from the current line
  InputSource.prototype.readNextToken = function(asString) {
    var lines = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultToken;

    // If the current line hasn't been split into tokens yet, do it
    if (typeof lines[lineIdx] === "string") {
      lines[lineIdx] = lines[lineIdx].split(" ").reverse(); // Split and reverse for efficient pop
    }

    resultToken = lines[lineIdx].pop(); // Get the last token

    // If the current line is exhausted, move to the next
    if (!lines[lineIdx].length) {
      this._currentLineIndex++;
    }

    return asString ? resultToken : +resultToken; // Return as string or number
  };

  // Method to read all tokens from the current line
  InputSource.prototype.readLineTokens = function(asStrings) {
    var tokens = this._sourceLines[this._currentLineIndex++].split(" ");
    return asStrings ? tokens : tokens.map(val => +val);
  };

  // Method to read a matrix (multiple lines, each split into tokens)
  InputSource.prototype.readMatrix = function(numRows, asStrings) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
                                      .map(line => line.split(" "));
    return asStrings ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  // Method to read raw lines (without splitting into tokens)
  InputSource.prototype.readRawLines = function(numLines, asStrings) {
    var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asStrings ? rawLines : rawLines.map(line => +line);
  };

  return createParser;
})();

var inputReader = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

function createMultiDimArray(initialValue) {
  var allArgs = arguments;
  var argCount = allArgs.length;
  var arrayCreationString = "Array(allArgs[" + --argCount + "]).fill(initialValue)";

  while (--argCount) {
    arrayCreationString = "Array(allArgs[" + argCount + "]).fill(0).map(_ => " + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

function findKthSmallest(dataArray, kthIndex) {
  // Adjust k to be 0-indexed
  --kthIndex;

  var leftPointer = 0;
  var rightPointer = dataArray.length - 1;

  while (leftPointer < rightPointer) {
    var pivotIndex = leftPointer - 1;
    var scanIndex = rightPointer;
    var medianIndex = leftPointer + rightPointer >> 1; // Bitwise right shift for integer division

    var pivotValue = dataArray[medianIndex];
    var tempSwap;

    // Move pivot to the end
    dataArray[medianIndex] = dataArray[rightPointer];
    dataArray[rightPointer] = pivotValue;

    // Partitioning loop
    while (true) {
      while (pivotIndex < scanIndex) {
        if (pivotValue < dataArray[++pivotIndex]) {
          break;
        }
      }
      while (pivotIndex < scanIndex) {
        if (dataArray[--scanIndex] < pivotValue) {
          break;
        }
      }
      if (scanIndex <= pivotIndex) {
        break; // Partitioning complete
      }
      // Swap elements
      tempSwap = dataArray[pivotIndex];
      dataArray[pivotIndex] = dataArray[scanIndex];
      dataArray[scanIndex] = tempSwap;
    }

    // Restore pivot to its final sorted position
    dataArray[rightPointer] = dataArray[pivotIndex];
    dataArray[pivotIndex] = pivotValue;

    // Adjust pointers for next iteration
    if (pivotIndex < kthIndex) {
      leftPointer = pivotIndex + 1;
    } else if (kthIndex < pivotIndex) {
      rightPointer = pivotIndex - 1;
    } else {
      break; // Found the k-th element
    }
  }
  return dataArray[kthIndex]; // Return the k-th smallest element
}

console.log(processInputAndCalculate());

function processInputAndCalculate() {
  // Read input values
  var countX = inputReader.readNextToken();
  var countY = inputReader.readNextToken();
  var countZ = inputReader.readNextToken();
  var topK = inputReader.readNextToken();

  // Read and sort arrays in descending order
  var arrayA = inputReader.readLineTokens().sort((val1, val2) => val2 - val1);
  var arrayB = inputReader.readLineTokens().sort((val1, val2) => val2 - val1);
  var arrayC = inputReader.readLineTokens().sort((val1, val2) => val2 - val1);

  // Calculate all possible sums of elements from arrayA and arrayB
  var intermediateSums = [];
  for (var idx1 = 0; idx1 < countX; idx1++) {
    for (var idx2 = 0; idx2 < countY; idx2++) {
      intermediateSums.push(arrayA[idx1] + arrayB[idx2]);
    }
  }

  // If the number of intermediate sums exceeds topK, reduce it to the topK largest
  if (topK < intermediateSums.length) {
    intermediateSums = getTopKElements(intermediateSums, topK);
  }

  // Sort the intermediate sums in descending order
  intermediateSums.sort((val1, val2) => val2 - val1);

  // Calculate final results by adding elements from arrayC to intermediate sums
  var finalResults = [];
  for (var idx1 = 0; idx1 < countZ; idx1++) {
    var limit = Math.min(intermediateSums.length, topK - idx1);
    for (var idx2 = 0; idx2 < limit; idx2++) {
      finalResults.push(arrayC[idx1] + intermediateSums[idx2]);
    }
  }

  // If the number of final results exceeds topK, reduce it to the topK largest
  if (topK < finalResults.length) {
    finalResults = getTopKElements(finalResults, topK);
  }

  // Sort the final results in descending order and join them with newlines
  return finalResults.sort((val1, val2) => val2 - val1).join("\n");
}

function getTopKElements(inputCollection, numElements) {
  // Use findKthSmallest to find the (length - numElements)-th smallest element.
  // This effectively partitions the array such that the largest 'numElements' are at the end.
  findKthSmallest(inputCollection, inputCollection.length - numElements);
  // Return the slice containing the largest 'numElements'
  return inputCollection.slice(inputCollection.length - numElements);
}

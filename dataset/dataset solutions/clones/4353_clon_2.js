var inputHandler = initializeInputProcessor();

processMatrixData();

function retrieveInteger() {
  return convertInputData(getNextLine(), 1);
}

function retrieveStringArray() {
  return convertInputData(getNextLine(), 2);
} // Splits by space

function retrieveIntegerArray() {
  return convertInputData(getNextLine(), 4);
} // Splits by space and converts to numbers

function retrieveCharacterArray() {
  return convertInputData(getNextLine(), 6);
} // Splits into individual characters

function getNextLine() {
  return inputHandler.getNextLine();
}

function hasMoreLines() {
  return inputHandler.hasMoreLines();
}

function readInputFile() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

function initializeInputProcessor() {
  var rawInputLines = readInputFile();
  var inputProcessor = {
    lineBuffer: rawInputLines,
    currentLineIndex: 0,
    totalLines: rawInputLines.length,
    hasMoreLines: function () {
      return this.currentLineIndex < this.totalLines;
    },
    getNextLine: function () {
      if (!this.hasMoreLines()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var currentInputLine = this.lineBuffer[this.currentLineIndex];
        this.currentLineIndex++;
        return currentInputLine;
      }
    },
  };
  return inputProcessor;
}

function printToConsole(content) {
  console.log(content);
} // Standard output

function logToErrorStream(message) {
  console.error(message);
} // Standard error output

// This function handles various input data conversions.
// conversionType:
//   1: Convert to integer
//   2: Split by space into string array
//   4: Split by space and convert to integer array
//   6: Split into character array
//   7: Split into character array and convert to integer array
//   8: Join array elements with space
//   9: Join array elements with newline
//   0: Join array elements without separator
// Default: Returns input as is.
function convertInputData(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((elementStr) => Number(elementStr));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((elementStr) => Number(elementStr));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (errorDetails) {
    return inputVal; // Return original value on conversion error
  }
}

function processMatrixData() {
  var matrixSize = retrieveInteger();
  var adjacencyMatrix = new Array(matrixSize);

  for (var rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
    adjacencyMatrix[rowIdx] = retrieveIntegerArray();
  }

  var redundantPathSum = 0;
  var totalEdgeWeight = 0;

  // Calculate initial sum of all edge weights
  for (var rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
    for (var colIdx = 0; colIdx < matrixSize; colIdx++) {
      totalEdgeWeight += adjacencyMatrix[rowIdx][colIdx];
    }
  }

  logToErrorStream(totalEdgeWeight);

  totalEdgeWeight /= 2; // Each edge is counted twice (i->j and j->i)

  var processedPairs = new Set();

  // Floyd-Warshall-like iteration to find redundant paths
  for (var intermediateNodeIdx = 0; intermediateNodeIdx < matrixSize; intermediateNodeIdx++) {
    for (var rowIdx = 0; rowIdx < matrixSize; rowIdx++) {
      for (var destinationNodeIdx = 0; destinationNodeIdx < matrixSize; destinationNodeIdx++) {
        // If a direct path is longer than a path through an intermediate node, it's an invalid graph
        if (
          adjacencyMatrix[rowIdx][destinationNodeIdx] >
          adjacencyMatrix[rowIdx][intermediateNodeIdx] + adjacencyMatrix[intermediateNodeIdx][destinationNodeIdx]
        ) {
          printToConsole(-1);
          return;
        } else if (
          adjacencyMatrix[rowIdx][destinationNodeIdx] ==
            adjacencyMatrix[rowIdx][intermediateNodeIdx] + adjacencyMatrix[intermediateNodeIdx][destinationNodeIdx] &&
          rowIdx != intermediateNodeIdx &&
          destinationNodeIdx != intermediateNodeIdx
        ) {
          // If a direct path is equal to a path through an intermediate node, it's a redundant edge
          // We only want to count each unique redundant edge once (e.g., (i,j) not (j,i) again)
          var pairIdentifier =
            Math.min(rowIdx, destinationNodeIdx).toString() +
            ":" +
            Math.max(rowIdx, destinationNodeIdx).toString();

          if (!processedPairs.has(pairIdentifier)) {
            redundantPathSum += adjacencyMatrix[rowIdx][destinationNodeIdx];
            processedPairs.add(pairIdentifier);
            // logToErrorStream((rowIdx + 1) + "," + (destinationNodeIdx + 1) + "," + (intermediateNodeIdx + 1));
          }
        }
      }
    }
  }

  logToErrorStream(redundantPathSum);
  // redundantPathSum /= 2; // This line was commented out in the original, so keep it commented.

  printToConsole(totalEdgeWeight - redundantPathSum);
}

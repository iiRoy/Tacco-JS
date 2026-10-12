var inputHandler = initializeInputProcessor();

primaryExecutionRoutine();

/**
 * Retrieves the next line from the input buffer and parses it as an integer.
 * @returns {number} The integer value from the next input line.
 */
function getNextInteger() {
  return performTypeConversion(fetchNextLine(), 1);
}

/**
 * Fetches the next input line and splits it into an array of strings using space as a delimiter.
 * @returns {string[]} An array containing string segments from the input line.
 */
function getNextStringArray() {
  return performTypeConversion(fetchNextLine(), 2);
}

/**
 * Reads the next input line, splits it by spaces, and converts each segment into a number.
 * @returns {number[]} An array of numbers parsed from the input line.
 */
function getNextIntegerArray() {
  return performTypeConversion(fetchNextLine(), 4);
}

/**
 * Obtains the next input line and breaks it down into an array of individual characters.
 * @returns {string[]} An array of characters from the input line.
 */
function getNextCharacterArray() {
  return performTypeConversion(fetchNextLine(), 6);
}

/**
 * Delegates to the input handler to get the subsequent line of input.
 * @returns {string} The next available line of input.
 */
function fetchNextLine() {
  return inputHandler.next();
}

/**
 * Delegates to the input handler to check if there are more lines to process.
 * @returns {boolean} True if more input lines are available, false otherwise.
 */
function hasMoreInputLines() {
  return inputHandler.hasNext();
}

/**
 * Reads the entire content from standard input, processes it, and returns an array of lines.
 * @returns {string[]} An array where each element is a line from the standard input.
 */
function readStandardInput() {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
}

/**
 * Initializes and returns an object responsible for managing and providing input lines.
 * This object maintains the state of input consumption.
 * @returns {object} An input processor object with methods to access input.
 */
function initializeInputProcessor() {
  var rawInputLines = readStandardInput();
  var inputDataProcessor = {
    "lineBuffer": rawInputLines,
    "currentLinePointer": 0,
    "totalAvailableLines": rawInputLines.length,

    /**
     * Determines if there are additional lines remaining in the input buffer.
     * @returns {boolean} True if the current pointer is within the bounds of available lines.
     */
    "hasNext": function() {
      return (this.currentLinePointer < this.totalAvailableLines);
    },

    /**
     * Retrieves the next line from the buffer and increments the line pointer.
     * Throws an error if an attempt is made to read beyond the end of the input.
     * @returns {string} The line at the current pointer's position.
     */
    "next": function() {
      if (!this.hasNext()) {
        throw "ArrayIndexOutOfBoundsException これ以上ないよ";
      } else {
        var returnInput = this.lineBuffer[this.currentLinePointer];
        this.currentLinePointer++;
        return returnInput;
      }
    }
  };
  return inputDataProcessor;
}

/**
 * Outputs the provided content to the standard console.
 * @param {*} content The data to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Outputs the provided content to the standard error console.
 * @param {*} content The error information to be displayed.
 */
function logError(content) {
  console.error(content);
}

/**
 * Performs various data type conversions based on a specified mode.
 * Handles parsing integers, splitting strings, and mapping to numbers.
 * @param {*} inputVal The value to be converted.
 * @param {number} conversionMode An integer code indicating the desired conversion type.
 * @returns {*} The converted value, or the original value if conversion fails or mode is unknown.
 */
function performTypeConversion(inputVal, conversionMode) {
  try {
    switch (conversionMode) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(" ");
      case 4:
        return inputVal.split(" ").map((stringElement) => Number(stringElement));
      case 6:
        return inputVal.split("");
      case 7:
        return inputVal.split("").map((stringElement) => Number(stringElement));
      case 8:
        return inputVal.join(" ");
      case 9:
        return inputVal.join("\n");
      case 0:
        return inputVal.join("");
      default:
        return inputVal;
    }
  } catch (conversionFailure) {
    return inputVal;
  }
}

/**
 * The core logic of the application.
 * It reads a square matrix, calculates a total sum, and then adjusts it
 * by identifying and subtracting redundant path weights based on a shortest-path-like condition.
 */
function primaryExecutionRoutine() {
  // Read the dimension (N) for the N x N matrix.
  var dimensionSize = getNextInteger();

  // Initialize the adjacency matrix.
  var adjacencyMatrix = new Array(dimensionSize);
  for (var rowIterator = 0; rowIterator < dimensionSize; rowIterator++) {
    adjacencyMatrix[rowIterator] = getNextIntegerArray();
  }

  // Variables to store accumulated sums.
  var redundantEdgeWeightSum = 0;
  var totalEdgeWeightSum = 0;

  // Calculate the initial sum of all elements in the matrix.
  for (var rowIterator = 0; rowIterator < dimensionSize; rowIterator++) {
    for (var colIterator = 0; colIterator < dimensionSize; colIterator++) {
      totalEdgeWeightSum += adjacencyMatrix[rowIterator][colIterator];
    }
  }
  // Divide by 2 because each edge (i,j) is typically represented twice (as (i,j) and (j,i)).
  totalEdgeWeightSum /= 2;

  // Apply a modified Floyd-Warshall algorithm logic.
  // Iterate through all possible intermediate nodes.
  for (var intermediateNodeIterator = 0; intermediateNodeIterator < dimensionSize; intermediateNodeIterator++) {
    // Iterate through all possible source nodes.
    for (var rowIterator = 0; rowIterator < dimensionSize; rowIterator++) {
      // Iterate through all possible destination nodes.
      for (var colIterator = 0; colIterator < dimensionSize; colIterator++) {
        // If a direct path (i,j) is longer than a path through an intermediate node (i,k) + (k,j),
        // it indicates an inconsistency in the given matrix (e.g., negative cycle or invalid shortest paths).
        if (adjacencyMatrix[rowIterator][colIterator] > (adjacencyMatrix[rowIterator][intermediateNodeIterator] + adjacencyMatrix[intermediateNodeIterator][colIterator])) {
          displayResult(-1); // Output -1 and exit immediately.
          return;
        }
        // If a direct path (i,j) is equal to a path through an intermediate node (i,k) + (k,j),
        // and i, j, k are distinct, then the direct path (i,j) is considered redundant
        // as an equally short path exists via 'k'.
        else if (adjacencyMatrix[rowIterator][colIterator] === (adjacencyMatrix[rowIterator][intermediateNodeIterator] + adjacencyMatrix[intermediateNodeIterator][colIterator]) &&
          rowIterator !== intermediateNodeIterator &&
          colIterator !== intermediateNodeIterator) {
          redundantEdgeWeightSum += adjacencyMatrix[rowIterator][colIterator];
        }
      }
    }
  }

  // Divide the sum of redundant edge weights by 2 for the same reason as totalEdgeWeightSum.
  redundantEdgeWeightSum /= 2;

  // The final result is the total sum of edge weights minus the sum of redundant edge weights.
  displayResult(totalEdgeWeightSum - redundantEdgeWeightSum);
}

const inputHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let parsedInputData;
const bufferedLines = [];

// Event listener for each line of input received
inputHandler.on('line', (currentLine) => {
  bufferedLines.push(currentLine);
});

// Event listener for when input stream closes
inputHandler.on('close', () => {
  parsedInputData = initializeInputParser(bufferedLines);
  console.error('\n'); // Add a newline for better debug output separation

  const startTime = Date.now();
  processSolution(); // Execute the main logic
  const elapsedTime = Date.now() - startTime;

  logDebugMessage(`Execution Time: ${elapsedTime} milliseconds`);
  logDebugMessage(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of a simple JSON-serializable object.
 * @param {object} originalObject - The object to clone.
 * @returns {object} A deep clone of the object.
 */
function createDeepCopy(originalObject) {
  return JSON.parse(JSON.stringify(originalObject));
}

// Enum-like object for data transformation types
const TransformationType = {
  INTEGER: 1,
  STRING_ARRAY_SPLIT_SPACE: 2,
  INTEGER_ARRAY_SPLIT_SPACE: 4,
  CHAR_ARRAY_SPLIT: 6,
  INTEGER_ARRAY_SPLIT_CHAR: 7,
  ARRAY_JOIN_SPACE: 8,
  ARRAY_JOIN_NEWLINE: 9,
  ARRAY_JOIN_NO_SEPARATOR: 0
};

/**
 * Retrieves the next integer from the input stream.
 * @returns {number} The next integer.
 */
function getNextInteger() {
  return dataTransformer(fetchNextInputToken(), TransformationType.INTEGER);
}

/**
 * Retrieves the next string array (space-separated) from the input stream.
 * @returns {string[]} The next string array.
 */
function getNextStringArray() {
  return dataTransformer(fetchNextInputToken(), TransformationType.STRING_ARRAY_SPLIT_SPACE);
}

/**
 * Retrieves the next integer array (space-separated) from the input stream.
 * @returns {number[]} The next integer array.
 */
function getNextIntegerArray() {
  return dataTransformer(fetchNextInputToken(), TransformationType.INTEGER_ARRAY_SPLIT_SPACE);
}

/**
 * Retrieves the next character array from the input stream.
 * @returns {string[]} The next character array.
 */
function getNextCharacterArray() {
  return dataTransformer(fetchNextInputToken(), TransformationType.CHAR_ARRAY_SPLIT);
}

/**
 * Fetches the next raw token from the input stream.
 * @returns {string} The next input token.
 */
function fetchNextInputToken() {
  return parsedInputData.readNextToken();
}

/**
 * Checks if there are more tokens in the input stream.
 * @returns {boolean} True if more tokens are available, false otherwise.
 */
function hasMoreInputTokens() {
  return parsedInputData.hasRemainingTokens();
}

/**
 * Initializes the input parser utility.
 * @param {string[]} inputLines - An array of raw input lines.
 * @returns {object} An object with methods to consume input.
 */
function initializeInputParser(inputLines) {
  let currentLineIndex = 0;
  const totalLines = inputLines.length;

  return {
    inputSource: inputLines,
    currentIndex: currentLineIndex,
    maximumLines: totalLines,

    /**
     * Checks if there are more lines to read.
     * @returns {boolean} True if more lines are available.
     */
    hasRemainingTokens: function() {
      return (this.currentIndex < this.maximumLines);
    },

    /**
     * Reads and returns the next line from the input.
     * Throws an error if no more input is available.
     * @returns {string} The next line of input.
     */
    readNextToken: function() {
      if (!this.hasRemainingTokens()) {
        throw new Error("EndOfInputException: No more input lines are available for processing.");
      }
      return this.inputSource[this.currentIndex++];
    }
  };
}

/**
 * Prints a message to standard output.
 * @param {any} message - The message to be displayed.
 */
function displayOutput(message) {
  console.log(message);
}

/**
 * Prints a debug message to standard error.
 * @param {any} debugInfo - The information to be logged.
 */
function logDebugMessage(debugInfo) {
  // Using custom inspection for better readability of complex objects.
  console.error(`DEBUG: ${require("util").inspect(debugInfo, { showHidden: false, depth: null, colors: true })}`);
}

/**
 * Transforms input data based on a specified type.
 * @param {any} inputData - The data to be transformed.
 * @param {TransformationType} conversionType - The type of transformation to apply.
 * @returns {any} The transformed data, or original data if transformation fails/is unknown.
 */
function dataTransformer(inputData, conversionType) {
  try {
    switch (conversionType) {
      case TransformationType.INTEGER:
        return parseInt(inputData, 10);
      case TransformationType.STRING_ARRAY_SPLIT_SPACE:
        return inputData.split(" ");
      case TransformationType.INTEGER_ARRAY_SPLIT_SPACE:
        return inputData.split(" ").map(Number);
      case TransformationType.CHAR_ARRAY_SPLIT:
        return inputData.split("");
      case TransformationType.INTEGER_ARRAY_SPLIT_CHAR:
        return inputData.split("").map(Number);
      case TransformationType.ARRAY_JOIN_SPACE:
        if (Array.isArray(inputData)) return inputData.join(" ");
        return inputData; // Return original if not an array
      case TransformationType.ARRAY_JOIN_NEWLINE:
        if (Array.isArray(inputData)) return inputData.join("\n");
        return inputData;
      case TransformationType.ARRAY_JOIN_NO_SEPARATOR:
        if (Array.isArray(inputData)) return inputData.join("");
        return inputData;
      default:
        // For unknown types, return the original data.
        logDebugMessage(`Warning: Unknown transformation type ${conversionType}. Returning original data.`);
        return inputData;
    }
  } catch (error) {
    logDebugMessage(`Error during data transformation (type: ${conversionType}): ${error.message}`);
    return inputData; // On error, return original data
  }
}

//--------------------------------------------------------------------------------------------------
// Main problem-solving logic starts here
//--------------------------------------------------------------------------------------------------

/**
 * Executes the core problem-solving algorithm.
 */
function processSolution() {
  const targetNumber = getNextInteger(); // Read the input 'N'

  if (targetNumber <= 0) {
    displayOutput("No"); // Handle non-positive input as an invalid case
    return;
  }

  let currentCandidate = 0;
  let isTriangleNumber = false;
  let dimensionSize = 0; // Will store 'k' if N is a triangle number

  // Search for 'k' such that N = k * (k + 1) / 2
  while (true) {
    currentCandidate++;
    const triangleSum = (currentCandidate * (currentCandidate + 1)) / 2;

    if (triangleSum === targetNumber) {
      isTriangleNumber = true;
      dimensionSize = currentCandidate; // Found the 'k'
      break;
    }

    // Optimization: If the current triangle sum exceeds N, no larger k will work
    if (triangleSum > targetNumber) {
      break;
    }
  }

  // If N is not a triangle number, output "No" and exit
  if (!isTriangleNumber) {
    displayOutput("No");
    return;
  }

  // If it is a triangle number, output "Yes" and proceed to construct the matrix
  displayOutput("Yes");

  // Initialize the connection graph (matrix) with appropriate dimensions
  // The problem implies a matrix of size (k+1) x k
  const connectionGraph = Array.from({
    length: dimensionSize + 1
  }, () => new Array(dimensionSize).fill(0));

  let edgeLabel = 1; // Counter for assigning unique labels to connections

  // Populate the connection graph
  // This nested loop structure ensures a specific pattern of connections
  // where list[i][j] and list[j+1][i] get the same label.
  // This effectively builds a structure representing sets and their common elements.
  for (let rowIdx = 0; rowIdx < dimensionSize; rowIdx++) {
    for (let colIdx = rowIdx; colIdx < dimensionSize; colIdx++) {
      connectionGraph[rowIdx][colIdx] = edgeLabel;
      connectionGraph[colIdx + 1][rowIdx] = edgeLabel; // Note the j+1 here
      edgeLabel++;
    }
  }

  logDebugMessage({
    "Constructed Graph": connectionGraph,
    "Graph Dimension": dimensionSize
  });

  // Output the number of rows in the graph (which is k+1)
  displayOutput(connectionGraph.length);

  // Prepare the final output lines
  const finalOutputLines = connectionGraph.map(row => {
    // Each row needs to be prefixed with its count of elements (which is 'k' or dimensionSize)
    // Then, the elements of the row are joined by spaces.
    const rowElements = [dimensionSize, ...row];
    return rowElements.join(" ");
  });

  // Join all formatted lines with newlines and display the result
  displayOutput(dataTransformer(finalOutputLines, TransformationType.ARRAY_JOIN_NEWLINE));
}
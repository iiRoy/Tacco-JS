const inputReaderInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataHandler;
const collectedInputLines = [];

// Event handler for each line of input
inputReaderInterface.on('line', (currentLine) => {
  collectedInputLines.push(currentLine);
});

// Event handler for when input stream closes
inputReaderInterface.on('close', () => {
  dataHandler = createInputHandler(collectedInputLines);
  
  const executionStartTime = new Date();
  processSolution(); // Renamed Main to processSolution
  const executionEndTime = new Date();
  const elapsedTime = executionEndTime - executionStartTime;

  // Log diagnostic messages for performance
  logDiagnosticMessage(`Execution time: ${elapsedTime} ms`);
  logDiagnosticMessage(`Memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Retrieves the next item from the input stream and parses it as an integer.
 * @returns {number} The next integer from input.
 */
function getNextInteger() {
  return parseInt(dataHandler.fetchNextItem(), 10);
}

/**
 * Retrieves the next item from the input stream and splits it into a string array by spaces.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return dataHandler.fetchNextItem().split(' ');
}

/**
 * Retrieves the next item from the input stream, splits it by spaces, and maps to a number array.
 * @returns {number[]} An array of numbers.
 */
function getNextIntegerArray() {
  return dataHandler.fetchNextItem().split(' ').map(Number);
}

/**
 * Retrieves the next item from the input stream and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return dataHandler.fetchNextItem().split('');
}

/**
 * Formats an array of strings or numbers into a single string, joined by newlines.
 * @param {Array<string|number>} items - The array to join.
 * @returns {string} The joined string.
 */
function joinLines(items) {
  return items.join('\n');
}

/**
 * Initializes and returns an input handler object to manage reading from collected lines.
 * @param {string[]} sourceLines - An array of raw input strings.
 * @returns {object} An object with methods to access input.
 */
function createInputHandler(sourceLines) {
  // Guard clause: ensure sourceLines is not null or empty
  if (!sourceLines || sourceLines.length === 0) {
    console.warn("[WARNING] Input source lines are empty.");
    return {
      hasMoreInput: () => false,
      fetchNextItem: () => { throw new Error("No more input available."); }
    };
  }

  const inputState = {
    dataSegments: sourceLines,
    currentSegmentIndex: 0,
    totalSegments: sourceLines.length,

    /**
     * Checks if there are more items to read in the input stream.
     * @returns {boolean} True if more items exist, false otherwise.
     */
    hasMoreInput: function() {
      return (this.currentSegmentIndex < this.totalSegments);
    },

    /**
     * Fetches the next item from the input stream.
     * @returns {string} The next input line.
     * @throws {Error} If no more items are available.
     */
    fetchNextItem: function() {
      if (!this.hasMoreInput()) {
        throw new Error("EndOfInputException: No more lines to read.");
      }
      const extractedItem = this.dataSegments[this.currentSegmentIndex];
      this.currentSegmentIndex++;
      return extractedItem;
    }
  };
  return inputState;
}

/**
 * Prints a given string or object to the standard output.
 * @param {any} content - The content to display.
 */
function printOutput(content) {
  console.log(content);
}

/**
 * Logs a diagnostic message to the standard error stream.
 * @param {any} message - The message to log.
 */
function logDiagnosticMessage(message) {
  console.error(`[DIAGNOSTIC] ${message}`);
}

/**
 * Main function containing the problem-solving logic.
 */
function processSolution() {
  const problemSize = getNextInteger(); // Renamed N to problemSize
  const MAX_COORDINATE_VALUE = 200; // Added a constant for the magic number
  
  // Initialize result array with zeros.
  const resultArray = Array(problemSize).fill(0); 
  
  // Renamed map to calculationFrequency
  const calculationFrequency = {}; 

  // Nested loops to calculate the sum of squares and products
  for (let valX = 1; valX <= MAX_COORDINATE_VALUE; valX++) {
    for (let valY = 1; valY <= MAX_COORDINATE_VALUE; valY++) {
      for (let valZ = 1; valZ <= MAX_COORDINATE_VALUE; valZ++) {
        // Calculate the specific sum based on the formula
        const calculatedSum = 
          valX * valX + valY * valY + valZ * valZ + 
          valX * valY + valY * valZ + valZ * valX;
        
        // Increment frequency for the calculated sum
        // Using a more concise way to initialize and increment
        calculationFrequency[calculatedSum] = (calculationFrequency[calculatedSum] || 0) + 1;
      }
    }
  }

  // Populate the resultArray based on the calculated frequencies
  for (let idx = 0; idx < problemSize; idx++) {
    // Check if a frequency exists for (idx + 1), otherwise assign 0
    // Using logical OR for concise default value
    resultArray[idx] = calculationFrequency[idx + 1] || 0;
  }
  
  // Output the results, each on a new line
  printOutput(joinLines(resultArray));
}
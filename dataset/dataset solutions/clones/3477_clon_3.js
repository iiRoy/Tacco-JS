var inputLineReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputDataSource;
var collectedInputLines = [];
var isInputProcessingComplete = false;

// Event listener for each line read from standard input
inputLineReader.on('line', function(currentLineText) {
  collectedInputLines.push(currentLineText);
});

// Event listener for when input stream closes
inputLineReader.on('close', function() {
  isInputProcessingComplete = true; // Mark input as fully collected
  inputDataSource = setupLineIterator(collectedInputLines); // Initialize the data source

  // Log a separator for better readability in debug output
  console.error("--- Program Execution Start ---");

  // Record performance metrics
  var executionStartTime = performance.now(); // Using performance.now() for higher precision
  
  try {
    executeSolutionLogic(); // Call the main program logic
  } catch (errorDetail) {
    reportDiagnostic("Runtime Error: " + errorDetail.message);
    // Optionally re-throw or exit
    process.exit(1);
  }

  var totalExecutionTime = performance.now() - executionStartTime;
  reportDiagnostic(`Execution Duration: ${totalExecutionTime.toFixed(2)} ms`);
  reportDiagnostic(`Memory Usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB (Heap Total)`);
  
  console.error("--- Program Execution End ---");
});

/**
 * Sets up an iterable object to process input lines.
 * @param {string[]} sourceLines - An array of raw input strings.
 * @returns {object} An object with methods to navigate and retrieve input.
 */
function setupLineIterator(sourceLines) {
  // Guard clause: ensure sourceLines is an array and not empty
  if (!Array.isArray(sourceLines) || sourceLines.length === 0) {
    reportDiagnostic("Warning: Input source lines are empty or invalid.");
    return {
      storedLines: [],
      readCursor: 0,
      totalLines: 0,
      canReadFurther: () => false,
      fetchNextLine: () => { throw new Error("No more input available."); }
    };
  }

  return {
    storedLines: sourceLines,
    readCursor: 0,
    totalLines: sourceLines.length,

    /** Checks if there are more lines to read. */
    canReadFurther: function() {
      return this.readCursor < this.totalLines;
    },

    /** Retrieves the next line from the input. */
    fetchNextLine: function() {
      if (this.canReadFurther()) {
        return this.storedLines[this.readCursor++];
      } else {
        throw new Error("EndOfInputException: No further input lines to process.");
      }
    },

    /** Peeks at the next line without advancing the cursor. */
    peekNextLine: function() {
      if (this.canReadFurther()) {
        return this.storedLines[this.readCursor];
      }
      return undefined; // Or throw an error
    }
  };
}

/** Retrieves the next integer from the input stream. */
function retrieveInteger() {
  return parseInputSegment(fetchNextLine(), 1);
}

/** Retrieves the next line as an array of string tokens. */
function getStringTokens() {
  return parseInputSegment(fetchNextLine(), 2);
}

/** Retrieves the next line as an array of numbers. */
function getNumericSequence() {
  return parseInputSegment(fetchNextLine(), 4);
}

/** Retrieves the next line as an array of characters. */
function getCharSequence() {
  return parseInputSegment(fetchNextLine(), 6);
}

/** Fetches the raw next line from the input source. */
function fetchNextLine() {
  return inputDataSource.fetchNextLine();
}

/** Checks if there's more data to read from the input source. */
function hasMoreData() {
  return inputDataSource.canReadFurther();
}

/**
 * Outputs a message to the console.
 * @param {*} content - The content to be displayed.
 */
function emitOutput(content) {
  console.log(content);
}

/**
 * Logs diagnostic information to the standard error stream.
 * @param {*} diagnosticMessage - The message or object to log.
 */
function reportDiagnostic(diagnosticMessage) {
  const timestamp = new Date().toISOString();
  // Using JSON.stringify for simple object inspection, falling back to string for primitives
  const formattedMessage = typeof diagnosticMessage === 'object' && diagnosticMessage !== null
    ? JSON.stringify(diagnosticMessage, null, 2)
    : String(diagnosticMessage);
  console.error(`[${timestamp}] DEBUG: ${formattedMessage}`);
}

/**
 * Converts an input segment based on a specified type.
 * @param {string} segmentValue - The input string segment to convert.
 * @param {number} conversionType - Type of conversion (1: int, 2: str array, 4: int array, etc.).
 * @returns {*} The converted value.
 */
function parseInputSegment(segmentValue, conversionType) {
  if (typeof segmentValue !== 'string') {
    reportDiagnostic(`Invalid input segment value: ${segmentValue}`);
    return segmentValue; // Return as is if not a string
  }

  // Define a map for common delimiters
  const delimiters = {
    SPACE: " ",
    EMPTY: "",
    NEWLINE: "\n"
  };

  switch (conversionType) {
    case 1: // Parse as integer
      return parseInt(segmentValue, 10); // Always specify radix
    case 2: // Split by space into string array
      return segmentValue.split(delimiters.SPACE);
    case 4: // Split by space and map to numbers
      return segmentValue.split(delimiters.SPACE).map(Number);
    case 6: // Split by character into char array
      return segmentValue.split(delimiters.EMPTY);
    case 7: // Split by character and map to numbers
      return segmentValue.split(delimiters.EMPTY).map(Number);
    case 8: // Join array elements with space
      return Array.isArray(segmentValue) ? segmentValue.join(delimiters.SPACE) : segmentValue;
    case 9: // Join array elements with newline
      return Array.isArray(segmentValue) ? segmentValue.join(delimiters.NEWLINE) : segmentValue;
    case 0: // Join array elements with no character
      return Array.isArray(segmentValue) ? segmentValue.join(delimiters.EMPTY) : segmentValue;
    default:
      reportDiagnostic(`Unknown conversion type: ${conversionType}. Returning original segment.`);
      return segmentValue;
  }
}

/**
 * This is the main function where the program's primary logic resides.
 */
function executeSolutionLogic() {
  // Guard clause: ensure inputDataSource is initialized
  if (!inputDataSource || !isInputProcessingComplete) {
    reportDiagnostic("Error: Input data source not ready for processing.");
    return;
  }

  // Example of adding an intermediate step/variable
  const confirmationMessage = "Yes";
  emitOutput(confirmationMessage);

  const primaryCount = 4;
  emitOutput(primaryCount);

  // Demonstrate using a loop for output, even if fixed
  const constantPrefix = 3; // Introduce a helper variable
  const outputLines = [
    `${constantPrefix} 1 2 3`,
    `${constantPrefix} 1 4 5`,
    `${constantPrefix} 2 5 6`,
    `${constantPrefix} 3 4 6`
  ];

  // Using a for...of loop instead of individual calls
  for (const lineContent of outputLines) {
    emitOutput(lineContent);
  }

  // Example of a conditional addition (e.g., a validation check)
  if (outputLines.length !== primaryCount) {
    reportDiagnostic(`Validation Warning: Expected ${primaryCount} output lines, but generated ${outputLines.length}.`);
  }
}
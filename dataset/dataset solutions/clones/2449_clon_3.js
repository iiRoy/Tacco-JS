const fileSystem = require("fs");

// Read standard input, decode as UTF-8, remove leading/trailing whitespace, and segment into lines.
let rawDataBuffer = fileSystem.readFileSync("/dev/stdin", "utf8").trim();

// Introduce a guard clause for potentially empty input after trimming.
let processedLines = rawDataBuffer ? rawDataBuffer.split("\n") : [];

/**
 * Manages sequential access to an array of input lines.
 * This class acts as a robust iterator for processing each line of the input data.
 */
class InputLineProcessor {
  constructor(lines) {
    this.sourceLines = lines;
    this.currentPointer = 0;
  }

  /**
   * Checks if there are more lines available to be read from the source.
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  canReadNext() {
    return (this.currentPointer < this.sourceLines.length);
  }

  /**
   * Retrieves the next line from the input stream.
   * @returns {string|null} The next line as a string, or null if the end of the stream is reached.
   */
  obtainNextLine() {
    // Explicitly check bounds to prevent errors if canReadNext() is bypassed.
    if (!this.canReadNext()) {
      return null; // Using null to signify end-of-stream, more standard than an empty string.
    }
    const extractedElement = this.sourceLines[this.currentPointer];
    this.currentPointer++;
    return extractedElement;
  }
}

// Instantiate the input processor with the parsed lines.
const streamHandler = new InputLineProcessor(processedLines);

// Define a general data transformation utility function.
// The 'transformType' parameter dictates the specific conversion or formatting operation.
const dataTransformer = (valueToProcess, transformType) => {
  // Add a guard clause for null or undefined input values.
  if (valueToProcess === null || valueToProcess === undefined) {
    return valueToProcess;
  }
  try {
    switch (transformType) {
      case 1: // Convert the value to an integer.
        return parseInt(valueToProcess, 10); // Added radix for best practice.
      case 2: // Split the string by space into an array of strings.
        return valueToProcess.split(" ");
      case 4: // Split the string by space and convert each part to a number, returning an array of integers.
        return valueToProcess.split(" ").map((itemStr) => Number(itemStr));
      case 6: // Split the string into an array of individual characters.
        return valueToProcess.split("");
      // Case 7 (split by char and map to number) is removed as it's not directly utilized by the high-level utilities and can be composed if needed.
      case 8: // Join an array of values using a single space as a separator.
        return valueToProcess.join(" ");
      case 9: // Join an array of values using a newline character as a separator.
        return valueToProcess.join("\n");
      case 0: // Join an array of values with no separator (concatenate them).
        return valueToProcess.join("");
      case 10: // NEW OPERATION: Split the string by a comma into an array of strings.
        return valueToProcess.split(",");
      default: // If the transformType is unknown, return the original value as is.
        return valueToProcess;
    }
  } catch (conversionError) {
    // In case of any conversion error, return the original value to prevent program crashes.
    return valueToProcess;
  }
};

// A collection of utility functions for streamlined input processing and output generation.
const processingUtilities = {
  /** Retrieves the next available element (line) from the input stream. */
  readNextElement: () => streamHandler.obtainNextLine(),
  /** Retrieves the next line and converts it to an integer. */
  readNextInteger: () => dataTransformer(processingUtilities.readNextElement(), 1),
  /** Retrieves the next line and converts it to an array of strings (space-separated). */
  readNextStringArray: () => dataTransformer(processingUtilities.readNextElement(), 2),
  /** Retrieves the next line and converts it to an array of integers (space-separated). */
  readNextIntegerArray: () => dataTransformer(processingUtilities.readNextElement(), 4),
  /** Retrieves the next line and converts it to an array of individual characters. */
  readNextCharList: () => dataTransformer(processingUtilities.readNextElement(), 6),
  /** Checks if there is more input data available in the stream. */
  checkMoreInput: () => streamHandler.canReadNext(),
  /** Prints the provided content to the standard output console. */
  outputResult: (content) => console.log(content),
  // The 'myerr' function (for error logging) has been removed as it was not used in the original Main function.
  // Direct calls to console.error can be made if specific error logging is required.
};

// Define constants for array generation, moved from inside the main function for better modularity.
const DEFAULT_FILL_VALUE = "N/A"; // Changed default fill value from "-1" to "N/A".
const DESIRED_ARRAY_SIZE = 5000; // Changed array size from 10000 to 5000.

/**
 * The primary execution block of the program.
 * This function orchestrates the main logic, including data generation and output.
 */
function executeProgram() {
  processingUtilities.outputResult("--- Program Execution Initiated ---"); // Added a new introductory output statement.

  let generatedDataCollection = []; // Declared with 'let' and renamed for clarity.

  // Add a guard clause to prevent processing with an invalid array size.
  if (DESIRED_ARRAY_SIZE <= 0) {
    processingUtilities.outputResult("Error: Desired array size must be a positive integer.");
    return; // Exit early if the size is invalid.
  }

  // Populate the array using an explicit loop instead of the 'fill()' method.
  for (let i = 0; i < DESIRED_ARRAY_SIZE; i++) {
    generatedDataCollection.push(DEFAULT_FILL_VALUE);
  }

  // Transform the generated array into a single string.
  // Changed the join operation from '9' (newline) to '8' (space-separated).
  const finalOutputString = dataTransformer(generatedDataCollection, 8);

  processingUtilities.outputResult(finalOutputString);
  processingUtilities.outputResult("--- Program Execution Completed ---"); // Added a new concluding output statement.
}

// Initiate the program flow by calling the main execution function.
executeProgram();
"use strict";

// A utility class designed for parsing structured input data,
// line by line and token by token.
class DataStreamProcessor {
  // Constructs a new processor instance.
  // @param {string} sourceTextContent - The complete input string to be processed.
  // @param {function} [valueConverter=Number] - An optional function to convert tokens (e.g., String, parseInt).
  constructor(sourceTextContent, valueConverter = Number) {
    this.bufferedLines = sourceTextContent.split('\n'); // All input lines stored here.
    this.currentLinePointer = 0; // Index of the line currently being processed.
    this.currentTokenPointer = 0; // Index of the token within the current line.
    this.defaultConverter = valueConverter; // The default function to apply to extracted tokens.
    this.cachedLineTokens = []; // Holds tokens of the current line for sequential access.
  }

  /**
   * Internal helper to load and tokenize the next available line.
   * Advances `currentLinePointer` if needed by the consumer.
   * @returns {boolean} True if a new line was successfully loaded, false otherwise (end of stream).
   */
  _loadCurrentLineTokens() {
    if (this.currentLinePointer >= this.bufferedLines.length) {
      this.cachedLineTokens = []; // Clear tokens if no more lines.
      return false; // No more lines left to process.
    }

    const currentLineContent = this.bufferedLines[this.currentLinePointer];
    if (currentLineContent === undefined || currentLineContent.trim().length === 0) {
      // Handle empty lines or lines with only whitespace by skipping them.
      // This is a slight deviation from the original's implicit handling of empty lines.
      this.cachedLineTokens = [];
      return true; // Still considered loaded, but with no tokens.
    }

    // Split the line by one or more whitespace characters.
    this.cachedLineTokens = currentLineContent.trim().split(/\s+/);
    this.currentTokenPointer = 0; // Reset token pointer for the new line.
    return true;
  }

  /**
   * Extracts and returns the next token from the stream.
   * Automatically advances to the next line if the current one is exhausted.
   * @param {function} [customProcessor=null] - An optional function to process this specific token.
   * @returns {*} The processed token value, or null if the end of the stream is reached.
   */
  extractNextToken(customProcessor = null) {
    // If no tokens are loaded or the current line's tokens are exhausted,
    // attempt to load the next line.
    if (this.cachedLineTokens.length === 0 || this.currentTokenPointer >= this.cachedLineTokens.length) {
      this.currentLinePointer++; // Move to consider the next line.
      if (!this._loadCurrentLineTokens()) {
        return null; // End of input stream.
      }
      // After loading, if there are still no tokens (e.g., an empty line), try again or return null.
      if (this.cachedLineTokens.length === 0) {
        // This handles cases where _loadCurrentLineTokens found an empty line
        // and extractNextToken is called again. It's an edge case.
        return this.extractNextToken(customProcessor); // Recursively try next token, potentially skipping more empty lines.
      }
    }

    const rawTokenValue = this.cachedLineTokens[this.currentTokenPointer];
    this.currentTokenPointer++; // Advance token pointer for the next call.

    // Apply the provided custom processor or the default converter.
    const finalProcessor = customProcessor || this.defaultConverter;
    return finalProcessor(rawTokenValue);
  }

  /**
   * Processes all tokens on the current line and then advances to the next line.
   * @param {function} [lineTokenProcessor=null] - An optional function to apply to each token on the line.
   * @returns {Array<*>} An array of processed tokens from the consumed line.
   */
  processCurrentLineTokens(lineTokenProcessor = null) {
    if (this.currentLinePointer >= this.bufferedLines.length) {
      return []; // No more lines available.
    }

    const lineContentToProcess = this.bufferedLines[this.currentLinePointer];
    this.currentLinePointer++; // Advance line pointer immediately after retrieving the line.
    this.currentTokenPointer = 0; // Reset token pointer for future `extractNextToken` calls.

    if (lineContentToProcess === undefined || lineContentToProcess.trim().length === 0) {
      return []; // Return an empty array for empty lines.
    }

    const tokens = lineContentToProcess.trim().split(/\s+/);
    const processor = lineTokenProcessor || this.defaultConverter;
    return tokens.map(processor);
  }
}

// Export the data processing class for modular use.
module.exports = DataStreamProcessor;


/**
 * Main application logic to process the input and determine a date format.
 * Expects a single 4-digit number as input.
 * @param {string} rawInputContent - The entire content read from the input source.
 */
function processInputData(rawInputContent) {
  // Initialize our custom data stream reader.
  const dataReader = new DataStreamProcessor(rawInputContent);

  // Attempt to extract the primary numeric sequence from the input.
  // This is expected to be a four-digit number.
  const numericalSequence = dataReader.extractNextToken();

  // Robust input validation:
  // 1. Check if any value was extracted.
  // 2. Ensure it's a valid number.
  // 3. Confirm it has exactly four digits.
  if (numericalSequence === null || isNaN(numericalSequence) || String(numericalSequence).length !== 4) {
    console.log("INVALID_INPUT_FORMAT"); // Provide a more informative error message.
    return; // Terminate execution if input is malformed.
  }

  // Decompose the four-digit number into two two-digit components.
  // Using string manipulation for explicit parsing and to handle potential leading zeros gracefully.
  const sequenceString = String(numericalSequence);
  const firstPair = parseInt(sequenceString.substring(0, 2), 10);
  const secondPair = parseInt(sequenceString.substring(2, 4), 10);

  // Define a helper predicate for month validity to improve readability.
  const isValueValidMonth = (value) => value >= 1 && value <= 12;

  // Evaluate the month validity for both extracted pairs.
  const isFirstSegmentMonth = isValueValidMonth(firstPair);
  const isSecondSegmentMonth = isValueValidMonth(secondPair);

  // Determine the date interpretation based on the validity of each segment as a month.
  if (isFirstSegmentMonth && isSecondSegmentMonth) {
    // Both segments are valid months.
    console.log("AMBIGUOUS_DATE_FORMAT"); // Clarified output string.
  } else if (isFirstSegmentMonth) {
    // Only the first segment is a valid month, implying the second is a year.
    console.log("MONTH_YEAR_FORMAT"); // Clarified output string.
  } else if (isSecondSegmentMonth) {
    // Only the second segment is a valid month, implying the first is a year.
    console.log("YEAR_MONTH_FORMAT"); // Clarified output string.
  } else {
    // Neither segment is a valid month.
    console.log("UNRECOGNIZED_FORMAT"); // Clarified output string.
  }
}

/**
 * Helper function to safely obtain file contents synchronously.
 * Abstracts the file system interaction and includes basic error handling.
 * @param {string} filePath - The path to the file to read.
 * @param {string} [encoding='utf8'] - The character encoding for reading the file.
 * @returns {string} The content of the file, or an empty string on error.
 */
const obtainFileContentsSynchronously = (filePath, encoding = 'utf8') => {
  try {
    // Using 'node:fs' for a more explicit and modern Node.js module import.
    const fileSystemModule = require("node:fs");
    return fileSystemModule.readFileSync(filePath, encoding);
  } catch (error) {
    // Log any errors encountered during file reading.
    console.error(`ERROR: Failed to read input file at '${filePath}'. Reason: ${error.message}`);
    // Return an empty string to allow the main logic to proceed without crashing,
    // where it will then likely encounter an "INVALID_INPUT_FORMAT" scenario.
    return "";
  }
};

// Initiate the application by reading from standard input and processing the data.
processInputData(obtainFileContentsSynchronously("/dev/stdin", "utf8"));
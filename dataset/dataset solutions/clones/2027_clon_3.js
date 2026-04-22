const DATA_TYPE_TO_INTEGER = 1;
const DATA_TYPE_SPACE_TOKENS = 2;
const DATA_TYPE_NUMERIC_TOKENS = 4;
const DATA_TYPE_CHARACTER_TOKENS = 6;
const DATA_TYPE_JOIN_BY_SPACE = 8;
const DATA_TYPE_JOIN_BY_NEWLINE = 9;
const DATA_TYPE_JOIN_NONE = 0;

/**
 * Fetches raw input from the standard input stream.
 * This function is specific to Node.js environments for competitive programming.
 * @returns {string[]} An array where each element is a line from the standard input.
 */
const acquireRawInputLines = () => {
  return require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");
};

/**
 * Manages the sequential access to input lines.
 * Provides methods to check for more input and retrieve the next line.
 */
class InputSequenceHandler {
  /**
   * Initializes the handler with a collection of input lines.
   * @param {string[]} linesCollection - An array of strings, each representing an input line.
   */
  constructor(linesCollection) {
    this._inputLines = linesCollection;
    this._currentLineIndex = 0;
    this._totalLineCount = linesCollection.length;
  }

  /**
   * Determines if there are additional input lines available to be read.
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  canReadMoreLines() {
    return this._currentLineIndex < this._totalLineCount;
  }

  /**
   * Retrieves the subsequent line from the input sequence.
   * Advances the internal pointer to the next line.
   * @returns {string} The next input line, or an empty string if no more lines are available.
   */
  retrieveNextLine() {
    if (!this.canReadMoreLines()) {
      return ""; // Return an empty string for graceful exhaustion of input.
    }
    const lineContent = this._inputLines[this._currentLineIndex];
    this._currentLineIndex++;
    return lineContent;
  }
}

/**
 * A versatile utility for transforming data based on a specified type code.
 * Handles conversions between strings, numbers, and arrays.
 * @param {string | string[]} sourceData - The data input for transformation.
 * @param {number} conversionType - An integer identifier for the desired transformation.
 * @returns {any} The transformed data, or the original data if the transformation is unknown or fails.
 */
const DataTransformationService = (sourceData, conversionType) => {
  try {
    switch (conversionType) {
      case DATA_TYPE_TO_INTEGER:
        const parsedInt = parseInt(sourceData, 10);
        return Number.isFinite(parsedInt) ? parsedInt : sourceData;
      case DATA_TYPE_SPACE_TOKENS:
        return String(sourceData).split(" ");
      case DATA_TYPE_NUMERIC_TOKENS:
        return String(sourceData).split(" ").map(Number);
      case DATA_TYPE_CHARACTER_TOKENS:
        return String(sourceData).split("");
      case DATA_TYPE_JOIN_BY_SPACE:
        return Array.isArray(sourceData) ? sourceData.join(" ") : sourceData;
      case DATA_TYPE_JOIN_BY_NEWLINE:
        return Array.isArray(sourceData) ? sourceData.join("\n") : sourceData;
      case DATA_TYPE_JOIN_NONE:
        return Array.isArray(sourceData) ? sourceData.join("") : sourceData;
      default:
        return sourceData; // Return original if type is not recognized
    }
  } catch (processingError) {
    // In a production system, detailed error logging would occur here.
    // For competitive programming, returning original data or a default is common.
    return sourceData;
  }
};

// Initialize the global input handler once.
const inputSourceManager = new InputSequenceHandler(acquireRawInputLines());

// Convenience functions for reading specific data types from input.
const retrieveNextInteger = () => DataTransformationService(inputSourceManager.retrieveNextLine(), DATA_TYPE_TO_INTEGER);
const retrieveNextStringTokens = () => DataTransformationService(inputSourceManager.retrieveNextLine(), DATA_TYPE_SPACE_TOKENS);
const retrieveNextNumericTokens = () => DataTransformationService(inputSourceManager.retrieveNextLine(), DATA_TYPE_NUMERIC_TOKENS);
const retrieveNextCharTokens = () => DataTransformationService(inputSourceManager.retrieveNextLine(), DATA_TYPE_CHARACTER_TOKENS);
const peekForMoreInput = () => inputSourceManager.canReadMoreLines();
const retrieveRawNextLine = () => inputSourceManager.retrieveNextLine();

// Utility for presenting the final computed result.
const outputFinalResult = (content) => console.log(content);

/**
 * The core logic function that computes the minimum path for a circular arrangement of points.
 * This involves identifying and excluding the longest segment.
 */
const computeMinimumCircularPath = () => {
  // Read the first line containing the total length of the circle and the number of points.
  const circleConfiguration = retrieveNextNumericTokens();
  if (!Array.isArray(circleConfiguration) || circleConfiguration.length < 2) {
    console.error("Input Error: Expected at least two numeric values for circle configuration.");
    return;
  }

  const totalCircleLength = circleConfiguration[0]; // Represents K
  const totalPointCount = circleConfiguration[1];   // Represents N

  // Read the second line containing the positions of the points on the circle.
  const pointCoordinates = retrieveNextNumericTokens();
  if (!Array.isArray(pointCoordinates) || pointCoordinates.length !== totalPointCount) {
    console.error("Input Error: Point coordinates array length mismatch.");
    return;
  }

  // Calculate the distances between adjacent points.
  // This array will hold N distances, including the wrap-around segment.
  const segmentLengths = [];

  // Calculate distances for the (N-1) segments that don't cross the zero-point.
  for (let idx = 0; idx < totalPointCount - 1; idx++) {
    const directDistance = pointCoordinates[idx + 1] - pointCoordinates[idx];
    segmentLengths.push(directDistance);
  }

  // Calculate the distance for the segment that wraps around the circle.
  // This is the distance from the last point to the first point, considering the circular nature.
  const circularWrapAroundDistance = totalCircleLength - pointCoordinates[totalPointCount - 1] + pointCoordinates[0];
  segmentLengths.push(circularWrapAroundDistance);

  // To find the minimum total travel distance, we must omit the single longest segment.
  // Sort the segments by length to easily identify the longest one.
  segmentLengths.sort((lengthA, lengthB) => lengthA - lengthB);

  // Remove the longest segment (which is now the last element after sorting).
  // `slice(0, -1)` creates a new array without the last element.
  const pathSegmentsExcludingLongest = segmentLengths.slice(0, -1);

  // Sum the lengths of the remaining segments to get the minimal travel distance.
  const minimalTotalDistance = pathSegmentsExcludingLongest.reduce((accumulator, currentLength) => accumulator + currentLength, 0);

  // Display the computed result.
  outputFinalResult(minimalTotalDistance);
};

// Execute the main computation function upon script invocation.
(() => {
  computeMinimumCircularPath();
})();
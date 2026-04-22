/**
 * @module InputProcessing
 * @description Provides utilities for parsing input data from a multi-line string.
 * This module is designed to read numerical tokens and lines from a given text source,
 * advancing through lines and tokens as they are consumed.
 */
const InputProcessing = (function () {
  /**
   * Factory function to create a new data stream parser instance.
   * @param {string} rawInputContent - The complete input string, typically read from a file.
   * @returns {DataStreamProcessor} An instance of the DataStreamProcessor.
   */
  function instantiateStreamProcessor(rawInputContent) {
    return new DataStreamProcessor(rawInputContent);
  }

  /**
   * @class DataStreamProcessor
   * @description Manages the parsing of input lines and tokens.
   * Lines are stored in an array, and a pointer tracks the current line.
   * Tokens are read from right-to-left within a line.
   */
  class DataStreamProcessor {
    /**
     * Initializes the processor with the input string.
     * @param {string} sourceText - The string containing all input lines.
     */
    constructor(sourceText) {
      // Clean and split the input into individual lines, filtering out any empty lines
      this.availableLines = sourceText.trim().split('\n').filter(line => line.length > 0);
      this.currentLinePointer = 0; // Index of the line currently being processed
      this.pendingTokensOnLine = []; // Buffer for tokens on the current line
    }

    /**
     * Checks if there are more lines available to process in the input stream.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    hasMoreDataLines() {
      return this.currentLinePointer < this.availableLines.length;
    }

    /**
     * Extracts and returns the next single token from the input stream.
     * If the current line's buffer is empty, it populates it from the next available line.
     * Tokens are processed from the end of the line backwards (due to internal reverse/shift).
     * @param {boolean} [retrieveAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The next token, or undefined if no more tokens are available.
     */
    retrieveNextToken(retrieveAsString = false) {
      // If no tokens are left in the current line's buffer, load the next line
      if (this.pendingTokensOnLine.length === 0) {
        if (!this.hasMoreDataLines()) {
          // No more lines to process, so no more tokens
          return undefined;
        }
        // Split the current line by spaces and reverse to read from right to left
        this.pendingTokensOnLine = this.availableLines[this.currentLinePointer].split(' ').reverse();
        // Advance the line pointer after processing (or attempting to process) the line
        this.currentLinePointer++;
      }

      // Get the next token from the buffer (which is the last token of the original line)
      const tokenValue = this.pendingTokensOnLine.shift();
      
      // Return the token as a string or attempt numerical conversion
      return retrieveAsString ? tokenValue : Number(tokenValue);
    }

    /**
     * Fetches an entire line of tokens, splitting it by spaces.
     * This method consumes a full line regardless of the `pendingTokensOnLine` buffer.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>|undefined} An array of tokens from the line, or undefined if no more lines.
     */
    fetchFullLineTokens(returnAsStrings = false) {
      if (!this.hasMoreDataLines()) {
        return undefined;
      }

      // Clear any remaining tokens from the previous line's buffer as we're reading a full new line
      this.pendingTokensOnLine = []; 

      const currentRawLine = this.availableLines[this.currentLinePointer];
      this.currentLinePointer++; // Advance line pointer immediately

      const lineParts = currentRawLine.split(' ');
      return returnAsStrings ? lineParts : lineParts.map(val => Number(val));
    }
    
    // The original 'm' (readMatrix) and 'r' (readLines) methods have been removed
    // as they are not utilized by the main application logic, simplifying the parser.
  }

  return instantiateStreamProcessor;
})();

// Define global constants for the coordinate range and iteration step.
const MINIMUM_COORDINATE_EXTENT = -1000000;
const MAXIMUM_COORDINATE_EXTENT = 1000000;
const SWEEP_INTERVAL = 20;

// Initialize the input data reader.
// This block attempts to read from /dev/stdin, common in competitive programming environments.
// A fallback example input is provided for local testing or environments without 'fs'.
let inputDataReader;
try {
  const fileSystem = require("fs");
  inputDataReader = InputProcessing(fileSystem.readFileSync("/dev/stdin", "utf8"));
} catch (error) {
  // Log an error if 'fs' module is not found or /dev/stdin fails.
  console.error("Failed to initialize input reader from /dev/stdin. Using fallback data. Error:", error.message);
  // Fallback to a hardcoded example input for development/testing
  inputDataReader = InputProcessing("5\n10 20\n-5 -10\n0 0\n30 40\n-1 -1"); 
}

// Module-level arrays to store the filtered x and y coordinates of points.
let xCoordinates = []; 
let yCoordinates = []; 
let actualPointCount = 0; // Stores the number of valid (non-origin) points after filtering.

// Execute the main processing logic and print the final result to the console.
console.log(processGeometricCalculations());

/**
 * @function processGeometricCalculations
 * @description Main function responsible for reading input points, filtering out
 *              (0,0) points, and then calculating the maximum squared Euclidean distance
 *              from the origin to the sum of point vectors, projected onto various directions.
 * @returns {number} The square root of the largest squared distance found, representing the maximum distance.
 */
function processGeometricCalculations() {
  // Read the initially declared total number of points from the input.
  const initialDeclaredPoints = inputDataReader.retrieveNextToken();

  // Guard clause: If no points are declared or the count is invalid, return 0 immediately.
  if (initialDeclaredPoints === undefined || initialDeclaredPoints <= 0) {
    return 0;
  }

  // Loop to read all declared points and populate the coordinate arrays.
  // Points at the origin (0,0) are explicitly filtered out.
  for (let pointIterator = 0; pointIterator < initialDeclaredPoints; pointIterator++) {
    const currentPointX = inputDataReader.retrieveNextToken();
    const currentPointY = inputDataReader.retrieveNextToken();

    // If a point is at the origin (0,0), it does not contribute to the sum of vectors,
    // so we skip adding it to our processing arrays.
    if (currentPointX === 0 && currentPointY === 0) {
      continue; 
    }
    xCoordinates.push(currentPointX);
    yCoordinates.push(currentPointY);
  }

  // Update the actual count of points that will be used in calculations.
  actualPointCount = xCoordinates.length;

  // Another guard clause: If all points were filtered out (e.g., all were 0,0), return 0.
  if (actualPointCount === 0) {
    return 0;
  }

  let largestSquaredDistance = 0; // Variable to store the maximum squared distance found.

  // Define an array of functions, each representing one of the four boundary conditions
  // for the direction vector (dirY, dirX) to be tested.
  const directionalTestVectors = [
    (sweepVal) => ({ dirY: MINIMUM_COORDINATE_EXTENT, dirX: sweepVal }), // Bottom edge
    (sweepVal) => ({ dirY: MAXIMUM_COORDINATE_EXTENT, dirX: sweepVal }), // Top edge
    (sweepVal) => ({ dirY: sweepVal, dirX: MAXIMUM_COORDINATE_EXTENT }), // Right edge
    (sweepVal) => ({ dirY: sweepVal, dirX: MINIMUM_COORDINATE_EXTENT }), // Left edge
  ];

  // Iterate through a range of coordinate values for the sweep.
  for (let currentSweepValue = MINIMUM_COORDINATE_EXTENT; currentSweepValue <= MAXIMUM_COORDINATE_EXTENT; currentSweepValue += SWEEP_INTERVAL) {
    // For each sweep value, test all four boundary direction vectors.
    for (const getDirectionVector of directionalTestVectors) {
      const { dirY, dirX } = getDirectionVector(currentSweepValue);
      // Calculate the sum of projections for the current direction.
      const currentCalculatedSum = calculateAggregatedProjection(dirY, dirX);
      // Update the largest squared distance if the current sum is greater.
      largestSquaredDistance = Math.max(largestSquaredDistance, currentCalculatedSum);
    }
  }

  // The final result is the square root of the maximum squared distance.
  return Math.sqrt(largestSquaredDistance);
}

/**
 * @function calculateAggregatedProjection
 * @description Computes the sum of vectors (sumX, sumY) for points whose dot product
 *              with a given direction vector (hComponent, wComponent) is positive.
 *              It then returns the squared Euclidean distance of this aggregated vector from the origin.
 * @param {number} hComponent - The Y-component of the direction vector.
 * @param {number} wComponent - The X-component of the direction vector.
 * @returns {number} The squared magnitude (sumX^2 + sumY^2) of the resultant vector.
 */
function calculateAggregatedProjection(hComponent, wComponent) {
  let sumXProjections = 0;
  let sumYProjections = 0;

  // Guard clause: If there are no actual points to process, return 0.
  if (actualPointCount === 0) {
    return 0;
  }

  // Iterate over all valid points collected earlier.
  for (let currentPointIndex = 0; currentPointIndex < actualPointCount; currentPointIndex++) {
    const pointX = xCoordinates[currentPointIndex];
    const pointY = yCoordinates[currentPointIndex];

    // The condition (pointX * wComponent + pointY * hComponent > 0) checks if the
    // dot product of the point's vector (pointX, pointY) and the direction vector
    // (wComponent, hComponent) is positive.
    // A positive dot product means the point lies in the half-plane defined by the
    // direction vector, indicating an acute angle between the two vectors.
    if (pointX * wComponent + pointY * hComponent > 0) {
      sumXProjections += pointX;
      sumYProjections += pointY;
    }
  }

  // Return the squared Euclidean distance of the resultant vector (sumXProjections, sumYProjections)
  // from the origin.
  return sumXProjections * sumXProjections + sumYProjections * sumYProjections;
}
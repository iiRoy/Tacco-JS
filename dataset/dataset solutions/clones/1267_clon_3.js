'use strict';
// This self-executing module processes input from a designated file to construct and display checkerboard-like patterns.
(function(rawInputData) {

  // Define constant symbols for the alternating pattern elements.
  const PRIMARY_CHAR = '#';
  const SECONDARY_CHAR = '.';

  /**
   * Constructs a rectangular pattern grid based on provided row and column counts.
   * It alternates between two predefined row patterns.
   * @param {number[]} sizePair - An array where the first element is the number of rows (height)
   *                               and the second is the number of columns (width).
   * @returns {string} A multi-line string representing the generated pattern. Returns an empty string
   *                   if dimensions are invalid (non-positive).
   */
  const generateGridPattern = (sizePair) => {
    // Extract the height and width values from the input array.
    const [gridHeight, gridWidth] = sizePair;

    // --- Type III: Added input validation for robustness ---
    if (gridHeight <= 0 || gridWidth <= 0) {
      // If dimensions are non-positive, return an empty string as a graceful failure.
      return '';
    }

    // --- Type III: Rewritten line generation using functional array methods ---
    // Create the first type of row pattern (e.g., #.#.#...).
    const patternSegmentOne = Array.from({
      length: gridWidth
    }, (_, colIdx) =>
      colIdx % 2 === 0 ? PRIMARY_CHAR : SECONDARY_CHAR
    ).join('');

    // Create the second type of row pattern (e.g., .#.#.#...).
    const patternSegmentTwo = Array.from({
      length: gridWidth
    }, (_, colIdx) =>
      colIdx % 2 === 0 ? SECONDARY_CHAR : PRIMARY_CHAR
    ).join('');

    // An array to accumulate the final pattern lines.
    const constructedLines = [];

    // Loop through each row index to build the complete pattern.
    for (let currentLineIdx = 0; currentLineIdx < gridHeight; currentLineIdx++) { // Type II: Renamed 'k' to 'currentLineIdx'
      // Alternate between the two predefined row patterns.
      const selectedLinePattern = currentLineIdx % 2 === 0 ? patternSegmentOne : patternSegmentTwo;
      constructedLines.push(selectedLinePattern);
    }

    // Join all the constructed lines with newline characters to form the final pattern string.
    return constructedLines.join('\n');
  };

  /**
   * Processes the raw input string, extracting dimension pairs [height, width]
   * until a '0 0' sentinel is encountered. Includes validation.
   * --- Type III: This function is an addition, extracting logic from the main block ---
   * @param {string} fullInputText - The entire raw string content read from the input source.
   * @returns {number[][]} An array of arrays, where each inner array is [height, width].
   */
  const extractProblemDimensions = (fullInputText) => {
    // Split the raw input into individual lines, ensuring leading/trailing whitespace is removed.
    const inputLineSegments = fullInputText.toString().trim().split('\n'); // Type II: Renamed 'inputs' to 'inputLineSegments'

    const processedDimensionSets = []; // Type II: Renamed 'data' to 'processedDimensionSets'

    // --- Type III: Using a for...of loop with explicit break for sentinel, instead of slice/indexOf ---
    for (const singleLineText of inputLineSegments) { // Type II: Renamed 'v' to 'singleLineText'
      // Check for the termination sentinel.
      if (singleLineText === '0 0') {
        break; // Exit the loop if the sentinel is found.
      }

      // Parse the line into potential numeric dimensions.
      const currentDimensionValues = singleLineText.split(' ').map(Number);

      // --- Type III: Added robust validation for each input line ---
      // Ensure there are exactly two numbers and both are positive integers.
      const isValidDimensionPair = currentDimensionValues.length === 2 &&
        currentDimensionValues.every(val => Number.isInteger(val) && val > 0);

      if (isValidDimensionPair) {
        processedDimensionSets.push(currentDimensionValues);
      } else {
        // Log a non-fatal warning for malformed input lines.
        console.warn(`Warning: Skipping invalid or malformed input line: "${singleLineText}". Expected two positive integers.`);
      }
    }
    return processedDimensionSets;
  };


  // --- Main Execution Block (Type III: Restructured with error handling) ---
  try {
    // Parse the input data to get all dimension specifications.
    const dimensionSpecifications = extractProblemDimensions(rawInputData);

    // Map each dimension specification to its corresponding generated pattern.
    const generatedPatternCollection = dimensionSpecifications.map(generateGridPattern); // Type II: Renamed 'all' to 'generatedPatternCollection'

    // Join all the individual patterns with two newline characters for clear separation.
    const completeOutputString = generatedPatternCollection.join('\n\n'); // Type II: Renamed 'all' to 'completeOutputString'

    // Print the final combined output to the standard console.
    console.log(completeOutputString);
  } catch (executionError) {
    // --- Type III: Added basic error handling for unexpected issues ---
    console.error('An unexpected error occurred during program execution:', executionError.message);
    // In a production environment, one might choose to exit with a non-zero status.
    // process.exit(1);
  }

  // --- Type III: Explicitly defining the input source outside the main function for clarity ---
  // The input is read synchronously from standard input as a UTF-8 string.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
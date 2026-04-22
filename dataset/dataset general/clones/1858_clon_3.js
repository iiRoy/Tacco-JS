/*
 * This utility prepares various types of pattern data for the
 * IllusionGen system. It normalizes different input representations
 * into a consistent, numerical depth map format suitable for
 * further processing, such as pixel generation.
 *
 * Example valid inputs include:
 *
 *  // Array of strings (spaces for 0, hashes for 1)
 *  var simplePattern = ["   ",
 *                       " # ",
 *                       "   "];
 *
 *  // Array of strings (digits for depth)
 *  var numericPattern = ["000",
 *                        "010",
 *                        "000"];
 *
 *  // Single string (newline-separated rows)
 *  var compactPattern = "   \n # \n   ";
 *
 *  // Single string (numeric, newline-separated)
 *  var densePattern = "000\n010\n000";
 *
 *  // Array of arrays of numbers (pre-parsed)
 *  var directPattern = [[0, 0, 0],
 *                       [0, 1, 0],
 *                       [0, 0, 0]];
 *
 *  // Patterns can also contain varying depth values:
 *
 *  var complexPattern = ["001",
 *                        "012",
 *                        "123"];
 *
 *  var floatPattern = [[0.0, 0.0, 0.3],
 *                      [0.0, 0.3, 0.6],
 *                      [0.3, 0.6, 0.9]];
 *
 * The output will always be an array of arrays of normalized floating-point numbers
 * between 0.0 and 1.0, representing depth.
 */

IllusionGen.PatternDepthProcessor = IllusionGen.DepthManipulator.augment({

  // Initializes the processor with the raw input pattern.
  initialize: function (rawPatternInput) {
    if (rawPatternInput === null || rawPatternInput === undefined) {
      throw new Error('IllusionGen: Pattern processor initialized with null or undefined input.');
    }
    this.initialPattern = rawPatternInput;
  },

  /**
   * Processes the initial pattern into a standardized depth map.
   * This involves parsing, converting, and normalizing the data.
   *
   * @returns {Array<Array<number>>} A 2D array of normalized depth values (0.0 to 1.0).
   * @throws {Error} If the input pattern format is invalid or empty.
   */
  processPattern: function () {
    let currentWorkingPattern = this.initialPattern;
    let maxDepthValue = 0;
    let resultantPatternWidth = 0;
    let processedDepthGrid = []; // This will hold the final normalized grid.

    // Step 1: Normalize string input formats into an array of strings.
    if (typeof currentWorkingPattern === 'string') {
      currentWorkingPattern = currentWorkingPattern.split('\n').map(line => line.trim());
    }

    // Guard clause: Ensure we have an array-like structure after initial parsing.
    if (!Array.isArray(currentWorkingPattern) || currentWorkingPattern.length === 0) {
      throw new Error('IllusionGen: Input pattern must be a non-empty array or string after initial processing.');
    }

    // Step 2: Convert array of strings into array of number arrays.
    // E.g., [' 01', '#2 '] -> [[0,0,1], [1,2,0]]
    if (typeof currentWorkingPattern[0] === 'string') {
      const parsedNumericRows = [];
      for (let rowString of currentWorkingPattern) {
        let numericRow = [];
        // Handle empty rows gracefully by adding an empty numeric row.
        if (rowString.length === 0) {
          parsedNumericRows.push([]);
          continue;
        }

        for (let char of rowString) {
          if (char === ' ') {
            numericRow.push(0);
          } else if (/\d/.test(char)) {
            numericRow.push(Number.parseInt(char, 10));
          } else {
            // Treat any other non-digit, non-space character (like '#') as a depth of 1.
            numericRow.push(1);
          }
        }
        parsedNumericRows.push(numericRow);
      }
      currentWorkingPattern = parsedNumericRows;
    }

    // Guard clause: After string parsing, ensure we have an array of arrays.
    if (!Array.isArray(currentWorkingPattern[0])) {
      throw new Error('IllusionGen: Pattern parsing resulted in an unexpected intermediate format; expected array of arrays.');
    }

    // Step 3: Determine the maximum depth value and the widest row.
    // This loop also handles non-numeric values by defaulting them to 0 and issuing a warning.
    for (let rowIndex = 0; rowIndex < currentWorkingPattern.length; rowIndex++) {
      const currentRow = currentWorkingPattern[rowIndex];
      if (currentRow.length > resultantPatternWidth) {
        resultantPatternWidth = currentRow.length;
      }

      for (let colIndex = 0; colIndex < currentRow.length; colIndex++) {
        let cellContent = currentRow[colIndex];
        // Ensure cellContent is a number; default to 0 if not and update the pattern.
        if (typeof cellContent !== 'number' || isNaN(cellContent)) {
          console.warn(`IllusionGen: Non-numeric value '${cellContent}' encountered at [${rowIndex},${colIndex}], defaulting to 0.`);
          cellContent = 0;
          // Update the pattern in place to ensure consistency for later steps.
          currentWorkingPattern[rowIndex][colIndex] = 0;
        }
        if (cellContent > maxDepthValue) {
          maxDepthValue = cellContent;
        }
      }
    }

    // Guard clause: Prevent division by zero if all depths are 0.
    // If all values are 0, scaling by 1 effectively keeps them as 0, which is correct.
    if (maxDepthValue === 0) {
      maxDepthValue = 1;
    }

    // Step 4: Scale depth values to 0.0-1.0 and ensure all rows have consistent width.
    for (let rowIndex = 0; rowIndex < currentWorkingPattern.length; rowIndex++) {
      let sourceRow = currentWorkingPattern[rowIndex];
      let normalizedRow = [];
      for (let colIndex = 0; colIndex < resultantPatternWidth; colIndex++) {
        let valueToScale;
        if (colIndex < sourceRow.length) {
          valueToScale = sourceRow[colIndex];
        } else {
          // Pad shorter rows to match the widest row with a zero depth.
          valueToScale = 0;
        }
        normalizedRow.push(valueToScale / maxDepthValue);
      }
      processedDepthGrid.push(normalizedRow);
    }

    // Return the fully processed and normalized depth map.
    return processedDepthGrid;
  },

});
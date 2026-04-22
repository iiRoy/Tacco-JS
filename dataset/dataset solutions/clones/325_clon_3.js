/**
 * Type III Clone Generation
 *
 * This file contains a refactored and structurally modified version of the original JavaScript code.
 * Changes include:
 * - Renaming all identifiers for clarity and to avoid collision.
 * - Updating prototype extensions to use modern JavaScript features and add robustness.
 * - Introducing new constants and helper variables.
 * - Adding guard clauses and input validations.
 * - Rewriting logic where appropriate for equivalence or improved readability.
 * - Adding comprehensive comments.
 */

// --- Prototype Extensions: Renamed, Rewritten, and Enhanced ---

/**
 * Extends String prototype to pad the current string on the left with spaces
 * until it reaches the specified target width. This effectively right-aligns the content.
 *
 * @param {number} targetWidth - The desired total length of the string after padding.
 * @returns {string} The right-aligned string. Returns the original string if targetWidth is invalid.
 */
String.prototype.alignRightToWidth = function(targetWidth) {
  // Guard clause: Ensure targetWidth is a valid positive number.
  if (typeof targetWidth !== 'number' || targetWidth < 0 || !Number.isInteger(targetWidth)) {
    // In a production environment, one might throw an error or log more robustly.
    console.warn(`Warning: Invalid target width (${targetWidth}) provided for String.prototype.alignRightToWidth. Returning original string.`);
    return String(this); // Ensure 'this' is treated as a string.
  }
  // Utilize modern String.prototype.padStart for efficient padding.
  return String(this).padStart(targetWidth, ' ');
};

/**
 * Extends Number prototype to format the number as a string,
 * then pad it on the left with spaces to the specified target width.
 * This ensures numeric values are right-aligned when displayed.
 *
 * @param {number} targetWidth - The desired total length for the string representation of the number.
 * @returns {string} The right-aligned string representation of the number.
 */
Number.prototype.formatPadded = function(targetWidth) {
  // Convert the number to a string and delegate to the String.prototype method.
  // The validation for targetWidth is handled by String.prototype.alignRightToWidth.
  return this.toString().alignRightToWidth(targetWidth);
};

/**
 * Extends Array prototype to apply right-alignment to each element
 * within the array, using a specified column width. This is useful for tabular output.
 *
 * @param {number} columnWidth - The desired width for each element's string representation.
 * @returns {Array<string>} An array where each element is a right-aligned string.
 */
Array.prototype.padElementsForDisplay = function(columnWidth) {
  // Use a concise arrow function for the map operation, leveraging the Number.prototype extension.
  return this.map(item => item.formatPadded(columnWidth));
};

/**
 * Extends Array prototype to compute the sum of all numeric elements in the array.
 * Non-numeric elements encountered during summation will be coerced to numbers.
 *
 * @returns {number} The total sum of all elements in the array. Returns 0 for an empty array.
 */
Array.prototype.calculateAggregateSum = function() {
  // Use the reduce method to iterate and sum.
  // Explicitly convert each element to a Number to handle string representations of numbers.
  // The initial accumulator value is set to 0.
  return this.reduce((currentSum, element) => currentSum + Number(element), 0);
};

// --- Main Application Logic ---

// Constants for file system operations and delimiters, promoting readability and maintainability.
const filesystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const newLineDelimiter = '\n';
const spaceDelimiter = ' ';
const zeroStringIndicator = '0'; // Sentinel value to terminate input processing.
const defaultColumnDisplayWidth = 5; // Standard width for output columns.

// Read all input data from standard input.
// Decode as UTF-8, remove any leading/trailing whitespace from the whole input,
// and then split the content into an array of individual lines.
let inputDataLines = filesystemModule.readFileSync(standardInputPath, "utf8").trim().split(newLineDelimiter);

// Guard clause: Check if any input data was actually provided.
if (!inputDataLines || inputDataLines.length === 0 || (inputDataLines.length === 1 && inputDataLines[0] === '')) {
  console.error("Error: No input data found or input file is empty. Exiting.");
  process.exit(1); // Exit with an error code to indicate failure.
}

let blockProcessingCounter = 0; // Tracks the number of data blocks processed.

// Main processing loop: Continues as long as the first line of the input queue
// is not the designated '0' sentinel, indicating the end of input.
while (inputDataLines[0] !== zeroStringIndicator) {
  blockProcessingCounter++;
  // Provide clear separation and identification for each processed block.
  console.log(`\n--- Initiating Processing for Data Block #${blockProcessingCounter} ---`);

  // Extract the first line of the block, which specifies the number of data rows to follow.
  // Use Number() for explicit type conversion and robust error handling.
  let expectedNumberOfRowsInBlock = Number(inputDataLines.shift());

  // Guard clause: Validate the extracted number of rows.
  if (isNaN(expectedNumberOfRowsInBlock) || expectedNumberOfRowsInBlock <= 0) {
    console.error(`Error: Invalid or non-positive number of rows (${expectedNumberOfRowsInBlock}) specified for Data Block #${blockProcessingCounter}. Skipping this block.`);
    // If invalid, attempt to consume any remaining lines that might belong to this malformed block
    // to prevent misinterpretation in subsequent blocks.
    for (let skipLineIdx = 0; skipLineIdx < expectedNumberOfRowsInBlock; skipLineIdx++) {
      if (inputDataLines.length > 0) {
        inputDataLines.shift(); // Consume the line.
      } else {
        break; // Ran out of input prematurely.
      }
    }
    continue; // Move to the next iteration of the while loop to check for the next block.
  }

  // This array will store all numeric data rows for the current block,
  // with each row augmented by its own calculated sum.
  let aggregatedGridData = [];
  // This array will accumulate the sums for each column across all rows.
  let columnSummaryTotals = [];

  // Loop through each data row specified for the current block.
  for (let currentRowIdx = 0; currentRowIdx < expectedNumberOfRowsInBlock; currentRowIdx++) {
    // Extract a line, split it by spaces into individual string values.
    let currentBlockValues = inputDataLines.shift().split(spaceDelimiter);

    // Calculate the sum of the numeric values in the current row.
    let currentLineSum = currentBlockValues.calculateAggregateSum();

    // Append the calculated row sum as the last element of the current row's values.
    currentBlockValues.push(currentLineSum);

    // Store this modified row (which now includes its sum) into our collection for later column summation.
    aggregatedGridData.push(currentBlockValues);

    // Output the current row, with all its elements right-aligned for consistent display.
    console.log(currentBlockValues.padElementsForDisplay(defaultColumnDisplayWidth).join(''));
  }

  // Calculate the sum for each column, including the column containing the row sums (which is the grand total).
  // The loop runs one extra time for the column of row sums.
  for (let currentColumnIdx = 0; currentColumnIdx < expectedNumberOfRowsInBlock + 1; currentColumnIdx++) {
    // For the current column index, map over each row in the aggregated data
    // to extract the value at that specific column.
    // Explicitly convert the extracted value to a Number before summing.
    let singleColumnSum = aggregatedGridData
                              .map(rowData => Number(rowData[currentColumnIdx]))
                              .calculateAggregateSum();
    columnSummaryTotals.push(singleColumnSum);
  }

  // Output the final summary row, which contains the sums for each column.
  console.log(columnSummaryTotals.padElementsForDisplay(defaultColumnDisplayWidth).join(''));
}

// Optional: A final message to indicate that all input blocks have been processed.
console.log("\n--- All input data blocks processed successfully. Exiting. ---");
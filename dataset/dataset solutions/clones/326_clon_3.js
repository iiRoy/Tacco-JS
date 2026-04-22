const fileSystem = require('node:fs');

/**
 * Reads raw input from standard input (file descriptor 0),
 * cleans it by trimming each line, and filters out any entirely empty lines.
 * @returns {string[]} An array of cleaned input lines.
 */
function acquireSanitizedInputLines() {
    let rawInputContent = fileSystem.readFileSync(0, 'utf8');
    const sanitizedLines = rawInputContent.split('\n')
                                        .map(textLine => textLine.trim())
                                        .filter(trimmedLine => trimmedLine.length > 0);
    return sanitizedLines;
}

/**
 * Formats a single numeric value into a 5-character string,
 * right-padded with spaces if necessary.
 * @param {number} numValue - The number to format.
 * @returns {string} The formatted 5-character string.
 */
function formatCellForDisplay(numValue) {
    // Convert to string and pad with spaces to 5 characters.
    // Slice from the end to handle numbers larger than 5 digits by taking the last 5.
    const paddedString = String(numValue).padStart(5, ' ');
    return paddedString.slice(-5);
}

/**
 * Formats an array of numbers into a single string row for display,
 * with each number formatted to 5 characters, and then prints it to stdout.
 * @param {number[]} numericRow - An array of numbers representing a row.
 */
function displayFormattedRow(numericRow) {
    const formattedSegments = numericRow.map(formatCellForDisplay);
    process.stdout.write(formattedSegments.join('') + '\n');
}

// --- Main execution flow ---

let processingQueue = acquireSanitizedInputLines();

if (processingQueue.length === 0) {
    // If no valid input lines are found, terminate early.
    return;
}

let accumulatedRowData = []; // Stores the matrix data rows, each with its sum appended.
let currentMatrixDimension = 0; // Represents 'N' in the original problem context.

// The very first line must define the initial matrix dimension.
const initialConfigLine = processingQueue.shift();
const initialDimensionCandidate = parseInt(initialConfigLine, 10);

if (isNaN(initialDimensionCandidate) || initialDimensionCandidate < 0) {
    // Basic validation for the initial dimension.
    process.stderr.write("Error: Initial matrix dimension must be a non-negative integer.\n");
    return;
}
currentMatrixDimension = initialDimensionCandidate;

// Process remaining lines from the input queue.
while (processingQueue.length > 0) {
    const currentRawInputLine = processingQueue.shift();
    
    // Parse the current line into an array of integers.
    // Handles multiple spaces as delimiters and filters out any non-numeric tokens.
    const parsedNumericValues = currentRawInputLine.split(/\s+/)
                                                 .map(strToken => parseInt(strToken, 10))
                                                 .filter(numValue => !isNaN(numValue));

    // Skip lines that result in no valid numbers after parsing.
    if (parsedNumericValues.length === 0) {
        continue;
    }

    if (parsedNumericValues.length === 1) {
        // This line signals a "print and reset" operation or termination.
        const controlValue = parsedNumericValues[0];

        // Initialize an array to hold column totals.
        // It needs 'currentMatrixDimension + 1' elements because of the added sum column.
        let columnTotals = Array(currentMatrixDimension + 1).fill(0);

        // Iterate through all accumulated data rows to calculate column sums
        // and print each row.
        for (const dataRow of accumulatedRowData) {
            for (let columnIndex = 0; columnIndex <= currentMatrixDimension; columnIndex++) {
                // Ensure we don't access out-of-bounds if a dataRow is malformed.
                if (columnIndex < dataRow.length) {
                    columnTotals[columnIndex] += dataRow[columnIndex];
                }
            }
            displayFormattedRow(dataRow);
        }

        // After processing all data rows, print the calculated column totals.
        displayFormattedRow(columnTotals);

        // Check if the control value signals termination.
        if (controlValue === 0) {
            break; // Exit the main processing loop.
        }

        // Reset for the next set of data: clear accumulated rows and update dimension.
        accumulatedRowData = [];
        currentMatrixDimension = controlValue;
    } else {
        // This line contains data for a new row.
        // Calculate the sum of all numbers in the row.
        const currentRowSum = parsedNumericValues.reduce((accumulator, value) => accumulator + value, 0);
        
        // Create a new array for the row, appending its total sum.
        const rowWithTotal = [...parsedNumericValues, currentRowSum];
        accumulatedRowData.push(rowWithTotal);
    }
}
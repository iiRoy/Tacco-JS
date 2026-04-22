const EMPTY_CELL_MARKER = '.';
const NEWLINE_SEPARATOR = '\n';

/**
 * Rotates a 2D array (matrix) by transposing its rows and columns.
 * For example, [[1,2],[3,4]] becomes [[1,3],[2,4]].
 * @param {Array<Array<string>>} sourceMatrix - The input 2D array of characters.
 * @returns {Array<Array<string>>} The transposed matrix. Returns an empty array if input is invalid.
 */
const performMatrixRotation = (sourceMatrix) => {
    // Defensive check for empty or malformed input matrices
    if (!sourceMatrix || sourceMatrix.length === 0 || sourceMatrix[0] === undefined || sourceMatrix[0].length === 0) {
        return [];
    }

    const numInputRows = sourceMatrix.length;
    const numInputCols = sourceMatrix[0].length; // Assumes all rows have the same number of columns

    // Initialize the rotated matrix with dimensions swapped (cols become rows, rows become cols)
    const rotatedMatrix = Array.from({ length: numInputCols }, () => Array(numInputRows).fill(null));

    // Populate the rotated matrix
    for (let colIdx = 0; colIdx < numInputCols; colIdx++) {
        for (let rowIdx = 0; rowIdx < numInputRows; rowIdx++) {
            rotatedMatrix[colIdx][rowIdx] = sourceMatrix[rowIdx][colIdx];
        }
    }
    return rotatedMatrix;
};

/**
 * Determines if every character in a given array (representing a row or column) is an empty cell marker.
 * @param {Array<string>} targetLineSegment - The array of characters to evaluate.
 * @returns {boolean} True if all characters are empty cell markers, false otherwise.
 */
const isLineCompletelyEmpty = (targetLineSegment) => {
    // An empty array or null/undefined segment is considered completely empty.
    if (!targetLineSegment || targetLineSegment.length === 0) {
        return true;
    }
    // Check if every element strictly matches the designated empty cell marker.
    return targetLineSegment.every(cellContent => cellContent === EMPTY_CELL_MARKER);
};

/**
 * Outputs the contents of a 2D character array to the console, joining each inner array into a string.
 * @param {Array<Array<string>>} gridToDisplay - The 2D array of characters to be printed.
 */
const outputGridToConsole = (gridToDisplay) => {
    if (!gridToDisplay || gridToDisplay.length === 0) {
        // No grid data to display, or grid was entirely filtered out.
        return;
    }
    for (let outputRowIdx = 0; outputRowIdx < gridToDisplay.length; outputRowIdx++) {
        // Join characters of the current row and print to standard output.
        console.log(gridToDisplay[outputRowIdx].join(''));
    }
};

/**
 * Main processing function for a character grid. It reads raw input,
 * filters out rows and columns that are entirely composed of empty cell markers,
 * and then prints the resulting compacted grid.
 * @param {string} rawInputStringData - The raw string input, typically from standard input,
 *                                      where each line represents a row in the grid.
 */
function processInputGrid(rawInputStringData) {
    // Validate the input string before proceeding.
    if (!rawInputStringData || rawInputStringData.trim().length === 0) {
        // If input is empty or just whitespace, there's nothing to process.
        return;
    }

    const allInputLines = rawInputStringData.split(NEWLINE_SEPARATOR);
    let processedGridRows = []; // Accumulates rows that are not completely empty

    // The problem statement implies skipping the first line of input.
    // Iterate through input lines starting from the second line.
    const initialLineSkip = 1;
    for (let currentLineIdx = initialLineSkip; currentLineIdx < allInputLines.length; currentLineIdx++) {
        const lineContent = allInputLines[currentLineIdx].trim(); // Remove leading/trailing whitespace from each line

        // Skip lines that are empty after trimming, as they don't contain grid data.
        if (lineContent.length === 0) {
            continue;
        }

        const characterSequence = lineContent.split('');
        // Only include this row if it contains at least one non-empty cell.
        if (!isLineCompletelyEmpty(characterSequence)) {
            processedGridRows.push(characterSequence);
        }
    }

    // If all rows were filtered out, or input was effectively empty.
    if (processedGridRows.length === 0) {
        return;
    }

    // Step 2: Transpose the grid to make columns accessible as rows for filtering.
    let gridAfterFirstRotation = performMatrixRotation(processedGridRows);

    // If the grid becomes empty after the first rotation (e.g., all input was a single empty column)
    if (gridAfterFirstRotation.length === 0) {
        return;
    }

    // Step 3: Filter out columns that are entirely composed of empty cell markers.
    // This is done on `gridAfterFirstRotation` where columns are now rows.
    let currentColumnProcessingIndex = 0;
    while (currentColumnProcessingIndex < gridAfterFirstRotation.length) {
        if (isLineCompletelyEmpty(gridAfterFirstRotation[currentColumnProcessingIndex])) {
            // Remove the current "column" (which is a row in the rotated grid)
            gridAfterFirstRotation.splice(currentColumnProcessingIndex, 1);
            // Do not increment the index, as the next element has shifted into the current position.
        } else {
            // Move to the next "column"
            currentColumnProcessingIndex++;
        }
    }

    // If all columns were filtered out.
    if (gridAfterFirstRotation.length === 0) {
        return;
    }

    // Step 4: Transpose the grid back to its original orientation after column filtering.
    let finalCompactGrid = performMatrixRotation(gridAfterFirstRotation);

    // Step 5: Display the final, compacted grid to the console.
    outputGridToConsole(finalCompactGrid);
}

// Entry point: Read input from standard input and pass it to the main processing function.
try {
    const fileSystemModule = require("fs");
    const standardInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processInputGrid(standardInputContent);
} catch (errorReadingInput) {
    // In a production environment, this might log the error or provide user feedback.
    // For competitive programming, often silent failure or specific error messages are required.
    // console.error(`Failed to read input from /dev/stdin: ${errorReadingInput.message}`);
}
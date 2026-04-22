const locateRepeatedEntryIndices = (inputNumbersCollection) => {
    // Validate the input: ensure it's an array and not empty.
    // Returning an empty array immediately for invalid input prevents errors and unnecessary processing.
    if (!Array.isArray(inputNumbersCollection) || inputNumbersCollection.length === 0) {
        return [];
    }

    // Initialize a frequency map for digits 1 through 9.
    // The Sudoku context implies digits 1-9. Array index 0 can be ignored or used for other purposes.
    const digitFrequencyMap = new Array(10).fill(0); // Indices 0-9

    // Iterate through each number in the input collection to populate the frequency map.
    for (const currentDigitValue of inputNumbersCollection) {
        // Ensure the current value is a valid number and within the expected Sudoku digit range (1-9).
        if (typeof currentDigitValue === 'number' && currentDigitValue >= 1 && currentDigitValue <= 9) {
            digitFrequencyMap[currentDigitValue]++;
        }
        // Values outside this range (e.g., 0, or non-numbers) are implicitly ignored.
    }

    // Identify all digits that appear two or more times.
    // Using a Set provides efficient O(1) average time complexity for checking membership later.
    const identifiedDuplicateDigits = new Set();
    for (let digitId = 1; digitId <= 9; digitId++) {
        if (digitFrequencyMap[digitId] >= 2) {
            identifiedDuplicateDigits.add(digitId);
        }
    }

    // If no digits were found to be duplicated, there's no need to search for their indices.
    if (identifiedDuplicateDigits.size === 0) {
        return [];
    }

    // Collect the original indices from the input collection where these duplicate digits are located.
    const problematicCellPositions = [];
    for (let originalPosition = 0; originalPosition < inputNumbersCollection.length; originalPosition++) {
        const valueAtCurrentPosition = inputNumbersCollection[originalPosition];
        if (identifiedDuplicateDigits.has(valueAtCurrentPosition)) {
            problematicCellPositions.push(originalPosition);
        }
    }

    return problematicCellPositions;
};

// --- Main program execution starts here ---

// Import the 'fs' module for file system operations, specifically reading from standard input.
const systemInput = require('fs');

// Define constants for Sudoku grid dimensions to enhance readability and maintainability.
const SUDOKU_GRID_SIZE = 9;
const SUDOKU_SUBGRID_SIZE = 3; // For 3x3 blocks

// Read all incoming data from '/dev/stdin' (standard input) as a UTF-8 string.
const rawInputBuffer = systemInput.readFileSync('/dev/stdin', 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into an array of lines.
const processedInputLines = rawInputBuffer.trim().split('\n');

// The very first line of the input indicates the total number of test cases to process.
const totalTestCases = parseInt(processedInputLines.shift(), 10);

// Loop through each individual test case.
for (let currentCaseIteration = 0; currentCaseIteration < totalTestCases; currentCaseIteration++) {
    // Print a newline character as a separator between the outputs of different test cases,
    // but only if it's not the first test case.
    if (currentCaseIteration > 0) {
        console.log('\n');
    }

    // Initialize two 2D arrays: one for the actual Sudoku numbers and another for marking problematic cells.
    // The `activeSudokuMatrix` will hold the numbers parsed from input.
    // The `errorTrackingMatrix` will store a count of rule violations for each cell.
    const activeSudokuMatrix = [];
    const errorTrackingMatrix = [];

    // Populate the `activeSudokuMatrix` and initialize the `errorTrackingMatrix` for the current test case.
    for (let rowIdx = 0; rowIdx < SUDOKU_GRID_SIZE; rowIdx++) {
        // Read a line, split it by spaces, and convert each part to a number.
        const rowData = processedInputLines.shift().split(' ').map(Number);
        activeSudokuMatrix.push(rowData);
        // Each cell in the error tracking matrix starts with 0 violations.
        errorTrackingMatrix.push(new Array(SUDOKU_GRID_SIZE).fill(0));
    }

    // --- Phase 1: Identify duplicates within each row ---
    for (let rIndex = 0; rIndex < SUDOKU_GRID_SIZE; rIndex++) {
        // Call the helper function to find indices of repeated numbers in the current row.
        const rowViolationIndices = locateRepeatedEntryIndices(activeSudokuMatrix[rIndex]);
        // For each identified duplicate position, increment the corresponding cell's error count.
        for (const cIndex of rowViolationIndices) {
            errorTrackingMatrix[rIndex][cIndex]++;
        }
    }

    // --- Phase 2: Identify duplicates within each column ---
    for (let cIndex = 0; cIndex < SUDOKU_GRID_SIZE; cIndex++) {
        // Extract all values for the current column into a temporary array.
        const columnContent = [];
        for (let rIndex = 0; rIndex < SUDOKU_GRID_SIZE; rIndex++) {
            columnContent.push(activeSudokuMatrix[rIndex][cIndex]);
        }
        // Find indices of repeated numbers within this column.
        const columnViolationIndices = locateRepeatedEntryIndices(columnContent);
        // Increment the error count for the cells identified as problematic in this column.
        // Note: The `rIndex` here corresponds to the original row index of the cell in the grid.
        for (const rIndex of columnViolationIndices) {
            errorTrackingMatrix[rIndex][cIndex]++;
        }
    }

    // --- Phase 3: Identify duplicates within each 3x3 subgrid (block) ---
    // Iterate through the 3x3 blocks by their top-left corner offsets.
    for (let blockRowOffsetMultiplier = 0; blockRowOffsetMultiplier < SUDOKU_SUBGRID_SIZE; blockRowOffsetMultiplier++) {
        for (let blockColOffsetMultiplier = 0; blockColOffsetMultiplier < SUDOKU_SUBGRID_SIZE; blockColOffsetMultiplier++) {
            // Calculate the starting row and column for the current 3x3 block.
            const blockStartRow = blockRowOffsetMultiplier * SUDOKU_SUBGRID_SIZE;
            const blockStartCol = blockColOffsetMultiplier * SUDOKU_SUBGRID_SIZE;

            const blockValueCollection = []; // Stores the numbers within the current block.
            const blockOriginalCoordinates = []; // Stores the [row, col] coordinates for each number in `blockValueCollection`.

            // Extract values and their original grid coordinates for the current 3x3 block.
            for (let localRow = 0; localRow < SUDOKU_SUBGRID_SIZE; localRow++) {
                for (let localCol = 0; localCol < SUDOKU_SUBGRID_SIZE; localCol++) {
                    const globalRow = blockStartRow + localRow;
                    const globalCol = blockStartCol + localCol;
                    blockValueCollection.push(activeSudokuMatrix[globalRow][globalCol]);
                    blockOriginalCoordinates.push([globalRow, globalCol]);
                }
            }

            // Find indices of repeated numbers within this 3x3 block.
            const blockViolationIndices = locateRepeatedEntryIndices(blockValueCollection);

            // Increment the error count for each problematic cell, using its original grid coordinates.
            for (const localIndexInBlock of blockViolationIndices) {
                const [originalGridRow, originalGridCol] = blockOriginalCoordinates[localIndexInBlock];
                errorTrackingMatrix[originalGridRow][originalGridCol]++;
            }
        }
    }

    // --- Final Output Formatting and Display ---
    // Transform the `activeSudokuMatrix` into an array of formatted strings for output.
    const formattedOutputRows = activeSudokuMatrix.map((rowContent, rowIndex) => {
        return rowContent.map((cellData, colIndex) => {
            // If a cell has an error count greater than zero, prefix its value with an asterisk.
            // Otherwise, prefix with a space to maintain consistent spacing in the output.
            return errorTrackingMatrix[rowIndex][colIndex] > 0 ? `*${cellData}` : ` ${cellData}`;
        }).join(''); // Join the cells in a row without any separators (e.g., no commas).
    });

    // Print the fully formatted Sudoku grid for the current test case, with rows separated by newlines.
    console.log(formattedOutputRows.join('\n'));
}
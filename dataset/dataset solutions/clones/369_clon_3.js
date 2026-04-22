/**
 * Helper function to identify positions of values that appear more than once in a sequence.
 * This function is designed to work with numeric sequences, converting elements to numbers
 * for comparison and counting.
 *
 * @param {Array<number|string>} numericSequence - An array of values, typically numbers or
 *   strings that can be converted to numbers, representing a segment of a grid (e.g., a row, column, or 3x3 block).
 * @returns {Array<number>} An array containing the original indices within `numericSequence`
 *   where elements that are duplicates (i.e., appear two or more times in the sequence) are located.
 *   Returns an empty array if the input is invalid or no duplicates are found.
 */
function locateDuplicateEntries(numericSequence) {
    // --- Input Validation and Edge Case Handling ---
    // Ensure the input is an array and not empty. If not, there are no duplicates to find.
    if (!Array.isArray(numericSequence) || numericSequence.length === 0) {
        return [];
    }

    // --- Step 1: Count Occurrences of Each Numeric Value ---
    // A Map is used here for its efficiency in storing and retrieving counts for arbitrary numbers.
    // The keys are the numeric values, and the values are their respective frequencies.
    const valueOccurrenceCounts = new Map();

    // Iterate through the input sequence to build the frequency map.
    // A traditional `for` loop is used for explicit index control and potential
    // minor performance benefits over `forEach` in some JavaScript engines,
    // especially when dealing with early exits or complex logic.
    for (let i = 0; i < numericSequence.length; ++i) {
        const currentItem = numericSequence[i];
        // Attempt to convert the current item to a number. This handles cases where
        // input might be strings that represent numbers.
        const numericValue = Number(currentItem);

        // If the conversion results in NaN (Not-a-Number), it means the item is not a valid number.
        // Such items are ignored as they cannot contribute to numeric duplicate checks.
        if (isNaN(numericValue)) {
            continue; // Skip this item and move to the next.
        }

        // Update the count for the `numericValue`. If it's the first time encountering this value,
        // initialize its count to 0 before incrementing.
        valueOccurrenceCounts.set(numericValue, (valueOccurrenceCounts.get(numericValue) || 0) + 1);
    }

    // --- Step 2: Identify Numeric Values That Are Repeated ---
    // A Set is used to store only the unique numeric values that have been identified as duplicates.
    // Using a Set provides O(1) average time complexity for adding and checking for existence,
    // which is beneficial for the next step.
    const repeatedNumericValues = new Set();

    // Iterate through the `valueOccurrenceCounts` map to find values with a count of 2 or more.
    for (const [value, count] of valueOccurrenceCounts.entries()) {
        if (count >= 2) { // A count of 2 or more indicates a duplicate.
            repeatedNumericValues.add(value);
        }
    }

    // --- Step 3: Collect Original Indices of All Duplicate Occurrences ---
    // This array will store the indices from the original `numericSequence` where
    // any of the `repeatedNumericValues` are present.
    const positionsOfDuplicateOccurrences = [];

    // Iterate through the original sequence again to find the positions.
    // `forEach` is suitable here for its direct access to both value and index.
    numericSequence.forEach((element, index) => {
        const elementAsNumber = Number(element);

        // Check if the current element is a valid number and if its numeric value
        // is present in the `repeatedNumericValues` set.
        if (!isNaN(elementAsNumber) && repeatedNumericValues.has(elementAsNumber)) {
            positionsOfDuplicateOccurrences.push(index);
        }
    });

    // Return the list of indices where duplicate numbers were found.
    return positionsOfDuplicateOccurrences;
}

// --- Main application logic for processing Sudoku-like grids ---

// Define constants for grid dimensions to enhance readability and simplify future modifications.
const GRID_DIMENSION = 9; // Standard size for Sudoku grids (9x9).
const SUBGRID_DIMENSION = 3; // Size of the smaller blocks within the grid (3x3).

/**
 * Reads the entire input data from standard input (`/dev/stdin`).
 * Includes error handling for file system operations.
 *
 * @returns {string} The complete content of the standard input as a string.
 * @throws {Error} If there's an issue reading from `/dev/stdin`.
 */
function readInputData() {
    try {
        // Node.js 'fs' module is used to read the file synchronously.
        // This is common in competitive programming environments for quick input processing.
        const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
        return fileContents;
    } catch (error) {
        // If an error occurs during file reading (e.g., file not found, permission denied),
        // log the error message and terminate the process.
        console.error(`Fatal Error: Could not read input data from /dev/stdin. Details: ${error.message}`);
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }
}

// Read the raw input content and process it into an array of lines.
const rawInputContent = readInputData();
const allInputLines = rawInputContent.trim().split('\n'); // Trim whitespace and split by newline.

// Extract the total number of test cases from the very first line of the input.
// `parseInt` is used with a radix (base 10) for robust conversion.
const numberOfTestCases = parseInt(allInputLines.shift(), 10);

// --- Global Input Validation: Number of Test Cases ---
// Ensure that the extracted number of test cases is a valid non-negative integer.
if (isNaN(numberOfTestCases) || numberOfTestCases < 0) {
    console.error("Input Error: The first line must specify a valid non-negative integer for the number of test cases.");
    process.exit(1); // Terminate if the input is malformed at this critical point.
}

// --- Main Loop: Process Each Test Case ---
for (let currentCaseIndex = 0; currentCaseIndex < numberOfTestCases; ++currentCaseIndex) {
    // --- Grid Initialization for the Current Test Case ---
    // `mainGridData` will store the actual Sudoku numbers read from the input.
    const mainGridData = [];

    // `duplicateFlagGrid` is a 2D array used to mark positions where duplicate numbers are found.
    // Each cell will store a count; a value > 0 indicates a duplicate was found at that position
    // in at least one check (row, column, or block).
    const duplicateFlagGrid = Array.from({ length: GRID_DIMENSION },
        () => new Array(GRID_DIMENSION).fill(0)
    );

    // --- Reading and Parsing the Grid for the Current Test Case ---
    for (let rowIndex = 0; rowIndex < GRID_DIMENSION; ++rowIndex) {
        const currentLine = allInputLines.shift(); // Get the next line, which should be a grid row.

        // --- Per-Row Input Validation ---
        // Check if a line was actually read. If not, it indicates insufficient input data.
        if (!currentLine) {
            console.error(`Input Warning: Missing grid row ${rowIndex + 1} for test case ${currentCaseIndex + 1}. Filling with zeros.`);
            // In a real application, one might throw an error or skip the test case.
            // Here, we push a row of zeros to maintain grid structure and prevent cascading errors.
            mainGridData.push(new Array(GRID_DIMENSION).fill(0));
            continue; // Move to the next row.
        }

        // Parse the line:
        // 1. `split(/\s+/)`: Splits the string by one or more whitespace characters.
        // 2. `filter(Boolean)`: Removes any empty strings that result from multiple spaces (e.g., "1  2" -> ["1", "", "2"] -> ["1", "2"]).
        // 3. `map(val => parseInt(val, 10))`: Converts each string part to an integer using base 10.
        const parsedRow = currentLine.split(/\s+/).filter(Boolean).map(val => parseInt(val, 10));

        // Additional validation: Check if the parsed row has the correct number of elements
        // and if all elements successfully converted to numbers (no NaNs).
        if (parsedRow.length !== GRID_DIMENSION || parsedRow.some(isNaN)) {
            console.error(`Input Warning: Malformed row data at row ${rowIndex + 1} in test case ${currentCaseIndex + 1}. Expected ${GRID_DIMENSION} numbers. Row: "${currentLine}". Filling with zeros.`);
            mainGridData.push(new Array(GRID_DIMENSION).fill(0));
            continue;
        }
        mainGridData.push(parsedRow); // Add the validated and parsed row to the main grid.
    }

    // --- Helper Function: Process a Generic Grid Segment ---
    /**
     * This function generalizes the process of checking for duplicates within any segment
     * (row, column, or 3x3 block) and marking their positions in the global `duplicateFlagGrid`.
     * This significantly reduces code duplication.
     *
     * @param {Array<number>} segmentValues - An array of numbers representing the current segment.
     * @param {Array<[number, number]>} globalCoordinates - An array where each element is a
     *   `[row, col]` pair, mapping the corresponding index in `segmentValues` to its
     *   global grid coordinates.
     * @param {Array<Array<number>>} markerGrid - The 2D array (`duplicateFlagGrid`) that
     *   gets updated to mark duplicate positions.
     */
    const processGridSegment = (segmentValues, globalCoordinates, markerGrid) => {
        // Use the `locateDuplicateEntries` function to find indices within this segment
        // that contain numbers appearing more than once.
        const duplicateLocalIndices = locateDuplicateEntries(segmentValues);

        // For each local index that was identified as a duplicate within the segment,
        // map it back to its global grid coordinates and increment the marker in the `markerGrid`.
        for (const localIdx of duplicateLocalIndices) {
            // Retrieve the global row and column from the `globalCoordinates` array.
            const [globalR, globalC] = globalCoordinates[localIdx];

            // Basic bounds checking to ensure coordinates are valid before marking.
            if (globalR >= 0 && globalR < GRID_DIMENSION && globalC >= 0 && globalC < GRID_DIMENSION) {
                markerGrid[globalR][globalC]++; // Increment the counter at the duplicate's position.
            }
        }
    };

    // --- Phase 1: Check Each Row for Duplicate Numbers ---
    // Iterate through each row of the `mainGridData`.
    for (let r = 0; r < GRID_DIMENSION; ++r) {
        // Generate an array of global coordinates for the current row.
        // Each coordinate pair `[r, colIdx]` corresponds to an element in `mainGridData[r]`.
        const rowGlobalCoords = Array.from({ length: GRID_DIMENSION }, (_, colIdx) => [r, colIdx]);
        // Process the current row using the generalized helper function.
        processGridSegment(mainGridData[r], rowGlobalCoords, duplicateFlagGrid);
    }

    // --- Phase 2: Check Each Column for Duplicate Numbers ---
    // Iterate through each column of the grid.
    for (let c = 0; c < GRID_DIMENSION; ++c) {
        const columnValues = []; // To store numbers from the current column.
        const columnGlobalCoords = []; // To store global coordinates for numbers in this column.

        // Extract values and their corresponding global coordinates for the current column.
        for (let r = 0; r < GRID_DIMENSION; ++r) {
            columnValues.push(mainGridData[r][c]);
            columnGlobalCoords.push([r, c]);
        }
        // Process the current column.
        processGridSegment(columnValues, columnGlobalCoords, duplicateFlagGrid);
    }

    // --- Phase 3: Check Each 3x3 Subgrid (Block) for Duplicate Numbers ---
    // Iterate through the starting row index of each 3x3 block (0, 3, 6).
    for (let blockRowStart = 0; blockRowStart < GRID_DIMENSION; blockRowStart += SUBGRID_DIMENSION) {
        // Iterate through the starting column index of each 3x3 block (0, 3, 6).
        for (let blockColStart = 0; blockColStart < GRID_DIMENSION; blockColStart += SUBGRID_DIMENSION) {
            const blockValues = []; // To store numbers within the current 3x3 block.
            const blockGlobalCoords = []; // To store global coordinates for numbers in this block.

            // Extract values and their global coordinates for the current 3x3 block.
            // `rOffset` and `cOffset` represent positions within the 3x3 block (0, 1, 2).
            for (let rOffset = 0; rOffset < SUBGRID_DIMENSION; ++rOffset) {
                for (let cOffset = 0; cOffset < SUBGRID_DIMENSION; ++cOffset) {
                    const globalRow = blockRowStart + rOffset; // Calculate global row index.
                    const globalCol = blockColStart + cOffset; // Calculate global column index.
                    blockValues.push(mainGridData[globalRow][globalCol]);
                    blockGlobalCoords.push([globalRow, globalCol]);
                }
            }
            // Process the current 3x3 block.
            processGridSegment(blockValues, blockGlobalCoords, duplicateFlagGrid);
        }
    }

    // --- Final Output Formatting and Printing ---
    // Transform the `mainGridData` into an array of formatted strings,
    // applying an asterisk '*' prefix to cells flagged as duplicates.
    const formattedOutputStrings = mainGridData.map((row, rIndex) => {
        // For each row, map its cell values to formatted strings.
        return row.map((cellValue, cIndex) => {
            // Determine the prefix: '*' if `duplicateFlagGrid` at this position is > 0, else ' '.
            const prefix = duplicateFlagGrid[rIndex][cIndex] > 0 ? '*' : ' ';
            // Use a template literal for clear string concatenation.
            return `${prefix}${cellValue}`;
        }).join(''); // Join the formatted cell strings of the current row without any separators.
    });

    // Print the complete formatted grid to the console. Each element of `formattedOutputStrings`
    // represents a row, and they are joined by newline characters.
    console.log(formattedOutputStrings.join('\n'));
}
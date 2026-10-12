/**
 * This module provides a utility function to detect duplicate numbers within an array
 * and applies this logic to validate Sudoku puzzles read from standard input.
 * It marks cells that violate Sudoku rules (duplicates in row, column, or 3x3 block)
 * with an asterisk in the output.
 */

/**
 * Identifies numbers that appear more than once within a given array
 * and returns the original indices of all occurrences of these duplicate numbers.
 *
 * @param {number[]} inputArray - The array of numeric values to be examined.
 * @returns {number[]} An array containing the zero-based indices of all elements
 *                     in `inputArray` that are part of a duplicate set.
 */
function FindDuplicates(inputArray) {
    // Initialize a frequency map (array) to count occurrences of digits 0 through 9.
    // Sudoku numbers are 1-9, so index 0 might remain unused, but a size of 10
    // accommodates all single-digit numbers.
    let occurrenceCounts = new Array(10).fill(0);

    // Iterate through the provided array to tally the frequency of each number.
    inputArray.forEach(function(currentValue) {
        // Use unary plus to ensure `currentValue` is treated as a number,
        // then increment its corresponding count.
        occurrenceCounts[+currentValue]++;
    });

    // Determine which specific number values (e.g., 1, 5, 9) are present two or more times.
    let duplicateValues = [];
    occurrenceCounts.forEach(function(count, index) {
        // If a number's count is 2 or more, it signifies a duplicate.
        if (count >= 2) {
            duplicateValues.push(index);
        }
    });

    // Collect the indices from the original `inputArray` where these identified
    // duplicate values are located.
    let duplicateIndices = [];
    inputArray.forEach(function(elementValue, elementIndex) {
        // Check if the current element's value is one of the values identified as a duplicate.
        if (duplicateValues.indexOf(elementValue) !== -1) {
            duplicateIndices.push(elementIndex);
        }
    });

    return duplicateIndices;
}

// --- Main program execution begins here ---

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
const lineData = rawData.trim().split("\n");

// The very first line of input specifies how many Sudoku puzzles (test cases) are to be processed.
let numberOfTestCases = parseInt(lineData.shift(), 10); // Convert the first line to an integer.

// Loop through each Sudoku puzzle test case.
for (let caseIterator = 0; caseIterator < numberOfTestCases; caseIterator++) {
    // If this is not the first test case, print a newline character
    // to separate the output of the current case from the previous one.
    if (caseIterator !== 0) {
        console.log("\n");
    }

    // Initialize two 2D arrays for the current puzzle:
    // `puzzleGrid` will store the actual numbers of the Sudoku grid.
    // `violationGrid` will act as a counter for rule violations at each cell.
    let puzzleGrid = [];
    let violationGrid = [];

    // Read the 9x9 Sudoku grid for the current test case from the input lines.
    for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
        // Each line represents a row; split it by spaces and convert all parts to numbers.
        let rowNumbers = lineData.shift().split(" ").map(Number);
        puzzleGrid.push(rowNumbers);
        // For every row added to `puzzleGrid`, initialize a corresponding row
        // in `violationGrid` with all zeros.
        violationGrid.push(new Array(9).fill(0));
    }

    // --- Validation Step 1: Check for duplicate numbers within each row ---
    for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
        // Use the `FindDuplicates` function to get indices of problematic cells in the current row.
        let problematicIndices = FindDuplicates(puzzleGrid[rowIdx]);
        // For each index identified as problematic, increment the violation counter
        // for that specific cell in the `violationGrid`.
        problematicIndices.forEach(function(problemIndex) {
            violationGrid[rowIdx][problemIndex]++;
        });
    }

    // --- Validation Step 2: Check for duplicate numbers within each column ---
    for (let colIdx = 0; colIdx < 9; colIdx++) {
        let columnValues = [];
        // Extract all numbers that belong to the current column across all rows.
        for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
            columnValues.push(puzzleGrid[rowIdx][colIdx]);
        }
        // Find indices of duplicate numbers within this extracted column.
        let problematicIndices = FindDuplicates(columnValues);
        // For each problematic index (which corresponds to a row index in the main grid),
        // increment the violation counter for the cell at that row and the current column.
        problematicIndices.forEach(function(problemIndex) {
            violationGrid[problemIndex][colIdx]++;
        });
    }

    // --- Validation Step 3: Check for duplicate numbers within each 3x3 subgrid (block) ---
    // Iterate through the 3 rows of 3x3 blocks.
    for (let blockRow = 0; blockRow < 3; blockRow++) {
        // Iterate through the 3 columns of 3x3 blocks.
        for (let blockCol = 0; blockCol < 3; blockCol++) {
            // Calculate the absolute row and column coordinates for the top-left cell
            // of the current 3x3 block.
            let startRow = blockRow * 3;
            let startCol = blockCol * 3;

            // Define the absolute grid coordinates for all 9 cells within this 3x3 block.
            const blockCoordinates = [
                [startRow + 0, startCol + 0], [startRow + 0, startCol + 1], [startRow + 0, startCol + 2],
                [startRow + 1, startCol + 0], [startRow + 1, startCol + 1], [startRow + 1, startCol + 2],
                [startRow + 2, startCol + 0], [startRow + 2, startCol + 1], [startRow + 2, startCol + 2]
            ];

            let blockValues = [];
            // Extract the actual number values from the `puzzleGrid` using the defined block coordinates.
            blockCoordinates.forEach(function(coords) {
                blockValues.push(puzzleGrid[coords[0]][coords[1]]);
            });

            // Find indices of duplicate numbers within this block's extracted values.
            let problematicIndices = FindDuplicates(blockValues);
            // For each problematic index (which is relative to the `blockValues` array),
            // map it back to its original grid coordinates and increment the violation counter.
            problematicIndices.forEach(function(problemIndex) {
                let originalRow = blockCoordinates[problemIndex][0];
                let originalCol = blockCoordinates[problemIndex][1];
                violationGrid[originalRow][originalCol]++;
            });
        }
    }

    // --- Final Output Formatting ---
    // Iterate through the `puzzleGrid` to apply the final output formatting.
    puzzleGrid.forEach(function(currentRow, rowIndex) {
        currentRow.forEach(function(cellValue, colIndex) {
            // If a cell has one or more violations recorded in `violationGrid`,
            // prefix its value with an asterisk. Otherwise, prefix it with a space
            // to maintain consistent spacing in the output.
            puzzleGrid[rowIndex][colIndex] = (violationGrid[rowIndex][colIndex] >= 1) ? "*" + cellValue : " " + cellValue;
        });
    });

    // Print the formatted Sudoku grid to standard output.
    // Rows are joined by newline characters. The `.replace(/,/g, "")` call
    // removes any commas that might be introduced when inner arrays are implicitly
    // converted to strings before the final `join("\n")`.
    console.log(puzzleGrid.join("\n").replace(/,/g, ""));
}

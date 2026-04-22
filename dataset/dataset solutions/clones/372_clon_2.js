/*
This script processes Sudoku-like grid data to identify cells involved in
duplicate number violations within rows, columns, and 3x3 subgrids.
It then formats the grid, marking problematic cells.
*/

// Function to pinpoint indices of elements that appear two or more times
// within a given list of numbers.
let FindDuplicates = function (numericList) {
    // Initialize a frequency counter for digits 0-9.
    const occurrenceCounter = Array(10).fill(0);

    // Populate the frequency counter by iterating through the input list.
    numericList.forEach((item) => {
        occurrenceCounter[item]++; // Increment count for the current number.
    });

    // Identify numbers that have appeared two or more times.
    const repeatedElements = [];
    occurrenceCounter.forEach((count, digit) => {
        if (count >= 2) {
            repeatedElements.push(digit);
        }
    });

    // Collect the original indices where these repeated elements are located.
    const anomalyPositions = [];
    numericList.forEach((item, index) => {
        if (repeatedElements.includes(item)) { // Check if the current item is a repeated number.
            anomalyPositions.push(index);
        }
    });

    return anomalyPositions; // Return the list of indices of problematic cells.
};


// Main execution block starts here
// Read all incoming data from standard input, decode as UTF-8.
const fileContent = require('fs')
    .readFileSync('/dev/stdin', 'utf8');


// Split the input content into an array of lines and remove leading/trailing whitespace.
let parsedLines = fileContent
    .trim()
    .split("\n");

// Buffer to accumulate the formatted output for all test cases.
let finalOutput = "";

// Extract the total number of test cases from the first line of input.
const totalTests = parseInt(parsedLines.shift(), 10); // Convert to integer.

// Iterate through each test case.
for (let testIterator = 0; testIterator < totalTests; testIterator++) {
    // gridData will store the numerical values of the Sudoku grid (9x9).
    const gridData = [];
    // issueTracker will store the count of violations for each cell (9x9).
    const issueTracker = Array(9).fill(null).map(() => Array(9).fill(0));

    // Populate the gridData from the input lines for this test case.
    // Also, initialize the issueTracker with zeros.
    for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
        // Read a line, split by space, and convert each part to a number.
        const rowContent = parsedLines.shift().split(" ").map(Number);
        gridData.push(rowContent);
    }

    // --- Check for duplicates within each row ---
    for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
        // Find indices of duplicates in the current row.
        const repeatPositions = FindDuplicates(gridData[rowIdx]);
        // Increment the violation count for affected cells in this row.
        repeatPositions.forEach((colIdx) => {
            issueTracker[rowIdx][colIdx]++;
        });
    }

    // --- Check for duplicates within each column ---
    for (let colIdx = 0; colIdx < 9; colIdx++) {
        // Construct a temporary array representing the current column.
        const verticalElements = [];
        for (let rowIdx = 0; rowIdx < 9; rowIdx++) {
            verticalElements.push(gridData[rowIdx][colIdx]);
        }
        // Find indices of duplicates in this column.
        const repeatPositions = FindDuplicates(verticalElements);
        // Increment the violation count for affected cells in this column.
        repeatPositions.forEach((rowOfRepeat) => {
            issueTracker[rowOfRepeat][colIdx]++;
        });
    }

    // --- Check for duplicates within each 3x3 subgrid (block) ---
    for (let blockRow = 0; blockRow < 3; blockRow++) {
        for (let blockCol = 0; blockCol < 3; blockCol++) {
            // Define the coordinates of cells within the current 3x3 block.
            const subgridCoords = [
                [blockRow * 3, blockCol * 3], [blockRow * 3, blockCol * 3 + 1], [blockRow * 3, blockCol * 3 + 2],
                [blockRow * 3 + 1, blockCol * 3], [blockRow * 3 + 1, blockCol * 3 + 1], [blockRow * 3 + 1, blockCol * 3 + 2],
                [blockRow * 3 + 2, blockCol * 3], [blockRow * 3 + 2, blockCol * 3 + 1], [blockRow * 3 + 2, blockCol * 3 + 2]
            ];

            // Extract the values of cells within this 3x3 block.
            const subgridValues = [];
            subgridCoords.forEach((coords) => {
                subgridValues.push(gridData[coords[0]][coords[1]]);
            });

            // Find indices of duplicates within this subgrid.
            const repeatPositions = FindDuplicates(subgridValues);

            // Increment the violation count for affected cells in this subgrid.
            repeatPositions.forEach((localIndex) => {
                const [globalRow, globalCol] = subgridCoords[localIndex];
                issueTracker[globalRow][globalCol]++;
            });
        }
    }

    // --- Format the grid for output, marking violated cells ---
    gridData.forEach((rowContent, rowIndex) => {
        rowContent.forEach((cellValue, colIndex) => {
            // If a cell has one or more violations, prepend an asterisk.
            // Otherwise, prepend a space for alignment.
            gridData[rowIndex][colIndex] = (issueTracker[rowIndex][colIndex] >= 1) ? "*" + cellValue : " " + cellValue;
        });
    });

    // Join the rows of the modified grid, replace internal commas, and append to the final output buffer.
    // Add an extra newline for separation between test cases.
    finalOutput += gridData.map(row => row.join("")).join("\n") + "\n\n";
}

// Print the accumulated output, removing any trailing newlines from the last test case.
console.log(finalOutput.trim());
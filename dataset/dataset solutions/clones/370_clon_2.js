function IdentifyRepeats(dataCollection) {
    // Initialize an array to count occurrences of digits 0-9.
    // This assumes input values are single digits (0-9) as per the original logic.
    let valueCounts = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Iterate through the input array to populate the count of each digit.
    dataCollection.forEach(function(currentValue) {
        valueCounts[currentValue - 0]++; // Convert to number and increment count.
    });

    // Identify which specific digit values are repeated (appear 2 or more times).
    let repeatedNumbers = [];
    valueCounts.forEach(function(frequency, digit) {
        if (frequency >= 2) { // If a digit's frequency is two or more.
            repeatedNumbers.push(digit);
        }
    });

    // Collect the indices from the original array where these repeated values are located.
    let problematicPositions = [];
    dataCollection.forEach(function(item, position) {
        if (repeatedNumbers.indexOf(item) !== -1) { // If the current item is one of the identified repeated values.
            problematicPositions.push(position);
        }
    });

    return problematicPositions; // Return an array of indices where duplicates exist.
}

// Read the entire input from standard input as a UTF-8 string.
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim leading/trailing whitespace and split into an array of lines.
let inputLines = fileContent.trim().split("\n");

// Initialize a string buffer to accumulate the formatted output for all test cases.
let finalOutputString = "";

// Extract the total number of test cases from the first line of input.
const totalCases = inputLines.shift() - 0; // Convert the string to a number.

// Loop through each test case.
for (let caseIterator = 0; caseIterator < totalCases; caseIterator++) {
    // `currentGrid` will store the actual Sudoku numbers for the current puzzle.
    let currentGrid = [];
    // `errorMarkers` will be a parallel grid to mark cells that contain duplicate values.
    let errorMarkers = [];

    // Read the 9 rows of the Sudoku grid for the current test case.
    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
        // Parse each line: split by space and convert elements to numbers.
        const rowString = inputLines.shift().split(" ").map(Number);
        currentGrid.push(rowString);
        // Initialize a corresponding row in the error marker grid with zeros.
        errorMarkers.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    // Perform checks for duplicate numbers across rows, columns, and 3x3 subgrids.
    for (let checkIndex = 0; checkIndex < 9; checkIndex++) {
        // 1. Check for duplicates in the current row (`checkIndex`).
        const horizontalIssues = IdentifyRepeats(currentGrid[checkIndex]);
        horizontalIssues.forEach(function(colPos) {
            errorMarkers[checkIndex][colPos]++; // Increment marker for each problematic cell in the row.
        });

        // 2. Construct a temporary array for the current column (`checkIndex`).
        let verticalSlice = [];
        for (let colNum = 0; colNum < 9; colNum++) {
            verticalSlice.push(currentGrid[colNum][checkIndex]);
        }
        // Check for duplicates in the current column.
        const verticalIssues = IdentifyRepeats(verticalSlice);
        verticalIssues.forEach(function(rowPos) {
            errorMarkers[rowPos][checkIndex]++; // Increment marker for each problematic cell in the column.
        });

        // 3. Determine the top-left coordinates of the current 3x3 subgrid.
        const blockY = ~~(checkIndex / 3); // Integer division for the block's row index (0, 1, or 2).
        const blockX = checkIndex % 3;     // Modulo for the block's column index (0, 1, or 2).

        // Define the 9 (row, col) coordinates within this 3x3 subgrid.
        const subgridCoords = [
            [0 + blockY * 3, 0 + blockX * 3], [0 + blockY * 3, 1 + blockX * 3], [0 + blockY * 3, 2 + blockX * 3],
            [1 + blockY * 3, 0 + blockX * 3], [1 + blockY * 3, 1 + blockX * 3], [1 + blockY * 3, 2 + blockX * 3],
            [2 + blockY * 3, 0 + blockX * 3], [2 + blockY * 3, 1 + blockX * 3], [2 + blockY * 3, 2 + blockX * 3]
        ];

        // Extract the values from the current 3x3 subgrid.
        let subgridElements = [];
        subgridCoords.forEach(function(cellCoord) {
            subgridElements.push(currentGrid[cellCoord[0]][cellCoord[1]]);
        });
        // Check for duplicates within the current 3x3 subgrid.
        const subgridIssues = IdentifyRepeats(subgridElements);
        subgridIssues.forEach(function(elementIdxInBlock) {
            // Use the stored coordinates to mark the actual cell in the error marker grid.
            errorMarkers[subgridCoords[elementIdxInBlock][0]][subgridCoords[elementIdxInBlock][1]]++;
        });
    }

    // Format the `currentGrid` for output based on the `errorMarkers`.
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            // If a cell has been marked as problematic (marker value >= 1), prepend an asterisk.
            // Otherwise, prepend a space for consistent formatting.
            currentGrid[r][c] = (errorMarkers[r][c] >= 1) ? "*" + currentGrid[r][c] : " " + currentGrid[r][c];
        }
    }

    // Join the rows of the formatted grid with newlines, remove commas, and append to the output buffer.
    finalOutputString += currentGrid.join("\n").replace(/,/g, "") + "\n\n";
}

// Print the final accumulated output string, trimming any trailing newlines.
console.log(finalOutputString.trim());

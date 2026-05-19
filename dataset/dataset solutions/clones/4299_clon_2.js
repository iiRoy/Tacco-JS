process.stdin.resume();
process.stdin.setEncoding('utf8');
var rawInputData = ''; // Stores all incoming data from standard input

process.stdin.on('data', function (dataChunk) {
    rawInputData += dataChunk; // Append each chunk of data
});

/**
 * Parses a space-separated string into an array of numbers.
 * Trims leading/trailing whitespace and converts each part to a number.
 * @param {string} inputLine - The string line to parse.
 * @returns {number[]} An array of numbers.
 */
const parseNumericLine = function (inputLine) {
    // Remove leading/trailing spaces, then split by single space
    var parsedValues = inputLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // Convert each string element to a number
    for (var idx = 0; idx < parsedValues.length; ++idx) {
        parsedValues[idx] = +parsedValues[idx];
    }
    return parsedValues;
};

/**
 * Parses a space-separated string into an array of strings.
 * Trims leading/trailing whitespace.
 * NOTE: This function is defined but not used in the main logic.
 * @param {string} inputLine - The string line to parse.
 * @returns {string[]} An array of strings.
 */
const parseStringLine = function (inputLine) {
    var parsedValues = inputLine.replace(/(^\s+)|(\s+$)/g, "").split(" ");
    // No type conversion needed, elements remain strings
    for (var idx = 0; idx < parsedValues.length; ++idx) {
        parsedValues[idx] = parsedValues[idx]; // Explicitly assign itself (no-op)
    }
    return parsedValues;
};

process.stdin.on('end', function () {
    // Split the entire input string by newline characters
    const inputLines = rawInputData.split('\n');

    // Parse the first line for grid dimensions (Width and Height)
    const dimensions = parseNumericLine(inputLines[0]);
    const gridWidth = dimensions[0];
    const gridHeight = dimensions[1];

    // Process subsequent lines to form the grid map
    // Filter out empty lines, then split each line into an array of characters
    const gridMap = inputLines.slice(1).filter(val => val.length > 0).map(lineStr => lineStr.split(""));

    let finalResult = []; // This variable is declared but not used in the original logic.

    // Define the 8 possible neighbor offsets (excluding self)
    let neighborOffsets = [];
    for (let rowOffset = -1; rowOffset <= 1; ++rowOffset) {
        for (let colOffset = -1; colOffset <= 1; ++colOffset) {
            // Exclude the (0,0) offset which represents the current cell itself
            if (rowOffset !== 0 || colOffset !== 0) {
                neighborOffsets.push([rowOffset, colOffset]);
            }
        }
    }

    // Iterate through each cell of the grid
    for (let currentRow = 0; currentRow < gridHeight; ++currentRow) {
        for (let currentCol = 0; currentCol < gridWidth; ++currentCol) {
            // If the current cell is an empty spot ('.')
            if (gridMap[currentRow][currentCol] === ".") {
                let hashCount = 0; // Counter for adjacent '#' cells

                // Check all 8 neighbors
                for (let offsetPair of neighborOffsets) {
                    const neighborRow = currentRow + offsetPair[0];
                    const neighborCol = currentCol + offsetPair[1];

                    // Check if the neighbor is within grid boundaries
                    if (neighborRow < gridHeight && neighborRow >= 0 && neighborCol < gridWidth && neighborCol >= 0) {
                        // If the neighbor cell contains a '#'
                        if (gridMap[neighborRow][neighborCol] === "#") {
                            hashCount++; // Increment the count
                        }
                    }
                }
                // Update the current empty cell with the count of adjacent '#'
                gridMap[currentRow][currentCol] = hashCount;
            }
        }
        // After processing all columns in the current row, print the row
        // Join the characters/numbers in the row back into a string
        console.log(gridMap[currentRow].join(""));
    }
});

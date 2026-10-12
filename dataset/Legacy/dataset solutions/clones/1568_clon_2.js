/**
 * Processes the given input string.
 * @param {string} inputData The raw input string.
 */
function ProcessInput(inputData) {
    // Split the input into lines: the first line and the rest.
    const [initialLine, ...remainingLines] = inputData.split("\n");

    // Parse the height and width from the first line.
    const [heightVal, widthVal] = parseNumbers(initialLine);

    // Convert remaining lines into a 2D array of numbers.
    // The original code uses `arr.unshift(null)` to make it 1-indexed for `y`.
    // So, `gridData[y]` corresponds to the y-th row.
    const gridData = createMatrix(remainingLines, ' ').map(rowStr => rowStr.map(cellStr => parseInt(cellStr, 10)));
    gridData.unshift(null); // Add a dummy element at index 0 for 1-based indexing convenience.

    /**
     * Stores the minimum step counts to reach each row.
     * Initialized with -1 to indicate unreached rows.
     * @type {Array<number>}
     */
    let pathCounts = new Array(heightVal).fill(-1);

    // Loop through possible starting columns (1 to widthVal).
    for (let colIndex = 1; colIndex <= widthVal; colIndex++) {
        let currentX = colIndex; // Current column position.
        let currentY = 1;         // Current row position, starting from the first row.
        let stepCounter = 0;      // Number of moves made.

        // This is the main movement loop for a given starting column.
        outerLoop: while (true) {
            stepCounter++; // Increment move count for each step.

            // Check if the current position allows moving down.
            if (canDescend(currentX, currentY)) {
                currentY++; // Move down to the next row.
                // If this path is shorter or the row hasn't been reached yet, update pathCounts.
                if (pathCounts[currentY - 2] === -1 || stepCounter < pathCounts[currentY - 2]) {
                    pathCounts[currentY - 2] = stepCounter;
                }
            } else {
                currentX++; // Cannot move down, so move right.
            }

            // If we've moved beyond the grid's width, this path is invalid or finished.
            if (currentX > widthVal) break outerLoop;
        }
    }

    // Output the final array of minimum step counts.
    console.log(pathCounts);

    /**
     * Determines if a downward move is possible from the current (x, y) position.
     * A move down is possible if the current x-coordinate is NOT within the blocked range [startBound, endBound] for the current row.
     * @param {number} x The current column index.
     * @param {number} y The current row index.
     * @returns {boolean} True if a downward move is allowed, false otherwise.
     */
    function canDescend(x, y) {
        // Retrieve the blocking range for the current row.
        const [startBound, endBound] = gridData[y];
        // Return true if x is outside the blocked range.
        return !(startBound <= x && x <= endBound);
    }
}

// This line handles standard input and calls the main processing function.
// Do not modify this part as it's critical for execution environment.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// --- Utility Functions ---

/**
 * Converts a string of space-separated numbers into an array of integers.
 * @param {string} inputString The string containing numbers.
 * @param {string} separatorChar The delimiter character (defaults to space).
 * @returns {Array<number>} An array of parsed integers.
 */
function parseNumbers(inputString, separatorChar = ' ') {
    return inputString.split(separatorChar).map(numStr => parseInt(numStr, 10));
}

/**
 * Converts a string of space-separated numbers into an array of BigInts.
 * @param {string} inputString The string containing numbers.
 * @param {string} separatorChar The delimiter character (defaults to space).
 * @returns {Array<BigInt>} An array of parsed BigInts.
 */
function parseBigInts(inputString, separatorChar = ' ') {
    return inputString.split(separatorChar).map(numStr => BigInt(numStr));
}

/**
 * Transforms an array of strings into a 2D array (matrix).
 * Each string in the input array is split by the delimiter.
 * @param {Array<string>} stringArray An array where each element is a string representing a row.
 * @param {string} separatorChar The delimiter character (defaults to space).
 * @returns {Array<Array<string>>} A 2D array of strings.
 */
function createMatrix(stringArray, separatorChar = ' ') {
    const resultMatrix = stringArray.map(rowString => rowString.split(separatorChar));
    return resultMatrix;
}

/**
 * Calculates the sum of all numbers in an array.
 * @param {Array<number>} numbersArray An array of numeric values.
 * @returns {number} The total sum.
 */
function calculateSum(numbersArray) {
    return numbersArray.reduce((accumulator, currentValue) => accumulator + currentValue);
}

/**
 * @param {String} inputString input
 */
function processInput(inputString) {
    const [initialLine, ...remainingLines] = inputString.split("\n");

    // Define a constant for the radix used in parsing integers
    const RADIX_DECIMAL = 10;

    // Parse height and width from the first line
    const [height, width] = parseNumbers(initialLine, RADIX_DECIMAL);

    // Process the remaining lines to create a 2D array of exclusion ranges
    const rawExclusionData = parseMatrix(remainingLines, ' ');
    const exclusionRanges = rawExclusionData.map(row => row.map(cell => parseInt(cell, RADIX_DECIMAL)));

    // Prepend null to the exclusion ranges array to enable 1-based row indexing
    // This aligns the array index directly with the 1-indexed `currentRow` variable.
    const indexedExclusionRanges = [null, ...exclusionRanges];

    /**
     * An array to store the minimum number of moves required to reach each row.
     * Initialized with a specific value indicating "not yet reached".
     * @type Array<number>
     */
    const INITIAL_MIN_MOVES_VALUE = -1;
    let minMovesToReachRow = new Array(height).fill(INITIAL_MIN_MOVES_VALUE);

    // Iterate through each possible starting column (1 to width)
    for (let startCol = 1; startCol <= width; startCol++) {
        let currentCol = startCol;
        let currentRow = 1; // Start at the first row
        let moveCount = 0;

        // Define a local helper function to determine if a downward move is possible
        // It checks if the current column falls within the exclusion range for the current row.
        const canMoveDown = (col, row) => {
            const [rangeStart, rangeEnd] = indexedExclusionRanges[row];
            // A downward move is possible if the current column is NOT within the exclusion range.
            // This is logically equivalent to: !(rangeStart <= col && col <= rangeEnd)
            return rangeStart > col || col > rangeEnd;
        };

        // Simulate the movement path for the current starting column
        simulationLoop: while (true) {
            moveCount++; // Increment move count for each step

            if (canMoveDown(currentCol, currentRow)) {
                currentRow++; // Move down to the next row

                // Calculate the 0-indexed target row for the `minMovesToReachRow` array.
                // `currentRow` is 1-indexed, and the result array is 0-indexed for `height` rows.
                // The first row where a move is recorded is `currentRow = 2`, which corresponds to index 0.
                const targetRowIndex = currentRow - 2;

                // Determine if the current path offers a new minimum move count for this row.
                const shouldUpdateMinMoves = minMovesToReachRow[targetRowIndex] === INITIAL_MIN_MOVES_VALUE || moveCount < minMovesToReachRow[targetRowIndex];

                if (shouldUpdateMinMoves) {
                    minMovesToReachRow[targetRowIndex] = moveCount;
                }

                // If the path has moved beyond the grid's height, terminate this simulation.
                if (currentRow > height) {
                    break simulationLoop;
                }
            } else {
                currentCol++; // Move right to the next column

                // If the path has moved beyond the grid's width, terminate this simulation.
                if (currentCol > width) {
                    break simulationLoop;
                }
            }
        }
    }

    // Output the final array of minimum moves
    console.log(minMovesToReachRow);

    // --- Utility functions (renamed and slightly refactored) ---

    /**
     * Converts a string to an array of numbers.
     * @param {String} str The input string.
     * @param {Number} radix The radix (base) to use for parsing integers.
     * @param {String} [delimiter=' '] The delimiter character.
     * @returns {Array<number>} An array of parsed numbers.
     */
    function parseNumbers(str, radix, delimiter = ' ') {
        return str.split(delimiter).map(s => parseInt(s, radix));
    }

    /**
     * Converts a string to an array of BigInts.
     * @param {String} str The input string.
     * @param {String} [delimiter=' '] The delimiter character.
     * @returns {Array<BigInt>} An array of parsed BigInts.
     */
    function parseBigInts(str, delimiter = ' ') {
        return str.split(delimiter).map(s => BigInt(s));
    }

    /**
     * Converts an array of strings into a 2D array (matrix).
     * @param {Array<String>} stringArray An array of strings, each representing a row.
     * @param {String} [delimiter=' '] The delimiter character for splitting each string.
     * @returns {Array<Array<String>>} A 2D array of strings.
     */
    function parseMatrix(stringArray, delimiter = ' ') {
        return stringArray.map(v => v.split(delimiter));
    }

    /**
     * Calculates the sum of numbers in an array.
     * @param {Array<Number>} numbers An array of numbers.
     * @returns {Number} The sum of the numbers.
     */
    function calculateSum(numbers) {
        return numbers.reduce((accumulator, currentValue) => accumulator + currentValue);
    }
}

// Standard input/output handling: reads from stdin and calls the main processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

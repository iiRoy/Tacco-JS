const traverseGrid = inputPayload => {
    // Ensures strict parsing for this function's scope, promoting cleaner code practices.
    'use strict';

    // A utility function to generate a string by repeating a character 'count' times.
    // This replaces array-based string construction for clarity and potential efficiency.
    const createRepeatedString = (charToRepeat, repeatCount) => {
        let resultString = '';
        for (let idx = 0; idx < repeatCount; idx++) {
            resultString += charToRepeat;
        }
        return resultString;
    };

    // Internal helper for padding binary strings with leading zeros.
    // Ensures all binary representations have a consistent length.
    const ensureBinaryLength = (binaryString, desiredLength) => {
        if (binaryString.length >= desiredLength) {
            return binaryString;
        }
        const zerosNeeded = desiredLength - binaryString.length;
        return createRepeatedString('0', zerosNeeded) + binaryString;
    };

    /**
     * Generates a list of valid binary movement sequences.
     * A sequence is valid if it falls within the decimal range defined by `minSeqStr` and `maxSeqStr`
     * and contains a specific, consistent number of '1's (representing 'down' moves).
     * @param {string} minSeqStr - The binary string representing the minimum path sequence.
     * @param {string} maxSeqStr - The binary string representing the maximum path sequence.
     * @returns {string[]} An array of binary strings, each representing a valid path.
     */
    const generatePermittedMovementPatterns = (minSeqStr, maxSeqStr) => {
        // Basic validation for sequence lengths.
        if (minSeqStr.length !== maxSeqStr.length) {
            console.error("Error: Input sequence lengths for path generation do not match.");
            return []; // Return empty array on error.
        }
        const sequenceLength = minSeqStr.length;

        // Calculate the required count of '1's (down moves) from the minimum sequence.
        // All valid paths must have this exact number of '1's.
        let requiredDownMoves = 0;
        for (const char of minSeqStr) {
            if (char === '1') {
                requiredDownMoves++;
            }
        }

        const minDecimalValue = Number.parseInt(minSeqStr, 2);
        const maxDecimalValue = Number.parseInt(maxSeqStr, 2);

        const acceptableSequences = [];

        // Iterate through all decimal numbers between the min and max inclusive.
        for (let currentDecimal = minDecimalValue; currentDecimal <= maxDecimalValue; currentDecimal++) {
            let currentBinary = currentDecimal.toString(2);
            // Pad the current binary string to ensure it has the correct total length.
            currentBinary = ensureBinaryLength(currentBinary, sequenceLength);

            // Count the '1's in the current binary string.
            let onesInCurrentBinary = 0;
            for (const char of currentBinary) {
                if (char === '1') {
                    onesInCurrentBinary++;
                }
            }

            // If the count of '1's matches the required number, this sequence is valid.
            if (onesInCurrentBinary === requiredDownMoves) {
                acceptableSequences.push(currentBinary);
            }
        }
        return acceptableSequences;
    };

    // --- Main processing logic starts here ---

    // Clean and split the raw input into individual lines. Filters out empty lines.
    const inputLines = inputPayload.split(/\r?\n/).filter(line => line.trim().length > 0);

    // Guard clause for empty input.
    if (inputLines.length === 0) {
        console.log(0); // Assuming 0 obstacles if no grid is provided.
        return;
    }

    // Parse grid dimensions from the first line.
    const [gridRows, gridCols] = inputLines[0].split(/\s+/).map(str => Number.parseInt(str, 10));

    // Validate parsed dimensions for correctness.
    if (isNaN(gridRows) || isNaN(gridCols) || gridRows <= 0 || gridCols <= 0) {
        console.error("Invalid grid dimensions detected. Please check input format.");
        console.log(-1); // Indicate an error condition.
        return;
    }

    // Construct the 2D grid matrix from subsequent input lines.
    // Each row string is trimmed to `gridCols` and then converted into an array of characters.
    const gridDataMatrix = inputLines.slice(1, 1 + gridRows).map(rowString => {
        return Array.from(rowString.slice(0, gridCols));
    });

    // Perform a structural validation of the grid matrix.
    if (gridDataMatrix.length !== gridRows || gridDataMatrix.some(row => row.length !== gridCols)) {
        console.error("Grid data does not match the specified dimensions. Input error.");
        console.log(-1);
        return;
    }

    // Handle the trivial case of a 1x1 grid.
    if (gridRows === 1 && gridCols === 1) {
        console.log(gridDataMatrix[0][0] === '#' ? 1 : 0);
        return;
    }

    // Determine the number of 'right' and 'down' moves required to reach the target cell (bottom-right).
    const requiredRightMoves = gridCols - 1;
    const requiredDownMoves = gridRows - 1;

    // Generate the binary string representing the path with the fewest obstacles (all 'right' then all 'down').
    // '0' denotes a rightward movement, '1' denotes a downward movement.
    const minimalPathCode = createRepeatedString('0', requiredRightMoves) + createRepeatedString('1', requiredDownMoves);
    // Generate the binary string representing the path with the most obstacles (all 'down' then all 'right').
    const maximalPathCode = createRepeatedString('1', requiredDownMoves) + createRepeatedString('0', requiredRightMoves);

    // Obtain all possible valid movement sequences using the helper function.
    const allValidPathSequences = generatePermittedMovementPatterns(minimalPathCode, maximalPathCode);

    let minimumObstacleEncounters = Infinity; // Initialize with a very high value for comparison.

    // Iterate through each generated path sequence to find the one with the fewest obstacles.
    for (let pathIndex = 0; pathIndex < allValidPathSequences.length; pathIndex++) {
        const currentPathSpec = allValidPathSequences[pathIndex];
        let obstaclesForThisPath = 0;
        let currentRowPos = 0; // Current vertical position (row index).
        let currentColPos = 0; // Current horizontal position (column index).

        // Check for an obstacle at the starting cell (0,0).
        if (gridDataMatrix[currentRowPos][currentColPos] === '#') {
            obstaclesForThisPath++;
        }

        // Traverse the grid according to the current path specification.
        for (let moveStep = 0; moveStep < currentPathSpec.length; moveStep++) {
            const moveInstruction = currentPathSpec[moveStep];

            // Update current position based on the move instruction.
            if (moveInstruction === '1') { // Move down
                currentRowPos++;
            } else { // Move right
                currentColPos++;
            }

            // A robustness check: ensure the path stays within grid boundaries.
            // This scenario implies an error in path generation if triggered.
            if (currentRowPos >= gridRows || currentColPos >= gridCols) {
                console.warn(`Path ${pathIndex} exceeded grid boundaries at step ${moveStep}. Skipping.`);
                obstaclesForThisPath = Infinity; // Mark this path as invalid.
                break; // Stop processing this erroneous path.
            }

            // Check if the current cell contains an obstacle.
            if (gridDataMatrix[currentRowPos][currentColPos] === '#') {
                obstaclesForThisPath++;
                // Optimization: if current path already has more obstacles than the best found,
                // no need to continue with this path.
                if (obstaclesForThisPath >= minimumObstacleEncounters) {
                    break;
                }
            }
        }

        // Update the overall minimum obstacle count.
        minimumObstacleEncounters = Math.min(minimumObstacleEncounters, obstaclesForThisPath);

        // Early exit: if a path with zero obstacles is found, it's the optimal solution.
        if (minimumObstacleEncounters === 0) {
            break;
        }
    }

    // Output the final result. If no valid path was found (e.g., due to errors), output -1.
    console.log(minimumObstacleEncounters === Infinity ? -1 : minimumObstacleEncounters);
};

// Self-executing anonymous function to handle input reading and call the main logic.
// This setup provides a robust way to run the script in different environments (Node.js, browser-like).
(function() {
    let rawInputContent = '';
    // Check if running in a Node.js-like environment where 'fs' module is available.
    const fileSystem = typeof require === 'function' ? require('fs') : null;

    if (fileSystem && fileSystem.readFileSync) {
        try {
            // Attempt to read from standard input for competitive programming setup.
            rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
        } catch (error) {
            console.error("Error reading from /dev/stdin:", error.message);
            // Fallback to example data if stdin read fails (e.g., local testing without piping).
            rawInputContent = "3 3\n...\n.#.\n..."; // Example data for testing
        }
    } else {
        // Fallback for environments without 'fs' module (e.g., browser-based execution).
        console.warn("File system module 'fs' not available. Using embedded test data.");
        rawInputContent = "4 5\n.....\n.###.\n.###.\n....."; // Another example
    }

    // Invoke the main grid traversal function with the obtained input.
    traverseGrid(rawInputContent);
})();
'use strict';

// This module processes grid data to find optimal paths.
const processInput = (inputData) => {
    /**
     * Generates binary strings within a specified range,
     * ensuring they have a consistent number of '1' bits.
     * @param {string} startPattern - The lower bound binary string.
     * @param {string} endPattern - The upper bound binary string.
     * @returns {string[]} An array of valid binary path strings.
     */
    const generateBinaryPaths = (startPattern, endPattern) => {
        // Determine the required count of '1's from the starting pattern.
        const oneCount = (startPattern.match(/1/g) || []).length;
        // Convert binary string bounds to integer values.
        const startVal = parseInt(startPattern, 2);
        const endVal = parseInt(endPattern, 2);
        // Array to store the generated binary path options.
        const pathOptions = [];

        // Iterate through all integers from the lower to the upper bound.
        for (let idx = startVal; idx <= endVal; idx++) {
            // Convert the current integer to its binary string representation.
            const currentBinaryStr = (idx).toString(2);
            // Check if the current binary string has the required number of '1's.
            if (oneCount !== (currentBinaryStr.match(/1/g) || []).length) {
                continue; // Skip if the '1' count doesn't match.
            }
            // Calculate the number of leading zeros needed for consistent length.
            const paddingZeros = [...Array(endPattern.length - currentBinaryStr.length)].map(() => "0").join("");
            // Add the zero-padded binary string to our list of path options.
            pathOptions.push(paddingZeros + currentBinaryStr);
        }

        return pathOptions;
    };

    // Parse the raw input string into an array of lines.
    const rawLines = inputData.trim().split("\n");
    // Extract grid dimensions (height, width) from the first line.
    const dimensions = rawLines[0].split(" ").map(item => parseInt(item, 10)); // [height, width]
    // Slice the grid rows from the input.
    const gridRows = rawLines.slice(1, dimensions[0] + 1); // Adjusted slice to correctly get rows based on dimensions[0]
    // Process each grid row by slicing it to the specified width.
    const processedGrid = gridRows.map(rowStr =>
        rowStr.slice(0, dimensions[1])
    );

    let minHashCount; // Variable to store the minimum count of '#' encountered.
    const targetHeight = dimensions[0] - 1; // Target Y-coordinate for the end of the path.
    const targetWidth = dimensions[1] - 1;  // Target X-coordinate for the end of the path.

    // Construct the binary string representing the path with only horizontal moves first.
    const initialPathPattern = [...Array(targetWidth)].map(() => "0").join("") + [...Array(targetHeight)].map(() => "1").join("");
    // Construct the binary string representing the path with only vertical moves first (reversed initial).
    const finalPathPattern = initialPathPattern.split("").reverse().join("");
    // Generate all valid binary move sequences.
    const validMoveSequences = generateBinaryPaths(initialPathPattern, finalPathPattern);

    // Iterate through each generated move sequence.
    for (let sequenceIdx = 0; sequenceIdx < validMoveSequences.length; sequenceIdx++) {
        let currentHashCount = 0; // Counter for '#' in the current path.
        let currentX = 0;         // Current X-coordinate on the grid.
        let currentY = 0;         // Current Y-coordinate on the grid.

        // Check the starting cell for a '#'.
        if (processedGrid[currentY][currentX] === "#") {
            currentHashCount++;
        }

        // Traverse the grid according to the current move sequence.
        for (let moveIdx = 0; moveIdx < validMoveSequences[sequenceIdx].length; moveIdx++) {
            // '1' indicates a vertical move (down).
            if (validMoveSequences[sequenceIdx][moveIdx] === "1") {
                currentY++;
            } else { // '0' indicates a horizontal move (right).
                currentX++;
            }

            // Check the new cell for a '#'.
            if (processedGrid[currentY][currentX] === "#") {
                currentHashCount++;
                // Optimization: If current path already has more '#' than the best found so far,
                // no need to continue this path.
                if (minHashCount !== undefined && currentHashCount >= minHashCount) {
                    break;
                }
            }
        }

        // Update the minimum hash count if the current path is better.
        if (minHashCount === undefined || currentHashCount < minHashCount) {
            minHashCount = currentHashCount;
            // Optimization: If a path with zero '#' is found, it's the best possible, so stop.
            if (currentHashCount === 0) {
                break;
            }
        }
    }

    // Output the final minimum hash count.
    console.log(minHashCount);
};

// Read input from standard input and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

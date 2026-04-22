// This JavaScript module is designed to analyze grid-like data structures.
// Its primary function is to identify and report the largest possible rectangular area
// composed entirely of designated "active" cells (represented by a '.').

// For demonstration and testing purposes, input data is hardcoded here.
// In a production scenario, this data might originate from a file system,
// a network request, or user input.
const rawInputDataContent = '2 4\n...*\n.*..\n0 0';
// To simulate standard input, uncomment the line below and ensure 'fs' module is available:
// const rawInputDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');

/**
 * Parses a raw string of input into an array of individual lines.
 * This function ensures that the input is valid and trims any
 * extraneous whitespace before splitting.
 *
 * @param {string} sourceText The raw string content to be parsed.
 * @returns {string[]} An array where each element is a trimmed line from the input.
 */
function extractLines(sourceText) {
    // Implement a basic validation check for the input source.
    if (typeof sourceText !== 'string' || sourceText.length === 0) {
        console.error("Input source text is either not a string or is empty. Cannot process.");
        return []; // Return an empty array to prevent further errors.
    }
    // Trim global whitespace and split the string by newline characters.
    return sourceText.trim().split("\n");
}

/**
 * Transforms a character-based grid into a numerical height map.
 * In this map, each cell (r, c) stores the count of consecutive '.' characters
 * forming a vertical column upwards from (r, c), including (r, c) itself.
 * Non-'.' characters (e.g., '*') reset the height count to zero.
 *
 * @param {string[]} gridRowsData An array of strings, where each string represents a row of the grid.
 * @param {number} totalRows The declared number of rows for the grid.
 * @param {number} totalColumns The declared number of columns for the grid.
 * @returns {number[][]} A 2D array (matrix) representing the computed height map.
 */
function buildHeightMatrix(gridRowsData, totalRows, totalColumns) {
    // Initialize a new 2D array with dimensions `totalRows` x `totalColumns`,
    // pre-filling all cells with a default value of 0.
    const currentHeightMatrix = Array.from({ length: totalRows }, () => Array(totalColumns).fill(0));

    // Iterate through each row of the input grid.
    for (let rIndex = 0; rIndex < totalRows; ++rIndex) {
        const lineFragment = gridRowsData[rIndex];
        // Perform a validation check to ensure the row data is present and has expected length.
        if (!lineFragment || lineFragment.length !== totalColumns) {
            console.warn(`Data inconsistency: Row ${rIndex} has an unexpected length or is missing. Expected ${totalColumns}, got ${lineFragment ? lineFragment.length : 'N/A'}.`);
            // Continue to the next row, treating this one as empty/invalid.
            continue;
        }

        // Iterate through each character (column) within the current row.
        for (let cIndex = 0; cIndex < totalColumns; ++cIndex) {
            const characterAtCell = lineFragment[cIndex];
            // If the current character is an 'active' cell ('.').
            if (characterAtCell === '.') {
                // Determine the height: if it's the first row, height is 1;
                // otherwise, it's 1 plus the height of the cell directly above it.
                currentHeightMatrix[rIndex][cIndex] = (rIndex === 0) ? 1 : currentHeightMatrix[rIndex - 1][cIndex] + 1;
            } else if (characterAtCell === '*') {
                // If it's an 'inactive' cell ('*'), the height is reset to 0.
                currentHeightMatrix[rIndex][cIndex] = 0;
            } else {
                // Log a warning for any unexpected characters encountered.
                console.warn(`Unrecognized character '${characterAtCell}' found at position (${rIndex}, ${cIndex}). Treating as an inactive cell.`);
                currentHeightMatrix[rIndex][cIndex] = 0;
            }
        }
    }
    return currentHeightMatrix;
}

/**
 * Computes the largest rectangular area within a given histogram (an array of bar heights).
 * This function employs a monotonic stack algorithm for optimal performance.
 *
 * @param {number[]} barHeights An array of numbers, where each number signifies a bar's height.
 * @returns {number} The maximum area of a rectangle that can be formed within the histogram.
 */
function determineMaxAreaInHistogram(barHeights) {
    let currentMaxArea = 0;
    // The stack stores indices of bars, maintaining a strictly increasing order of heights.
    const heightStackIndices = [];

    // Append a sentinel value (0) to the end of the histogram.
    // This ensures all bars remaining in the stack are processed.
    const processedHeights = [...barHeights, 0];
    const numberOfBars = processedHeights.length;

    // Iterate through each bar in the extended histogram.
    for (let currentPos = 0; currentPos < numberOfBars; ++currentPos) {
        // While the stack is not empty AND the height of the bar at the top of the stack
        // is greater than or equal to the height of the current bar.
        while (heightStackIndices.length > 0 &&
               processedHeights[heightStackIndices[heightStackIndices.length - 1]] >= processedHeights[currentPos]) {
            // Pop the index of the bar from the top of the stack.
            const poppedBarIndex = heightStackIndices.pop();
            const poppedBarHeight = processedHeights[poppedBarIndex];

            // Calculate the width of the rectangle formed by the popped bar's height.
            // If the stack becomes empty after popping, it means the popped bar
            // extends to the very beginning of the histogram.
            // Otherwise, its left boundary is defined by the new top of the stack.
            const calculatedWidth = heightStackIndices.length === 0
                                  ? currentPos // Width is from 0 to currentPos (exclusive of currentPos).
                                  : currentPos - heightStackIndices[heightStackIndices.length - 1] - 1;

            // Update the maximum area found so far.
            currentMaxArea = Math.max(currentMaxArea, poppedBarHeight * calculatedWidth);
        }
        // Push the index of the current bar onto the stack.
        heightStackIndices.push(currentPos);
    }
    return currentMaxArea;
}

/**
 * Orchestrates the processing of multiple grid configurations.
 * It reads grid dimensions and data sequentially, computes the
 * largest '.' rectangle area for each grid, and prints the result.
 */
function executeGridProcessingPipeline() {
    // Extract all lines from the raw input data.
    const allInputLines = extractLines(rawInputDataContent);
    let lineCursor = 0; // A pointer to keep track of the current line being processed.

    // Main loop to process multiple grid sets until a termination condition is met.
    while (true) {
        // Guard against prematurely running out of input lines.
        if (lineCursor >= allInputLines.length) {
            console.warn("End of input stream reached unexpectedly, or input is malformed.");
            break;
        }

        const currentDimensionLine = allInputLines[lineCursor++];
        const dimensionValues = currentDimensionLine.split(" ").map(Number);

        // Use destructuring assignment for clearer access to dimensions.
        const [gridRowsCount, gridColsCount] = dimensionValues;

        // Check for the termination condition (0 0).
        if (gridRowsCount === 0 && gridColsCount === 0) {
            // Optional: Check if there's any data following the termination marker.
            if (lineCursor < allInputLines.length) {
                console.info("Input termination marker '0 0' encountered, but additional data follows. Processing stopped as per protocol.");
            }
            break; // Exit the processing loop.
        }

        // Validate that dimensions are valid positive numbers.
        if (isNaN(gridRowsCount) || isNaN(gridColsCount) || gridRowsCount < 1 || gridColsCount < 1) {
            console.error(`Invalid grid dimensions provided: "${currentDimensionLine}". Skipping this grid configuration.`);
            // Attempt to skip the expected number of data lines for this invalid grid, if `gridRowsCount` is somewhat sensible.
            if (!isNaN(gridRowsCount) && gridRowsCount > 0) {
                lineCursor += gridRowsCount;
            }
            continue; // Move to the next set of dimensions.
        }
        
        // Ensure there are enough subsequent lines for the grid's actual data.
        if (lineCursor + gridRowsCount > allInputLines.length) {
            console.error(`Insufficient input lines for a ${gridRowsCount}x${gridColsCount} grid. Expected ${gridRowsCount} data lines, but only ${allInputLines.length - lineCursor} remain.`);
            break; // Cannot continue processing if grid data is incomplete.
        }

        // Extract the specific lines that represent the current grid's character data.
        const activeGridData = allInputLines.slice(lineCursor, lineCursor + gridRowsCount);
        lineCursor += gridRowsCount; // Advance the cursor past the grid data.

        // Construct the numerical height map for the current grid.
        const processedHeightMap = buildHeightMatrix(activeGridData, gridRowsCount, gridColsCount);

        let largestAreaForCurrentGrid = 0; // Initialize the maximum area for this specific grid.

        // Iterate through each row of the height map. Each row is treated as a histogram.
        for (let rowIterator = 0; rowIterator < gridRowsCount; ++rowIterator) {
            const currentRowHistogram = processedHeightMap[rowIterator];
            // Calculate the maximum rectangle area within this specific histogram row.
            const areaInThisRow = determineMaxAreaInHistogram(currentRowHistogram);
            // Update the overall largest area found for the current grid.
            largestAreaForCurrentGrid = Math.max(largestAreaForCurrentGrid, areaInThisRow);
        }

        // Output the calculated maximum area for the current grid configuration.
        console.log(largestAreaForCurrentGrid);
    }
}

// Initiate the grid processing pipeline.
executeGridProcessingPipeline();
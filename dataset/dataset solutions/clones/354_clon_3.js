// --- Type III Clone of the original JavaScript code ---

// Import the 'fs' module to handle file system operations, specifically reading from standard input.
const fileSystem = require('fs');

// Read all input data from /dev/stdin as a UTF-8 string.
// This is the raw text content provided to the program.
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Trim leading/trailing whitespace from the raw input and split it into an array of lines.
// Each element in 'lineBuffer' will be one line from the input.
let lineBuffer = rawInputData.trim().split('\n');

// Initialize a variable to keep track of the current line being processed from the buffer.
let currentLineIndex = 0;

/**
 * Safely extracts and parses a line from the global lineBuffer.
 * Advances the internal line index.
 * @returns {string | null} The fetched line, or null if no more lines are available.
 */
const fetchAndParseLine = () => {
    if (currentLineIndex >= lineBuffer.length) {
        // Return null if no more lines are available to indicate end of input.
        return null;
    }
    const line = lineBuffer[currentLineIndex];
    currentLineIndex++; // Advance the line pointer for the next read.
    return line;
};

// Main processing loop: continues indefinitely until a specific termination condition is met.
// This `for (;;)` structure is functionally equivalent to `while(true)`.
for (;;) {
    // Fetch the next line which is expected to contain the grid dimensions (height and width).
    const dimensionLine = fetchAndParseLine();

    // If no more lines are available, or the line is unexpectedly empty,
    // it signifies the end of input or an error condition for a new grid.
    if (!dimensionLine) {
        break; // Exit the main processing loop.
    }

    // Split the dimension line by space and convert the parts to integers using base 10.
    // Using parseInt ensures robust conversion, even if there's leading/trailing whitespace around numbers.
    const rawDimensions = dimensionLine.split(' ');
    const gridHeight = parseInt(rawDimensions[0], 10);
    const gridWidth = parseInt(rawDimensions[1], 10);

    // Check for the problem's termination condition: height and width both being zero.
    if (gridHeight === 0 && gridWidth === 0) {
        break; // Exit the main processing loop as requested by the problem statement.
    }

    // Initialize a 2D array (matrix) to store the calculated heights of consecutive '.' characters.
    // 'dotColumnHeights' will effectively represent a series of histograms, one for each row.
    const dotColumnHeights = [];

    // Loop through each row of the input grid, based on the determined grid height.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        // Fetch the current row's character string (e.g., "....#..").
        const charRowData = fetchAndParseLine();
        if (!charRowData) {
            // This is a guard clause for unexpected end of input, crucial for robust error handling.
            // In typical competitive programming, input is guaranteed well-formed, but it's good practice.
            console.error("Error: Unexpected end of input while attempting to read grid rows.");
            // A more robust application might throw an error or exit differently.
            return; // Terminate execution.
        }

        // Split the row string into an array of individual characters.
        const rowCharacters = charRowData.split('');
        // Initialize the current row in our height map with a fixed size for efficiency.
        dotColumnHeights[rowIdx] = new Array(gridWidth);

        // Iterate through each character (column) in the current row.
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellChar = rowCharacters[colIdx];

            // Determine the height based on the current character and the height from the cell directly above it.
            if (currentCellChar === '.') {
                // If the current cell is a dot, its height is 1 plus the height from the cell directly above it.
                // For the first row (rowIdx === 0), there's no cell above, so the height is just 1.
                dotColumnHeights[rowIdx][colIdx] = (rowIdx === 0) ? 1 : (dotColumnHeights[rowIdx - 1][colIdx] + 1);
            } else { // If the current cell is not a dot (e.g., '#'), the sequence of consecutive dots ends.
                // Therefore, the height for this column at this row is reset to 0.
                dotColumnHeights[rowIdx][colIdx] = 0;
            }
        }
    }

    // After constructing the 'dotColumnHeights' matrix, we now calculate the maximum rectangular area.
    // This involves applying the "largest rectangle in histogram" algorithm to each row of the matrix.
    let maximumRectangleArea = 0; // Initialize the greatest area found so far to zero.

    /**
     * Calculates the largest rectangular area within a given histogram (an array of bar heights).
     * This function implements the standard "largest rectangle in histogram" algorithm using a monotonic stack.
     * @param {number[]} histogramBars An array of numbers representing bar heights.
     * @returns {number} The maximum area of a rectangle found within the histogram.
     */
    const calculateLargestHistogramRectangle = (histogramBars) => {
        let maxHistArea = 0;
        // The stack will store objects: { height: number, index: number }.
        // It maintains a sequence of increasing bar heights.
        const increasingHeightStack = [];

        // To ensure all bars in the stack are processed at the end, a sentinel value (0 height)
        // is appended to the histogram. This simplifies the logic by avoiding a separate cleanup loop.
        const processedBars = [...histogramBars, 0];
        const numBars = processedBars.length;

        // Iterate through each bar in the (potentially extended) histogram.
        for (let idx = 0; idx < numBars; idx++) {
            const currentBarHeight = processedBars[idx];
            let lastPoppedIndex = idx; // This tracks the leftmost index for the current bar or popped bars.

            // While the stack is not empty AND the current bar is shorter than the bar at the top of the stack:
            // This means we've found a potential right boundary for rectangles formed by bars in the stack.
            while (increasingHeightStack.length > 0 && increasingHeightStack[increasingHeightStack.length - 1].height >= currentBarHeight) {
                const poppedBar = increasingHeightStack.pop();
                // When a bar is popped, it means 'currentBarHeight' is its effective right boundary.
                // The 'lastPoppedIndex' for the new bar (to be pushed) should extend to the left
                // as far as the popped bar's original index.
                lastPoppedIndex = poppedBar.index;

                // Calculate the area for the popped bar: height * width.
                // The width is from the popped bar's original index up to the current index (exclusive).
                const currentCalculatedArea = poppedBar.height * (idx - poppedBar.index);
                if (currentCalculatedArea > maxHistArea) {
                    maxHistArea = currentCalculatedArea; // Update the maximum area if a larger one is found.
                }
            }
            // Push the current bar onto the stack.
            // We use 'lastPoppedIndex' as the index for the 'currentBarHeight'.
            // This effectively extends the reach of 'currentBarHeight' to the left, covering any popped bars
            // that were taller than or equal to 'currentBarHeight' but had a smaller index.
            increasingHeightStack.push({ height: currentBarHeight, index: lastPoppedIndex });
        }
        return maxHistArea;
    };


    // Iterate through each row of 'dotColumnHeights'. Each row is treated as an independent histogram.
    for (let currentHistRow = 0; currentHistRow < gridHeight; currentHistRow++) {
        // Calculate the maximum area for the histogram represented by the current row.
        const currentHistMaxArea = calculateLargestHistogramRectangle(dotColumnHeights[currentHistRow]);

        // Update the overall maximum rectangle area found across all rows if the current row yields a larger one.
        if (currentHistMaxArea > maximumRectangleArea) {
            maximumRectangleArea = currentHistMaxArea;
        }
    }

    // Output the greatest area found for the current grid's configuration to standard output.
    console.log(maximumRectangleArea);
}
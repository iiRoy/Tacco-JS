// Comprehensive configuration parameters governing the pathfinding process and grid dimensions.
let systemConfiguration = {};

// The core two-dimensional array representing the traversal grid.
// Each element signifies a movement rule at that grid cell:
//   -1: Indicates a horizontal bar that leads to the left (moving from current_col to current_col - 1).
//    0: Represents an empty space, implying no horizontal movement.
//    1: Indicates a horizontal bar that leads to the right (moving from current_col to current_col + 1).
let traversalGrid = [];

/**
 * Calculates a forward path through the grid, starting from a specified column and row.
 * This function traces the path downwards, applying the movement rules defined in `traversalGrid`.
 *
 * @param {number} initialColumnIndex - The 0-based column index where the path begins.
 * @param {number} [startingRowIndex=0] - The 0-based row index from which to start the traversal. Defaults to 0.
 * @returns {number[]} An array of 0-based column indices, representing the path's position at each row.
 */
const calculateForwardTraversal = (initialColumnIndex, startingRowIndex = 0) => {
    // Implement a guard clause to handle cases where the grid is not yet populated or is empty.
    if (!traversalGrid || traversalGrid.length === 0) {
        console.error("Error: The traversal grid is uninitialized or empty. Cannot calculate forward path.");
        // As a fallback, return an array containing only the initial position.
        return [initialColumnIndex];
    }

    let currentPathColumn = initialColumnIndex;
    // An array to store the sequence of column positions encountered during traversal.
    const forwardPathCoordinates = [currentPathColumn];

    // Iterate through the grid rows, starting from `startingRowIndex` and moving downwards.
    for (let rowIndex = startingRowIndex; rowIndex < traversalGrid.length; ++rowIndex) {
        const currentRowData = traversalGrid[rowIndex];

        // Validate that the `currentPathColumn` is within the bounds of the current row.
        if (currentPathColumn < 0 || currentPathColumn >= currentRowData.length) {
            console.warn(`Warning: Column index ${currentPathColumn} is out of bounds at grid row ${rowIndex}. Path computation halted.`);
            break; // Terminate traversal if an invalid position is reached.
        }

        // Apply the movement rule: update `currentPathColumn` based on the grid value.
        currentPathColumn += currentRowData[currentPathColumn];
        forwardPathCoordinates.push(currentPathColumn);
    }
    return forwardPathCoordinates;
};

/**
 * Determines a backward-traced path that would lead to a specific target column.
 * This function effectively simulates a path starting at the `terminalColumnIndex` from the *bottom* of the grid
 * and moving *upwards*, then reverses the resulting sequence to represent a top-to-bottom path.
 * This is a common technique for 'Amidakuji' (ladder game) reverse pathfinding.
 *
 * @param {number} terminalColumnIndex - The 0-based column index that the path should end at (when viewed top-to-bottom).
 * @returns {number[]} An array of 0-based column indices, representing the path from start to the specified end.
 */
const determineBackwardTraversal = (terminalColumnIndex) => {
    // Guard against an uninitialized or empty traversal grid.
    if (!traversalGrid || traversalGrid.length === 0) {
        console.error("Error: The traversal grid is uninitialized or empty. Cannot determine backward path.");
        // Fallback: return an array with just the target column.
        return [terminalColumnIndex];
    }

    let currentReversePathColumn = terminalColumnIndex;
    // This array temporarily stores the path traced from end to start (bottom-up).
    const reversePathCoordinates = [currentReversePathColumn];

    // Iterate through the grid rows from the bottom (`traversalGrid.length - 1`) up to the top (`0`).
    for (let rowIndex = traversalGrid.length - 1; rowIndex >= 0; --rowIndex) {
        const currentGridRow = traversalGrid[rowIndex];

        // Validate column index against current row's bounds.
        if (currentReversePathColumn < 0 || currentReversePathColumn >= currentGridRow.length) {
            console.warn(`Warning: Column index ${currentReversePathColumn} is out of bounds at grid row ${rowIndex} during reverse traversal. Path computation halted.`);
            break;
        }

        // Apply the same movement rule as forward traversal. This simulates moving "up" the grid.
        currentReversePathColumn += currentGridRow[currentReversePathColumn];
        reversePathCoordinates.push(currentReversePathColumn);
    }
    // Reverse the collected path to present it in a standard top-to-bottom order.
    return reversePathCoordinates.reverse();
};

// An array to accumulate all input lines received from standard input.
const collectedInputLines = [];

// Initialize standard input stream in Node.js.
// Ensures the process remains active to continuously receive data.
process.stdin.resume();
// Specifies the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

// Event handler for when data chunks are received from standard input.
process.stdin.on('data', (inputBufferPart) => {
    // Process only if the chunk is valid and contains data.
    if (inputBufferPart && inputBufferPart.length > 0) {
        // Split the incoming chunk by newline characters and iterate over each resulting line.
        inputBufferPart.split('\n').forEach((singleInputLine) => {
            const trimmedLine = singleInputLine.trim();
            // Add only non-empty, trimmed lines to our collection.
            if (trimmedLine.length > 0) {
                collectedInputLines.push(trimmedLine);
            }
        });
    }
});

// Event handler for when the standard input stream has ended, signifying all data has been received.
process.stdin.on('end', () => {
    let finalComparisonResult = ""; // This string will hold the final output message.

    // Re-initialize global state variables to ensure a clean slate for processing.
    systemConfiguration = {};
    traversalGrid = [];

    // Define the ordered keys for the initial configuration parameters.
    const configurationKeyOrder = ["gridHeight", "startColumn", "endColumn", "maxTraversalSteps"];
    let currentConfigKeyIndex = 0;

    // Loop through each line collected from standard input.
    for (const currentLineContent of collectedInputLines) {
        // A specific line containing "0" acts as a termination command for input processing.
        if (currentLineContent === "0") {
            break; // Exit the loop if the termination signal is found.
        }

        // Process the initial lines as configuration parameters.
        if (currentConfigKeyIndex < configurationKeyOrder.length) {
            const parsedConfigValue = Number.parseInt(currentLineContent, 10);

            // Validate that the parsed value is a valid number.
            if (Number.isNaN(parsedConfigValue)) {
                console.error(`Input Error: Invalid numeric value "${currentLineContent}" for configuration parameter "${configurationKeyOrder[currentConfigKeyIndex]}".`);
                // Continue processing, but this parameter might be missing or incorrect.
            } else {
                systemConfiguration[configurationKeyOrder[currentConfigKeyIndex]] = parsedConfigValue;
            }
            currentConfigKeyIndex++;
            continue; // Proceed to the next line of input.
        }

        // Lines following the configuration parameters define the grid structure.
        const currentRowSegments = [];
        // The width of the grid (number of potential horizontal bar positions) is typically one less than gridHeight.
        const expectedGridWidth = systemConfiguration.gridHeight - 1;

        // Parse each character in the current line to build a row of the grid.
        for (let segmentColumnIndex = 0; segmentColumnIndex < expectedGridWidth; ++segmentColumnIndex) {
            const charAsNumber = Number.parseInt(currentLineContent.charAt(segmentColumnIndex), 10);

            let segmentValue = charAsNumber;
            // Apply a specific rule for grid encoding: if a segment is '0' and the preceding segment was '1' (left bar),
            // this implies the current segment is the 'right side' of that bar, hence it should be encoded as -1.
            if (segmentColumnIndex > 0 && segmentValue === 0 && currentRowSegments[segmentColumnIndex - 1] === 1) {
                segmentValue = -1;
            }
            currentRowSegments.push(segmentValue);
        }

        // After processing the explicit segments, determine the value for the very last column.
        // If the last processed segment was '1' (a bar extending right), the final column must be '-1' (a bar extending left into it).
        // Otherwise, it's '0' (no bar).
        const lastProcessedSegmentIndex = currentRowSegments.length - 1;
        if (lastProcessedSegmentIndex >= 0) { // Ensure there's at least one segment processed.
            const finalColumnValue = (currentRowSegments[lastProcessedSegmentIndex] === 1) ? -1 : 0;
            currentRowSegments.push(finalColumnValue);
        } else {
            // This case handles an unlikely scenario where `expectedGridWidth` was 0 or less.
            currentRowSegments.push(0); // Default to 0 if no segments were added.
        }

        traversalGrid.push(currentRowSegments);
    }

    // Adjust column indices from 1-based (as typically provided in input) to 0-based for array access.
    systemConfiguration.startColumn--;
    systemConfiguration.endColumn--;

    // Execute the forward path calculation starting from the configured initial column.
    const forwardTraversalSequence = calculateForwardTraversal(systemConfiguration.startColumn);

    // Retrieve the final position reached by the forward path.
    const finalForwardPosition = forwardTraversalSequence[forwardTraversalSequence.length - 1];

    // If the forward path successfully reaches the designated end column, output "0" and terminate.
    if (finalForwardPosition === systemConfiguration.endColumn) {
        console.log("0");
        return; // Mission accomplished, no further processing needed.
    }

    // Execute the backward path calculation starting from the configured target end column.
    const backwardTraversalSequence = determineBackwardTraversal(systemConfiguration.endColumn);

    // Determine the number of steps to compare, limited by `maxTraversalSteps` and the actual grid height.
    const numberOfComparisonSteps = Math.min(systemConfiguration.maxTraversalSteps, traversalGrid.length);

    // Iterate through the path steps to identify a suitable point for inserting a connecting bar.
    for (let stepIndex = 0; stepIndex < numberOfComparisonSteps; ++stepIndex) {
        // Ensure both path sequences have data for the current step to prevent out-of-bounds access.
        if (stepIndex >= forwardTraversalSequence.length || stepIndex >= backwardTraversalSequence.length) {
            console.warn(`Path sequence unexpectedly terminated before reaching step ${stepIndex}.`);
            break;
        }

        const currentForwardPosition = forwardTraversalSequence[stepIndex];
        const currentBackwardPosition = backwardTraversalSequence[stepIndex];

        // The core condition for finding an insertion point:
        // 1. The two paths must be adjacent (absolute difference of 1 in column index).
        // 2. Both positions at this `stepIndex` (row) in the `traversalGrid` must be '0' (empty, no existing bar).
        const arePathsAdjacent = Math.abs(currentForwardPosition - currentBackwardPosition) === 1;
        const isForwardSpotEmpty = traversalGrid[stepIndex] && traversalGrid[stepIndex][currentForwardPosition] === 0;
        const isBackwardSpotEmpty = traversalGrid[stepIndex] && traversalGrid[stepIndex][currentBackwardPosition] === 0;

        if (arePathsAdjacent && isForwardSpotEmpty && isBackwardSpotEmpty) {
            // A suitable connection point has been identified.
            // Format the output: (row_number + 1) + " " + (minimum_column_index + 1).
            const outputRowNumber = stepIndex + 1;
            const outputColumnIndex = Math.min(currentForwardPosition, currentBackwardPosition) + 1;
            finalComparisonResult = `${outputRowNumber} ${outputColumnIndex}`;
            break; // Stop after finding the first valid connection point.
        }
    }

    // If no suitable connection point was found after inspecting all steps, set the default outcome to "1".
    if (finalComparisonResult.length === 0) {
        finalComparisonResult = "1";
    }

    // Output the determined result to standard output.
    console.log(finalComparisonResult);
});
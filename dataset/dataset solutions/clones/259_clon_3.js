// Configuration parameters for the pathfinding algorithm.
let appConfiguration = {};

// Represents the traversable grid or maze structure.
// Elements: -1 (right-to-left barrier), 0 (open path), 1 (left-to-right barrier).
let traversableGrid = [];

// Stores raw input lines from standard input.
const collectedInputLines = [];

// Helper function to determine the forward path from a given starting point.
const computeForwardPath = (initialColumnIndex, startingRow = 0) => {
    // Input validation for robustness.
    if (!Array.isArray(traversableGrid) || traversableGrid.length === 0) {
        console.warn("Warning: Traversable grid is empty. Returning empty path.");
        return [];
    }
    if (initialColumnIndex < 0 || initialColumnIndex >= appConfiguration.lines) {
        console.error(`Invalid initial column index: ${initialColumnIndex}. Must be within [0, ${appConfiguration.lines - 1}].`);
        return [];
    }

    let currentPosition = initialColumnIndex;
    const pathTrace = [currentPosition]; // Keep track of the path segments.

    // Iterate through the grid rows starting from the specified row.
    for (let rowIndex = startingRow; rowIndex < traversableGrid.length; rowIndex++) {
        // Ensure the current position is within the bounds of the current row before access.
        const currentRow = traversableGrid[rowIndex];
        if (!currentRow || currentPosition < 0 || currentPosition >= currentRow.length) {
            console.error(`Error: Current position ${currentPosition} is out of bounds for row ${rowIndex} (length: ${currentRow ? currentRow.length : 'N/A'}). Path terminated.`);
            break; // Terminate pathfinding if out of bounds.
        }
        
        const movementDelta = currentRow[currentPosition];
        currentPosition += movementDelta;
        pathTrace.push(currentPosition);
    }
    return pathTrace;
};

// Helper function to determine the reverse path from a specified end column.
// This function applies the same movement rules as computeForwardPath but iterates
// the grid rows in reverse, then reverses the collected path to get a start-to-end sequence.
const computeReversePath = (targetColumnIndex) => {
    // Input validation.
    if (!Array.isArray(traversableGrid) || traversableGrid.length === 0) {
        console.warn("Warning: Traversable grid is empty for reverse path calculation. Returning empty path.");
        return [];
    }
    if (targetColumnIndex < 0 || targetColumnIndex >= appConfiguration.lines) {
        console.error(`Invalid target column index: ${targetColumnIndex}. Must be within [0, ${appConfiguration.lines - 1}].`);
        return [];
    }

    let currentPosition = targetColumnIndex;
    const pathSegments = [currentPosition]; // Store path in reverse order initially.

    // Traverse the grid rows backwards.
    for (let rowIndex = traversableGrid.length - 1; rowIndex >= 0; rowIndex--) {
        const currentRow = traversableGrid[rowIndex];
        
        // Ensure the current position is within bounds for the reverse calculation.
        if (!currentRow || currentPosition < 0 || currentPosition >= currentRow.length) {
             console.error(`Error: Current position ${currentPosition} out of bounds for reverse path row ${rowIndex} (length: ${currentRow ? currentRow.length : 'N/A'}). Path terminated.`);
             break;
        }

        const reverseDelta = currentRow[currentPosition];
        currentPosition += reverseDelta;
        pathSegments.push(currentPosition);
    }
    // The path segments were collected from end to start, so reverse them to get start to end.
    return pathSegments.reverse();
};

// Initiate standard input processing.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', (inputChunk) => {
    // Process each line from the chunk, stripping whitespace and splitting.
    inputChunk.trim().split('\n').forEach((singleLineEntry) => {
        // Add non-empty lines to our buffer.
        if (singleLineEntry.length > 0) {
            collectedInputLines.push(singleLineEntry);
        }
    });
});
 
// Event listener for the end of standard input stream.
process.stdin.on('end', () => {
    let computedResultString = ""; // Variable to store the final output.

    // Re-initialize configuration and grid for fresh processing.
    appConfiguration = {};
    traversableGrid = [];

    // Define the expected order of configuration keys from input.
    const expectedConfigKeys = ["lines", "start", "end", "steps"];
    let configKeyIndex = 0;

    // Iterate through the collected input lines to parse configuration and grid data.
    for (let lineIterator = 0; lineIterator < collectedInputLines.length; lineIterator++) {
        const currentLineContent = collectedInputLines[lineIterator];

        // Sentinel value check: "0" indicates the end of input data.
        if (currentLineContent === "0") {
            break; 
        }
    
        // Parse initial configuration parameters based on their expected order.
        if (configKeyIndex < expectedConfigKeys.length) {
            const parsedValue = Number.parseInt(currentLineContent, 10);
            if (Number.isNaN(parsedValue)) {
                console.error(`Invalid number format for configuration key '${expectedConfigKeys[configKeyIndex]}': '${currentLineContent}'. Exiting.`);
                process.exit(1); // Terminate on critical input parsing error.
            }
            appConfiguration[expectedConfigKeys[configKeyIndex]] = parsedValue;
            configKeyIndex++;
            continue; // Move to the next input line.
        }
    
        // After configuration, parse grid matrix rows.
        const currentRowData = [];
        const numColumnsInGrid = appConfiguration.lines; // Number of vertical lines/columns.

        // Construct a row of the traversable grid.
        for (let columnIndex = 0; columnIndex < numColumnsInGrid - 1; columnIndex++) {
            const charValue = currentLineContent.charAt(columnIndex);
            let parsedCellValue = Number.parseInt(charValue, 10);

            // Special handling for cell values based on previous cell.
            // If current char is '0' and previous cell was '1', it indicates a right-to-left barrier (-1).
            if (columnIndex > 0 && parsedCellValue === 0 && currentRowData[columnIndex - 1] === 1) {
                parsedCellValue = -1; 
            }
            currentRowData.push(parsedCellValue);
        }
        
        // Add the last column's value based on the second-to-last column.
        // If the second-to-last column was 1, the last column is -1 (completing the bar).
        // Otherwise, it's 0 (no bar).
        const lastCellIndex = currentRowData.length - 1;
        const lastAddedValue = currentRowData[lastCellIndex];
        const finalColumnValue = (lastAddedValue === 1) ? -1 : 0;
        currentRowData.push(finalColumnValue);
        
        traversableGrid.push(currentRowData); // Add the completed row to the grid.
    }

    // Adjust start and end indices to be 0-based, as per problem requirements.
    if (appConfiguration.start !== undefined) {
        appConfiguration.start--; 
    } else {
        console.error("Configuration 'start' parameter is missing from input. Exiting.");
        process.exit(1);
    }
    if (appConfiguration.end !== undefined) {
        appConfiguration.end--;
    } else {
        console.error("Configuration 'end' parameter is missing from input. Exiting.");
        process.exit(1);
    }

    // Calculate the path from the specified start.
    const forwardTraversalPath = computeForwardPath(appConfiguration.start);
    
    // Check if the forward path directly reaches the end goal.
    const finalForwardPosition = forwardTraversalPath[forwardTraversalPath.length - 1];
    if (finalForwardPosition === appConfiguration.end) {
        console.log("0"); // Output "0" if the goal is reached directly without needing a bridge.
        return; // Exit the program as the task is complete.
    }

    // Calculate the path from the specified end (using the reverse traversal logic).
    const backwardTraversalPath = computeReversePath(appConfiguration.end);
    
    // Iterate through the steps to find a potential "bridge" point.
    // A bridge exists if two paths are adjacent and both have an open path (0) at that step.
    const totalStepsToConsider = appConfiguration.steps;

    for (let currentStep = 0; currentStep < totalStepsToConsider; currentStep++) {
        const forwardPathPosition = forwardTraversalPath[currentStep];
        const backwardPathPosition = backwardTraversalPath[currentStep];

        // Ensure both path positions are valid for the current step.
        if (forwardPathPosition === undefined || backwardPathPosition === undefined) {
            console.warn(`Path positions undefined at step ${currentStep}. Skipping current step.`);
            continue;
        }

        const gridRowAtStep = traversableGrid[currentStep];

        // Validate that the grid row and path positions are within bounds.
        if (!gridRowAtStep || 
            forwardPathPosition < 0 || forwardPathPosition >= gridRowAtStep.length || 
            backwardPathPosition < 0 || backwardPathPosition >= gridRowAtStep.length) {
            console.warn(`Grid row or path position out of bounds at step ${currentStep}. Skipping current step.`);
            continue;
        }

        const forwardPathCellState = gridRowAtStep[forwardPathPosition];
        const backwardPathCellState = gridRowAtStep[backwardPathPosition];

        // Condition for a bridge: paths are adjacent AND both have an open path (0).
        const arePathsAdjacent = Math.abs(forwardPathPosition - backwardPathPosition) === 1;
        const bothPathsAreOpen = forwardPathCellState === 0 && backwardPathCellState === 0;

        if (arePathsAdjacent && bothPathsAreOpen) {
            // Found a bridge! Format the output: (step number + 1) and (minimum column + 1).
            computedResultString = `${currentStep + 1} ${Math.min(forwardPathPosition, backwardPathPosition) + 1}`;
            break; // Exit loop after finding the first bridge, as only one is needed.
        }
    }

    // If no bridge was found after checking all steps, the default result is "1".
    if (computedResultString === "") {
        computedResultString = "1";
    }
    
    // Output the final result to standard output.
    console.log(computedResultString);
});
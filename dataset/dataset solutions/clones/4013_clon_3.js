// This function serves as the primary entry point for processing the input data.
// It reads grid dimensions, populates a coordinate map, pre-calculates movement costs,
// and then processes a series of queries based on these calculations.
function processInputData(rawDataString) {
    // Break down the entire input string into an array of individual lines.
    const inputLines = rawDataString.split("\n");

    // The first line contains the grid height, width, and the jump distance.
    // We parse these numerical values from their string representations.
    const dimensionsAndJumpParams = inputLines[0].split(" ").map(parsedStr => parseInt(parsedStr.trim(), 10));
    
    // Assign the parsed parameters to descriptive constant names.
    const gridHeight = dimensionsAndJumpParams[0];
    const gridWidth = dimensionsAndJumpParams[1];
    const jumpDistance = dimensionsAndJumpParams[2];

    // --- Type III Addition: Basic input validation ---
    // Although competitive programming inputs are typically guaranteed valid,
    // adding such checks demonstrates a Type III structural change for robustness.
    if (gridHeight <= 0 || gridWidth <= 0 || jumpDistance <= 0) {
        console.error("Error: Invalid grid dimensions or jump distance provided. All must be positive integers.");
        // In a real application, more sophisticated error handling might be used.
        return; 
    }
    // --- End Type III Addition ---

    // Initialize a data structure to store the grid coordinates (row, column)
    // for each unique value present in the grid.
    // The size is `(gridHeight * gridWidth + 1)` to accommodate values from 1 up to H*W.
    // Each element is a two-element array: [row, column].
    const valueCoordinatesMap = Array.from({ length: gridHeight * gridWidth + 1 }, () => [0, 0]);

    // Populate the `valueCoordinatesMap` by iterating through the grid data.
    // Grid data starts from the second line (index 1) of the input.
    for (let currentRowIndex = 0; currentRowIndex < gridHeight; ++currentRowIndex) {
        // Parse the current line of grid values.
        const currentGridRowValues = inputLines[currentRowIndex + 1].split(" ").map(valStr => parseInt(valStr.trim(), 10));
        
        // Iterate through each cell in the current row.
        for (let currentColIndex = 0; currentColIndex < gridWidth; ++currentColIndex) {
            const cellNumber = currentGridRowValues[currentColIndex];
            // Store the coordinates for the number found in this cell.
            valueCoordinatesMap[cellNumber][0] = currentRowIndex;
            valueCoordinatesMap[cellNumber][1] = currentColIndex;
        }
    }

    // --- Type III Addition: Pre-calculation of cumulative jump costs ---
    // This is a significant structural change to optimize query processing.
    // 'cumulativeMagicCosts[k]' will store the total cost to reach 'k' from the
    // smallest value 'j' (where j >= 1 and j % jumpDistance == k % jumpDistance)
    // by taking steps of 'jumpDistance'.
    const cumulativeMagicCosts = new Array(gridHeight * gridWidth + 1).fill(0);

    // Iterate through all possible values in the grid, starting from a point
    // where a jump of 'jumpDistance' is possible from a previous value.
    for (let currentVal = jumpDistance + 1; currentVal <= gridHeight * gridWidth; ++currentVal) {
        // Retrieve the coordinates of the previous value in the jump sequence.
        const previousValCoords = valueCoordinatesMap[currentVal - jumpDistance];
        // Retrieve the coordinates of the current value.
        const currentValCoords = valueCoordinatesMap[currentVal];
        
        // Calculate the Manhattan distance (absolute row difference + absolute column difference)
        // between the previous value's coordinates and the current value's coordinates.
        const deltaRow = Math.abs(currentValCoords[0] - previousValCoords[0]);
        const deltaCol = Math.abs(currentValCoords[1] - previousValCoords[1]);
        const singleStepCost = deltaRow + deltaCol;

        // Add this single step's cost to the cumulative cost of the previous value in its sequence.
        cumulativeMagicCosts[currentVal] = cumulativeMagicCosts[currentVal - jumpDistance] + singleStepCost;
    }
    // --- End Type III Pre-calculation ---

    // The line following the grid data (at index `gridHeight + 1`) contains the number of queries.
    const totalQueriesCount = parseInt(inputLines[gridHeight + 1].trim(), 10);
    
    // An array to store the final computed result for each query.
    const queryResultsArray = new Array(totalQueriesCount).fill(0);

    // Process each individual query. Query data starts from line `gridHeight + 2`.
    for (let currentQueryIndex = 0; currentQueryIndex < totalQueriesCount; ++currentQueryIndex) {
        // Parse the start (L) and end (R) values for the current query.
        const queryRange = inputLines[gridHeight + 2 + currentQueryIndex].split(" ").map(numStr => parseInt(numStr.trim(), 10));
        
        const queryStartValue = queryRange[0];
        const queryEndValue = queryRange[1];

        // --- Type III Addition: Query validation ---
        // Validate query parameters before processing.
        const maxGridValue = gridHeight * gridWidth;
        if (queryStartValue < 1 || queryEndValue > maxGridValue || queryStartValue > queryEndValue || (queryEndValue - queryStartValue) % jumpDistance !== 0) {
            console.warn(`Warning: Invalid query detected (L=${queryStartValue}, R=${queryEndValue}). Skipping this query.`);
            // Assign a default or error value, or skip the query.
            queryResultsArray[currentQueryIndex] = -1; 
            continue; // Move to the next query.
        }
        // --- End Type III Addition ---

        // --- Type III Update: Use pre-calculated costs for query result ---
        // With the `cumulativeMagicCosts` array, the total cost for a query
        // from `queryStartValue` to `queryEndValue` is simply the difference
        // between their cumulative costs. This replaces the iterative `while` loop.
        queryResultsArray[currentQueryIndex] = cumulativeMagicCosts[queryEndValue] - cumulativeMagicCosts[queryStartValue];
        // --- End Type III Update ---
    }
    
    // Output the computed results, with each query's answer on a new line.
    console.log(queryResultsArray.join("\n"));
}

// Read the entire standard input asynchronously and then pass it to our processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
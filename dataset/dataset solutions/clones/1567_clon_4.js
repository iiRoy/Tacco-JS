function ExecuteSimulation(inputDataString) {
    const inputLines = inputDataString.split("\n");
    const dimensionSpecification = inputLines[0];
    const obstacleDescriptions = inputLines.slice(1);

    const [gridRows, gridColumns] = dimensionSpecification.split(' ').map(Number);

    const obstructionCheckers = new Map(); // Map: row_index (1-based) -> (col_index) => boolean
    obstacleDescriptions.forEach((descriptionLine, lineIndex) => {
        const trimmedLine = descriptionLine.trim();
        if (trimmedLine === '') return;
        const [startBlock, endBlock] = trimmedLine.split(' ').map(Number);
        const currentGridRow = lineIndex + 1; // Grid rows are 1-indexed
        if (!isNaN(startBlock) && !isNaN(endBlock)) {
            obstructionCheckers.set(currentGridRow, (position) => position >= startBlock && position <= endBlock);
        }
    });

    const initialColumnPositions = Array.from({length: gridColumns}, (_, i) => i + 1); // 1-indexed starting columns

    const allAchievedRowCosts = initialColumnPositions.flatMap(initialCol =>
        traverseRouteSegment(initialCol, 1, 0, obstructionCheckers, gridRows, gridColumns)
    );

    const minimalRowEntranceCosts = new Map(); // Map: row_index (1-based) -> minimum_cost
    for (const record of allAchievedRowCosts) {
        const { rowIndex, travelCost } = record;
        minimalRowEntranceCosts.set(rowIndex, Math.min(minimalRowEntranceCosts.get(rowIndex) || Infinity, travelCost));
    }

    const finalOutcomeArray = new Array(gridRows).fill(-1); // 0-indexed array for output
    for (let outputIndex = 0; outputIndex < gridRows; outputIndex++) {
        const actualRowNumber = outputIndex + 1; // Convert 0-indexed output array index to 1-indexed row number
        if (minimalRowEntranceCosts.has(actualRowNumber)) {
            finalOutcomeArray[outputIndex] = minimalRowEntranceCosts.get(actualRowNumber);
        }
    }

    console.log(finalOutcomeArray.join("\n"));
}

// Recursive helper function for path traversal
// Returns an array of {rowIndex: number, travelCost: number} objects.
// Each object signifies reaching rowIndex with travelCost steps.
function traverseRouteSegment(currentCol, currentRow, currentCost, obstacleMap, totalRows, totalCols) {
    // Base cases for path termination: if we've gone beyond grid boundaries
    if (currentRow > totalRows || currentCol > totalCols) {
        return [];
    }

    const segmentResults = [];
    const isBlockedAtCurrent = obstacleMap.has(currentRow) && obstacleMap.get(currentRow)(currentCol);

    if (!isBlockedAtCurrent) { // If current position is not blocked, we can move down
        const costAfterDownMove = currentCost + 1;
        // Record that we've reached 'currentRow' (1-indexed) with 'costAfterDownMove' steps.
        segmentResults.push({ rowIndex: currentRow, travelCost: costAfterDownMove });

        // Recursively explore the path after moving down to the next row
        return segmentResults.concat(traverseRouteSegment(currentCol, currentRow + 1, costAfterDownMove, obstacleMap, totalRows, totalCols));
    } else { // If current position is blocked, we must move right
        const costAfterRightMove = currentCost + 1;
        // Recursively explore the path after moving right to the next column
        return segmentResults.concat(traverseRouteSegment(currentCol + 1, currentRow, costAfterRightMove, obstacleMap, totalRows, totalCols));
    }
}

ExecuteSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
const solvePuzzle = (rawInputData) => {
    const dataLines = rawInputData.split("\n");
    const matrixDimension = parseInt(dataLines[0], 10);
    const activitySequence = dataLines[1].split(" ").map(Number);

    const cellDataMap = new Map(); // Stores cell values, key: "row,col", value: number

    // Populate the initial cell values based on minimum distance to any border
    // Using 0-indexed coordinates (r, c) from 0 to matrixDimension-1
    for (let r = 0; r < matrixDimension; r++) {
        for (let c = 0; c < matrixDimension; c++) {
            const edgeDistance = Math.min(r, matrixDimension - 1 - r, c, matrixDimension - 1 - c);
            cellDataMap.set(`${r},${c}`, edgeDistance);
        }
    }

    let accumulatedScore = 0;

    const adjacentCellShifts = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right

    // Recursive function to propagate value decrements
    // Equivalent to original `check`
    const initiateValueAdjustment = (currentCellMap, currentR, currentC, currentDim, visitedNodes) => {
        const currentCoordKey = `${currentR},${currentC}`;
        const currentCellValue = currentCellMap.get(currentCoordKey);

        for (const [deltaR, deltaC] of adjacentCellShifts) {
            const nextR = currentR + deltaR;
            const nextC = currentC + deltaC;
            const nextCoordKey = `${nextR},${nextC}`;

            // Ensure neighbor is within grid bounds
            if (nextR >= 0 && nextR < currentDim && nextC >= 0 && nextC < currentDim) {
                // If not visited in this pass and cell exists
                if (!visitedNodes.has(nextCoordKey) && currentCellMap.has(nextCoordKey)) {
                    const neighborValue = currentCellMap.get(nextCoordKey);
                    if (neighborValue > currentCellValue) {
                        visitedNodes.add(nextCoordKey); // Mark as visited
                        initiateValueAdjustment(currentCellMap, nextR, nextC, currentDim, visitedNodes);
                        currentCellMap.set(nextCoordKey, neighborValue - 1); // Decrement AFTER recursion
                    }
                }
            }
        }
    };

    // Recursive function to propagate cell eradication (-2 status)
    // Equivalent to original `checkout`
    const propagateEradication = (currentCellMap, currentR, currentC, currentDim, visitedForEradication) => {
        const currentCoordKey = `${currentR},${currentC}`;
        currentCellMap.set(currentCoordKey, -2); // Mark current cell as eradicated
        visitedForEradication.add(currentCoordKey);

        for (const [deltaR, deltaC] of adjacentCellShifts) {
            const nextR = currentR + deltaR;
            const nextC = currentC + deltaC;
            const nextCoordKey = `${nextR},${nextC}`;

            if (nextR >= 0 && nextR < currentDim && nextC >= 0 && nextC < currentDim) {
                if (!visitedForEradication.has(nextCoordKey) && currentCellMap.has(nextCoordKey)) {
                    visitedForEradication.add(nextCoordKey); // Mark as visited for this eradication path
                    const neighborValue = currentCellMap.get(nextCoordKey);
                    if (neighborValue >= 0) {
                        currentCellMap.set(nextCoordKey, 0); // Set to 0 if positive
                    } else if (neighborValue === -2) {
                        propagateEradication(currentCellMap, nextR, nextC, currentDim, visitedForEradication);
                    }
                    // Original `checkout` does not handle -1 cells directly;
                    // that logic is in the main processing loop.
                }
            }
        }
    };

    // Iterate through the sequence of interaction points
    for (const pointVal of activitySequence) {
        // Convert 1-indexed, flattened point value to 0-indexed (row, col)
        let focusRow = Math.ceil(pointVal / matrixDimension) - 1;
        let focusCol = (pointVal % matrixDimension === 0 ? matrixDimension : pointVal % matrixDimension) - 1;

        const currentFocusKey = `${focusRow},${focusCol}`;
        accumulatedScore += cellDataMap.get(currentFocusKey);

        // Initialize and execute value adjustment for the current point
        const decayVisitedSet = new Set();
        decayVisitedSet.add(currentFocusKey); // Current cell is the start of this decay process
        initiateValueAdjustment(cellDataMap, focusRow, focusCol, matrixDimension, decayVisitedSet);

        cellDataMap.set(currentFocusKey, -1); // Mark current cell as 'temporarily inactive'

        // Determine if the current cell is adjacent to any eradicated cell or boundary
        let isAdjacentToEradicated = false;
        for (const [deltaR, deltaC] of adjacentCellShifts) {
            const neighborR = focusRow + deltaR;
            const neighborC = focusCol + deltaC;
            const neighborKey = `${neighborR},${neighborC}`;

            const outOfBounds = neighborR < 0 || neighborR >= matrixDimension || neighborC < 0 || neighborC >= matrixDimension;

            if (outOfBounds) {
                isAdjacentToEradicated = true; // Out-of-bounds acts like an eradicated cell
                break;
            } else if (cellDataMap.get(neighborKey) === -2) {
                isAdjacentToEradicated = true; // Neighbor is already eradicated
                break;
            }
        }

        if (isAdjacentToEradicated) {
            cellDataMap.set(currentFocusKey, -2); // Current cell itself becomes eradicated

            const eradicationVisitedSet = new Set();
            // Propagate eradication status to neighbors
            for (const [deltaR, deltaC] of adjacentCellShifts) {
                const neighborR = focusRow + deltaR;
                const neighborC = focusCol + deltaC;
                const neighborKey = `${neighborR},${neighborC}`;

                if (neighborR >= 0 && neighborR < matrixDimension && neighborC >= 0 && neighborC < matrixDimension) {
                    const neighborValue = cellDataMap.get(neighborKey);
                    if (neighborValue !== undefined) { // Cell exists in our map
                        if (neighborValue >= 0) {
                            cellDataMap.set(neighborKey, 0); // Set to 0 if positive
                        } else if (neighborValue === -1) {
                            // If neighbor was 'temporarily inactive' (-1), it now becomes eradicated (-2)
                            // and this eradication propagates further.
                            if (!eradicationVisitedSet.has(neighborKey)) {
                                propagateEradication(cellDataMap, neighborR, neighborC, matrixDimension, eradicationVisitedSet);
                            }
                        }
                    }
                }
            }
        }
    }

    console.log('%s', accumulatedScore);
    return accumulatedScore;
};

// Standard boilerplate for competitive programming execution
const initiateProcessing = (inputContent) => {
    solvePuzzle(inputContent);
};

if (typeof require !== 'undefined' && require.main === module) {
    initiateProcessing(require("fs").readFileSync("/dev/stdin", "utf8"));
}
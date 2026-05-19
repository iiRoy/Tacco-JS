function calculatePath(gridData, totalCols) {
    const pathMemo = new Map(); // Stores minimum steps to reach a state "${x},${y}"

    function traverse(currentX, currentY, currentSteps) {
        // Boundary check: If outside valid column range, this path is invalid.
        if (currentY < 0 || currentY >= totalCols) {
            return Infinity;
        }

        const stateIdentifier = `${currentX},${currentY}`;

        // Memoization check: If we've already reached this state with fewer or equal steps,
        // there's no need to explore this path further as it won't be shorter.
        if (pathMemo.has(stateIdentifier) && pathMemo.get(stateIdentifier) <= currentSteps) {
            return Infinity;
        }

        // Update memo with the current minimum steps to reach this state.
        pathMemo.set(stateIdentifier, currentSteps);

        // Target check: If we are at the last column and the cell value is not 2,
        // we have found a valid path to the end.
        if (currentY === totalCols - 1 && gridData[currentX][currentY] !== 2) {
            return currentSteps;
        }

        let adjustedY = currentY;
        const cellContent = gridData[currentX][currentY];

        // Apply movement rules based on cell content
        if (cellContent === 1) {
            // Move right as long as the cell content is 1
            let tempColumn = currentY;
            while (tempColumn < totalCols && gridData[currentX][tempColumn] === 1) {
                tempColumn++;
            }
            adjustedY = tempColumn - 1; // Stop at the last '1' cell
        } else if (cellContent === 2) {
            // Move left as long as the cell content is 2
            let tempColumn = currentY;
            while (tempColumn >= 0 && gridData[currentX][tempColumn] === 2) {
                tempColumn--;
            }
            adjustedY = tempColumn + 1; // Stop at the first non-'2' cell or boundary
        }

        // Explore next possible states by switching rows and moving to adjustedY, adjustedY+1, or adjustedY+2
        let minimumPathFromCurrent = Infinity;
        const nextRowIndex = 1 - currentX; // Switch to the other row

        for (let offset = 0; offset <= 2; offset++) {
            minimumPathFromCurrent = Math.min(
                minimumPathFromCurrent,
                traverse(nextRowIndex, adjustedY + offset, currentSteps + 1)
            );
        }

        return minimumPathFromCurrent;
    }

    // Initiate the search from the two starting points (0,0) and (1,0) with 0 steps.
    // The memoization table is shared across these initial calls to find the global minimum.
    let resultFromRow0 = traverse(0, 0, 0);
    let resultFromRow1 = traverse(1, 0, 0);

    let overallMinimum = Math.min(resultFromRow0, resultFromRow1);

    // Return "NA" if no path was found, otherwise return the minimum steps.
    return overallMinimum === Infinity ? "NA" : overallMinimum;
}

var inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = inputSource.trim().split("\n");

while (true) {
    var columnCount = lineBuffer.shift() - 0; // Read N, convert to number
    if (columnCount === 0) {
        break; // Exit loop if N is 0
    }

    var gridValues = [];
    gridValues[0] = lineBuffer.shift().split(" ").map(Number); // Read first row
    gridValues[1] = lineBuffer.shift().split(" ").map(Number); // Read second row

    console.log(calculatePath(gridValues, columnCount));
}

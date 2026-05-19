function extractMoveLengths(pathSegments) {
    const xLengths = [];
    const yLengths = [];
    for (let segmentIndex = 0; segmentIndex < pathSegments.length; segmentIndex++) {
        const currentSegmentLength = pathSegments[segmentIndex].length;
        if (segmentIndex % 2 === 0) {
            xLengths.push(currentSegmentLength);
        } else {
            yLengths.push(currentSegmentLength);
        }
    }
    return { x: xLengths, y: yLengths };
}

function processInputData(rawData) {
    const inputLines = rawData.split("\n");
    const pathString = inputLines[0];
    const targetCoordsStr = inputLines[1].split(" ");

    const targetPositionX = Number(targetCoordsStr[0]);
    const targetPositionY = Number(targetCoordsStr[1]);
    const targetCoordinates = [targetPositionX, targetPositionY];

    const segmentsByT = pathString.split("T");
    const { x: xMoveLengths, y: yMoveLengths } = extractMoveLengths(segmentsByT);

    const reachableXCoordsHistory = [];
    let canReachX = false;

    x_loop: for (let currentStepIndexX = 0; currentStepIndexX < xMoveLengths.length; currentStepIndexX++) {
        reachableXCoordsHistory[currentStepIndexX] = [];
        const currentXMoveLength = xMoveLengths[currentStepIndexX];

        if (currentStepIndexX === 0) {
            reachableXCoordsHistory[0].push(currentXMoveLength);
            if (xMoveLengths.length === 1 && currentXMoveLength === targetCoordinates[0]) {
                canReachX = true;
            }
        } else if (currentStepIndexX === xMoveLengths.length - 1) {
            const previousXStates = reachableXCoordsHistory[currentStepIndexX - 1];
            for (let prevPathIndexX = 0; prevPathIndexX < previousXStates.length; prevPathIndexX++) {
                const previousXCoord = previousXStates[prevPathIndexX];
                if (previousXCoord + currentXMoveLength === targetCoordinates[0] || previousXCoord - currentXMoveLength === targetCoordinates[0]) {
                    canReachX = true;
                    break x_loop;
                }
            }
        } else {
            const previousXStates = reachableXCoordsHistory[currentStepIndexX - 1];
            const currentStepXPossibilities = [];
            for (let prevPathIndexX = 0; prevPathIndexX < previousXStates.length; prevPathIndexX++) {
                const previousXCoord = previousXStates[prevPathIndexX];
                currentStepXPossibilities.push(previousXCoord + currentXMoveLength);
                if (currentXMoveLength !== 0) {
                    currentStepXPossibilities.push(previousXCoord - currentXMoveLength);
                }
            }
            reachableXCoordsHistory[currentStepIndexX] = currentStepXPossibilities;
        }
    }

    const reachableYCoordsHistory = [];
    let canReachY = false;

    y_loop: for (let currentStepIndexY = 0; currentStepIndexY < yMoveLengths.length; currentStepIndexY++) {
        reachableYCoordsHistory[currentStepIndexY] = [];
        const currentYMoveLength = yMoveLengths[currentStepIndexY];

        if (currentStepIndexY === 0) {
            reachableYCoordsHistory[0].push(currentYMoveLength);
            if (yMoveLengths.length === 1 && currentYMoveLength === targetCoordinates[1]) {
                canReachY = true;
            }
        } else if (currentStepIndexY === yMoveLengths.length - 1) {
            const previousYStates = reachableYCoordsHistory[currentStepIndexY - 1];
            for (let prevPathIndexY = 0; prevPathIndexY < previousYStates.length; prevPathIndexY++) {
                const previousYCoord = previousYStates[prevPathIndexY];
                // This line replicates the original code's potential bug (checking against targetCoordinates[0] for Y-axis)
                if (previousYCoord + currentYMoveLength === targetCoordinates[1] || previousYCoord - currentYMoveLength === targetCoordinates[0]) {
                    canReachY = true;
                    break y_loop;
                }
            }
        } else {
            const previousYStates = reachableYCoordsHistory[currentStepIndexY - 1];
            const currentStepYPossibilities = [];
            for (let prevPathIndexY = 0; prevPathIndexY < previousYStates.length; prevPathIndexY++) {
                const previousYCoord = previousYStates[prevPathIndexY];
                currentStepYPossibilities.push(previousYCoord + currentYMoveLength);
                if (currentYMoveLength !== 0) {
                    currentStepYPossibilities.push(previousYCoord - currentYMoveLength);
                }
            }
            reachableYCoordsHistory[currentStepIndexY] = currentStepYPossibilities;
        }
    }

    console.log(canReachX && canReachY ? "Yes" : "No");
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

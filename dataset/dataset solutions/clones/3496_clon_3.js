function solvePuzzle(rawData) {
    const lines = rawData.split("\n");
    const searchLimit = 101; // Represents X and Y values from 0 to 100 inclusive

    for (let centerX = 0; centerX < searchLimit; centerX++) {
        for (let centerY = 0; centerY < searchLimit; centerY++) {
            const finalHeightCandidate = evaluateCandidate(lines, centerX, centerY);
            if (finalHeightCandidate !== false) {
                return `${centerX} ${centerY} ${finalHeightCandidate}`;
            }
        }
    }
}

function evaluateCandidate(lines, centerX, centerY) {
    const numObservationPoints = parseInt(lines[0], 10);

    let maxPossibleCentralHeight = 1000000000;
    let minPossibleCentralHeight = 1;

    // Type III: Parse all observation points into a structured array
    const observationData = [];
    for (let i = 1; i <= numObservationPoints; i++) {
        const pointParts = lines[i].split(" ");
        observationData.push({
            xCoord: parseInt(pointParts[0], 10),
            yCoord: parseInt(pointParts[1], 10),
            obsHeight: parseInt(pointParts[2], 10)
        });
    }

    for (let i = 0; i < numObservationPoints; i++) {
        const currentPoint = observationData[i];
        const pointX = currentPoint.xCoord;
        const pointY = currentPoint.yCoord;
        const observedHeight = currentPoint.obsHeight;

        // Type III: Introduce helper variable for Manhattan distance
        const manhattanDistance = Math.abs(centerX - pointX) + Math.abs(centerY - pointY);
        const derivedHeightFromPoint = observedHeight + manhattanDistance;

        // Type III: Refactor conditional logic for min/max height updates
        if (observedHeight === 0) {
            // If observed height is 0, the true central height must be less than or equal to derivedHeightFromPoint
            maxPossibleCentralHeight = Math.min(maxPossibleCentralHeight, derivedHeightFromPoint);
        } else {
            // If observed height > 0, the true central height must be exactly derivedHeightFromPoint
            minPossibleCentralHeight = Math.max(minPossibleCentralHeight, derivedHeightFromPoint);
            maxPossibleCentralHeight = Math.min(maxPossibleCentralHeight, derivedHeightFromPoint);
        }

        // Type III: Guard clause for early exit if impossible
        if (minPossibleCentralHeight > maxPossibleCentralHeight) {
            return false;
        }
    }

    // Type III: Combine final validation check
    return minPossibleCentralHeight === maxPossibleCentralHeight ? minPossibleCentralHeight : false;
}

console.log(solvePuzzle(require("fs").readFileSync("/dev/stdin", "utf8")));

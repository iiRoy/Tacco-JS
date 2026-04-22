function processMovement(sourceData) {
    const inputLines = sourceData.split("\n");
    const pathString = inputLines[0];
    const targetCoordsString = inputLines[1].split(" ");

    const finalXCoordinate = Number(targetCoordsString[0]);
    const finalYCoordinate = Number(targetCoordsString[1]);

    let initialXDisplacement = 0;
    const subsequentMoveLengths = [];
    let currentFBlockLength = 0;
    let hasEncounteredTurn = false;

    // Custom parsing of movement string to extract initial displacement and subsequent segment lengths
    for (let i = 0; i < pathString.length; i++) {
        if (pathString[i] === 'F') {
            currentFBlockLength++;
        } else { // 'T' character
            if (!hasEncounteredTurn) {
                initialXDisplacement = currentFBlockLength;
                hasEncounteredTurn = true;
            } else {
                subsequentMoveLengths.push(currentFBlockLength);
            }
            currentFBlockLength = 0;
        }
    }
    // Handle any trailing 'F's at the end of the path string
    if (currentFBlockLength > 0) {
        if (!hasEncounteredTurn) {
            initialXDisplacement = currentFBlockLength;
        } else {
            subsequentMoveLengths.push(currentFBlockLength);
        }
    }

    const horizontalMovements = [];
    const verticalMovements = [];

    // Distribute subsequent movement lengths to their respective axes
    // After the initial X-movement, the first turn enables Y-axis movement, then X, then Y, etc.
    for (let i = 0; i < subsequentMoveLengths.length; i++) {
        if (i % 2 === 0) { // Index 0 (1st turn) is Y, Index 2 (3rd turn) is Y, etc.
            verticalMovements.push(subsequentMoveLengths[i]);
        } else { // Index 1 (2nd turn) is X, Index 3 (4th turn) is X, etc.
            horizontalMovements.push(subsequentMoveLengths[i]);
        }
    }

    const totalHorizontalLength = horizontalMovements.reduce((acc, val) => acc + val, 0);
    const totalVerticalLength = verticalMovements.reduce((acc, val) => acc + val, 0);

    // Calculate the absolute displacement required for each axis after accounting for initial X-movement
    const requiredDeltaX = Math.abs(finalXCoordinate - initialXDisplacement);
    const requiredDeltaY = Math.abs(finalYCoordinate);

    // Function to determine if a target distance can be formed using a subset of given segment values
    // This is a variation of the subset sum problem. We need to find if a subset of 'availableSegments'
    // sums to (axisTotalLength - targetDistance) / 2.
    const canAchieveTarget = (availableSegments, axisTotalLength, targetDistance) => {
        if (targetDistance > axisTotalLength) {
            return false; // Cannot reach a distance greater than total available movement
        }
        const difference = axisTotalLength - targetDistance;
        if (difference % 2 !== 0) {
            return false; // The difference must be even for signs to balance
        }
        const targetSubsetSum = difference / 2;

        // Use a boolean array for dynamic programming to track reachable sums
        // `possible[s]` is true if sum `s` can be formed from a subset of `availableSegments`
        const possible = new Array(targetSubsetSum + 1).fill(false);
        possible[0] = true; // A sum of 0 is always achievable (by choosing no segments)

        for (const segmentVal of availableSegments) {
            // Iterate downwards to ensure each segment is used at most once in forming a sum
            for (let s = targetSubsetSum; s >= segmentVal; s--) {
                possible[s] = possible[s] || possible[s - segmentVal];
            }
        }
        return possible[targetSubsetSum];
    };

    // Check if both X and Y target displacements can be achieved independently
    if (canAchieveTarget(horizontalMovements, totalHorizontalLength, requiredDeltaX) &&
        canAchieveTarget(verticalMovements, totalVerticalLength, requiredDeltaY)) {
        console.log("Yes");
    } else {
        console.log("No");
    }
}

// Standard input/output handling for competitive programming platforms
processMovement(require("fs").readFileSync("/dev/stdin", "utf8"));
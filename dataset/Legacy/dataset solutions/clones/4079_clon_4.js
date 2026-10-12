function processInput(rawInput) {
    const inputLines = rawInput.split("\n");
    const [totalPoints, gridBlockSize] = inputLines[0].split(" ").map(Number);

    const pointConfigurations = [];
    for (let pointIndex = 0; pointIndex < totalPoints; pointIndex++) {
        const currentPointData = inputLines[pointIndex + 1].split(" ");
        const xCoordinate = parseInt(currentPointData[0]) % (2 * gridBlockSize);
        const yCoordinate = parseInt(currentPointData[1]) % (2 * gridBlockSize);
        const pointType = (currentPointData[2] === "W" ? 0 : 1); // 0 for 'W', 1 for 'B'
        pointConfigurations.push({ x: xCoordinate, y: yCoordinate, type: pointType });
    }

    // Helper function to apply a value to a rectangular region in a 2D difference array.
    // r1, c1 are inclusive start coordinates. r2, c2 are inclusive end coordinates.
    const applyRegionDelta = (deltaMatrix, rStart, cStart, rEnd, cEnd, deltaValue) => {
        if (rStart > rEnd || cStart > cEnd) return; // Skip invalid or empty regions

        deltaMatrix[rStart][cStart] += deltaValue;
        if (cEnd + 1 < gridBlockSize + 1) {
            deltaMatrix[rStart][cEnd + 1] -= deltaValue;
        }
        if (rEnd + 1 < gridBlockSize + 1) {
            deltaMatrix[rEnd + 1][cStart] -= deltaValue;
        }
        if (rEnd + 1 < gridBlockSize + 1 && cEnd + 1 < gridBlockSize + 1) {
            deltaMatrix[rEnd + 1][cEnd + 1] += deltaValue;
        }
    };

    // Initialize a 2D difference array. Its dimensions are (gridBlockSize + 1) x (gridBlockSize + 1)
    // to handle boundary conditions when applying deltas up to index gridBlockSize - 1.
    const shiftDeltaMatrix = Array.from({ length: gridBlockSize + 1 }, () => Array(gridBlockSize + 1).fill(0));

    for (const currentPoint of pointConfigurations) {
        const currentX = currentPoint.x;
        const currentY = currentPoint.y;
        const currentType = currentPoint.type;

        const xBaseBlock = Math.floor(currentX / gridBlockSize);
        const yBaseBlock = Math.floor(currentY / gridBlockSize);

        // xShiftBoundary: The smallest 'i' in [0, K] where (currentX + i) / K changes its integer part.
        // If currentX is a multiple of K, it means (currentX + i) / K will be xBaseBlock for all i in [0, K-1].
        // In this case, the boundary effectively occurs at i = K.
        const xShiftBoundary = (currentX % gridBlockSize === 0) ? gridBlockSize : (gridBlockSize - (currentX % gridBlockSize));
        // yShiftBoundary: Similar logic for 'j' and currentY.
        const yShiftBoundary = (currentY % gridBlockSize === 0) ? gridBlockSize : (gridBlockSize - (currentY % gridBlockSize));

        // The (i, j) shift space [0, K-1] x [0, K-1] is divided into up to four regions
        // based on when (currentX + i) / K and (currentY + j) / K change their block values.

        // Region 1: i in [0, xShiftBoundary - 1], j in [0, yShiftBoundary - 1]
        // Here, x_block = xBaseBlock, y_block = yBaseBlock
        if (((xBaseBlock ^ yBaseBlock) & 1) === currentType) {
            applyRegionDelta(shiftDeltaMatrix, 0, 0, xShiftBoundary - 1, yShiftBoundary - 1, 1);
        }

        // Region 2: i in [xShiftBoundary, K - 1], j in [0, yShiftBoundary - 1]
        // Here, x_block = xBaseBlock + 1, y_block = yBaseBlock
        if ((( (xBaseBlock + 1) ^ yBaseBlock) & 1) === currentType) {
            applyRegionDelta(shiftDeltaMatrix, xShiftBoundary, 0, gridBlockSize - 1, yShiftBoundary - 1, 1);
        }

        // Region 3: i in [0, xShiftBoundary - 1], j in [yShiftBoundary, K - 1]
        // Here, x_block = xBaseBlock, y_block = yBaseBlock + 1
        if (((xBaseBlock ^ (yBaseBlock + 1)) & 1) === currentType) {
            applyRegionDelta(shiftDeltaMatrix, 0, yShiftBoundary, xShiftBoundary - 1, gridBlockSize - 1, 1);
        }

        // Region 4: i in [xShiftBoundary, K - 1], j in [yShiftBoundary, K - 1]
        // Here, x_block = xBaseBlock + 1, y_block = yBaseBlock + 1
        if ((( (xBaseBlock + 1) ^ (yBaseBlock + 1)) & 1) === currentType) {
            applyRegionDelta(shiftDeltaMatrix, xShiftBoundary, yShiftBoundary, gridBlockSize - 1, gridBlockSize - 1, 1);
        }
    }

    let maximumAchievedMatches = 0;
    // Compute 2D prefix sums from the difference array to get actual match counts for each shift (rowShift, colShift).
    for (let rowShift = 0; rowShift < gridBlockSize; rowShift++) {
        for (let colShift = 0; colShift < gridBlockSize; colShift++) {
            // Apply the 2D prefix sum formula
            if (rowShift > 0) shiftDeltaMatrix[rowShift][colShift] += shiftDeltaMatrix[rowShift - 1][colShift];
            if (colShift > 0) shiftDeltaMatrix[rowShift][colShift] += shiftDeltaMatrix[rowShift][colShift - 1];
            if (rowShift > 0 && colShift > 0) shiftDeltaMatrix[rowShift][colShift] -= shiftDeltaMatrix[rowShift - 1][colShift - 1];
            
            const currentShiftMatchCount = shiftDeltaMatrix[rowShift][colShift];
            // Update the maximum, considering both the current pattern and its inverted version.
            maximumAchievedMatches = Math.max(maximumAchievedMatches, currentShiftMatchCount, totalPoints - currentShiftMatchCount);
        }
    }

    console.log(maximumAchievedMatches);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function ProcessGridData(inputLines) {
    const gridDimensions = inputLines.shift().split(" ").map(Number);
    const totalGridHeight = gridDimensions[0];
    const totalGridWidth = gridDimensions[1];
    const numPoints = gridDimensions[2];

    const inputCoordinates = inputLines.map(line => line.split(" ").map(Number));
    // The original code sorts points by their y-coordinate (first element).
    // While not strictly necessary for this new approach, preserving this step
    // ensures behavioral consistency with the original's input processing.
    inputCoordinates.sort((coordA, coordB) => coordA[0] - coordB[0]);

    // Use a Map to store the count of points within each 3x3 square.
    // The key represents the bottom-right corner (brY_brX) of the 3x3 square.
    const squarePointAggregates = new Map();

    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        const [pointY, pointX] = inputCoordinates[pointIndex];

        // A point (pointY, pointX) contributes to 3x3 squares whose bottom-right corner
        // (brY, brX) falls within the range:
        // brY: [pointY, pointY + 2]
        // brX: [pointX, pointX + 2]
        // These ranges must also respect the overall grid boundaries (1 to totalGridHeight/Width).

        const minBottomRightY = Math.max(1, pointY);
        const maxBottomRightY = Math.min(totalGridHeight, pointY + 2);

        const minBottomRightX = Math.max(1, pointX);
        const maxBottomRightX = Math.min(totalGridWidth, pointX + 2);

        for (let brY = minBottomRightY; brY <= maxBottomRightY; brY++) {
            for (let brX = minBottomRightX; brX <= maxBottomRightX; brX++) {
                const squareKey = `${brY}_${brX}`;
                squarePointAggregates.set(squareKey, (squarePointAggregates.get(squareKey) || 0) + 1);
            }
        }
    }

    // Initialize an array to store the final counts for 0 to 9 points.
    // finalCounts[k] will store the number of 3x3 squares containing k points.
    const finalCounts = Array(10).fill(0);

    // Populate finalCounts based on the aggregated square counts.
    for (const pointCount of squarePointAggregates.values()) {
        finalCounts[pointCount]++;
    }

    // Calculate the total number of possible 3x3 squares.
    // The original code defines `h` and `w` as `s[0][0]-2` and `s[0][1]-2`.
    // These represent the maximum top-left coordinates for a 3x3 square.
    // So, the total number of 3x3 squares is `(totalGridHeight - 2) * (totalGridWidth - 2)`.
    const effectiveGridHeight = totalGridHeight - 2;
    const effectiveGridWidth = totalGridWidth - 2;

    // Ensure dimensions are not negative if grid is too small.
    let totalPossibleSquares = Math.max(0, effectiveGridHeight) * Math.max(0, effectiveGridWidth);
    let overflowMagnitude = 0; // Corresponds to 'f' in the original code

    // Replicate the original's specific large number handling for totalPossibleSquares.
    // This involves splitting the product into two parts if it exceeds 9e15.
    if (totalPossibleSquares > 9e15) {
        // This calculation `(h % 1e5 * w)` is a specific way to get the lower part of the product.
        let tempLowerProduct = (effectiveGridHeight % 100000) * effectiveGridWidth;
        overflowMagnitude = Math.floor(tempLowerProduct / 100000);
        totalPossibleSquares = tempLowerProduct % 100000;

        // Add the higher part of the product to the overflow magnitude.
        overflowMagnitude += Math.floor(effectiveGridHeight / 100000) * effectiveGridWidth;
    }

    // Subtract the counts of squares with 1 to 9 points from the total.
    // This gives the count of squares with 0 points.
    for (let idx = 1; idx <= 9; idx++) {
        totalPossibleSquares -= finalCounts[idx];
    }

    // Apply final adjustments and formatting if overflow handling was active.
    if (overflowMagnitude > 0) {
        // Adjust for negative `totalPossibleSquares` due to subtractions.
        while (totalPossibleSquares < 0) {
            overflowMagnitude--;
            totalPossibleSquares += 100000;
        }
        // Format the lower part to 5 digits and combine with the higher part.
        const formattedLowerPart = String(totalPossibleSquares % 100000).padStart(5, '0');
        finalCounts[0] = String(overflowMagnitude) + formattedLowerPart;
    } else {
        // If no overflow handling was needed, or `overflowMagnitude` became 0,
        // `finalCounts[0]` is just the calculated `totalPossibleSquares`.
        finalCounts[0] = totalPossibleSquares;
    }

    console.log(finalCounts.join("\n"));
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));

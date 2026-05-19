function processInputData(inputLines) {
    // Constants for grid dimensions and point processing
    const SQUARE_DIMENSION = 3;
    const MIN_OFFSET_FOR_SQUARE_TOP_LEFT = -2;
    const MAX_OFFSET_FOR_SQUARE_TOP_LEFT = 0;
    const MAX_POINTS_IN_SQUARE_DISPLAY = 9; // Max index for resultCounts array

    // Parse initial parameters: grid dimensions and number of points
    const [initialHeightRaw, initialWidthRaw, numPoints] = inputLines[0].split(" ").map(valStr => parseInt(valStr, 10));
    const gridHeight = initialHeightRaw - (SQUARE_DIMENSION - 1); // h = s[0][0] - 2
    const gridWidth = initialWidthRaw - (SQUARE_DIMENSION - 1);   // w = s[0][1] - 2

    // Initialize a structure to store counts of points within 3x3 squares.
    // We use modulo 3 indexing to efficiently manage memory for rows,
    // as only 3 consecutive rows (y, y+1, y+2) are relevant at any given time.
    const pointCountsByRowMod = Array.from({ length: SQUARE_DIMENSION }, () => ({})); // m

    // Parse point coordinates from input lines, skipping the first line
    const pointCoordinates = inputLines.slice(1, numPoints + 1).map(line =>
        line.split(" ").map(valStr => parseInt(valStr, 10))
    );

    // Sort points by their row coordinate to process them efficiently
    pointCoordinates.sort((coordA, coordB) => coordA[0] - coordB[0]);

    // Array to store the final counts of 3x3 squares containing 0 to 9 points
    const resultCounts = Array(MAX_POINTS_IN_SQUARE_DISPLAY + 1).fill(0); // ans

    let currentProcessingRow = 1; // Represents 'y' in the original code, the top-left row of the 3x3 square

    // Helper function to increment the count for a 3x3 square that contains a given point (pointCol, pointRow)
    const updateCountsForPoint = (pointCol, pointRow) => {
        for (let colOffset = MIN_OFFSET_FOR_SQUARE_TOP_LEFT; colOffset <= MAX_OFFSET_FOR_SQUARE_TOP_LEFT; colOffset++) {
            const squareTopLeftCol = pointCol + colOffset;
            // If the 3x3 square's top-left column is outside the valid grid width, skip this column offset
            if (squareTopLeftCol < 1) continue;
            if (squareTopLeftCol > gridWidth) break; // Further colOffsets will also be out of bounds

            for (let rowOffset = MIN_OFFSET_FOR_SQUARE_TOP_LEFT; rowOffset <= MAX_OFFSET_FOR_SQUARE_TOP_LEFT; rowOffset++) {
                const squareTopLeftRow = pointRow + rowOffset;
                // If the 3x3 square's top-left row is outside the valid grid height, skip this row offset
                if (squareTopLeftRow < 1) continue;
                if (squareTopLeftRow > gridHeight) break; // Further rowOffsets will also be out of bounds

                const rowModIndex = squareTopLeftRow % SQUARE_DIMENSION;
                // Increment the count for this specific 3x3 square.
                // If it's the first point in this square, initialize to 1.
                pointCountsByRowMod[rowModIndex][squareTopLeftCol] = (pointCountsByRowMod[rowModIndex][squareTopLeftCol] || 0) + 1;
            }
        }
    };

    // Iterate through each sorted point
    for (let pointIndex = 0; pointIndex < numPoints; pointIndex++) {
        const [pointRow, pointCol] = pointCoordinates[pointIndex];

        let rowsSkippedInBlock = 0; // Counter for consecutive rows processed without a point
        // Process rows that are "skipped" because the current point is significantly further down
        while (currentProcessingRow < pointRow - (SQUARE_DIMENSION - 1)) { // while (y + 2 < s[i][0])
            const currentModRowIndex = currentProcessingRow % SQUARE_DIMENSION;
            // Aggregate counts for all 3x3 squares in the current `currentProcessingRow`
            for (const colKey of Object.keys(pointCountsByRowMod[currentModRowIndex])) {
                const count = pointCountsByRowMod[currentModRowIndex][colKey];
                if (count <= MAX_POINTS_IN_SQUARE_DISPLAY) {
                    resultCounts[count]++;
                }
            }
            // Clear the counts for this row as it has been fully processed and aggregated
            pointCountsByRowMod[currentModRowIndex] = {};
            currentProcessingRow++;
            rowsSkippedInBlock++;

            // Optimization: If we've skipped 3 or more rows, we can jump `currentProcessingRow`
            // directly to just before the current point's row. This is safe because
            // `pointCountsByRowMod` only tracks 3 rows (y, y+1, y+2), so any rows
            // beyond that range would have already been cleared.
            if (rowsSkippedInBlock >= SQUARE_DIMENSION) {
                currentProcessingRow = pointRow - (SQUARE_DIMENSION - 1);
            }
        }
        // Update counts for the 3x3 squares affected by the current point
        updateCountsForPoint(pointCol, pointRow);
    }

    // After processing all points, aggregate any remaining counts in `pointCountsByRowMod`
    // These are squares whose top-left row is currentProcessingRow, currentProcessingRow+1, or currentProcessingRow+2
    for (let modIndex = 0; modIndex < SQUARE_DIMENSION; modIndex++) {
        for (const colKey of Object.keys(pointCountsByRowMod[modIndex])) {
            const count = pointCountsByRowMod[modIndex][colKey];
            if (count <= MAX_POINTS_IN_SQUARE_DISPLAY) {
                resultCounts[count]++;
            }
        }
    }

    // --- Calculate the count of squares with 0 points (resultCounts[0]) ---
    let zeroPointSquaresCount = gridHeight * gridWidth; // Initial total possible squares
    let largeNumberCarry = 0; // Used for handling very large numbers for resultCounts[0]
    const LARGE_NUMBER_BASE = 100000; // 1e5
    const LARGE_NUMBER_THRESHOLD = 9000000000000000; // 9e15, used to detect if zeroPointSquaresCount exceeds safe integer limits

    // If the total number of squares is very large, split it for calculation and display
    if (zeroPointSquaresCount > LARGE_NUMBER_THRESHOLD) {
        // Perform calculation using modulo arithmetic to prevent overflow
        zeroPointSquaresCount = (gridHeight % LARGE_NUMBER_BASE * gridWidth);
        largeNumberCarry = Math.floor(zeroPointSquaresCount / LARGE_NUMBER_BASE);
        zeroPointSquaresCount %= LARGE_NUMBER_BASE;
    }

    // Subtract the counts of squares with 1 to 9 points from the total
    for (let countValue = 1; countValue <= MAX_POINTS_IN_SQUARE_DISPLAY; countValue++) {
        zeroPointSquaresCount -= resultCounts[countValue];
    }

    // If there was a large number carry, adjust the final zeroPointSquaresCount and format it
    if (largeNumberCarry) {
        largeNumberCarry += Math.floor(gridHeight / LARGE_NUMBER_BASE) * gridWidth;
        // Adjust carry and zeroPointSquaresCount if zeroPointSquaresCount became negative
        while (zeroPointSquaresCount < 0) {
            largeNumberCarry--;
            zeroPointSquaresCount += LARGE_NUMBER_BASE;
        }
        // Format the lower part of the number with leading zeros to 5 digits
        const formattedLowerPart = String(zeroPointSquaresCount % LARGE_NUMBER_BASE).padStart(5, '0');
        resultCounts[0] = String(largeNumberCarry) + formattedLowerPart;
    } else {
        resultCounts[0] = zeroPointSquaresCount;
    }

    // Output the final counts, each on a new line
    console.log(resultCounts.join("\n"));
}

// Read input from stdin and pass it to the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));

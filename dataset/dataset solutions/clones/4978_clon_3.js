function ProcessCoordinates(rawInputLines) {
    // This JavaScript program processes a list of 2D points and calculates the
    // distribution of how many times each cell in a specific grid area is "painted"
    // by these points. Each point "paints" a 3x3 square, affecting cells relative
    // to its own coordinates (the point is the bottom-right of the 3x3 square).

    // --- Input Parsing and Initial Grid Setup ---

    // The first line of input contains the original grid dimensions (Height, Width)
    // and the total number of points to process.
    const initialParameters = rawInputLines[0].split(" ").map(val => parseInt(val, 10));
    const originalGridDimensionH = initialParameters[0];
    const originalGridDimensionW = initialParameters[1];
    const totalNumberOfPoints = initialParameters[2];

    // The problem implies a 1-indexed grid. A point at (X, Y) affects cells
    // (X-2, Y-2) through (X, Y). Therefore, the effective grid area where
    // cell overlaps can occur is smaller than the original grid.
    // E.g., a point at (1,1) only affects (1,1). A point at (3,3) affects (1,1) to (3,3).
    // So, the top-left corner of any affected 3x3 square can range from (1,1) up to (H-2, W-2).
    const effectiveProcessingHeight = originalGridDimensionH - 2;
    const effectiveProcessingWidth = originalGridDimensionW - 2;

    // Early exit if the effective grid area is non-positive.
    // In this case, no cells can be painted, so all overlap counts are zero.
    if (effectiveProcessingHeight <= 0 || effectiveProcessingWidth <= 0) {
        console.log(Array(10).fill(0).join("\n"));
        return;
    }

    // Parse the coordinates of all points. The input lines start from index 1.
    // Each line `i+1` corresponds to the `i`-th point.
    const inputPointCoordinates = [];
    for (let pointIndex = 0; pointIndex < totalNumberOfPoints; pointIndex++) {
        // Points are given as (Y, X) coordinates.
        const pointValues = rawInputLines[pointIndex + 1].split(" ").map(val => parseInt(val, 10));
        inputPointCoordinates.push(pointValues);
    }

    // Sort the points primarily by their Y-coordinate (first element).
    // This allows us to process rows in a sequential manner, which is crucial
    // for efficiently managing the circular buffer of row maps.
    inputPointCoordinates.sort((pointAlpha, pointBeta) => pointAlpha[0] - pointBeta[0]);

    // `overlapFrequencyDistribution` will store the final counts.
    // `overlapFrequencyDistribution[k]` represents the number of cells that have `k` overlaps.
    // We are interested in counts from 0 to 9.
    const overlapFrequencyDistribution = new Array(10).fill(0);

    // A circular buffer of Maps, used to store overlap counts for cells in a 3-row window.
    // `rowOverlapMaps[i]` stores `Map<X_Coordinate, OverlapCount>` for cells
    // whose Y-coordinate modulo `MODULO_CYCLE_SIZE` equals `i`.
    // Using `Map` objects provides clear key-value storage for sparse cell data.
    const rowOverlapMaps = [new Map(), new Map(), new Map()];
    const MODULO_CYCLE_SIZE = 3; // The size of the circular buffer (due to 3x3 painting).

    let currentEvaluationRow = 1; // Tracks the current row being considered for processing.

    // --- Main Point Processing Loop ---

    // Iterate through each point, which are now sorted by their Y-coordinate.
    for (let pIdx = 0; pIdx < totalNumberOfPoints; pIdx++) {
        const pointYValue = inputPointCoordinates[pIdx][0];
        const pointXValue = inputPointCoordinates[pIdx][1];

        // Process "empty" rows:
        // If the current point's Y-coordinate is sufficiently far ahead of
        // `currentEvaluationRow`, it means `currentEvaluationRow` and the next two
        // rows (`currentEvaluationRow + 1`, `currentEvaluationRow + 2`) will not be
        // affected by *any* future points whose Y-coordinate is >= `pointYValue`.
        // We can safely finalize the overlap counts for `currentEvaluationRow` and clear its map.
        while (currentEvaluationRow + 2 < pointYValue) {
            const mapBufferIndex = currentEvaluationRow % MODULO_CYCLE_SIZE;
            // Iterate through all cells in the map corresponding to `currentEvaluationRow`.
            for (const [cellXCoord, currentOverlapCount] of rowOverlapMaps[mapBufferIndex].entries()) {
                // Increment the appropriate slot in the final distribution array.
                // Cap counts at 9 for the purpose of distribution.
                if (currentOverlapCount < 10) {
                    overlapFrequencyDistribution[currentOverlapCount]++;
                } else {
                    overlapFrequencyDistribution[9]++;
                }
            }
            // Clear the map for this row, as its counts have been finalized.
            rowOverlapMaps[mapBufferIndex].clear();
            currentEvaluationRow++; // Move to the next row.
        }

        // Apply the "paint" operation for the current point.
        // This updates the `rowOverlapMaps` for the 3x3 area influenced by `pointXValue, pointYValue`.
        applyPointEffect(
            pointXValue,
            pointYValue,
            rowOverlapMaps,
            effectiveProcessingHeight,
            effectiveProcessingWidth,
            MODULO_CYCLE_SIZE
        );
    }

    // --- Finalize Remaining Overlap Counts ---

    // After all points are processed, there might be some remaining overlap counts
    // in the `rowOverlapMaps` for the last few rows affected by the final points.
    // Iterate through the circular buffer and add these remaining counts to the distribution.
    for (let bufferIndex = 0; bufferIndex < MODULO_CYCLE_SIZE; bufferIndex++) {
        for (const [cellXCoord, currentOverlapCount] of rowOverlapMaps[bufferIndex].entries()) {
            if (currentOverlapCount < 10) {
                overlapFrequencyDistribution[currentOverlapCount]++;
            } else {
                overlapFrequencyDistribution[9]++;
            }
        }
    }

    // --- Calculate Cells with Zero Overlaps (overlapFrequencyDistribution[0]) ---

    // A constant for handling large number arithmetic (splitting into high and low parts).
    const LARGE_NUMBER_BASE = 1e5;

    // Helper function to perform subtraction on large numbers represented as (highPart, lowPart).
    // This is crucial for `effectiveProcessingHeight * effectiveProcessingWidth` when it exceeds
    // standard JavaScript number precision.
    function subtractLargeNumber(totalLow, totalHigh, subtractorValue, base) {
        let currentLow = totalLow;
        let currentHigh = totalHigh;

        // Extract high and low parts of the subtractor if it's large.
        let subLow = subtractorValue % base;
        let subHigh = Math.floor(subtractorValue / base);

        currentLow -= subLow;
        currentHigh -= subHigh;

        // Handle borrowing if the low part becomes negative.
        while (currentLow < 0) {
            currentLow += base;
            currentHigh--; // Borrow from the high part.
        }
        return { low: currentLow, high: currentHigh };
    }

    // First, calculate the total number of effective cells in the grid.
    // This product (effectiveProcessingHeight * effectiveProcessingWidth) can be very large.
    let totalEffectiveCellsLowPart = (effectiveProcessingHeight % LARGE_NUMBER_BASE) * effectiveProcessingWidth;
    let totalEffectiveCellsHighPart = Math.floor(effectiveProcessingHeight / LARGE_NUMBER_BASE) * effectiveProcessingWidth;

    // Propagate carry from the multiplication of low parts.
    totalEffectiveCellsHighPart += Math.floor(totalEffectiveCellsLowPart / LARGE_NUMBER_BASE);
    totalEffectiveCellsLowPart %= LARGE_NUMBER_BASE;

    // Sum up all cells that have 1 or more overlaps.
    let totalCellsWithAnyOverlaps = 0;
    for (let count = 1; count <= 9; count++) {
        totalCellsWithAnyOverlaps += overlapFrequencyDistribution[count];
    }

    // Now, subtract `totalCellsWithAnyOverlaps` from the `totalEffectiveCells` (high/low parts).
    const subtractionResult = subtractLargeNumber(
        totalEffectiveCellsLowPart,
        totalEffectiveCellsHighPart,
        totalCellsWithAnyOverlaps,
        LARGE_NUMBER_BASE
    );

    // Update the high part based on the subtraction result.
    totalEffectiveCellsHighPart = subtractionResult.high;
    totalEffectiveCellsLowPart = subtractionResult.low;

    // Format `overlapFrequencyDistribution[0]` (cells with zero overlaps).
    if (totalEffectiveCellsHighPart > 0) {
        // If there's a high part, format the low part with leading zeros and concatenate.
        const formattedLowPart = String(totalEffectiveCellsLowPart).padStart(String(LARGE_NUMBER_BASE - 1).length, '0');
        overlapFrequencyDistribution[0] = String(totalEffectiveCellsHighPart) + formattedLowPart;
    } else {
        // Otherwise, it's just the low part.
        overlapFrequencyDistribution[0] = totalEffectiveCellsLowPart;
    }

    // --- Output Results ---

    // Join the distribution array elements with newlines for the final output.
    console.log(overlapFrequencyDistribution.join("\n"));
}


// --- Helper Function: Apply Point Effect (Mark Overlaps) ---

// This function updates the `rowOverlapMaps` based on a single point's influence.
// A point at `(pointX, pointY)` affects a 3x3 square, where `(pointX, pointY)`
// is the bottom-right corner of this square.
function applyPointEffect(
    pointX,
    pointY,
    overlapMapsBuffer,       // The circular buffer of Maps.
    maxEffectiveHeight,      // Maximum valid Y-coordinate for a cell.
    maxEffectiveWidth,       // Maximum valid X-coordinate for a cell.
    bufferModuloSize         // Size of the circular buffer (e.g., 3).
) {
    // Basic validation for point coordinates. Grid is 1-indexed.
    if (pointX < 1 || pointY < 1) {
        return; // Invalid point, do not process.
    }

    // Define the offsets for the 3x3 square relative to the `pointX, pointY`
    // (which is the bottom-right corner).
    const X_OFFSET_MIN = -2;
    const X_OFFSET_MAX = 0;
    const Y_OFFSET_MIN = -2;
    const Y_OFFSET_MAX = 0;

    for (let xOffset = X_OFFSET_MIN; xOffset <= X_OFFSET_MAX; xOffset++) {
        const targetCellX = pointX + xOffset;

        // Check if the target cell's X-coordinate is within the effective grid boundaries.
        if (targetCellX < 1 || targetCellX > maxEffectiveWidth) {
            continue; // Skip if out of bounds.
        }

        for (let yOffset = Y_OFFSET_MIN; yOffset <= Y_OFFSET_MAX; yOffset++) {
            const targetCellY = pointY + yOffset;

            // Check if the target cell's Y-coordinate is within the effective grid boundaries.
            if (targetCellY < 1 || targetCellY > maxEffectiveHeight) {
                continue; // Skip if out of bounds.
            }

            // Determine which map in the circular buffer corresponds to this `targetCellY`.
            const mapBufferIndex = targetCellY % bufferModuloSize;
            const currentMapForThisRow = overlapMapsBuffer[mapBufferIndex];

            // Increment the overlap count for this specific cell (targetCellX, targetCellY).
            // If the cell hasn't been encountered before, its count starts at 0, then increments to 1.
            const existingCount = currentMapForThisRow.get(targetCellX) || 0;
            currentMapForThisRow.set(targetCellX, existingCount + 1);
        }
    }
}

// --- Program Entry Point ---
// Reads input from standard input, splits it into lines, and passes to the main processing function.
ProcessCoordinates(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
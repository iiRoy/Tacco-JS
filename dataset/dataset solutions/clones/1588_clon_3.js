(async () => {
    // This asynchronous function processes input to solve a grid-based problem.
    // It identifies the maximum number of points in any row and any column,
    // then checks for a specific "gap" condition at their intersections.

    let incomingDataBuffer = [];
    // Accumulate all incoming data chunks from standard input.
    for await (const dataPiece of process.stdin) {
        incomingDataBuffer.push(dataPiece);
    }
    // Convert the buffered data to a complete string.
    const fullInputString = Buffer.concat(incomingDataBuffer).toString('utf8');

    // Split the entire input into individual lines for processing.
    const inputLineSegments = fullInputString.split(/\r?\n/).filter(Boolean); // Filter out empty lines

    // Parse the first line to get grid dimensions and total number of coordinate points.
    // The format is "matrixHeight matrixWidth totalCoordinates".
    const [matrixHeightStr, matrixWidthStr, totalCoordinatesStr] = inputLineSegments[0].split(/\s/);

    const matrixHeight = parseInt(matrixHeightStr, 10);
    const matrixWidth = parseInt(matrixWidthStr, 10);
    const totalCoordinates = parseInt(totalCoordinatesStr, 10);

    // Early exit for trivial cases or invalid inputs
    if (isNaN(matrixHeight) || isNaN(matrixWidth) || isNaN(totalCoordinates) ||
        matrixHeight <= 0 || matrixWidth <= 0 || totalCoordinates < 0) {
        console.log(0);
        return;
    }

    // Helper function to parse a single coordinate line
    const extractCoordinatePair = (coordinateLine) => {
        const [xCoordStr, yCoordStr] = coordinateLine.split(/\s/);
        // Adjust coordinates to be 0-indexed
        return [parseInt(xCoordStr, 10) - 1, parseInt(yCoordStr, 10) - 1];
    };

    // Process subsequent lines to get all coordinate points.
    // We slice from the second line (index 1) up to totalCoordinates + 1.
    const coordinatePoints = inputLineSegments.slice(1, totalCoordinates + 1).map(extractCoordinatePair);

    // Initialize data structures to track point presence and counts along axes.

    // `axisPointCounts` stores the number of points in each row and each column.
    // Using an object for better readability than a magic index array.
    const axisPointCounts = {
        row: Array(matrixHeight).fill(0), // Counts for each row
        col: Array(matrixWidth).fill(0)   // Counts for each column
    };

    // `occupiedCellsGrid` is a 2D boolean array representing the grid,
    // where `true` indicates a point exists at that cell.
    const occupiedCellsGrid = Array.from({ length: matrixHeight }, () =>
        Array(matrixWidth).fill(false)
    );

    // Populate the data structures based on the parsed coordinate points.
    // Iterate through each coordinate pair and update counts and grid status.
    for (const currentCoord of coordinatePoints) {
        const [rowIdx, colIdx] = currentCoord;

        // Ensure coordinates are within valid bounds before processing
        if (rowIdx >= 0 && rowIdx < matrixHeight && colIdx >= 0 && colIdx < matrixWidth) {
            axisPointCounts.row[rowIdx]++;
            axisPointCounts.col[colIdx]++;
            occupiedCellsGrid[rowIdx][colIdx] = true;
        }
        // else: Optionally, handle out-of-bounds coordinates (e.g., log a warning)
    }

    // Find the maximum number of points in any single row and any single column.
    // We create sorted copies to easily pick the maximum element.
    const sortedRowDensities = axisPointCounts.row.slice().sort((a, b) => b - a);
    const sortedColDensities = axisPointCounts.col.slice().sort((a, b) => b - a);

    const maxPointsInAnyRow = sortedRowDensities[0] || 0; // Default to 0 if no rows or points
    const maxPointsInAnyCol = sortedColDensities[0] || 0; // Default to 0 if no cols or points

    // Identify all column indices that achieve the `maxPointsInAnyCol` value.
    // These are the "peak" columns.
    const peakColumnIndices = [];
    for (let k = 0; k < matrixWidth; k++) {
        if (axisPointCounts.col[k] === maxPointsInAnyCol) {
            peakColumnIndices.push(k);
        }
    }

    // Determine if there is any unoccupied cell at the intersection of a "peak" row
    // (a row with `maxPointsInAnyRow`) and a "peak" column (from `peakColumnIndices`).
    let hasUnoccupiedIntersection = false;
    // Outer loop iterates through all possible row indices.
    for (let currentGridRowIdx = 0; currentGridRowIdx < matrixHeight; currentGridRowIdx++) {
        // Only proceed if this row itself has the maximum number of points.
        if (axisPointCounts.row[currentGridRowIdx] === maxPointsInAnyRow) {
            // Inner loop iterates through the list of peak column indices.
            for (let peakColListIdx = 0; peakColListIdx < peakColumnIndices.length; peakColListIdx++) {
                const currentPeakColIdx = peakColumnIndices[peakColListIdx];
                // Check if the cell at the intersection of this peak row and peak column is empty.
                if (!occupiedCellsGrid[currentGridRowIdx][currentPeakColIdx]) {
                    hasUnoccupiedIntersection = true; // Found an empty intersection!
                    break; // No need to check further columns for this row.
                }
            }
        }
        if (hasUnoccupiedIntersection) {
            break; // If an empty intersection is found, no need to check further rows.
        }
    }

    // Calculate the final result.
    // The base value is the sum of maximum points in a row and maximum points in a column.
    // If there's an empty intersection, we subtract 1 from this sum.
    // This logic effectively finds the maximum possible sum of distinct points if we pick one max row and one max column.
    const finalResult = maxPointsInAnyRow + maxPointsInAnyCol - (hasUnoccupiedIntersection ? 1 : 0);

    console.log(finalResult);
})();
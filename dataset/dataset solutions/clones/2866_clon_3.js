function calculateMaxLightExposure(inputStringPayload) {
    // Extensive input processing and validation
    const rawInputLines = inputStringPayload.split("\n").filter(line => line.trim() !== '');

    if (rawInputLines.length === 0) {
        console.error("Input data is empty. Cannot process an empty grid.");
        return 0; // Return a default value or throw an error for invalid input
    }

    // Parse grid dimensions from the first line
    const dimensionTokens = rawInputLines[0].split(" ").map(Number);
    const gridRowCount = dimensionTokens[0];
    const gridColCount = dimensionTokens[1];

    // Validate parsed dimensions
    if (isNaN(gridRowCount) || isNaN(gridColCount) || gridRowCount <= 0 || gridColCount <= 0) {
        console.error(`Invalid grid dimensions: Rows=${gridRowCount}, Cols=${gridColCount}. Both must be positive integers.`);
        return 0;
    }

    // Extract the actual grid map, ignoring the dimension line
    // We slice from index 1 up to gridRowCount + 1 to ensure we get exactly the specified number of rows.
    const terrainLayout = rawInputLines.slice(1, gridRowCount + 1).map(line => line.split(''));

    // Further validate the structure of the terrain map
    if (terrainLayout.length !== gridRowCount) {
        console.warn(`Grid row count mismatch: Expected ${gridRowCount} rows, but found ${terrainLayout.length}.`);
        // Depending on requirements, one might throw an error or adjust gridRowCount here.
        // For robustness, we'll proceed with the parsed gridRowCount but note the discrepancy.
    }
    for (let r = 0; r < gridRowCount; r++) {
        if (!terrainLayout[r] || terrainLayout[r].length !== gridColCount) {
            console.error(`Row ${r} has incorrect column count: Expected ${gridColCount}, found ${terrainLayout[r] ? terrainLayout[r].length : 'undefined'}.`);
            return 0; // Abort if a row is malformed
        }
    }

    // --- Dynamic Programming Arrays Initialization ---
    // These arrays will store segment lengths for continuous '.' cells.
    // Each cell will store the length of the continuous segment of '.'s that it is part of,
    // calculated from different directions.

    // `hLeftSegments[r][c]` stores the length of the horizontal '.' segment ending at (r, c)
    // when scanning from left to right.
    let hLeftSegments = Array.from({ length: gridRowCount }, () => Array(gridColCount).fill(0));
    // `hRightSegments[r][c]` stores the length of the horizontal '.' segment starting at (r, c)
    // when scanning from right to left.
    let hRightSegments = Array.from({ length: gridRowCount }, () => Array(gridColCount).fill(0));
    // `vUpSegments[r][c]` stores the length of the vertical '.' segment ending at (r, c)
    // when scanning from top to bottom.
    let vUpSegments = Array.from({ length: gridRowCount }, () => Array(gridColCount).fill(0));
    // `vDownSegments[r][c]` stores the length of the vertical '.' segment starting at (r, c)
    // when scanning from bottom to top.
    let vDownSegments = Array.from({ length: gridRowCount }, () => Array(gridColCount).fill(0));


    // --- Calculate Horizontal Segment Lengths ---
    // Pass 1: Left-to-Right scan
    for (let r = 0; r < gridRowCount; r++) {
        for (let c = 0; c < gridColCount; c++) {
            if (terrainLayout[r][c] === '.') {
                // If current cell is '.', extend the segment from the left.
                // If it's the first column, segment length is 1.
                hLeftSegments[r][c] = (c > 0 ? hLeftSegments[r][c - 1] : 0) + 1;
            }
            // If it's '#', hLeftSegments[r][c] remains 0 (initial value).
        }
    }

    // Pass 2: Right-to-Left scan
    for (let r = 0; r < gridRowCount; r++) {
        for (let c = gridColCount - 1; c >= 0; c--) {
            if (terrainLayout[r][c] === '.') {
                // If current cell is '.', extend the segment from the right.
                // If it's the last column, segment length is 1.
                hRightSegments[r][c] = (c < gridColCount - 1 ? hRightSegments[r][c + 1] : 0) + 1;
            }
        }
    }

    // --- Calculate Vertical Segment Lengths ---
    // Pass 3: Top-to-Bottom scan
    for (let c = 0; c < gridColCount; c++) { // Iterate columns first for potential cache benefits
        for (let r = 0; r < gridRowCount; r++) {
            if (terrainLayout[r][c] === '.') {
                // If current cell is '.', extend the segment from above.
                // If it's the first row, segment length is 1.
                vUpSegments[r][c] = (r > 0 ? vUpSegments[r - 1][c] : 0) + 1;
            }
        }
    }

    // Pass 4: Bottom-to-Top scan
    for (let c = 0; c < gridColCount; c++) {
        for (let r = gridRowCount - 1; r >= 0; r--) {
            if (terrainLayout[r][c] === '.') {
                // If current cell is '.', extend the segment from below.
                // If it's the last row, segment length is 1.
                vDownSegments[r][c] = (r < gridRowCount - 1 ? vDownSegments[r + 1][c] : 0) + 1;
            }
        }
    }

    // --- Determine Maximum Possible Illumination ---
    let peakBrightness = 0;

    // Helper function for finding the maximum value (a minor utility addition)
    const updateMaximum = (currentMax, newValue) => Math.max(currentMax, newValue);

    for (let r = 0; r < gridRowCount; r++) {
        for (let c = 0; c < gridColCount; c++) {
            // A light can only be placed on an empty cell ('.')
            if (terrainLayout[r][c] === '.') {
                // The total horizontal length for cell (r, c) is the sum of L-R and R-L segments, minus 1
                // because the cell (r, c) itself is counted in both.
                const fullHorizontalExtent = hLeftSegments[r][c] + hRightSegments[r][c] - 1;
                // Similarly for the vertical extent.
                const fullVerticalExtent = vUpSegments[r][c] + vDownSegments[r][c] - 1;

                // The total illumination from placing a light at (r, c) is the sum of
                // horizontal and vertical extents, minus 1 (again for cell (r, c) itself).
                const currentCellIllumination = fullHorizontalExtent + fullVerticalExtent - 1;

                // Update the overall maximum brightness found so far
                peakBrightness = updateMaximum(peakBrightness, currentCellIllumination);
            }
        }
    }

    // Output the final computed maximum brightness
    console.log(peakBrightness.toString());
    return peakBrightness;
}

// Emulate standard input reading for competitive programming environments
(function processStdInput() {
    try {
        const fileSystem = require("fs");
        const standardInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        calculateMaxLightExposure(standardInputContent);
    } catch (ioError) {
        // Log an error if file system operations fail, e.g., in a browser or restricted environment
        console.error("Error reading from standard input:", ioError.message);
        // Optionally, provide a dummy input or exit if input is critical
    }
})();
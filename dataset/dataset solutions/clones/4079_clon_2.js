function ProcessInput(rawData) {
    // Split the raw input string into an array of lines.
    rawData = rawData.split('\n');

    // Parse the first line to get the total number of points and the grid size parameter.
    // The 'dimensions' array will hold [total_points, grid_size_K].
    let dimensions = rawData[0x0].split(' ').map(valStr => parseInt(valStr, 0b10));

    // Extract the grid size parameter (K) from the parsed dimensions.
    const gridSize = dimensions[0b1];
    // Extract the total number of points (N) from the parsed dimensions.
    let pointCount = dimensions[0x0];

    // Initialize arrays to store point coordinates and their assigned colors.
    // xCoords will initially hold string arrays, then parsed x-coordinates.
    let xCoords = [], yCoords = [], colors = [];

    // Loop through each point's data from the input, starting from the second line.
    for (let idx = 0x0; idx < pointCount; idx++) {
        // Split the current line into its components (x-coordinate, y-coordinate, color).
        let currentPointData = rawData[idx + 0x1].split(' ');

        // Parse the y-coordinate and apply a modulo operation with (K * 2).
        yCoords[idx] = parseInt(currentPointData[0b1], 0b10) % (gridSize * 0x2);
        // Determine the color: 0 for 'W' (white), 1 for 'B' (black).
        colors[idx] = (currentPointData[0x2] === 'W' ? 0x0 : 0b1);
        // Parse the x-coordinate and apply a modulo operation with (K * 2).
        xCoords[idx] = parseInt(currentPointData[0x0], 0b10) % (gridSize << 0b1);
    }

    // Initialize the variable to store the maximum number of points found.
    let maxPoints = 0x0;

    // Iterate through all possible horizontal shifts (from 0 to K-1).
    for (let shiftVal = 0x0; shiftVal < gridSize; shiftVal++) {
        let currentCount = 0x0; // Counter for points matching the current configuration.
        // Arrays to store counts of points based on their y-coordinate modulo (K*2)
        // and whether they match (typeOneCounts) or mismatch (typeTwoCounts) the current pattern.
        let typeOneCounts = new Array(gridSize * 0x2).fill(0x0);
        let typeTwoCounts = new Array(gridSize * 0x2).fill(0x0);

        // Iterate through all points to classify them for the current horizontal shift.
        for (let pointIdx = 0x0; pointIdx < pointCount; pointIdx++) {
            // The core logic: determines if a point's region type (based on shifted x and y)
            // matches its assigned color.
            // The expression `(A / K ^ B / K) & 1` checks the parity of the sum of
            // integer divisions by K, effectively determining the region's 'color'.
            if ((((xCoords[pointIdx] + shiftVal) / gridSize ^ yCoords[pointIdx] / gridSize) & 0b1) === colors[pointIdx]) {
                currentCount++;
                typeOneCounts[yCoords[pointIdx]]++;
            } else {
                typeTwoCounts[yCoords[pointIdx]]++;
            }
        }

        // Update maxPoints if the current configuration yields a higher count.
        if (maxPoints < currentCount) {
            maxPoints = currentCount;
        }
        // Also consider the complementary count (total points - currentCount),
        // which would be the count if all colors were flipped.
        if (maxPoints < pointCount - currentCount) {
            maxPoints = pointCount - currentCount;
        }

        // Now, iterate through possible vertical shifts (from 0 to K-2) to efficiently
        // update 'currentCount' for subsequent y-axis configurations.
        for (let yShiftIter = 0x0; yShiftIter < gridSize - 0b1; yShiftIter++) {
            // Adjust 'currentCount' based on points moving from 'typeOne' to 'typeTwo' or vice-versa
            // when the y-axis is effectively shifted by one unit (K).
            currentCount += typeTwoCounts[yShiftIter] - typeOneCounts[yShiftIter] +
                            typeTwoCounts[yShiftIter + gridSize] - typeOneCounts[yShiftIter + gridSize];

            // Update maxPoints again with the new 'currentCount'.
            if (maxPoints < currentCount) {
                maxPoints = currentCount;
            }
            // And its complement.
            if (maxPoints < pointCount - currentCount) {
                maxPoints = pointCount - currentCount;
            }
        }
    }

    // Output the final maximum number of points that can be covered.
    console.log(maxPoints);
}

// Read input from standard input using Node.js 'fs' module and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

(async () => {
    // A string variable to accumulate all incoming standard input data.
    let rawInputData = '';

    // Asynchronously iterate over chunks from standard input and append them.
    for await (const dataSegment of process.stdin) {
        rawInputData += dataSegment; // Concatenate the received data.
    }

    // Split the complete input string into an array of lines, using newline characters.
    const inputLines = rawInputData.split(/\n/);

    // Parse the first line to extract the grid dimensions (rows, columns) and the number of points.
    // The line is split by whitespace, and each resulting string is converted to a numeric type.
    const [rowDimension, colDimension, markerCount] = inputLines[0].split(/\s/).map(strValue => +strValue);

    // Process the subsequent lines to obtain the coordinates of each point.
    // It slices the array from the second line up to the line corresponding to the last marker.
    // Each line is then split by whitespace, and its components are converted to 0-indexed numbers.
    const pointLocations = inputLines.slice(1, markerCount + 1).map(currentInputLine =>
        currentInputLine.split(/\s/).map(strValue => strValue - 1)
    );

    // Initialize two arrays to store the frequency of points in each row and each column.
    // The first sub-array tracks row frequencies, the second tracks column frequencies.
    let pointFrequencies = [new Array(rowDimension).fill(0), new Array(colDimension).fill(0)];

    // Create a 2D boolean grid (map) to quickly check for the existence of a point at specific coordinates.
    // Initially, all cells are set to 'false', indicating no point is present.
    let pointExistenceMap = new Array(rowDimension).fill(null).map(() => new Array(colDimension).fill(false));

    // Iterate through each point's coordinates to update the frequency counts and the existence map.
    for (const currentPoint of pointLocations) {
        // Increment the frequency count for the point's row.
        pointFrequencies[0][currentPoint[0]]++;
        // Increment the frequency count for the point's column.
        pointFrequencies[1][currentPoint[1]]++;
        // Mark the point's exact location as 'true' in the existence map.
        pointExistenceMap[currentPoint[0]][currentPoint[1]] = true;
    }

    // Determine the maximum number of points found in any single row.
    // A shallow copy is made before sorting to avoid modifying the original frequency array.
    const topRowCounts = pointFrequencies[0].slice().sort((valA, valB) => valB - valA);

    // Determine the maximum number of points found in any single column.
    // A shallow copy is made before sorting to avoid modifying the original frequency array.
    const topColCounts = pointFrequencies[1].slice().sort((valA, valB) => valB - valA);

    // Collect all column indices that achieve the maximum column point count.
    let maxColPositions = [];
    // IMPORTANT: The original code uses 'h' (rowDimension) as the loop bound here,
    // even though it's iterating over 'targetCount[1]' (pointFrequencies[1]) which has 'w' (colDimension) elements.
    // This behavior is preserved as per Type II cloning rules, even if it might lead to out-of-bounds access
    // or incomplete iteration depending on 'h' and 'w' values.
    for (let loopIndex = 0; loopIndex < rowDimension; loopIndex++) {
        if (pointFrequencies[1][loopIndex] === topColCounts[0]) {
            maxColPositions.push(loopIndex);
        }
    }

    // A flag to indicate if there is at least one point that lies at the intersection
    // of a row with the maximum row count and a column with the maximum column count.
    // It starts as 1 (true) and changes to 0 (false) if no such intersection is found.
    let hasCommonIntersection = 1;

    // Iterate through each row to identify rows that have the maximum point count.
    // The loop continues only if 'hasCommonIntersection' is still 1.
    for (let rIdx = 0; rIdx < rowDimension && hasCommonIntersection; rIdx++) {
        if (pointFrequencies[0][rIdx] === topRowCounts[0]) {
            // If the current row has the maximum point count, check its intersections
            // with all columns that also have the maximum point count.
            for (let cIdx = 0; cIdx < maxColPositions.length; cIdx++) {
                // If there is NO point at the intersection of this max-count row
                // and one of the max-count columns...
                if (!pointExistenceMap[rIdx][maxColPositions[cIdx]]) {
                    // ...then no common intersection exists, so set the flag to 0.
                    hasCommonIntersection = 0;
                    break; // Exit the inner loop as the condition is met.
                }
            }
        }
    }

    // Output the final calculated value:
    // (Max points in a column) + (Max points in a row) - (1 if a common intersection exists, 0 otherwise).
    console.log(topColCounts[0] + topRowCounts[0] - hasCommonIntersection);
})();

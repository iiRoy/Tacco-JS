// Helper function to parse initial grid parameters from the first line of input
function parseGridParameters(firstLineContent) {
    const parameterParts = firstLineContent.split(" ");
    const parsedHeight = Number(parameterParts[0]);
    const parsedWidth = Number(parameterParts[1]);
    const parsedStep = Number(parameterParts[2]);
    return { gridHeight: parsedHeight, gridWidth: parsedWidth, moveStep: parsedStep };
}

// Helper function to build the coordinate mapping for all cell values
function buildCoordinateMap(allInputLines, heightValue) {
    const coordMap = [];
    // Iterate through grid rows, starting from line 1 (index 1)
    for (let r = 1; r <= heightValue; r++) {
        const currentGridRow = allInputLines[r].split(" ");
        // Iterate through columns in the current row
        for (let c = 0; c < currentGridRow.length; c++) {
            const cellNumericValue = Number(currentGridRow[c]);
            // Store coordinates (x: row index, y: column index + 1)
            coordMap[cellNumericValue] = { x: r, y: c + 1 };
        }
    }
    return coordMap;
}

// Helper function to parse query ranges (start and end points for exams)
function parseQueryRanges(allInputLines, heightValue, totalQueries) {
    const queryStartValues = [];
    const queryEndValues = [];
    // Queries start after the grid data and the line containing totalQueries count
    const queryDataStartIndex = heightValue + 2;
    for (let q = 0; q < totalQueries; q++) {
        const queryLineContent = allInputLines[queryDataStartIndex + q];
        const rangeParts = queryLineContent.split(" ");
        queryStartValues.push(Number(rangeParts[0]));
        queryEndValues.push(Number(rangeParts[1]));
    }
    return { starts: queryStartValues, ends: queryEndValues };
}

// Helper function to calculate Manhattan distance between two coordinate objects
function getManhattanDistance(coordA, coordB) {
    return Math.abs(coordB.x - coordA.x) + Math.abs(coordB.y - coordA.y);
}

// Main function to process the input data and calculate distances
function processInputData(rawData) {
    const inputLines = rawData.split("\n");

    // 1. Parse initial grid parameters using a helper function
    const { gridHeight, gridWidth, moveStep } = parseGridParameters(inputLines[0]);

    // 2. Build the coordinate map for all cell values using a helper function
    const coordinateMap = buildCoordinateMap(inputLines, gridHeight);

    // 3. Parse exam queries using a helper function
    const numberOfQueries = Number(inputLines[gridHeight + 1]);
    const { starts: startPoints, ends: endPoints } = parseQueryRanges(inputLines, gridHeight, numberOfQueries);

    const distanceCache = []; // Memoization table to store calculated distances
    const queryResults = [];  // Array to store the final results for each query

    // 4. Process each query to calculate the total distance
    for (let queryIdx = 0; queryIdx < startPoints.length; queryIdx++) {
        const currentQueryStart = startPoints[queryIdx];
        const currentQueryEnd = endPoints[queryIdx];

        // Initialize cache for the current start point if it doesn't exist
        if (!distanceCache[currentQueryStart]) {
            distanceCache[currentQueryStart] = [];
        }

        // Check if the result for this specific query (start to end) is already cached
        if (distanceCache[currentQueryStart][currentQueryEnd] !== undefined) {
            queryResults[queryIdx] = distanceCache[currentQueryStart][currentQueryEnd];
            continue; // Skip calculation and move to the next query
        }

        // Calculate the number of segments (steps) required for this query
        const totalSegments = (currentQueryEnd - currentQueryStart) / moveStep;
        let accumulatedDistanceForQuery = 0; // Accumulator for the current query's total distance

        // Iterate through each segment of the current query path
        for (let segmentIdx = 0; segmentIdx < totalSegments; segmentIdx++) {
            const segmentStartValue = currentQueryStart + segmentIdx * moveStep;
            const segmentEndValue = currentQueryStart + (segmentIdx + 1) * moveStep;

            // Retrieve coordinates for the start and end of the current segment
            const currentSegmentStartCoord = coordinateMap[segmentStartValue];
            const currentSegmentEndCoord = coordinateMap[segmentEndValue];

            // Calculate Manhattan distance for the current segment using a helper function
            const segmentDistance = getManhattanDistance(currentSegmentStartCoord, currentSegmentEndCoord);
            accumulatedDistanceForQuery += segmentDistance;

            // Cache the accumulated distance from currentQueryStart to segmentEndValue
            // This helps if a later query asks for a path that is a sub-path of this one
            if (distanceCache[currentQueryStart][segmentEndValue] === undefined) {
                distanceCache[currentQueryStart][segmentEndValue] = accumulatedDistanceForQuery;
            }
        }

        // Store the final calculated distance for the current query
        queryResults[queryIdx] = accumulatedDistanceForQuery;
        // Cache the final result for the current query (start to end)
        distanceCache[currentQueryStart][currentQueryEnd] = accumulatedDistanceForQuery;
    }

    // Output the results, each on a new line, as required
    console.log(queryResults.join("\n"));
}

// Standard input/output handling: reads from stdin and calls the main processing function
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

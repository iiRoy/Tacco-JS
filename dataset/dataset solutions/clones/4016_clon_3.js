function processPathCalculations(problemInput) {
    // This function is designed to parse problem input, establish a coordinate mapping,
    // and then compute cumulative path distances for a series of queries.
    // It employs memoization to optimize repeated path segment calculations.

    // First, split the entire input string into an array of individual lines.
    const inputLines = problemInput.split('\n');

    // --- Configuration Parsing from the First Line ---
    // The initial line provides global settings: grid dimensions and movement interval.
    const [mapHeightStr, mapWidthStr, movementIntervalStr] = inputLines[0].split(' ');

    // Convert string values to numbers.
    const gridRows = Number(mapHeightStr);
    const gridCols = Number(mapWidthStr); // 'gridCols' is parsed but not directly used in grid data processing.
    const jumpSize = Number(movementIntervalStr); // Defines the step size for path segments.

    // A check for invalid jump size; for competitive programming, assume valid input.
    if (jumpSize <= 0) {
        // console.error("Error: The movement interval (jumpSize) must be a positive integer.");
        // return []; // Or throw an error as appropriate.
    }

    // --- Grid Data Mapping ---
    // A Map is used to store the 1-based (row, column) coordinates for each unique numeric value
    // found within the grid. This allows for efficient lookup of a value's position.
    const valueCoordinatesMap = new Map();

    // Iterate through the lines representing the grid, starting from the second line (index 1).
    for (let rowIndex = 0; rowIndex < gridRows; ++rowIndex) {
        const currentGridLineValues = inputLines[rowIndex + 1].split(' ').map(Number); // Parse numbers from the line.

        // For each number in the current grid line, record its 1-based coordinates.
        for (let colIndex = 0; colIndex < currentGridLineValues.length; ++colIndex) {
            const cellNumericValue = currentGridLineValues[colIndex];
            // Store coordinates as an object { row: 1-indexed, col: 1-indexed }.
            valueCoordinatesMap.set(cellNumericValue, { row: rowIndex + 1, col: colIndex + 1 });
        }
    }

    // --- Path Query Parsing ---
    // The line immediately following the grid data indicates how many path queries follow.
    const queryCountLineNumber = gridRows + 1;
    const totalQueryCount = Number(inputLines[queryCountLineNumber]);

    // An array to hold structured objects for each query, containing start and end points.
    const pathQueries = [];
    // Populate the pathQueries array by parsing subsequent lines.
    for (let queryIdx = 0; queryIdx < totalQueryCount; ++queryIdx) {
        const currentQueryLineNumber = queryCountLineNumber + 1 + queryIdx;
        const [startValueStr, endValueStr] = inputLines[currentQueryLineNumber].split(' ');
        pathQueries.push({
            startValue: Number(startValueStr),
            endValue: Number(endValueStr)
        });
    }

    // --- Distance Calculation Helper Function ---
    // Calculates the Manhattan distance between two given coordinate objects.
    // Returns Infinity if either coordinate is missing from the map.
    const calculateManhattanDistance = (coordA, coordB) => {
        if (!coordA || !coordB) {
            // This scenario implies a value was queried that doesn't exist in the grid map.
            // Returning Infinity marks this path segment as unreachable or invalid.
            return Infinity;
        }
        return Math.abs(coordB.row - coordA.row) + Math.abs(coordB.col - coordA.col);
    };

    // --- Path Sum Memoization and Final Results Storage ---
    // This Map stores cumulative path distances to avoid recalculating segments.
    // Structure: Map<initialStartPoint, Map<intermediateOrFinalEndPoint, cumulativeDistance>>
    const cumulativeDistanceCache = new Map();
    // Array to hold the final calculated distance for each query.
    const queryResults = new Array(totalQueryCount).fill(0); // Initialize all results to zero.

    // --- Process Each Path Query ---
    for (let currentQueryIndex = 0; currentQueryIndex < totalQueryCount; ++currentQueryIndex) {
        const currentPathRequest = pathQueries[currentQueryIndex];
        const initialSegmentStart = currentPathRequest.startValue;
        const finalSegmentEnd = currentPathRequest.endValue;

        // Check if the entire path for this query has already been computed and cached.
        if (cumulativeDistanceCache.has(initialSegmentStart) && cumulativeDistanceCache.get(initialSegmentStart).has(finalSegmentEnd)) {
            queryResults[currentQueryIndex] = cumulativeDistanceCache.get(initialSegmentStart).get(finalSegmentEnd);
            continue; // Skip calculation, move to the next query.
        }

        // Initialize the cumulative distance for the current query.
        let accumulatedPathDistance = 0;

        // Ensure a nested Map exists for the current query's starting point in the cache.
        if (!cumulativeDistanceCache.has(initialSegmentStart)) {
            cumulativeDistanceCache.set(initialSegmentStart, new Map());
        }
        const currentQueryCache = cumulativeDistanceCache.get(initialSegmentStart);

        // Iterate through the path in segments defined by 'jumpSize'.
        // The loop continues as long as the current segment's start is before the final end point.
        // This implicitly handles scenarios where (finalSegmentEnd - initialSegmentStart) might not be a perfect multiple of jumpSize.
        for (let segmentCurrentValue = initialSegmentStart; segmentCurrentValue < finalSegmentEnd; segmentCurrentValue += jumpSize) {
            // Determine the actual end value for this segment. It's either segmentCurrentValue + jumpSize
            // or the finalSegmentEnd if the jump would overshoot it.
            const segmentNextValue = Math.min(segmentCurrentValue + jumpSize, finalSegmentEnd);

            // Retrieve coordinates for the start and end points of the current segment.
            const startCoord = valueCoordinatesMap.get(segmentCurrentValue);
            const endCoord = valueCoordinatesMap.get(segmentNextValue);

            // Add the Manhattan distance of this segment to the accumulated total.
            accumulatedPathDistance += calculateManhattanDistance(startCoord, endCoord);

            // Cache the cumulative distance from the initial start point up to segmentNextValue.
            // This allows future queries or segments starting from 'initialSegmentStart' and ending at 'segmentNextValue'
            // to retrieve this pre-calculated sum.
            currentQueryCache.set(segmentNextValue, accumulatedPathDistance);

            // If the segment's end value is the final destination for this query, we can stop.
            if (segmentNextValue === finalSegmentEnd) {
                break;
            }
        }
        // Store the final accumulated distance for the current query.
        queryResults[currentQueryIndex] = accumulatedPathDistance;

        // Also, explicitly cache the full path result for direct lookup for this specific query.
        currentQueryCache.set(finalSegmentEnd, accumulatedPathDistance);
    }

    // --- Output Generation ---
    // Join all computed distances with newline characters to produce the final output string.
    return queryResults.join('\n');
}

// --- Standard Input/Output Handling (Do Not Modify Below This Line) ---
// This part reads all standard input at once and passes it to the main processing function.
const fs = require('fs');
const inputBuffer = fs.readFileSync('/dev/stdin', 'utf8');
console.log(processPathCalculations(inputBuffer));
// This function processes the entire input data received from standard input.
function ProcessInput(rawData) {
    // Split the raw input string into an array of individual lines.
    const dataLines = rawData.split("\n");

    // Parse the first line to extract grid dimensions and the step value.
    const tempParts = dataLines[0].split(" ");
    const gridHeight = Number(tempParts[0]);
    const gridWidth = Number(tempParts[1]); // This variable is read but not utilized in subsequent logic.
    const jumpSize = Number(tempParts[2]);

    // Initialize an array to serve as a map, storing coordinates for each cell value.
    // The index of the array will correspond to the cell's numerical value.
    const coordinateMap = [];
    // Iterate through the lines representing the grid rows, starting from the second line (index 1).
    for (let rowIdx = 1; rowIdx < gridHeight + 1; rowIdx++) {
        const currentRow = dataLines[rowIdx].split(" ");

        // Iterate through each cell in the current row.
        for (let colIdx = 0; colIdx < currentRow.length; colIdx++) {
            const cellValue = Number(currentRow[colIdx]);
            // Store the 1-indexed row (coordX) and 1-indexed column (coordY) for the current cell value.
            coordinateMap[cellValue] = { "coordX": rowIdx, "coordY": colIdx + 1 };
        }
    }

    // Read the total number of distance calculation queries from the input.
    const queryCount = Number(dataLines[gridHeight + 1]);
    // Arrays to hold the starting and ending points for each query.
    const startPoints = [];
    const endPoints = [];
    // Populate the query arrays by parsing subsequent lines.
    for (let queryIdx = 1; queryIdx < queryCount + 1; queryIdx++) {
        const queryParts = dataLines[gridHeight + 1 + queryIdx].split(" ");
        startPoints.push(Number(queryParts[0]));
        endPoints.push(Number(queryParts[1]));
    }

    // Initialize a cache (memoization table) to store previously calculated segment distances.
    const distanceCache = [];
    // Initialize an array to store the final computed distances for each query.
    const resultsArray = [];

    // Process each distance query one by one.
    for (let currentQueryIndex = 0; currentQueryIndex < startPoints.length; currentQueryIndex++) {
        // Set the initial distance for the current query to zero.
        resultsArray[currentQueryIndex] = 0;

        // Check if the distance from the current query's start point to its end point is already in the cache.
        if (!distanceCache[startPoints[currentQueryIndex]]) {
            distanceCache[startPoints[currentQueryIndex]] = [];
        }
        if (distanceCache[startPoints[currentQueryIndex]][endPoints[currentQueryIndex]]) {
            // If found in cache, use the cached value and skip further calculation for this query.
            resultsArray[currentQueryIndex] = distanceCache[startPoints[currentQueryIndex]][endPoints[currentQueryIndex]];
            continue;
        }

        // Calculate the number of segments required to traverse from start to end with the given jump size.
        const segmentCount = (endPoints[currentQueryIndex] - startPoints[currentQueryIndex]) / jumpSize;
        // Iterate through each segment to accumulate the total Manhattan distance.
        for (let segmentIndex = 0; segmentIndex < segmentCount; segmentIndex++) {
            // Retrieve the coordinates for the beginning and end of the current segment.
            const segmentStartCoord = coordinateMap[startPoints[currentQueryIndex] + segmentIndex * jumpSize];
            const segmentEndCoord = coordinateMap[startPoints[currentQueryIndex] + (segmentIndex + 1) * jumpSize];

            // Add the Manhattan distance between the segment's start and end points to the total.
            resultsArray[currentQueryIndex] += Math.abs(segmentEndCoord.coordX - segmentStartCoord.coordX) + Math.abs(segmentEndCoord.coordY - segmentStartCoord.coordY);
            // Cache the cumulative distance from the initial query start point to the end of the current segment.
            distanceCache[startPoints[currentQueryIndex]][startPoints[currentQueryIndex] + (segmentIndex + 1) * jumpSize] = resultsArray[currentQueryIndex];
        }
    }

    // Output the calculated distances, with each result on a new line.
    console.log(resultsArray.join("\n"));
}

// The following line is responsible for reading input from standard input and invoking the main processing function.
// It should not be altered as it handles the environment-specific input mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

// This function processes raw input data to compute specific path distances based on a grid and queries.
function CalculatePaths(sourceContent) {
    // First, divide the entire input into an array of strings, one for each line.
    const dataRows = sourceContent.split("\n");

    // Extract the grid's dimensions and the movement step size from the very first line of input.
    let gridDimensions = dataRows[0].split(" ");
    const numRows = +gridDimensions[0]; // Convert the string representation of rows to an integer.
    const numCols = +gridDimensions[1]; // Convert the string representation of columns to an integer.
    const jumpSize = +gridDimensions[2]; // Convert the string representation of step to an integer.

    // Initialize an array that will serve as a registry to quickly find the coordinates (row, column) for any given number from the grid.
    let locationRegistry = [];

    // Iterate through each row of the grid, starting from the second input line (index 1).
    for (let rowIndex = 1; rowIndex < numRows + 1; rowIndex++) {
        // Split the current grid row string into an array of individual number strings.
        const lineElements = dataRows[rowIndex].split(" ");

        // Now, iterate through each number within the current row.
        for (let colIndex = 0; colIndex < lineElements.length; colIndex++) {
            // Convert the string representation of the grid number to an actual number.
            const gridNumber = +lineElements[colIndex];
            // Store the coordinates (row position, column position) for this grid number in the registry.
            // Note: colIndex + 1 is used to match 1-based indexing if that's what the problem implies for y-coordinates.
            locationRegistry[gridNumber] = { "rowPos": rowIndex, "colPos": colIndex + 1 };
        }
    }

    // Read the total count of pathfinding queries from the line immediately following the grid data.
    const totalRequests = +dataRows[numRows + 1];

    // Prepare two arrays to store the starting and ending numbers for each query.
    let originValues = [];
    let destinationValues = [];

    // Parse each subsequent line, which contains a query pair (start number, end number).
    for (let queryIndex = 1; queryIndex < totalRequests + 1; queryIndex++) {
        // Split the current query line into its two number components.
        let queryPair = dataRows[numRows + 1 + queryIndex].split(" ");
        originValues.push(+queryPair[0]);      // Add the starting point of the current query.
        destinationValues.push(+queryPair[1]); // Add the ending point of the current query.
    }

    // Initialize a 2D array to act as a memoization cache for storing already calculated distances between points.
    let distanceCache = [];
    // Initialize an array to hold the final computed distances for all the pathfinding queries.
    let resultArray = [];

    // Begin processing each individual pathfinding query.
    for (let currentQueryIdx = 0; currentQueryIdx < originValues.length; currentQueryIdx++) {
        resultArray[currentQueryIdx] = 0; // Set the initial accumulated distance for the current query to zero.

        // Ensure that the memoization cache has an entry (an inner array) for the current query's starting point.
        if (!distanceCache[originValues[currentQueryIdx]]) {
            distanceCache[originValues[currentQueryIdx]] = [];
        }

        // Check if the total distance for this specific query (from origin to destination) has already been computed and cached.
        if (distanceCache[originValues[currentQueryIdx]][destinationValues[currentQueryIdx]]) {
            resultArray[currentQueryIdx] = distanceCache[originValues[currentQueryIdx]][destinationValues[currentQueryIdx]]; // Retrieve the cached value.
            continue; // Skip further calculation for this query and move to the next.
        }

        // Calculate the number of intermediate segments (jumps) required to travel from the origin to the destination.
        const numSegments = (destinationValues[currentQueryIdx] - originValues[currentQueryIdx]) / jumpSize;

        // Iterate through each segment of the path for the current query.
        for (let segmentIdx = 0; segmentIdx < numSegments; segmentIdx++) {
            // Retrieve the grid coordinates for the beginning of the current segment.
            const originCoords = locationRegistry[originValues[currentQueryIdx] + segmentIdx * jumpSize];
            // Retrieve the grid coordinates for the end of the current segment.
            const targetCoords = locationRegistry[originValues[currentQueryIdx] + (segmentIdx + 1) * jumpSize];

            // Calculate the Manhattan distance between the segment's start and end points and add it to the total for the current query.
            resultArray[currentQueryIdx] += Math.abs(targetCoords.rowPos - originCoords.rowPos) + Math.abs(targetCoords.colPos - originCoords.colPos);

            // Store the cumulative distance calculated so far (from the query's origin up to the end of the current segment) in the memoization cache.
            distanceCache[originValues[currentQueryIdx]][originValues[currentQueryIdx] + (segmentIdx + 1) * jumpSize] = resultArray[currentQueryIdx];
        }
    }

    // Finally, print all the calculated distances, each on a new line, to standard output.
    console.log(resultArray.join("\n"));
}

// The following code block is responsible for handling standard input/output and should not be altered.
CalculatePaths(require("fs").readFileSync("/dev/stdin", "utf8"));
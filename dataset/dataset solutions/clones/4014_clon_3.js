// This function processes the received input data to compute specific path distances based on a grid and movement rules.
function ExecuteChallengeSolution(problemInput) {
    /**
     * Calculates the Manhattan distance between two 2D points.
     * Points are expected as arrays: [x, y].
     * @param {number[]} coordsA - The coordinates of the first point.
     * @param {number[]} coordsB - The coordinates of the second point.
     * @returns {number} The Manhattan distance.
     */
    const computeManhattanDistance = (coordsA, coordsB) => {
        // Basic validation for coordinate format.
        if (!Array.isArray(coordsA) || coordsA.length !== 2 ||
            !Array.isArray(coordsB) || coordsB.length !== 2) {
            // In a production environment, this might throw an error or log more verbosely.
            // For competitive programming, assume valid input format for coordinates.
            return 0;
        }
        return Math.abs(coordsB[0] - coordsA[0]) + Math.abs(coordsB[1] - coordsA[1]);
    };

    // Split the entire input payload into individual lines for easier processing.
    const inputLines = problemInput.split("\n");

    // Guard clause: Ensure there's at least enough input for dimensions.
    if (inputLines.length < 1 || inputLines[0].trim() === "") {
        console.error("Input data is empty or malformed at the start.");
        return ""; // Return empty string for invalid input.
    }

    // Parse the first line to extract grid dimensions and the step value for path calculations.
    const gridDimensionsStr = inputLines[0].split(" ");
    if (gridDimensionsStr.length < 3) {
        console.error("Dimension line is incomplete. Expected 3 values.");
        return "";
    }

    const rowCount = parseInt(gridDimensionsStr[0], 10);
    const colCount = parseInt(gridDimensionsStr[1], 10); // Note: colCount is parsed but not directly used in the original problem's logic for grid iteration.
    const movementStride = parseInt(gridDimensionsStr[2], 10);

    // Further validation for parsed numerical values.
    if (isNaN(rowCount) || isNaN(colCount) || isNaN(movementStride) || rowCount <= 0 || movementStride <= 0) {
        console.error("Invalid numerical values for grid dimensions or movement stride.");
        return "";
    }

    // A Map data structure is used to store the 1-based [row, column] coordinates for each unique number found in the grid.
    // This provides efficient lookup by value.
    const numberToCoordinatesMap = new Map();

    // Iterate through the grid rows (starting from line 1 of input) to populate the coordinate map.
    // The loop runs for 'rowCount' number of rows.
    for (let rowIndex = 0; rowIndex < rowCount; ++rowIndex) {
        const currentLineIndex = rowIndex + 1; // Adjust for 0-based array access vs. 1-based line numbering in problem description.
        if (currentLineIndex >= inputLines.length) {
            console.error(`Missing grid row data at input line ${currentLineIndex + 1}.`);
            break; // Stop processing grid if input is truncated.
        }
        const currentLineSegments = inputLines[currentLineIndex].split(" ");

        // Process each number within the current row.
        for (let colIndex = 0; colIndex < currentLineSegments.length; ++colIndex) {
            const currentGridValue = parseInt(currentLineSegments[colIndex], 10);

            // Skip if the parsed value is not a valid number.
            if (isNaN(currentGridValue)) {
                console.warn(`Non-numeric value found in grid at row ${rowIndex + 1}, col ${colIndex + 1}. Skipping.`);
                continue;
            }
            // Store coordinates. The problem uses 1-based indexing for both x (row) and y (column).
            numberToCoordinatesMap.set(currentGridValue, [rowIndex + 1, colIndex + 1]);
        }
    }

    // Determine the input line where the number of queries is specified.
    const queryCountLineIndex = rowCount + 1;
    if (queryCountLineIndex >= inputLines.length) {
        console.error("Missing line specifying the number of queries.");
        return "";
    }

    // Parse the total number of path queries.
    const numberOfQueries = parseInt(inputLines[queryCountLineIndex], 10);
    if (isNaN(numberOfQueries) || numberOfQueries < 0) {
        console.error("Invalid number of queries specified.");
        return "";
    }

    // Arrays to store the starting and ending numbers for each path query.
    const pathStartNumbers = [];
    const pathEndNumbers = [];

    // Populate the query arrays by parsing subsequent lines.
    // Query data starts immediately after the query count line.
    for (let queryIdx = 0; queryIdx < numberOfQueries; ++queryIdx) {
        const currentQueryLineIndex = queryCountLineIndex + 1 + queryIdx;
        if (currentQueryLineIndex >= inputLines.length) {
            console.error(`Missing query data at input line ${currentQueryLineIndex + 1}.`);
            break;
        }
        const querySegmentStr = inputLines[currentQueryLineIndex].split(" ");
        if (querySegmentStr.length < 2) {
            console.warn(`Malformed query line at line ${currentQueryLineIndex + 1}. Skipping this query.`);
            continue;
        }

        const startVal = parseInt(querySegmentStr[0], 10);
        const endVal = parseInt(querySegmentStr[1], 10);

        if (isNaN(startVal) || isNaN(endVal)) {
            console.warn(`Invalid numbers in query at line ${currentQueryLineIndex + 1}. Skipping this query.`);
            continue;
        }

        pathStartNumbers.push(startVal);
        pathEndNumbers.push(endVal);
    }

    // Array to accumulate the total Manhattan distance for each query.
    const computedDistances = [];

    // Process each path query to calculate the total accumulated Manhattan distance.
    for (let queryIteration = 0; queryIteration < pathStartNumbers.length; ++queryIteration) {
        let currentQueryAccumulatedDistance = 0;
        const currentPathStart = pathStartNumbers[queryIteration];
        const currentPathEnd = pathEndNumbers[queryIteration];

        // Iterate through the path segments according to the movement stride.
        // currentSegmentStart will represent the 'from' point of each segment.
        // The loop continues as long as the next point in the stride does not exceed the path end.
        for (let currentSegmentStart = currentPathStart; currentSegmentStart < currentPathEnd; currentSegmentStart += movementStride) {
            const nextSegmentPoint = currentSegmentStart + movementStride;

            // This check ensures that we don't process segments that go beyond the target 'currentPathEnd'.
            // Based on the problem's nature, (currentPathEnd - currentPathStart) is expected to be a multiple of movementStride.
            if (nextSegmentPoint > currentPathEnd) {
                // If the stride overshoots, it implies malformed query or stride.
                // In this context, we skip the invalid segment.
                console.warn(`Stride ${movementStride} from ${currentSegmentStart} overshoots end ${currentPathEnd}. Skipping final segment.`);
                continue;
            }

            // Retrieve coordinates for both the start and end points of the current segment.
            const coordsFirstPoint = numberToCoordinatesMap.get(currentSegmentStart);
            const coordsSecondPoint = numberToCoordinatesMap.get(nextSegmentPoint);

            // Validate that both points exist in the coordinate map.
            if (!coordsFirstPoint || !coordsSecondPoint) {
                console.warn(`Coordinates not found for path segment: ${currentSegmentStart} to ${nextSegmentPoint}. Skipping segment.`);
                continue; // Skip this segment if coordinates are missing.
            }

            // Add the Manhattan distance for this segment to the query's total.
            currentQueryAccumulatedDistance += computeManhattanDistance(coordsFirstPoint, coordsSecondPoint);
        }
        computedDistances.push(currentQueryAccumulatedDistance);
    }

    // Return the results, with each computed distance on a new line.
    return computedDistances.join("\n");
}

// The following section handles standard input/output and should not be modified for the problem itself.
ExecuteChallengeSolution(require("fs").readFileSync("/dev/stdin", "utf8"));
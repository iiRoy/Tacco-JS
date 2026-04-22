const analyzeProximity = (rawDataPayload) => {
    // This routine is designed to evaluate a set of 2D coordinates
    // against a specified maximum distance from the origin (0,0).
    // It counts how many points fall within or exactly on this circular boundary.

    // Define constants for input parsing and geometric calculations to improve readability.
    const LINE_DELIMITER = "\n";
    const COORDINATE_DELIMITER = " ";
    const DEFAULT_NUMERIC_VALUE = 0; // Fallback for invalid number parsing.

    // A utility function to convert a string to a number, handling potential NaN results.
    const coerceToNumber = (valueString) => {
        const parsedNumber = Number(valueString);
        return isNaN(parsedNumber) ? DEFAULT_NUMERIC_VALUE : parsedNumber;
    };

    // Split the entire input string into an array of individual data lines.
    let dataLinesArray = rawDataPayload.split(LINE_DELIMITER);

    // Implement an early exit if there's no input data at all.
    if (dataLinesArray.length === 0) {
        console.log(0);
        return;
    }

    // The first line contains the boundary radius information.
    // It's expected to be in the format "N D", where D is our radius.
    const boundaryLineTokens = dataLinesArray[0].split(COORDINATE_DELIMITER);

    // Validate the format of the first line.
    if (boundaryLineTokens.length < 2) {
        // If the radius cannot be determined, no points can be counted.
        console.log(0);
        return;
    }

    // Extract and parse the maximum allowed radius from the first line.
    const maximumAllowedDistance = coerceToNumber(boundaryLineTokens[1]);

    // Pre-calculate the square of the maximum allowed distance.
    // This avoids redundant power calculations inside the main processing loop.
    const maximumDistanceSquared = Math.pow(maximumAllowedDistance, 2);

    let pointsWithinBoundaryCount = 0; // Initialize our accumulator for qualifying points.

    // Iterate through the rest of the lines, starting from the second line (index 1).
    // Each subsequent line is expected to represent a point (x, y).
    for (let currentDatumIndex = 1; currentDatumIndex < dataLinesArray.length; currentDatumIndex++) {
        const currentDataRow = dataLinesArray[currentDatumIndex];

        // Skip any empty or whitespace-only lines to prevent parsing errors.
        if (!currentDataRow || currentDataRow.trim() === "") {
            continue;
        }

        const pointValueTokens = currentDataRow.split(COORDINATE_DELIMITER);

        // Ensure that we have at least two components (x and y) for a valid point.
        if (pointValueTokens.length < 2) {
            continue; // Move to the next line if this one is malformed.
        }

        // Parse the x and y coordinates using our robust number coercion utility.
        const xCoordinateValue = coerceToNumber(pointValueTokens[0]);
        const yCoordinateValue = coerceToNumber(pointValueTokens[1]);

        // Calculate the squared Euclidean distance of the current point from the origin (0,0).
        // Distance^2 = (x - 0)^2 + (y - 0)^2 = x^2 + y^2.
        const distanceFromOriginSquared = Math.pow(xCoordinateValue, 2) + Math.pow(yCoordinateValue, 2);

        // Compare the squared distance to the pre-calculated squared maximum radius.
        // Using squared values avoids costly square root operations.
        if (distanceFromOriginSquared <= maximumDistanceSquared) {
            pointsWithinBoundaryCount++; // Increment the counter if the point is within bounds.
        }
    }

    // Output the final tally of points that satisfy the distance criterion.
    console.log(pointsWithinBoundaryCount);
};

// --- Standard Input Handling ---
// This following block is standard boilerplate for reading input in a typical
// competitive programming environment. It ensures that the entire input from
// stdin is read and passed to our primary processing function.
// It is generally not modified to maintain compatibility with the execution system.
analyzeProximity(require("fs").readFileSync("/dev/stdin", "utf8"));
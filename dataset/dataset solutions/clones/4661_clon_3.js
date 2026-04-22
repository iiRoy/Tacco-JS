// This module processes a specific type of spatial data to determine proximities.
// It identifies the closest "target location" for each "source point" based on Manhattan distance.

/**
 * Processes a raw string of input data, parses it, and outputs the 1-based index
 * of the closest target location for each source point.
 *
 * @param {string} rawData - The entire input as a single string, typically read from stdin.
 */
function ProcessInputData(rawData) {
    // Implement a basic check for input validity.
    // If the input is empty or not a string, we cannot proceed.
    if (typeof rawData !== 'string' || rawData.trim() === '') {
        // In a production environment, this might throw an error or log a warning.
        // For competitive programming, input format is usually guaranteed.
        console.error("Error: No valid input data provided.");
        return;
    }

    /**
     * Helper function to parse a string containing two space-separated numbers
     * into a point object with 'x' and 'y' coordinates.
     *
     * @param {string} coordString - A string like "10 20".
     * @returns {{x: number, y: number}} A point object.
     * @throws {Error} If parsing fails or the format is incorrect.
     */
    const parsePointCoordinates = (coordString) => {
        const numericParts = coordString.split(' ').map(Number);
        // Ensure exactly two valid numbers were parsed.
        if (numericParts.length !== 2 || isNaN(numericParts[0]) || isNaN(numericParts[1])) {
            throw new Error(`Failed to parse coordinates from "${coordString}". Expected two numbers.`);
        }
        return { x: numericParts[0], y: numericParts[1] };
    };

    /**
     * Calculates the Manhattan (L1) distance between two given point objects.
     *
     * @param {{x: number, y: number}} pointOne - The first point.
     * @param {{x: number, y: number}} pointTwo - The second point.
     * @returns {number} The Manhattan distance.
     */
    const computeManhattanDistance = (pointOne, pointTwo) => {
        return Math.abs(pointOne.x - pointTwo.x) + Math.abs(pointOne.y - pointTwo.y);
    };

    // Divide the entire input string into an array where each element is a line.
    const allInputLines = rawData.split('\n');

    // The very first line specifies the counts of source points (N) and target locations (M).
    const dimensionLineTokens = allInputLines[0].split(' ').map(Number);

    // Validate the dimension line to ensure we have two numbers.
    if (dimensionLineTokens.length < 2 || isNaN(dimensionLineTokens[0]) || isNaN(dimensionLineTokens[1])) {
        throw new Error("Invalid format for dimension line. Expected 'N M'.");
    }

    const numSourcePoints = dimensionLineTokens[0]; // Represents 'N' from the problem statement.
    const numTargetLocations = dimensionLineTokens[1]; // Represents 'M' from the problem statement.

    // Arrays to hold our parsed point data. Using 0-based indexing internally.
    const sourcePointsCollection = [];
    const targetLocationsCollection = [];

    // Parse all source points. These are lines 1 through N (0-based: lines[1] to lines[N]).
    for (let sourcePointIndex = 0; sourcePointIndex < numSourcePoints; sourcePointIndex++) {
        // The line index in `allInputLines` is 1 + `sourcePointIndex` because the first line (index 0) is N,M.
        const currentSourceLine = allInputLines[1 + sourcePointIndex];
        sourcePointsCollection.push(parsePointCoordinates(currentSourceLine));
    }

    // Parse all target locations. These are lines (N+1) through (N+M) (0-based: lines[N+1] to lines[N+M]).
    for (let targetLocationIndex = 0; targetLocationIndex < numTargetLocations; targetLocationIndex++) {
        // The starting line for target locations is 1 + `numSourcePoints`.
        const currentTargetLine = allInputLines[1 + numSourcePoints + targetLocationIndex];
        targetLocationsCollection.push(parsePointCoordinates(currentTargetLine));
    }

    // Now, for each source point, find the closest target location.
    for (let sIdx = 0; sIdx < numSourcePoints; sIdx++) {
        const currentSourcePoint = sourcePointsCollection[sIdx];

        // Initialize tracking variables for the closest location found so far for this source point.
        let minManhattanDistance = Infinity; // Start with an effectively infinite distance.
        let closestLocationOutputIndex = -1; // Will store the 1-based index of the closest target location.

        // Compare the current source point against every target location.
        for (let tIdx = 0; tIdx < numTargetLocations; tIdx++) {
            const currentTargetLocation = targetLocationsCollection[tIdx];

            // Calculate the distance.
            const distanceToTarget = computeManhattanDistance(currentSourcePoint, currentTargetLocation);

            // If this target location is closer than any found previously, update our records.
            if (distanceToTarget < minManhattanDistance) {
                minManhattanDistance = distanceToTarget;
                // The problem requires 1-based indexing for the output.
                closestLocationOutputIndex = tIdx + 1;
            }
        }
        // Output the 1-based index of the closest target for the current source point.
        console.log(closestLocationOutputIndex);
    }
}

// This standard competitive programming boilerplate reads all input from stdin
// and passes it to the main processing function.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
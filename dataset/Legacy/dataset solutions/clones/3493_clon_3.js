function findCenterAndHeight(rawData) {
    const NEWLINE_SEPARATOR = "\n";
    const MAX_COORDINATE_VALUE = 100; // Defines the upper limit for X and Y coordinates
    const inputLines = rawData.split(NEWLINE_SEPARATOR);

    // Iterate through all possible center coordinates within the defined range
    for (let currentX = 0; currentX <= MAX_COORDINATE_VALUE; currentX++) {
        for (let currentY = 0; currentY <= MAX_COORDINATE_VALUE; currentY++) {
            // Attempt to determine a consistent height for the current (currentX, currentY)
            const determinedHeight = verifyCenterConsistency(inputLines, currentX, currentY);

            // If a valid (non-zero and non-false) height is found, return the formatted result
            // The original code treats 0 as falsy, so we must replicate that behavior.
            if (determinedHeight) {
                return `${currentX} ${currentY} ${determinedHeight}`;
            }
        }
    }
    // This part of the code should ideally not be reached if a solution always exists
    // within the 0-100 range for X and Y, as per typical competitive programming problems.
}

// Helper function to parse a single line of coordinate and height data
function parsePointDataLine(lineString) {
    const SPACE_SEPARATOR = " ";
    const parts = lineString.split(SPACE_SEPARATOR);
    return {
        xCoord: Number(parts[0]),
        yCoord: Number(parts[1]),
        heightValue: Number(parts[2])
    };
}

// Verifies if a given (candidateX, candidateY) can be a valid center
// and returns the consistent height H, or false if inconsistent.
function verifyCenterConsistency(dataLines, candidateX, candidateY) {
    const numberOfDataPoints = Number(dataLines[0]);
    let consistentCentralHeight = 0; // Stores the calculated H, initialized to 0

    // Store Math.abs in a local constant for potential minor optimization and clarity
    const getAbsoluteDifference = Math.abs;

    // Process each data point from the input
    for (let pointIndex = 1; pointIndex <= numberOfDataPoints; pointIndex++) {
        const currentPoint = parsePointDataLine(dataLines[pointIndex]);
        const { xCoord: pointX, yCoord: pointY, heightValue: pointH } = currentPoint;

        // Only points with a non-zero height contribute to determining the central height H
        if (pointH !== 0) {
            // Calculate the expected central height based on the current point
            const calculatedHeightFromPoint = pointH + getAbsoluteDifference(candidateX - pointX) + getAbsoluteDifference(candidateY - pointY);

            // If this is the first non-zero height point encountered, set H
            if (consistentCentralHeight === 0) {
                consistentCentralHeight = calculatedHeightFromPoint;
            } else {
                // If H was already determined, check for consistency with previous points
                if (consistentCentralHeight !== calculatedHeightFromPoint) {
                    return false; // Inconsistent, this (candidateX, candidateY) is not valid
                }
            }
        }
    }
    // If all non-zero height points are consistent, return the determined central height.
    // If no non-zero height points were found, consistentCentralHeight remains 0, which is returned.
    return consistentCentralHeight;
}

// Standard input/output mechanism, kept identical to the original
console.log(findCenterAndHeight(require("fs").readFileSync("/dev/stdin", "utf8")));

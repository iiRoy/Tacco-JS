// This function analyzes geographical coordinate data to determine
// if a peaceful zone can be established between two warring factions.
// The input is a multi-line string containing various coordinate values.
function ExecuteWorldConflictAnalysis(sourceDataContent) {
    // Step 1: Parse the raw input string into manageable data structures.
    // It's assumed the input format is consistent with problem specifications
    // and contains at least three lines of data.
    const dataLines = sourceDataContent.trim().split("\n");

    // Extracting global parameters and individual coordinate lists.
    // The first line provides overall world boundaries and counts (n, m, x, y).
    // The second and third lines list specific X and Y coordinates.
    const boundaryInfoStrings = dataLines[0].split(" ");
    const xCoordStrings = dataLines[1].split(" ");
    const yCoordStrings = dataLines[2].split(" ");

    // Helper function to robustly convert an array of string numbers to actual numbers.
    // Using `Number()` is generally preferred over `parseInt()` for consistent numeric conversion.
    const parseStringArrayToNumbers = (strArray) => strArray.map(value => Number(value.trim()));

    // Extracting the critical global X lower bound and Y upper bound from the first line.
    // These act as initial constraints for the respective coordinate sets.
    const worldXLowerBound = Number(boundaryInfoStrings[2]); // Represents initial 'x'
    const worldYUpperBound = Number(boundaryInfoStrings[3]); // Represents initial 'y'

    // Early conflict detection: If the global lower X bound is already
    // at or above the global upper Y bound, a peaceful zone is impossible from the start.
    // This condition means the two main territories are already overlapping or touching.
    if (worldXLowerBound >= worldYUpperBound) {
        console.log('War');
        return; // Exit early as conflict is inevitable.
    }

    // Convert the string arrays of specific X and Y coordinates into numerical arrays.
    const specificXCoordinates = parseStringArrayToNumbers(xCoordStrings);
    const specificYCoordinates = parseStringArrayToNumbers(yCoordStrings);

    // Calculate the highest X-coordinate that needs to be cleared for a peaceful zone.
    // This includes the global lower bound (worldXLowerBound) and all specific X-points.
    // We use `reduce` for a functional and efficient way to find the maximum value.
    const highestRequiredX = specificXCoordinates.reduce(
        (currentMax, xVal) => Math.max(currentMax, xVal),
        worldXLowerBound
    );

    // Calculate the lowest Y-coordinate that defines the upper limit of a potential peaceful zone.
    // This includes the global upper bound (worldYUpperBound) and all specific Y-points.
    // `reduce` is again used to find the minimum value efficiently.
    const lowestAllowedY = specificYCoordinates.reduce(
        (currentMin, yVal) => Math.min(currentMin, yVal),
        worldYUpperBound
    );

    // Final determination of peace or conflict.
    // A peaceful zone can exist if and only if the highest X-coordinate
    // is strictly less than the lowest Y-coordinate.
    // This implies there is a gap (a coordinate Z) such that highestRequiredX < Z <= lowestAllowedY.
    if (highestRequiredX < lowestAllowedY) {
        console.log('No War'); // Peace is possible, a zone exists.
    } else {
        console.log('War'); // No overlapping peaceful zone exists, leading to conflict.
    }
}

// Standard boilerplate for competitive programming environments.
// This part should not be modified as per the original instructions.
ExecuteWorldConflictAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));
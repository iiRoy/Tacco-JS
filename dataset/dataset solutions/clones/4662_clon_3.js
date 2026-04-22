/**
 * A script designed to process geographical or spatial data, determining the closest target location
 * for a set of source entities based on Manhattan distance.
 *
 * This utility reads input from standard input (e.g., a file redirected to stdin),
 * parses entity and location coordinates, performs the necessary distance calculations,
 * and finally prints the 1-based index of the nearest location for each entity to standard output.
 */

/**
 * Entry point function that orchestrates the entire data processing workflow.
 * It takes raw string input, parses it into structured data, computes proximity,
 * and generates the final output.
 *
 * @param {string} rawInputText - The complete raw string content read from the input source.
 */
const processSpatialData = (rawInputText) => {
    // Constants for parsing and data handling.
    const COORDINATE_SEPARATOR = ' ';
    const DECIMAL_RADIX = 10;
    const MISSING_TARGET_SENTINEL = -1; // Value to indicate no target was found (e.g., if target list is empty).

    // Step 1: Initial Input Cleaning and Line Segmentation.
    // Trim any leading/trailing whitespace from the input and split it into an array of lines.
    const inputContentLines = rawInputText.trim().split('\n');

    // --- Input Validation: Basic structural checks ---
    if (inputContentLines.length === 0) {
        console.error("Error: The provided input data is empty.");
        return; // Exit if no data to process.
    }

    // Step 2: Parse Global Counts (Number of Entities and Locations).
    const headerLineParts = inputContentLines[0].split(COORDINATE_SEPARATOR);

    // Ensure the header line has enough parts for N and M.
    if (headerLineParts.length < 2) {
        console.error("Error: First line of input is malformed; expected two numbers (N M).");
        return;
    }

    // Convert string parts to integers, specifying the radix for robustness.
    const numberOfSourceEntities = Number.parseInt(headerLineParts[0], DECIMAL_RADIX);
    const numberOfTargetLocations = Number.parseInt(headerLineParts[1], DECIMAL_RADIX);

    // --- Input Validation: Numeric checks for counts ---
    if (isNaN(numberOfSourceEntities) || isNaN(numberOfTargetLocations) || numberOfSourceEntities < 0 || numberOfTargetLocations < 0) {
        console.error("Error: Invalid numeric counts for entities or locations in the header line.");
        return;
    }

    // --- Input Validation: Check for sufficient data lines ---
    const expectedTotalLines = 1 + numberOfSourceEntities + numberOfTargetLocations;
    if (inputContentLines.length < expectedTotalLines) {
        console.error(`Error: Insufficient input lines provided. Expected ${expectedTotalLines}, got ${inputContentLines.length}.`);
        return;
    }


    /**
     * Utility function to parse a string representation of coordinates into a structured object.
     * Example: "10 20" becomes { x: 10, y: 20 }.
     * Includes fallback to 0 if parsing results in NaN.
     * @param {string} coordinateString - A string containing two space-separated numeric coordinates.
     * @returns {{x: number, y: number}} An object representing the coordinates.
     */
    const parsePointCoordinates = (coordinateString) => {
        const parts = coordinateString.split(COORDINATE_SEPARATOR);
        // Using `|| 0` to provide a default value if `parseInt` returns NaN.
        const xCoordinate = Number.parseInt(parts[0], DECIMAL_RADIX) || 0;
        const yCoordinate = Number.parseInt(parts[1], DECIMAL_RADIX) || 0;
        return {
            x: xCoordinate,
            y: yCoordinate
        };
    };

    // Step 3: Extract and Parse Source Entities and Target Locations.
    // Slice the input lines to get the specific sections for entities and locations.
    const rawSourceEntityLines = inputContentLines.slice(1, numberOfSourceEntities + 1);
    const parsedSourceEntities = rawSourceEntityLines.map(parsePointCoordinates);

    const rawTargetLocationLines = inputContentLines.slice(numberOfSourceEntities + 1, numberOfSourceEntities + numberOfTargetLocations + 1);
    const parsedTargetLocations = rawTargetLocationLines.map(parsePointCoordinates);


    // --- Core Logic: Distance Calculation and Nearest Neighbor Search ---

    /**
     * Calculates the Manhattan distance (L1 norm) between two given 2D points.
     * The Manhattan distance is the sum of the absolute differences of their coordinates.
     * @param {{x: number, y: number}} pointA - The first coordinate point.
     * @param {{x: number, y: number}} pointB - The second coordinate point.
     * @returns {number} The calculated Manhattan distance.
     */
    const calculateL1Distance = (pointA, pointB) => {
        return Math.abs(pointA.x - pointB.x) + Math.abs(pointA.y - pointB.y);
    };

    // This array will store the 0-based index of the closest target location for each source entity.
    const assignedClosestLocationIndices = [];

    // Iterate over each source entity to determine its nearest target location.
    // Using `entries()` allows simultaneous access to both the index and the object.
    for (const [entityIndex, currentEntity] of parsedSourceEntities.entries()) {
        // Guard clause: Handle cases where there are no target locations to compare against.
        if (numberOfTargetLocations === 0) {
            assignedClosestLocationIndices.push(MISSING_TARGET_SENTINEL);
            continue; // Move to the next entity.
        }

        // Initialize the minimum distance and the best-found index for the current entity.
        // We calculate the distance to the first target location as a starting point,
        // which avoids using an arbitrary large magic number.
        let minimumAchievedDistance = calculateL1Distance(currentEntity, parsedTargetLocations[0]);
        let bestLocationIdentifier = 0; // The 0-based index of the closest location found so far.

        // Loop through all target locations to find the one that minimizes the distance.
        // We start from the second target location (index 1) because the first was used for initialization.
        for (let locationIdx = 1; locationIdx < parsedTargetLocations.length; locationIdx++) {
            const currentTarget = parsedTargetLocations[locationIdx];
            const distanceToCurrentTarget = calculateL1Distance(currentEntity, currentTarget);

            // If the current target is closer than the previously closest one, update.
            if (distanceToCurrentTarget < minimumAchievedDistance) {
                minimumAchievedDistance = distanceToCurrentTarget;
                bestLocationIdentifier = locationIdx;
            }
        }
        // Record the 0-based index of the closest target location for the current entity.
        assignedClosestLocationIndices.push(bestLocationIdentifier);
    }

    // --- Output Generation ---
    // Iterate through the collected closest indices and print them, adjusting to be 1-based.
    for (const resultIdentifier of assignedClosestLocationIndices) {
        // Only print valid indices. Skip sentinel values if they were assigned.
        if (resultIdentifier !== MISSING_TARGET_SENTINEL) {
            console.log(resultIdentifier + 1); // Output 1-based index.
        } else {
            // Optionally, handle cases where no target was found (e.g., print a specific message).
            // For this problem, we assume M > 0 if N > 0.
            // console.log("No target found");
        }
    }
};

// --- Execution Trigger ---
// This block ensures the script runs by reading from stdin and passing the content
// to our main processing function. It's designed for Node.js environments.
try {
    const fileSystem = require('fs');
    const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf-8');
    processSpatialData(inputContent);
} catch (error) {
    console.error("Failed to read from /dev/stdin or an unexpected error occurred:", error.message);
    // Exit with a non-zero code to indicate an error, common in shell scripting.
    process.exit(1);
}
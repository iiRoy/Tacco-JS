"use strict";

/**
 * Processes raw coordinate data to determine two additional vertices
 * that would form a square with the initial two given vertices.
 * This function assumes the input represents two adjacent vertices of a square.
 *
 * @param {string} rawInputString - A string containing space or newline separated numbers
 *                                  representing the x1, y1, x2, y2 coordinates.
 */
function calculateSquareCompletionPoints(rawInputString) {
    // Initial data preparation: Clean up the input string and split it into potential numeric parts.
    // Using trim() removes leading/trailing whitespace, and split(/\s+/) handles multiple delimiters.
    const stringSegments = rawInputString.trim().split(/\s+/);

    // Convert string segments to integers, performing basic validation during conversion.
    // If a segment cannot be parsed as an integer, it defaults to 0 to prevent errors,
    // though a more robust system might throw an error or filter it out.
    const numericalCoordinates = stringSegments.map(segment => {
        const parsedValue = parseInt(segment, 10);
        // Check if the parsed value is a valid number.
        if (isNaN(parsedValue)) {
            // Log a warning or handle the error more explicitly in a production environment.
            // For this exercise, we'll substitute invalid numbers with zero.
            console.warn(`Warning: Non-numeric input "${segment}" found. Substituting with 0.`);
            return 0;
        }
        return parsedValue;
    });

    // Essential validation: Ensure we have enough data points to proceed.
    // We expect at least four numerical components: x1, y1, x2, y2.
    const MINIMUM_EXPECTED_COORDINATES = 4;
    if (numericalCoordinates.length < MINIMUM_EXPECTED_COORDINATES) {
        console.error("Error: Insufficient coordinate data supplied. Expected at least 4 numbers (x1, y1, x2, y2).");
        // Exit the function gracefully if input is insufficient.
        return;
    }

    // Extract the initial two points using array destructuring for clarity.
    // This maps the first four numbers from the input to descriptive variable names.
    const [
        pointOneX,
        pointOneY,
        pointTwoX,
        pointTwoY
    ] = numericalCoordinates;

    // Calculate the vector components (differences) between the first and second points.
    // This vector represents one side of the square.
    const xVectorComponent = pointTwoX - pointOneX; // Horizontal displacement (delta X)
    const yVectorComponent = pointTwoY - pointOneY; // Vertical displacement (delta Y)

    // Calculate the components of a vector rotated 90 degrees counter-clockwise from the original.
    // If original vector is (dx, dy), the rotated vector is (-dy, dx).
    const rotatedXComponent = -yVectorComponent; // This will be added to X coordinates
    const rotatedYComponent = xVectorComponent;  // This will be added to Y coordinates

    // Determine the coordinates of the third vertex.
    // This point is found by adding the rotated vector to the second point.
    const thirdVertexCoordinateX = pointTwoX + rotatedXComponent;
    const thirdVertexCoordinateY = pointTwoY + rotatedYComponent;

    // Determine the coordinates of the fourth vertex.
    // This point is found by adding the same rotated vector to the first point.
    const fourthVertexCoordinateX = pointOneX + rotatedXComponent;
    const fourthVertexCoordinateY = pointOneY + rotatedYComponent;

    // Output the calculated coordinates.
    // The format is "thirdX thirdY fourthX fourthY".
    console.log(`${thirdVertexCoordinateX} ${thirdVertexCoordinateY} ${fourthVertexCoordinateX} ${fourthVertexCoordinateY}`);
}

/**
 * Main entry point for the application.
 * Handles reading input from stdin and orchestrating the coordinate processing.
 */
function initializeApplicationLogic() {
    // Use a try-catch block to handle potential errors during file system operations,
    // such as the file not existing or permission issues.
    try {
        const fileSystemModule = require("fs"); // Dynamically load the 'fs' module.
        // Read the entire content of standard input as a UTF-8 string.
        const standardInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

        // Pass the retrieved data to the core processing function.
        calculateSquareCompletionPoints(standardInputData);
    } catch (inputReadError) {
        // Report any errors encountered during input reading.
        console.error("An error occurred while attempting to read standard input:", inputReadError.message);
        // In a production application, more sophisticated error handling or fallback
        // mechanisms would be implemented here.
    }
}

// Execute the application's main logic.
initializeApplicationLogic();
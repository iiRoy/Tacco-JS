// This module provides utilities for file system operations.
const fileSystemUtility = require('fs');

// Define standard input file descriptor for convenience.
const STDIN_FILE_DESCRIPTOR = process.stdin.fd;

// Constant for converting degrees to radians.
const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0;

/**
 * Retrieves and processes input data from standard input.
 * Reads the entire content, converts it to UTF-8, trims whitespace,
 * and splits it into an array of lines.
 * @returns {string[]} An array of processed input lines.
 */
function acquireInputData() {
    // Determine the size of the standard input stream.
    const inputStats = fileSystemUtility.fstatSync(STDIN_FILE_DESCRIPTOR);
    const totalInputSize = inputStats.size;

    // Allocate a buffer to hold the raw input bytes.
    const rawInputBuffer = Buffer.alloc(totalInputSize);

    // Read bytes from standard input into the buffer.
    const actualBytesRead = fileSystemUtility.readSync(
        STDIN_FILE_DESCRIPTOR,
        rawInputBuffer,
        0, // Offset into the buffer
        totalInputSize,
        0  // Position in the file
    );

    // Convert the read bytes to a UTF-8 string, trim it, and split into lines.
    const processedContent = rawInputBuffer.subarray(0, actualBytesRead).toString('utf8').trim();

    // Handle potential empty input.
    if (!processedContent) {
        // Log a warning if no input is provided.
        console.warn("Warning: No input data received from stdin. Proceeding with empty instructions.");
        return [];
    }

    return processedContent.split('\n');
}

/**
 * Executes a series of navigation instructions to calculate a final 2D position.
 * The movement starts at (0,0) and tracks cumulative angular changes
 * (clockwise from the positive Y-axis).
 * @param {string[]} navigationInstructions - An array of strings, each containing "distance,angle_change".
 */
function executeNavigationInstructions(navigationInstructions) {
    // Initialize current coordinates.
    let currentXCoordinate = 0.0;
    let currentYCoordinate = 0.0;

    // Initialize the cumulative orientation angle in degrees (clockwise from positive Y-axis).
    let cumulativeOrientationInDegrees = 0.0;

    // Iterate through each instruction line provided.
    for (const instructionLine of navigationInstructions) {
        // Split the line by comma to get individual movement components.
        const instructionComponents = instructionLine.split(',');

        // Validate the structure of the instruction line.
        if (instructionComponents.length !== 2) {
            console.warn(`Skipping invalid instruction line: "${instructionLine}". Expected "distance,angle".`);
            continue; // Move to the next instruction.
        }

        // Parse distance and angular change from string to floating-point numbers.
        const movementDistance = parseFloat(instructionComponents[0]);
        const angularChangeDegrees = parseFloat(instructionComponents[1]);

        // Validate if parsed values are actual numbers.
        if (isNaN(movementDistance) || isNaN(angularChangeDegrees)) {
            console.warn(`Skipping instruction with non-numeric values: "${instructionLine}".`);
            continue; // Move to the next instruction.
        }

        // Check for the termination condition: both distance and angle are zero.
        if (movementDistance === 0.0 && angularChangeDegrees === 0.0) {
            // This instruction signals the end of the sequence.
            break;
        }

        // Convert the current cumulative angle from degrees to radians for trigonometric functions.
        const currentOrientationInRadians = cumulativeOrientationInDegrees * DEGREES_TO_RADIANS_FACTOR;

        // Calculate the sine and cosine components for the current orientation.
        // X-axis movement is proportional to sine, Y-axis movement to cosine
        // (assuming initial orientation along Y-axis for 0 degrees).
        const sineComponent = Math.sin(currentOrientationInRadians);
        const cosineComponent = Math.cos(currentOrientationInRadians);

        // Update the X and Y coordinates based on the movement distance and orientation.
        currentXCoordinate += movementDistance * sineComponent;
        currentYCoordinate += movementDistance * cosineComponent;

        // Update the cumulative orientation angle.
        cumulativeOrientationInDegrees += angularChangeDegrees;
    }

    // Output the final calculated coordinates, truncated to integers.
    // Using Math.trunc for integer part, similar to bitwise NOT (~~).
    console.log(`Final X position: ${Math.trunc(currentXCoordinate)}`);
    console.log(`Final Y position: ${Math.trunc(currentYCoordinate)}`);
}

// Entry point of the script.
// First, gather all input data.
const allInputLines = acquireInputData();

// Then, process these lines to perform the navigation.
executeNavigationInstructions(allInputLines);
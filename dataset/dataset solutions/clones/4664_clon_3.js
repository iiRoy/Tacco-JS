// Module for processing geographic proximity data, specifically finding the closest target for multiple entities.
// Enforce strict parsing rules to catch common coding errors and "unsafe" actions.
'use strict';

/**
 * Calculates the Manhattan distance (L1 distance) between two 2D points.
 * This represents the sum of the absolute differences of their Cartesian coordinates.
 *
 * @param {number[]} pointOne - The first point, represented as an array [x, y].
 * @param {number[]} pointTwo - The second point, represented as an array [x, y].
 * @returns {number} The Manhattan distance between the two points.
 * @throws {Error} If the input points are not valid 2D arrays.
 */
function computeGridDistance(pointOne, pointTwo) {
    // Robust input validation for the coordinate arrays.
    if (!Array.isArray(pointOne) || pointOne.length < 2 ||
        !Array.isArray(pointTwo) || pointTwo.length < 2 ||
        !pointOne.every(val => typeof val === 'number') ||
        !pointTwo.every(val => typeof val === 'number')) {
        throw new Error("Invalid input for computeGridDistance: expected two arrays of two numbers.");
    }

    // Calculate absolute differences for X and Y coordinates.
    const deltaX = Math.abs(pointOne[0] - pointTwo[0]);
    const deltaY = Math.abs(pointOne[1] - pointTwo[1]);

    // Sum the absolute differences to get the Manhattan distance.
    return deltaX + deltaY;
}

/**
 * Parses a string containing two space-separated numbers into an array of numbers.
 *
 * @param {string} coordString - The string to parse (e.g., "10 20").
 * @returns {number[]} An array containing two numbers [x, y].
 * @throws {Error} If the string cannot be parsed into two valid numbers.
 */
function parseCoordinatePair(coordString) {
    // Trim any leading/trailing whitespace and split the string by space.
    const numericStrings = coordString.trim().split(' ');

    // Validate that exactly two numeric strings were found.
    if (numericStrings.length !== 2) {
        throw new Error(`Invalid coordinate string format: "${coordString}". Expected two space-separated numbers.`);
    }

    // Convert string parts to numbers.
    const [valX, valY] = numericStrings.map(Number);

    // Validate that both converted values are indeed numbers.
    if (isNaN(valX) || isNaN(valY)) {
        throw new Error(`Failed to parse numbers from coordinate string: "${coordString}".`);
    }

    return [valX, valY];
}

/**
 * Main function to process raw input data, determine participant locations,
 * target waypoints, and then find the closest target for each participant.
 * Results are printed to standard output.
 *
 * @param {string} rawInputContent - The complete raw string content read from the input source.
 */
function ProcessProximityData(rawInputContent) {
    // Define constant for line break for better readability and potential future changes.
    const LINE_SEPARATOR = '\n';

    // Initial validation for the input content.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Error: Provided input data is empty or not a string. Cannot proceed.");
        return; // Exit early if input is invalid.
    }

    // Split the entire input content into an array of individual lines.
    const inputLines = rawInputContent.trim().split(LINE_SEPARATOR);

    // Parse the first line to extract the total count of participants and targets.
    // Using destructuring assignment for clarity.
    let numParticipants, numTargetPoints;
    try {
        [numParticipants, numTargetPoints] = parseCoordinatePair(inputLines[0]);
    } catch (parseError) {
        console.error(`Error parsing dimensions line: ${parseError.message}`);
        return;
    }

    // Validate that the counts are positive integers.
    if (numParticipants <= 0 || numTargetPoints <= 0) {
        console.error(`Error: Invalid counts for participants (${numParticipants}) or target points (${numTargetPoints}). Must be positive.`);
        return;
    }

    // Perform a structural validation: check if the number of lines provided
    // matches the expected count based on the dimensions.
    const expectedTotalLines = 1 + numParticipants + numTargetPoints; // 1 for dimensions + participants + targets
    if (inputLines.length !== expectedTotalLines) {
        console.warn(`Warning: Input line count mismatch. Expected ${expectedTotalLines} lines, but received ${inputLines.length}. Processing might be incomplete or incorrect.`);
        // Continue processing, but this warning indicates potential data issues.
    }

    // Extract and parse all participant location coordinates.
    // The slice method is used to get lines from index 1 up to (and including) numParticipants.
    const allParticipantCoordinates = inputLines
        .slice(1, numParticipants + 1)
        .map((line, idx) => {
            try {
                return parseCoordinatePair(line);
            } catch (error) {
                console.error(`Error parsing participant coordinates on line ${idx + 2}: ${error.message}`);
                // Depending on strictness, might throw or return a default/skip.
                // For this clone, let's stop if critical data is unparseable.
                throw error;
            }
        });

    // Extract and parse all target waypoint coordinates.
    // The slice method gets lines from (numParticipants + 1) to the end.
    const allTargetWaypointCoordinates = inputLines
        .slice(numParticipants + 1)
        .map((line, idx) => {
            try {
                return parseCoordinatePair(line);
            } catch (error) {
                console.error(`Error parsing target coordinates on line ${numParticipants + 2 + idx}: ${error.message}`);
                throw error;
            }
        });

    // A buffer to store the 1-based index of the closest target for each participant.
    const closestTargetIndices = [];

    // Iterate through each participant to determine their nearest target waypoint.
    allParticipantCoordinates.forEach((currentParticipantCoords, participantOrdinal) => {
        let currentMinDistance = Number.MAX_SAFE_INTEGER; // Initialize with a very large number.
        let bestTargetIndex = -1; // Stores the 0-based index of the closest target found so far.

        // Loop through every available target waypoint.
        for (let targetOrdinal = 0; targetOrdinal < numTargetPoints; ++targetOrdinal) {
            const targetCoords = allTargetWaypointCoordinates[targetOrdinal];
            // Calculate the distance from the current participant to this target.
            const calculatedCurrentDistance = computeGridDistance(currentParticipantCoords, targetCoords);

            // If this target is closer than the previously closest one, update.
            if (calculatedCurrentDistance < currentMinDistance) {
                currentMinDistance = calculatedCurrentDistance;
                bestTargetIndex = targetOrdinal;
            }
        }
        // Store the 1-based index of the closest target for the current participant.
        // Adding 1 converts from 0-based array index to 1-based problem statement index.
        closestTargetIndices.push(bestTargetIndex + 1);
    });

    // Output all the collected results, each on a new line.
    closestTargetIndices.forEach(resultIndex => console.log(resultIndex));

    // No explicit return statement is needed as the function's purpose is to perform side effects (logging).
}

// Check if the script is being run directly (not imported as a module).
if (require.main === module) {
    try {
        // Read the entire content from standard input synchronously using Node.js 'fs' module.
        const fileData = require('fs').readFileSync('/dev/stdin', 'utf8');
        // Invoke the main processing function with the read data.
        ProcessProximityData(fileData);
    } catch (executionError) {
        // Catch and log any errors that occur during file reading or main processing.
        console.error("An unhandled error occurred during script execution:", executionError.message);
        // Optionally, exit with a non-zero status code to indicate an error.
        process.exit(1);
    }
}
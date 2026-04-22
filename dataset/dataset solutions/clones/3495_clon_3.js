/**
 * A utility function to calculate the Manhattan distance between two 2D points.
 * This is also known as L1 distance or city block distance.
 * @param {number} p1x - X-coordinate of the first point.
 * @param {number} p1y - Y-coordinate of the first point.
 * @param {number} p2x - X-coordinate of the second point.
 * @param {number} p2y - Y-coordinate of the second point.
 * @returns {number} The calculated Manhattan distance.
 */
const calculateL1Distance = (p1x, p1y, p2x, p2y) => {
    return Math.abs(p1x - p2x) + Math.abs(p1y - p2y);
};

/**
 * Orchestrates the analysis of sensor readings to deduce the central coordinates
 * and apex altitude of a pyramid-like structure.
 * It iterates through a grid, checking for consistency with all observed points.
 * @param {string} rawSensorData - The complete sensor data as a single string,
 *                                  with lines separated by newlines.
 */
const processSensorObservations = (rawSensorData) => {
    // Break down the raw input string into individual lines for parsing.
    const sensorDataLines = rawSensorData.split('\n');

    // Extract the total number of observation records from the very first line.
    // Using unary plus operator for type conversion and checking for validity.
    const numberOfRecords = +sensorDataLines[0];
    if (isNaN(numberOfRecords) || numberOfRecords < 1) {
        // If the first line doesn't yield a valid positive number, something is wrong.
        console.error("Error: Initial line does not specify a valid number of observation records.");
        return; // Terminate execution due to malformed input.
    }

    // Initialize an array to hold structured observation point data.
    const observationRecords = [];

    // Loop through the subsequent lines to parse each observation point.
    // Start from index 1 as index 0 contains the count.
    for (let currentRecIdx = 1; currentRecIdx <= numberOfRecords; ++currentRecIdx) {
        const currentLineText = sensorDataLines[currentRecIdx];

        // Skip empty or malformed lines to prevent errors.
        if (!currentLineText || currentLineText.trim() === '') {
            console.warn(`Warning: Skipping empty or invalid line at record ${currentRecIdx}.`);
            continue;
        }

        // Split the line by spaces and convert string parts to integers.
        const stringCoordinates = currentLineText.trim().split(' ');
        if (stringCoordinates.length !== 3) {
            console.warn(`Warning: Record ${currentRecIdx} does not contain three values. Skipping.`);
            continue;
        }

        const currentXCoord = parseInt(stringCoordinates[0], 10);
        const currentYCoord = parseInt(stringCoordinates[1], 10);
        const currentAltitude = parseInt(stringCoordinates[2], 10);

        // Validate that parsed values are indeed numbers.
        if (isNaN(currentXCoord) || isNaN(currentYCoord) || isNaN(currentAltitude)) {
            console.warn(`Warning: Non-numeric data found in record ${currentRecIdx}. Skipping.`);
            continue;
        }

        // Store the parsed observation as an object for better readability and access.
        observationRecords.push({
            xPos: currentXCoord,
            yPos: currentYCoord,
            zAlt: currentAltitude
        });
    }

    // Define the maximum boundary for the grid search for pyramid center.
    const GRID_DIMENSION_MAX = 100; // Search space from 0 to 100 for both X and Y.

    // Begin iterating through every possible (x, y) coordinate within the defined grid.
    for (let potentialCenterX = 0; potentialCenterX <= GRID_DIMENSION_MAX; ++potentialCenterX) {
        for (let potentialCenterY = 0; potentialCenterY <= GRID_DIMENSION_MAX; ++potentialCenterY) {

            let derivedApexHeight = -1; // Placeholder for the calculated apex height.
                                        // -1: not yet determined, -2: inconsistent/invalid.
            let hasContradiction = false; // Flag to indicate if current (x,y) is impossible.

            // Phase 1: Use observations with positive altitudes (zAlt > 0)
            // to determine a candidate apex height. All such points must yield the same height.
            for (const currentObservation of observationRecords) {
                if (currentObservation.zAlt > 0) {
                    // Calculate expected apex height based on this observation.
                    const candidatePeakFromThisPoint = currentObservation.zAlt +
                                                       calculateL1Distance(
                                                           currentObservation.xPos, currentObservation.yPos,
                                                           potentialCenterX, potentialCenterY
                                                       );

                    if (derivedApexHeight === -1) {
                        // This is the first positive altitude point encountered; set the initial height.
                        derivedApexHeight = candidatePeakFromThisPoint;
                    } else if (derivedApexHeight !== candidatePeakFromThisPoint) {
                        // A different positive altitude point yields a different height,
                        // implying this (potentialCenterX, potentialCenterY) is not the correct center.
                        hasContradiction = true;
                        break; // Exit this inner loop, no need to check further points.
                    }
                }
            }

            // If a contradiction was found in Phase 1, this (x,y) is invalid. Move to the next.
            if (hasContradiction) {
                continue;
            }

            // Handle the edge case where no zAlt > 0 points were found.
            // If all observations have zAlt = 0, then the apex height must also be 0.
            if (derivedApexHeight === -1) {
                derivedApexHeight = 0;
            }

            // Phase 2: Use observations with zero altitude (zAlt = 0)
            // to confirm the consistency of the derived apex height.
            // A zAlt = 0 point must not be "under" the pyramid's base if the apex height is H.
            for (const currentObservation of observationRecords) {
                if (currentObservation.zAlt === 0) {
                    const distanceToZeroAltitudePoint = calculateL1Distance(
                                                            currentObservation.xPos, currentObservation.yPos,
                                                            potentialCenterX, potentialCenterY
                                                        );

                    // If the derived apex height is greater than the distance to a Z=0 point,
                    // it means this point should have a positive altitude, but it's 0. Contradiction.
                    if (derivedApexHeight > distanceToZeroAltitudePoint) {
                        hasContradiction = true;
                        break; // Exit this inner loop.
                    }
                }
            }

            // If a contradiction was found in Phase 2, this (x,y) is invalid. Move to the next.
            if (hasContradiction) {
                continue;
            }

            // If both phases pass without contradiction, then this (x,y) and derivedApexHeight
            // represent a consistent solution.
            // Output the found coordinates and the apex height using a template literal.
            console.log(`${potentialCenterX} ${potentialCenterY} ${derivedApexHeight}`);
        }
    }
};

// Immediately Invoked Function Expression (IIFE) to encapsulate the file reading and main execution.
(() => {
    try {
        // Read the entire file content from standard input.
        const fileData = require('fs').readFileSync('/dev/stdin', 'utf-8');
        // Pass the raw file content to our main processing function.
        processSensorObservations(fileData);
    } catch (ioError) {
        // Catch and report any errors that occur during file operations or processing.
        console.error('An error occurred during input reading or data processing:', ioError.message);
    }
})();
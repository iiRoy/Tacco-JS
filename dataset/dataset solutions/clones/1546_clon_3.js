/*
 * This module provides a utility function to determine the feasibility of a journey.
 * It checks if a given distance can be covered within a specified time limit
 * at a constant average speed.
 *
 * The expected input is a single string containing three space-separated numerical values:
 * 1. Total distance to be traveled (e.g., in kilometers).
 * 2. Maximum allowed time for the journey (e.g., in hours).
 * 3. Average speed of travel (e.g., in kilometers per hour).
 */
function checkRouteViability(inputPayload) {
    // --- Input Pre-processing and Initial Validation ---
    // First, ensure the input string is not empty, null, or of an incorrect type.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: The provided input payload is invalid or empty. Expected a non-empty string.");
        // If input is fundamentally bad, it's impossible to process.
        console.log('No');
        return;
    }

    // Split the trimmed input string into its constituent parts based on spaces.
    // This separates the distance, time limit, and speed values.
    const dataComponents = inputPayload.trim().split(' ');

    // Verify that exactly three components were provided as expected.
    if (dataComponents.length !== 3) {
        console.error(`Error: Incorrect number of input components. Expected 3, but received ${dataComponents.length}.`);
        console.log('No');
        return;
    }

    // --- Numerical Parsing and Type Conversion ---
    // Explicitly convert the string components into floating-point numbers.
    // Using Number() ensures proper handling of potential decimal values.
    const totalDistanceKm = Number(dataComponents[0]); // The total distance for the journey.
    const maxTimeHours = Number(dataComponents[1]);    // The maximum time permitted for travel.
    const averageSpeedKmh = Number(dataComponents[2]);   // The constant speed at which travel occurs.

    // --- Robustness Checks: Validate Parsed Numerical Data ---
    // Check if any of the parsed values are not a valid number (NaN).
    if (isNaN(totalDistanceKm) || isNaN(maxTimeHours) || isNaN(averageSpeedKmh)) {
        console.error("Error: One or more input values could not be parsed as valid numbers.");
        console.log('No'); // Cannot determine viability with invalid numerical inputs.
        return;
    }

    // Guard against illogical scenarios for travel.
    // A negative distance or time limit implies an impossible or invalid scenario.
    if (totalDistanceKm < 0 || maxTimeHours < 0) {
        console.log('No');
        return;
    }

    // Critical check: If the speed is zero or negative, no distance can be covered
    // in any positive amount of time, making the journey impossible.
    if (averageSpeedKmh <= 0) {
        console.log('No');
        return;
    }

    // --- Core Logic: Calculate Feasibility ---
    // Instead of dividing distance by speed to get time, calculate the maximum distance
    // that can be covered within the allowed time. This avoids potential floating-point
    // issues with division and demonstrates an equivalent logical transformation.
    const maximumReachableDistanceInTime = maxTimeHours * averageSpeedKmh;

    // Determine if the required total distance is less than or equal to the
    // maximum distance that can be reached within the time limit.
    let isJourneyFeasible;
    if (totalDistanceKm <= maximumReachableDistanceInTime) {
        isJourneyFeasible = true; // The journey is possible.
    } else {
        isJourneyFeasible = false; // The journey is not possible.
    }

    // --- Output Generation ---
    // Based on the feasibility determination, prepare the final output message.
    let finalResponseMessage;
    if (isJourneyFeasible) {
        finalResponseMessage = 'Yes';
    } else {
        finalResponseMessage = 'No';
    }

    // Display the final result to the console.
    console.log(finalResponseMessage);
}

// --- Script Execution Entry Point ---
// This block handles reading input from the standard input stream
// and calling the main processing function.
try {
    // Use Node.js 'fs' module to synchronously read data from /dev/stdin.
    // /dev/stdin is a standard path for console input on Unix-like systems.
    const rawInputFromSystem = require("fs").readFileSync("/dev/stdin", "utf8");

    // Pass the raw input string to our journey viability checker.
    checkRouteViability(rawInputFromSystem);

} catch (ioError) {
    // If an error occurs during file reading (e.g., file not found, permissions issue),
    // log the error details and indicate that input could not be processed.
    console.error(`System Input Error: Failed to read from /dev/stdin. Details: ${ioError.message}`);
    // In such cases, it's safer to assume the journey cannot be validated.
    console.log('No');
}
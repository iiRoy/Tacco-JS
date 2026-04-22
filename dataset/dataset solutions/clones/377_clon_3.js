const fileSystem = require('fs');

/**
 * Reads data from a specified file path, assuming UTF-8 encoding.
 * Handles potential file reading errors gracefully.
 * @param {string} sourcePath The file path from which to read input.
 * @returns {string | null} The raw content of the file as a string, or null if an error occurs.
 */
function retrieveRawData(sourcePath) {
    try {
        // Attempt to read the entire file synchronously.
        const fileContent = fileSystem.readFileSync(sourcePath, 'utf8');
        return fileContent;
    } catch (readError) {
        // Log an error message if the file cannot be read.
        console.error(`ERROR: Failed to read input from '${sourcePath}'. Details: ${readError.message}`);
        return null; // Return null to signal a failure.
    }
}

// Define constants for geometric properties of a clock face.
const DEGREES_IN_A_CIRCLE = 360;
const CLOCK_FACE_HOURS = 12;
const CLOCK_FACE_MINUTES = 60;

// Pre-calculate angular velocities for clock hands for efficiency and clarity.
const HOUR_HAND_DEGREES_PER_HOUR = DEGREES_IN_A_CIRCLE / CLOCK_FACE_HOURS; // 30 degrees per hour mark
const MINUTE_HAND_DEGREES_PER_MINUTE = DEGREES_IN_A_CIRCLE / CLOCK_FACE_MINUTES; // 6 degrees per minute mark
const HOUR_HAND_DEGREES_PER_MINUTE_MOVEMENT = HOUR_HAND_DEGREES_PER_HOUR / CLOCK_FACE_MINUTES; // 0.5 degrees per minute for hour hand

/**
 * Parses a time string (e.g., "10:30") into its numerical hour and minute components.
 * Includes basic validation for format and numeric content.
 * @param {string} timeStringRep The string representation of time.
 * @returns {{parsedHour: number, parsedMinute: number} | null} An object with hour and minute, or null on failure.
 */
function parseTimeInput(timeStringRep) {
    // Split the string by the colon character.
    const components = timeStringRep.split(':');

    // Validate that exactly two components (hour and minute) were found.
    if (components.length !== 2) {
        console.warn(`WARNING: Input format error for time string '${timeStringRep}'. Expected HH:MM.`);
        return null;
    }

    // Convert string components to integers using base 10.
    const currentHour = parseInt(components[0], 10);
    const currentMinute = parseInt(components[1], 10);

    // Validate that conversion resulted in valid numbers.
    if (isNaN(currentHour) || isNaN(currentMinute)) {
        console.warn(`WARNING: Non-numeric time values detected in '${timeStringRep}'.`);
        return null;
    }

    // Perform basic range validation for hour and minute values.
    if (currentHour < 0 || currentHour > 23 || currentMinute < 0 || currentMinute > 59) {
        console.warn(`WARNING: Time values out of valid range for '${timeStringRep}'. (HH: 0-23, MM: 0-59)`);
        return null;
    }

    return { parsedHour: currentHour, parsedMinute: currentMinute };
}

/**
 * Calculates the smallest angle (0-180 degrees) between the hour and minute hands of a clock.
 * @param {number} hourValue The hour (0-23).
 * @param {number} minuteValue The minute (0-59).
 * @returns {number} The calculated angle in degrees.
 */
function computeHandSeparationAngle(hourValue, minuteValue) {
    // Convert 24-hour format to 12-hour format for clock calculations.
    // The hour hand's position is based on the 12-hour cycle.
    const effectiveTwelveHour = hourValue % CLOCK_FACE_HOURS;

    // Calculate the total degrees for the hour hand.
    // It moves by hour and also by the fraction of the hour passed due to minutes.
    const hourHandPosition = (effectiveTwelveHour * HOUR_HAND_DEGREES_PER_HOUR) +
                             (minuteValue * HOUR_HAND_DEGREES_PER_MINUTE_MOVEMENT);

    // Calculate the total degrees for the minute hand.
    const minuteHandPosition = minuteValue * MINUTE_HAND_DEGREES_PER_MINUTE;

    // Find the absolute difference between the two hand positions.
    let rawAngularDifference = Math.abs(hourHandPosition - minuteHandPosition);

    // The smaller angle is either the raw difference or 360 minus the raw difference.
    // This ensures the angle is always between 0 and 180 degrees (inclusive).
    const minimumAngle = Math.min(rawAngularDifference, DEGREES_IN_A_CIRCLE - rawAngularDifference);

    return minimumAngle;
}

/**
 * Classifies the calculated clock hand angle into predefined risk categories.
 * @param {number} angleInDegrees The angle between clock hands.
 * @returns {string} The classification ("alert", "safe", or "warning").
 */
function categorizeAngleStatus(angleInDegrees) {
    // Angles less than 30 degrees indicate hands are very close.
    if (angleInDegrees < 30) {
        return "alert";
    }
    // Angles between 90 and 180 degrees (inclusive) indicate hands are significantly separated.
    else if (angleInDegrees >= 90 && angleInDegrees <= 180) {
        return "safe";
    }
    // Any other angle falls into the 'warning' category.
    else {
        return "warning";
    }
}

// --- Main program execution block ---
(function runClockAngleAnalysis() {
    // Acquire the raw input data from the standard input path.
    const rawDataContent = retrieveRawData('/dev/stdin');

    // Exit if no data was retrieved or if the content is empty after trimming.
    if (rawDataContent === null || rawDataContent.trim().length === 0) {
        console.error("PROGRAM ABORT: No processable input data found.");
        return;
    }

    // Split the raw content into individual lines, removing any trailing newlines first.
    const dataLines = rawDataContent.trimEnd().split('\n');

    // The first line is expected to be the total count of time entries to follow.
    const totalEntriesCount = Number(dataLines.shift());

    // Validate the parsed entry count.
    if (isNaN(totalEntriesCount) || totalEntriesCount < 0) {
        console.error("PROGRAM ABORT: Invalid number of entries specified in the first line of input.");
        return;
    }

    // Iterate through each time entry up to the specified count.
    for (let entryIndex = 0; entryIndex < totalEntriesCount; entryIndex++) {
        const currentEntryLine = dataLines[entryIndex];

        // Skip any empty or undefined lines that might appear in the input.
        if (!currentEntryLine || currentEntryLine.trim() === '') {
            console.warn(`WARNING: Skipping empty line at input position ${entryIndex + 1}.`);
            continue;
        }

        // Parse the hour and minute from the current time string.
        const timeComponents = parseTimeInput(currentEntryLine);

        // If parsing failed for this line, skip to the next entry.
        if (timeComponents === null) {
            continue;
        }

        // Calculate the angle between the clock hands.
        const calculatedAngle = computeHandSeparationAngle(timeComponents.parsedHour, timeComponents.parsedMinute);

        // Determine the risk category based on the calculated angle.
        const angleCategory = categorizeAngleStatus(calculatedAngle);

        // Output the final category for the current time entry.
        console.log(angleCategory);
    }
})(); // This is an Immediately Invoked Function Expression (IIFE) to encapsulate the script's main logic.
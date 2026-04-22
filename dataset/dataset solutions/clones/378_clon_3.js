// This script processes time entries to classify the angular difference
// between the hour and minute hands on a standard analog clock face.
// Classifications are 'alert', 'safe', or 'warning' based on predefined angle ranges.

// Utilize the Node.js file system module for reading input from standard input.
const fileSystemModule = require('fs');

// Define fundamental constants for clock geometry to enhance clarity and precision.
const FULL_CIRCLE_DEGREES = 360;
const CLOCK_HOURS_TOTAL = 12;
const MINUTES_IN_HOUR = 60;

// Pre-calculate common angular increments for clock hands.
const DEGREES_PER_HOUR_SEGMENT = FULL_CIRCLE_DEGREES / CLOCK_HOURS_TOTAL; // 30 degrees for each hour mark
const DEGREES_PER_MINUTE_SEGMENT = FULL_CIRCLE_DEGREES / MINUTES_IN_HOUR; // 6 degrees for each minute mark
const HOUR_HAND_MINUTE_PROGRESSION = DEGREES_PER_HOUR_SEGMENT / MINUTES_IN_HOUR; // 0.5 degrees movement for hour hand per minute

/**
 * Ensures an angle is within the [0, 360) degree range.
 * @param {number} angleInput - The angle in degrees to normalize.
 * @returns {number} The normalized angle.
 */
function normalizeAngleToCircle(angleInput) {
    let normalized = angleInput % FULL_CIRCLE_DEGREES;
    // Handle negative results from modulo operator.
    if (normalized < 0) {
        normalized += FULL_CIRCLE_DEGREES;
    }
    return normalized;
}

/**
 * Computes the smallest angular difference between two given angles.
 * This effectively finds the shortest path between two points on a circle.
 * @param {number} angleA - The first angle in degrees.
 * @param {number} angleB - The second angle in degrees.
 * @returns {number} The smallest absolute difference in degrees.
 */
function determineSmallestAngleSpan(angleA, angleB) {
    const rawAngularDifference = Math.abs(angleA - angleB);
    // The smallest angle is either the direct difference or 360 minus that difference.
    return Math.min(rawAngularDifference, FULL_CIRCLE_DEGREES - rawAngularDifference);
}

// --- Primary Program Logic ---

// Retrieve all input data from the standard input stream.
let rawStreamData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Clean up input: remove any trailing newlines and then split into individual lines.
// `trimEnd()` is more robust than `replace(/\n$/, "")` for various newline scenarios.
let arrayOfInputLines = rawStreamData.trimEnd().split('\n');

// Extract the first line, which denotes the total number of time entries to process.
const entriesCountString = arrayOfInputLines.shift();
let totalProcessingEntries = Number.parseInt(entriesCountString, 10);

// Implement a critical validation check for the number of entries.
if (isNaN(totalProcessingEntries) || totalProcessingEntries < 0) {
    console.error("Input Error: The specified number of time entries is invalid.");
    process.exit(1); // Terminate execution due to unrecoverable input error.
}

// Iterate through each provided time entry to perform analysis.
for (let entryIndex = 0; entryIndex < totalProcessingEntries; entryIndex++) {
    const currentClockTime = arrayOfInputLines[entryIndex];

    // Basic format validation for the current time string.
    if (!currentClockTime || !currentClockTime.includes(':')) {
        console.log("Processing Warning: Encountered an invalid or empty time string. Skipping this entry.");
        continue; // Proceed to the next entry.
    }

    // Split the time string (e.g., "10:30") into its hour and minute components.
    const timeSegmentParts = currentClockTime.split(':');

    // Convert string parts to integer values for calculations.
    const parsedHour = Number.parseInt(timeSegmentParts[0], 10);
    const parsedMinute = Number.parseInt(timeSegmentParts[1], 10);

    // Comprehensive validation for the parsed hour and minute values.
    if (isNaN(parsedHour) || isNaN(parsedMinute) || parsedHour < 0 || parsedHour > 23 || parsedMinute < 0 || parsedMinute > 59) {
        console.log("Processing Warning: Invalid hour or minute value detected. Skipping entry.");
        continue;
    }

    // Adjust the hour for 12-hour clock face calculations (00:00 or 12:00 should point to 12).
    // The modulo operator handles 24-hour to 12-hour conversion, and `|| CLOCK_HOURS_TOTAL`
    // ensures that 0 (for 00:XX or 12:XX) correctly maps to the 12 o'clock position.
    const clockFaceHour = parsedHour % CLOCK_HOURS_TOTAL || CLOCK_HOURS_TOTAL;

    // Calculate the precise angular position of the hour hand.
    // This includes the base hour position plus the additional movement due to minutes.
    let hourHandPositionDegrees = (clockFaceHour * DEGREES_PER_HOUR_SEGMENT) + (parsedMinute * HOUR_HAND_MINUTE_PROGRESSION);
    hourHandPositionDegrees = normalizeAngleToCircle(hourHandPositionDegrees); // Ensure angle is within [0, 360)

    // Calculate the precise angular position of the minute hand.
    let minuteHandPositionDegrees = parsedMinute * DEGREES_PER_MINUTE_SEGMENT;
    minuteHandPositionDegrees = normalizeAngleToCircle(minuteHandPositionDegrees); // Ensure angle is within [0, 360)

    // Calculate the smallest angular span between the two hands.
    const finalCalculatedAngle = determineSmallestAngleSpan(hourHandPositionDegrees, minuteHandPositionDegrees);

    let classificationVerdict;

    // Apply the classification rules based on the calculated angle.
    // The order of conditions is rearranged compared to the original, but logic is equivalent.
    if (finalCalculatedAngle >= 90 && finalCalculatedAngle <= 180) {
        // Angles from 90 to 180 degrees (inclusive) are considered 'safe'.
        classificationVerdict = "safe";
    } else if (finalCalculatedAngle < 30) {
        // Angles less than 30 degrees (e.g., hands very close) are 'alert'.
        classificationVerdict = "alert";
    } else {
        // All other angles (30 to less than 90 degrees) fall into 'warning'.
        classificationVerdict = "warning";
    }

    // Output the determined classification for the current time entry.
    console.log(classificationVerdict);
}
const fileSystem = require('fs');

// Constants representing key values for clock angle calculations.
const FULL_CIRCLE_DEGREES = 360;
const HOURS_ON_CLOCK_FACE = 12;
const MINUTES_PER_HOUR_SEGMENT = 60;

// Pre-calculated angular rates for clock hands.
// Each hour mark on a 12-hour clock is 30 degrees (360 / 12).
const DEGREES_PER_FULL_HOUR_MARK = FULL_CIRCLE_DEGREES / HOURS_ON_CLOCK_FACE; // 30 degrees
// Each minute mark for the minute hand is 6 degrees (360 / 60).
const DEGREES_PER_MINUTE_HAND_STEP = FULL_CIRCLE_DEGREES / MINUTES_PER_HOUR_SEGMENT; // 6 degrees
// The hour hand moves 0.5 degrees for every minute (30 degrees / 60 minutes).
const DEGREES_HOUR_HAND_PER_MINUTE = DEGREES_PER_FULL_HOUR_MARK / MINUTES_PER_HOUR_SEGMENT; // 0.5 degrees

/**
 * Parses a time string (e.g., "HH:MM") into its constituent hour and minute integer values.
 * Includes basic validation for format and numerical range.
 * @param {string} timeExpression - The input time string.
 * @returns {{hourValue: number, minuteValue: number}} An object containing the parsed hour and minute.
 * @throws {Error} If the time string is not in the expected "HH:MM" format or values are out of range.
 */
function parseTimeInput(timeExpression) {
    const timeSegments = timeExpression.split(':');

    // Validate the number of segments after splitting.
    if (timeSegments.length !== 2) {
        throw new Error('Malformed time string. Expected "HH:MM" format.');
    }

    // Convert string segments to numbers. `Number()` is equivalent to `parseInt(str, 10)`.
    const currentHourValue = Number(timeSegments[0]);
    const currentMinuteValue = Number(timeSegments[1]);

    // Basic numerical validation for hours and minutes.
    if (isNaN(currentHourValue) || isNaN(currentMinuteValue) ||
        currentHourValue < 0 || currentHourValue > 23 ||
        currentMinuteValue < 0 || currentMinuteValue > 59) {
        throw new Error(`Invalid hour or minute value in "${timeExpression}".`);
    }

    return { hourValue: currentHourValue, minuteValue: currentMinuteValue };
}

/**
 * Calculates the absolute angular positions of the hour and minute hands on a 360-degree clock dial.
 * The calculation strictly follows the numerical behavior of the original code,
 * where 12:00 and 00:00 can have different hour hand angles (360 vs 0).
 * @param {number} inputHour - The hour value (0-23).
 * @param {number} inputMinute - The minute value (0-59).
 * @returns {{hourHandPosition: number, minuteHandPosition: number}} Object with calculated angles in degrees.
 */
function calculateClockAngles(inputHour, inputMinute) {
    // Calculate hour hand position: (hour * 30 degrees) + (minute * 0.5 degrees).
    // The original code uses the raw hour value (e.g., 12 for 12 PM, 0 for 12 AM),
    // which can result in angles like 360 for 12:00 or 390 for 13:00.
    const hourHandPosition = (inputHour * DEGREES_PER_FULL_HOUR_MARK) + (inputMinute * DEGREES_HOUR_HAND_PER_MINUTE);

    // Calculate minute hand position: minute * 6 degrees.
    const minuteHandPosition = inputMinute * DEGREES_PER_MINUTE_HAND_STEP;

    return { hourHandPosition: hourHandPosition, minuteHandPosition: minuteHandPosition };
}

/**
 * Determines a status message based on the absolute angular difference between two clock hands.
 * @param {number} angleDifferenceInDegrees - The absolute difference between the hand angles.
 * @returns {string} One of "alert", "safe", or "warning".
 */
function evaluateAngularProximity(angleDifferenceInDegrees) {
    // Define thresholds for status categories for improved readability.
    const PROXIMITY_ALERT_MAX_DEG = 30;
    const SAFETY_ZONE_MIN_DEG = 90;
    const SAFETY_ZONE_MAX_DEG = 180;

    // Apply the original conditional logic for status assignment.
    if (angleDifferenceInDegrees >= 0 && angleDifferenceInDegrees < PROXIMITY_ALERT_MAX_DEG) {
        return "alert";
    } else if (angleDifferenceInDegrees >= SAFETY_ZONE_MIN_DEG && angleDifferenceInDegrees <= SAFETY_ZONE_MAX_DEG) {
        return "safe";
    } else {
        return "warning";
    }
}

// Read all input data from standard input.
const rawDataString = fileSystem.readFileSync('/dev/stdin', 'utf8');

// Clean the input: remove any trailing whitespace (including newlines) and split into an array of lines.
let dataLines = rawDataString.trimEnd().split('\n');

// The first line of input specifies the total count of test cases.
const totalNumberOfCases = Number(dataLines.shift());

// Process each test case sequentially.
for (let caseIterator = 0; caseIterator < totalNumberOfCases; caseIterator++) {
    const currentTestTimeString = dataLines[caseIterator];

    try {
        // Step 1: Extract hour and minute from the time string.
        const { hourValue, minuteValue } = parseTimeInput(currentTestTimeString);

        // Step 2: Calculate the angular positions of both clock hands.
        const { hourHandPosition, minuteHandPosition } = calculateClockAngles(hourValue, minuteValue);

        // Step 3: Compute the absolute difference between the two hand angles.
        // Math.abs(A - B) is equivalent to (A >= B) ? A - B : B - A.
        const absoluteAngleDifference = Math.abs(hourHandPosition - minuteHandPosition);

        // Step 4: Determine the final status message based on the angular difference.
        const determinedStatus = evaluateAngularProximity(absoluteAngleDifference);

        // Output the result for the current test case.
        console.log(determinedStatus);

    } catch (processingError) {
        // Enhanced error handling for Type III: log the error and provide a specific status.
        console.error(`Error encountered for input "${currentTestTimeString}": ${processingError.message}`);
        console.log("error_processing_time"); // Custom error output indicating input issue.
    }
}
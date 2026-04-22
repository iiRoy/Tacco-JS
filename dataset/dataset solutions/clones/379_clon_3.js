// This script processes time entries to classify the angular separation of clock hands.
// It reads time data from standard input, calculates the angle between the hour and minute hands,
// and then categorizes this angle into 'alert', 'safe', or 'warning' based on predefined thresholds.

// Core constants for clock angle calculations
const TOTAL_DEGREES_IN_CIRCLE = 360;
const HOURS_ON_ANALOG_CLOCK = 12;
const MINUTES_PER_HOUR = 60;

// Derived constants for angle calculations
const DEGREES_PER_HOUR_MARK = TOTAL_DEGREES_IN_CIRCLE / HOURS_ON_ANALOG_CLOCK; // 30 degrees per hour
const DEGREES_PER_MINUTE_FOR_HOUR_HAND_MOVEMENT = DEGREES_PER_HOUR_MARK / MINUTES_PER_HOUR; // 0.5 degrees per minute for hour hand movement
const DEGREES_PER_MINUTE_FOR_MINUTE_HAND_MOVEMENT = TOTAL_DEGREES_IN_CIRCLE / MINUTES_PER_HOUR; // 6 degrees per minute for minute hand movement

// Thresholds for classification of the angle between hands
const CRITICAL_ANGLE_THRESHOLD_MAX = 30; // Angles less than this are 'alert'
const MODERATE_ANGLE_THRESHOLD_MIN = 90; // Angles from this value are potentially 'safe'
const MODERATE_ANGLE_THRESHOLD_MAX_EXCLUSIVE = 180; // Angles strictly less than this are 'safe' (180 itself is 'warning' based on original logic)

/**
 * Calculates the smaller angle in degrees between the hour and minute hands of a clock.
 * Assumes a 24-hour format for input, which is converted to 12-hour for clock logic.
 *
 * @param {number} currentHour - The hour value (0-23).
 * @param {number} currentMinute - The minute value (0-59).
 * @returns {number} The smaller angle in degrees (0 to 180) between the clock hands.
 */
function calculateHandAngle(currentHour, currentMinute) {
    // Adjust hour for 12-hour format: 12 PM becomes 0 for calculations, then 1-11, 12 AM is 0.
    // For a 24-hour input, convert to 12-hour cycle. E.g., 13:00 is 1:00 PM.
    const adjustedHourForClock = currentHour % HOURS_ON_ANALOG_CLOCK;

    // Calculate the angular position of the hour hand.
    // It moves 30 degrees for each hour and an additional 0.5 degrees for each minute.
    const hourHandPosition = (adjustedHourForClock * DEGREES_PER_HOUR_MARK) +
                             (currentMinute * DEGREES_PER_MINUTE_FOR_HOUR_HAND_MOVEMENT);

    // Calculate the angular position of the minute hand.
    // It moves 6 degrees for each minute.
    const minuteHandPosition = currentMinute * DEGREES_PER_MINUTE_FOR_MINUTE_HAND_MOVEMENT;

    // Determine the absolute difference between the two hand positions.
    // This difference can be greater than 180 degrees.
    let absoluteAngleDifference = Math.abs(hourHandPosition - minuteHandPosition);

    // The actual angle between hands is always the smaller of the two possible angles
    // (e.g., 270 degrees difference is effectively 90 degrees in the other direction).
    const finalSmallerAngleBetweenHands = Math.min(absoluteAngleDifference, TOTAL_DEGREES_IN_CIRCLE - absoluteAngleDifference);

    return finalSmallerAngleBetweenHands;
}

/**
 * Classifies an angle into "alert", "safe", or "warning" based on predefined thresholds.
 *
 * @param {number} angleInDegrees - The angle between clock hands in degrees (0-180).
 * @returns {string} The classification ("alert", "safe", or "warning").
 */
function classifyAngle(angleInDegrees) {
    let classificationStatus;

    // Condition for 'alert': Hands are very close.
    if (angleInDegrees < CRITICAL_ANGLE_THRESHOLD_MAX) {
        classificationStatus = "alert";
    }
    // Condition for 'safe': Hands are moderately separated.
    // Based on original logic, 180 degrees falls into 'warning'.
    else if (angleInDegrees >= MODERATE_ANGLE_THRESHOLD_MIN && angleInDegrees < MODERATE_ANGLE_THRESHOLD_MAX_EXCLUSIVE) {
        classificationStatus = "safe";
    }
    // All other angles (e.g., between 30 and 90 degrees, or exactly 180 degrees) result in 'warning'.
    else {
        classificationStatus = "warning";
    }
    return classificationStatus;
}

// Main execution block to process the input data.
// This section reads from standard input, parses time entries,
// calculates and classifies angles, and then outputs the results.

const fileSystemModule = require('fs');

// Read all input data from standard input as a UTF-8 string.
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// If the input is empty or just whitespace, there's nothing to process.
if (!rawInputContent || rawInputContent.trim() === '') {
    // No output if no input.
    return;
}

// Process the raw input: remove any trailing newline character and split into an array of lines.
const processedInputLines = rawInputContent.trimEnd().split('\n');

// The very first line of input contains the total count of time entries to be processed.
// Use Number() for robust conversion, handling potential leading/trailing whitespace.
const totalNumberOfTimeEntries = Number(processedInputLines.shift());

// Validate the parsed number of entries. If it's not a valid number or is negative, exit.
if (isNaN(totalNumberOfTimeEntries) || totalNumberOfTimeEntries < 0) {
    // If the count is invalid, we might output an error or just stop processing.
    // For competitive programming, often just stopping is sufficient.
    return;
}

// An array to collect all the classification results before printing them collectively.
const collectedOutputMessages = [];

// Iterate through each specified number of time entries.
for (let entryIterator = 0; entryIterator < totalNumberOfTimeEntries; entryIterator++) {
    const currentTimeString = processedInputLines[entryIterator];

    // Input validation: Check if the time string is valid (not empty and contains a colon).
    if (!currentTimeString || !currentTimeString.includes(':')) {
        collectedOutputMessages.push("invalid_format"); // Indicate an issue with the format.
        continue; // Skip to the next entry.
    }

    // Split the time string by the colon to get hour and minute parts.
    const timeComponentsArray = currentTimeString.split(':');

    // Parse the hour and minute values from their string representations.
    const parsedHourValue = Number(timeComponentsArray[0]);
    const parsedMinuteValue = Number(timeComponentsArray[1]);

    // Input validation: Check if parsed values are valid numbers and within expected ranges for time.
    if (isNaN(parsedHourValue) || isNaN(parsedMinuteValue) ||
        parsedHourValue < 0 || parsedHourValue > 23 ||
        parsedMinuteValue < 0 || parsedMinuteValue > 59)
    {
        collectedOutputMessages.push("invalid_time_value"); // Indicate an issue with the time values.
        continue; // Skip to the next entry.
    }

    // Calculate the angle between the clock hands for the current time.
    const calculatedClockAngle = calculateHandAngle(parsedHourValue, parsedMinuteValue);

    // Classify the calculated angle into its respective category.
    const currentEntryClassification = classifyAngle(calculatedClockAngle);

    // Add the classification result to our collection.
    collectedOutputMessages.push(currentEntryClassification);
}

// After processing all entries, print each collected result on a new line.
collectedOutputMessages.forEach(message => console.log(message));
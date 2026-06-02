var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Define constants for clarity and reusability in angle calculations
const DEGREES_IN_FULL_CIRCLE = 360;
const CLOCK_FACE_HOURS = 12;
const MINUTES_IN_AN_HOUR = 60;

// Calculate degrees moved per unit for hour and minute hands
const DEGREES_PER_HOUR_UNIT = DEGREES_IN_FULL_CIRCLE / CLOCK_FACE_HOURS; // 30 degrees per hour
const DEGREES_PER_MINUTE_UNIT = DEGREES_IN_FULL_CIRCLE / MINUTES_IN_AN_HOUR; // 6 degrees per minute
const HOUR_HAND_MINUTE_CONTRIBUTION = DEGREES_PER_HOUR_UNIT / MINUTES_IN_AN_HOUR; // 0.5 degrees per minute

// Define angle thresholds for status determination
const ALERT_ANGLE_LOWER_BOUND = 0;
const ALERT_ANGLE_UPPER_BOUND = 30;
const SAFE_ANGLE_LOWER_BOUND = 90;
const SAFE_ANGLE_UPPER_BOUND = 180;

// Helper function to compute the hour hand's absolute angle from 12 o'clock
function calculateHourHandPosition(currentHour, currentMinute) {
    // Hour hand moves based on the hour and also incrementally with minutes
    return (currentHour * DEGREES_PER_HOUR_UNIT) + (currentMinute * HOUR_HAND_MINUTE_CONTRIBUTION);
}

// Helper function to compute the minute hand's absolute angle from 12 o'clock
function calculateMinuteHandPosition(currentMinute) {
    // Minute hand moves directly based on the current minute
    return currentMinute * DEGREES_PER_MINUTE_UNIT;
}

// Helper function to determine the clock status based on the absolute angle difference
function getClockHandStatus(absoluteAngleDifference) {
    if (absoluteAngleDifference >= ALERT_ANGLE_LOWER_BOUND && absoluteAngleDifference < ALERT_ANGLE_UPPER_BOUND) {
        return "alert";
    } else if (absoluteAngleDifference >= SAFE_ANGLE_LOWER_BOUND && absoluteAngleDifference <= SAFE_ANGLE_UPPER_BOUND) {
        return "safe";
    } else {
        return "warning";
    }
}

// Process input data
var lineData = rawData.trimEnd().split("\n"); // Use trimEnd() for robust trailing newline removal
var numCases = parseInt(lineData.shift(), 10); // Explicitly specify radix for parseInt

// Iterate through each test case
for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    var timeComponents = lineData[caseIndex].split(":");
    var hourValue = parseInt(timeComponents[0], 10);
    var minuteValue = parseInt(timeComponents[1], 10);

    // Calculate the angles for both hands
    var hourHandAngle = calculateHourHandPosition(hourValue, minuteValue);
    var minuteHandAngle = calculateMinuteHandPosition(minuteValue);

    // Determine the absolute difference between the angles
    var angleDifference = Math.abs(hourHandAngle - minuteHandAngle);

    // Get the status based on the calculated angle difference
    var clockStatus = getClockHandStatus(angleDifference);

    // Output the result
    console.log(clockStatus);
}

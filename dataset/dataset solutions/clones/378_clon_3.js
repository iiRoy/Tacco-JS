var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineData = (rawData.replace(/\n$/, "")).split("\n");
var numCases = Number(lineData.shift());

const DEGREES_IN_FULL_CIRCLE = 360;
const CLOCK_HOURS_COUNT = 12;
const MINUTES_PER_HOUR_OR_CLOCK = 60;

const HOUR_HAND_DEGREES_PER_HOUR = DEGREES_IN_FULL_CIRCLE / CLOCK_HOURS_COUNT; // 30 degrees
const MINUTE_HAND_DEGREES_PER_MINUTE = DEGREES_IN_FULL_CIRCLE / MINUTES_PER_HOUR_OR_CLOCK; // 6 degrees
const HOUR_HAND_MINUTE_ADJUSTMENT_FACTOR = HOUR_HAND_DEGREES_PER_HOUR / MINUTES_PER_HOUR_OR_CLOCK; // 0.5 degrees

const ALERT_ANGLE_UPPER_BOUND = 30;
const SAFE_ANGLE_LOWER_BOUND = 90;
const SAFE_ANGLE_UPPER_BOUND = 180;

function calculateHourHandAngle(currentHour, currentMinute) {
    let baseHourPosition = currentHour * HOUR_HAND_DEGREES_PER_HOUR;
    let minuteContributionToHourHand = currentMinute * HOUR_HAND_MINUTE_ADJUSTMENT_FACTOR;
    return baseHourPosition + minuteContributionToHourHand;
}

function calculateMinuteHandAngle(currentMinute) {
    return currentMinute * MINUTE_HAND_DEGREES_PER_MINUTE;
}

for (let caseIdx = 0; caseIdx < numCases; caseIdx++) {
    let currentCaseLine = lineData[caseIdx];
    let timeComponents = currentCaseLine.split(":");
    
    let hourValue = parseInt(timeComponents[0], 10);
    let minuteValue = parseInt(timeComponents[1], 10);

    let hourHandPosition = calculateHourHandAngle(hourValue, minuteValue);
    let minuteHandPosition = calculateMinuteHandAngle(minuteValue);

    let absoluteAngleDifference = Math.abs(hourHandPosition - minuteHandPosition);
    
    let statusMessage;
    if (absoluteAngleDifference >= 0 && absoluteAngleDifference < ALERT_ANGLE_UPPER_BOUND) {
        statusMessage = "alert";
    } else if (absoluteAngleDifference >= SAFE_ANGLE_LOWER_BOUND && absoluteAngleDifference <= SAFE_ANGLE_UPPER_BOUND) {
        statusMessage = "safe";
    } else {
        statusMessage = "warning";
    }
    console.log(statusMessage);
}

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const DEGREES_IN_CIRCLE = 360;
const HOURS_ON_CLOCK_FACE = 12;
const MINUTES_PER_HOUR = 60;

var trimmedData = rawData.trimEnd();
var lineData = trimmedData.split("\n");

var numCases = Number(lineData.shift());

function getClockStatus(angleDifference) {
    const ALERT_MAX_ANGLE = 30;
    const SAFE_MIN_ANGLE = 90;
    const SAFE_MAX_ANGLE = 180;

    if (angleDifference >= 0 && angleDifference < ALERT_MAX_ANGLE) {
        return "alert";
    } else if (angleDifference >= SAFE_MIN_ANGLE && angleDifference < SAFE_MAX_ANGLE) {
        return "safe";
    } else {
        return "warning";
    }
}

for (var caseIndex = 0; caseIndex < numCases; caseIndex++) {
    var currentTimeString = lineData[caseIndex];
    var timeComponents = currentTimeString.split(":");

    var hourValue = parseInt(timeComponents[0], 10);
    var minuteValue = parseInt(timeComponents[1], 10);

    const degreesPerHourUnit = DEGREES_IN_CIRCLE / HOURS_ON_CLOCK_FACE;
    const degreesPerMinuteUnit = DEGREES_IN_CIRCLE / MINUTES_PER_HOUR;
    const hourHandMovementPerMinute = degreesPerHourUnit / MINUTES_PER_HOUR;

    var calculatedHourAngle = hourValue * degreesPerHourUnit + minuteValue * hourHandMovementPerMinute;
    var calculatedMinuteAngle = minuteValue * degreesPerMinuteUnit;

    var absoluteAngleDifference = Math.abs(calculatedHourAngle - calculatedMinuteAngle);

    var resultStatus = getClockStatus(absoluteAngleDifference);

    console.log(resultStatus);
}

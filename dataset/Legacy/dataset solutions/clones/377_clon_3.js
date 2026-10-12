const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const DEGREES_PER_HOUR_MARK = 360 / 12;
const DEGREES_PER_MINUTE_FOR_HOUR_HAND = DEGREES_PER_HOUR_MARK / 60;
const DEGREES_PER_MINUTE_FOR_MINUTE_HAND = 360 / 60;

function determineClockStatus(currentAngleDifference) {
    if (currentAngleDifference >= 0 && currentAngleDifference < 30) {
        return "alert";
    } else if (currentAngleDifference >= 90 && currentAngleDifference <= 180) {
        return "safe";
    } else {
        return "warning";
    }
}

const inputLines = rawInputData.replace(/\n$/, "").split("\n");
const numberOfTestCases = Number(inputLines.shift());

for (let caseIndex = 0; caseIndex < numberOfTestCases; caseIndex++) {
    const currentTimeParts = inputLines[caseIndex].split(":");
    const currentHours = parseInt(currentTimeParts[0], 10);
    const currentMinutes = parseInt(currentTimeParts[1], 10);

    const baseHourAngle = currentHours * DEGREES_PER_HOUR_MARK;
    const minuteContributionToHourHand = currentMinutes * DEGREES_PER_MINUTE_FOR_HOUR_HAND;
    const finalHourAngle = baseHourAngle + minuteContributionToHourHand;

    const finalMinuteAngle = currentMinutes * DEGREES_PER_MINUTE_FOR_MINUTE_HAND;

    let initialAngleDifference = Math.abs(finalHourAngle - finalMinuteAngle);

    const normalizedAngleDifference = Math.min(initialAngleDifference, 360 - initialAngleDifference);

    const clockStatusResult = determineClockStatus(normalizedAngleDifference);
    console.log(clockStatusResult);
}

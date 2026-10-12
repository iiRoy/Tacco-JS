const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const timeEntries = rawData.trimEnd().split('\n');

const entryCount = Number(timeEntries.shift());

const angleClassifications = [
    { check: (val) => val >= 0 && val < 30, outcome: "alert" },
    { check: (val) => val >= 90 && val <= 180, outcome: "safe" }
];

const getStatusByAngle = (angleValue) =>
    angleClassifications.reduce((currentStatus, classification) => {
        if (classification.check(angleValue)) {
            return classification.outcome;
        }
        return currentStatus;
    }, "warning");

const calculateClockHandDifference = (hourVal, minuteVal) => {
    const hourDialPosition = (hourVal % 12) * 5 + minuteVal / 12;
    const minuteDialPosition = minuteVal;

    const rawDialDifference = hourDialPosition - minuteDialPosition;
    const absoluteDialDifference = Math.abs(rawDialDifference);

    const finalAngleDifference = absoluteDialDifference * 6;
    return finalAngleDifference;
};

timeEntries.slice(0, entryCount).forEach((timeString) => {
    const timeParts = timeString.split(':');
    const hourVal = Number(timeParts[0]);
    const minuteVal = Number(timeParts[1]);

    const angleDifference = calculateClockHandDifference(hourVal, minuteVal);
    const statusMessage = getStatusByAngle(angleDifference);

    console.log(statusMessage);
});

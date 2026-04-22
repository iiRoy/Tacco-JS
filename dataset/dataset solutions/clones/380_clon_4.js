const fileSystem = require('fs');

const determineCategory = (angleValue) => {
    const categoryRules = [
        { check: (val) => val >= 0 && val < 30, outcome: "alert" },
        { check: (val) => val >= 90 && val <= 180, outcome: "safe" }
    ];

    for (const rule of categoryRules) {
        if (rule.check(angleValue)) {
            return rule.outcome;
        }
    }
    return "warning";
};

const processTimeEntry = (timeString) => {
    const timeComponents = timeString.split(":");
    const currentHour = Number(timeComponents[0]);
    const currentMinute = Number(timeComponents[1]);

    const hourHandPositionOnClock = (currentHour % 12) * 5 + currentMinute / 12;
    const minuteHandPositionOnClock = currentMinute;

    const absoluteMinuteDifference = Math.abs(hourHandPositionOnClock - minuteHandPositionOnClock);
    const resultingAngle = absoluteMinuteDifference * 6;

    return determineCategory(resultingAngle);
};

const dataContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const timeEntries = dataContent.trim().split('\n');

const entryCount = Number(timeEntries.shift());

timeEntries
    .slice(0, entryCount)
    .map(processTimeEntry)
    .forEach(result => console.log(result));
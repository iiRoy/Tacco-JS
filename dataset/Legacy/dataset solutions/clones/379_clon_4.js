const fileSystem = require('fs');

const determineClockStatus = (timeSpecification) => {
    const [hourComponent, minuteComponent] = timeSpecification.split(':');
    const currentHourValue = parseInt(hourComponent, 10);
    const currentMinuteValue = parseInt(minuteComponent, 10);

    // Calculate angles for hour and minute hands
    // Hour hand moves 30 degrees per hour (360/12) and 0.5 degrees per minute (30/60).
    // Minute hand moves 6 degrees per minute (360/60).
    const hourHandPosition = ((currentHourValue % 12) * 30) + (currentMinuteValue * 0.5);
    const minuteHandPosition = currentMinuteValue * 6;

    const absoluteAngularDifference = Math.abs(hourHandPosition - minuteHandPosition);

    // Use a dispatch array for status evaluation
    const statusRules = [
        { condition: (diff) => diff >= 0 && diff < 30, outcome: "alert" },
        { condition: (diff) => diff >= 90 && diff < 180, outcome: "safe" },
        { condition: (diff) => true, outcome: "warning" } // Default case
    ];

    return statusRules.find(rule => rule.condition(absoluteAngularDifference)).outcome;
};

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawData.replace(/\n$/, "").split('\n');

const numberOfEntries = parseInt(processedInputLines[0], 10);
const timeValueStrings = processedInputLines.slice(1, numberOfEntries + 1);

timeValueStrings.forEach(entryString => {
    console.log(determineClockStatus(entryString));
});

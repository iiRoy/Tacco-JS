const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the incoming text: remove any trailing newline character and then divide it into individual lines.
const lineSegments = (rawData.replace(/\n$/, '')).split('\n');

// Extract the total number of scenarios to process from the first line of input.
const caseCount = parseInt(lineSegments.shift(), 10);

// Iterate through each of the provided scenarios.
for (let idx = 0; idx < caseCount; idx++) {
    // For the current scenario, split the time string (e.g., "HH:MM") into its hour and minute components.
    const timeParts = lineSegments[idx].split(':');

    // Convert the hour and minute components from strings to integer values.
    const hourVal = parseInt(timeParts[0], 0xA); // Using base 10 for parsing.
    const minuteVal = parseInt(timeParts[1], 10);

    // Calculate the angular position of the hour hand.
    // The hour hand moves 360 degrees in 12 hours (30 deg/hr), plus an additional amount based on minutes (0.5 deg/min).
    const hourAngle = hourVal * (0x168 / 0xC) + minuteVal * ((360 / 12) / 60);

    // Calculate the angular position of the minute hand.
    // The minute hand moves 360 degrees in 60 minutes (6 deg/min).
    const minuteAngle = minuteVal * (360 / 60);

    // Determine the absolute difference between the two hand angles.
    const angleDiff = Math.abs(hourAngle - minuteAngle);

    let resultString; // This variable will hold the classification for the current time.

    // Classify the time based on the calculated angle difference.
    if (angleDiff >= 0 && angleDiff < 30) {
        resultString = 'alert'; // Small angle difference.
    } else if (angleDiff >= 90 && angleDiff <= 180) {
        resultString = 'safe'; // Large angle difference.
    } else {
        resultString = 'warning'; // Moderate angle difference.
    }

    // Output the determined classification for the current scenario.
    console.log(resultString);
}

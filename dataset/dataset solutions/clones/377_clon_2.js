let incomingData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');

// Process raw input to get an array of time strings
const timeStrings = (incomingData.trimEnd()).split('\n');

// Extract the total number of entries to process
let totalEntries = Number(timeStrings.shift());

// Loop through each provided time entry
for (let index = 0; index < totalEntries; index++) {

    // Split the current time string into hour and minute components
    const timeComponents = timeStrings[index].split(':');

    // Parse the hour value as an integer
    let currentHour = parseInt(timeComponents[0], 10);

    // Parse the minute value as an integer
    let currentMinute = parseInt(timeComponents[1], 10);

    // Calculate the angle of the hour hand in degrees from 12 o'clock
    // Hour hand moves 360/12 = 30 degrees per hour
    // Minute hand moves 360/60 = 6 degrees per minute
    // Hour hand also moves 30/60 = 0.5 degrees per minute
    const hourAngleDegrees = currentHour * (360 / 12) + currentMinute * ((360 / 12) / 60);

    // Calculate the angle of the minute hand in degrees from 12 o'clock
    const minuteAngleDegrees = currentMinute * (360 / 60);

    // Determine the absolute difference between the two angles
    let angleDifference = Math.abs(hourAngleDegrees - minuteAngleDegrees);

    // Adjust the angle to be the smaller of the two possible angles (e.g., 30 degrees instead of 330 degrees)
    angleDifference = Math.min(angleDifference, 360 - angleDifference);

    // Initialize a variable to hold the classified outcome
    let outcomeMessage;

    // Classify the angle difference into specific categories
    if (angleDifference >= 0 && angleDifference < 30) {
        outcomeMessage = "alert"; // Small angle difference
    } else if (angleDifference >= 90 && angleDifference <= 180) {
        outcomeMessage = "safe";  // Large angle difference
    } else {
        outcomeMessage = "warning"; // Moderate angle difference
    }

    // Output the determined classification for the current time
    console.log(outcomeMessage);
}
let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input stream

// Process the raw input: remove trailing newline and split into an array of time strings
const timeEntries = (rawData.replace(/\n$/, "")).split("\n");

// The first element of the array indicates the number of time entries to process
let numEntries = timeEntries.shift() - 0; // Convert the string to a number

// Iterate through each provided time entry
for (let idx = 0; idx < numEntries; idx++) {
  // Split the current time string (e.g., "10:30") into hour and minute components
  const timeParts = timeEntries[idx].split(":");

  // Parse the hour and minute values as integers
  let hourVal = parseInt(timeParts[0], 10);
  let minuteVal = parseInt(timeParts[1], 10);

  // Calculate the angle of the hour hand in degrees
  // Hour hand moves 360 degrees in 12 hours, so 30 degrees per hour.
  // It also moves 0.5 degrees per minute (30 degrees / 60 minutes).
  const hourAngle = hourVal * (360 / 12) + minuteVal * ((360 / 12) / 60);

  // Calculate the angle of the minute hand in degrees
  // Minute hand moves 360 degrees in 60 minutes, so 6 degrees per minute.
  const minuteAngle = minuteVal * (360 / 60);

  // Determine the absolute difference between the hour and minute hand angles
  // This ensures the angle is always positive.
  let angleDiff = (hourAngle >= minuteAngle) ? hourAngle - minuteAngle : minuteAngle - hourAngle;

  let resultStatus; // Variable to store the classification result

  // Classify the time based on the angle difference
  if (angleDiff >= 0 && angleDiff < 30) {
    resultStatus = "alert"; // Small angle difference
  } else if (angleDiff >= 90 && angleDiff <= 180) {
    resultStatus = "safe"; // Large angle difference
  } else {
    resultStatus = "warning"; // Intermediate angle difference
  }

  // Output the determined status for the current time entry
  console.log(resultStatus);
}

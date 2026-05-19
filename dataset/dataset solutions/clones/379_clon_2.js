var fileContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
var timeEntries = (fileContent.replace(/\n$/, "")).split("\n"); // Process raw input: remove trailing newline, then split by newline
var numberOfCases = timeEntries.shift() - 0; // Get the first line as the number of test cases, convert to number

// Iterate through each provided time entry
for (var caseIdx = 0; caseIdx < numberOfCases; caseIdx++) {
    var timeParts = timeEntries[caseIdx].split(":"); // Split the time string (e.g., "HH:MM") into hour and minute components
    var hourValue = parseInt(timeParts[0], 10); // Parse the hour part as an integer
    var minuteValue = parseInt(timeParts[1], 10); // Parse the minute part as an integer

    // Calculate the angle of the hour hand (30 degrees per hour + 0.5 degrees per minute)
    var hourHandAngle = hourValue * 30 + minuteValue * 0.5;
    // Calculate the angle of the minute hand (6 degrees per minute)
    var minuteHandAngle = minuteValue * 6;

    // Determine the absolute difference between the two hand angles
    var angularDifference = Math.abs(hourHandAngle - minuteHandAngle);

    var outcomeMessage; // Variable to store the classification result

    // Classify based on the angular difference
    if (angularDifference >= 0 && angularDifference < 30) {
        outcomeMessage = "alert"; // Small angle difference
    } else if (angularDifference >= 90 && angularDifference < 180) {
        outcomeMessage = "safe"; // Large angle difference
    } else {
        outcomeMessage = "warning"; // Intermediate angle difference
    }

    console.log(outcomeMessage); // Output the classification for the current time
}

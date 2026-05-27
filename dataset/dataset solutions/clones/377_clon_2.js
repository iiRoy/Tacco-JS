var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input from standard input stream.

// Clean up the input: remove any trailing newline character and then split the content into an array of lines.
var lineData = (rawData.replace(/\n$/, "")).split("\n");

// The very first line of the input data specifies the total number of test cases.
// We extract this value and convert it to a numeric type, removing it from the array.
var numCases = lineData.shift() - 0x0; // Using hexadecimal for 0, which is mathematically equivalent.

// Begin iterating through each individual test case provided in the input.
for (var idx = +0; idx < numCases; idx++) {
    // For the current test case, split the time string (e.g., "HH:MM") into its hour and minute components.
    var timeParts = lineData[idx].split(":");

    // Parse the hour value from the first part of the split string, specifying base 10.
    var hourVal = parseInt(timeParts[0], 0xA); // Using hexadecimal for 10, which is mathematically equivalent.
    // Parse the minute value from the second part of the split string, also specifying base 10.
    var minuteVal = parseInt(timeParts[1], 10);

    // Calculate the angular position of the hour hand on a 360-degree clock face.
    // The hour hand moves 360 degrees in 12 hours (30 deg/hr), plus an additional movement based on minutes (0.5 deg/min).
    var hourAngle = hourVal * (360.0 / 12.0) + minuteVal * ((360.0 / 12.0) / 60.0);

    // Calculate the angular position of the minute hand.
    // The minute hand moves 360 degrees in 60 minutes (6 deg/min).
    var minuteAngle = minuteVal * (360.0 / 60.0);

    // Determine the absolute difference between the two hand angles.
    var angleDiff = Math.abs(hourAngle - minuteAngle);

    // Adjust the angle difference to always represent the smaller angle between the two hands (0 to 180 degrees).
    angleDiff = Math.min(angleDiff, 360.0 - angleDiff);

    var resultString; // Declare a variable to hold the classification result for the current time.

    // Classify the calculated angle difference into one of three categories: "alert", "safe", or "warning".
    if (angleDiff >= 0.0 && angleDiff < 30.0) {
        resultString = "alert"; // Small angle difference indicates an alert situation.
    } else if (angleDiff >= 90.0 && angleDiff <= 180.0) {
        resultString = "safe"; // A large angle difference (90-180 degrees) indicates a safe situation.
    } else {
        resultString = "warning"; // Any other angle difference falls into the warning category.
    }

    // Output the determined status string to the console for the current test case.
    console.log(resultString);
}

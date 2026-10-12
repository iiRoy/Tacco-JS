var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = (rawData.trim()).split("\n"); // Split input into lines

while (true) {
    // Read the number of entries for the current test case
    var entryCount = lineBuffer.shift() - 0;

    // If N is 0, it's the end of input
    if (entryCount === 0) {
        break;
    }

    var eventList = []; // Array to store start/end events for mass changes

    // Process each entry
    for (var idx = 0; idx < entryCount; idx++) {
        var parsedLine = (lineBuffer.shift()).split(" ").map(Number); // Parse line into numbers
        var massValue = parsedLine[0]; // The mass value
        var startPoint = parsedLine[1]; // Start coordinate
        var endPoint = parsedLine[2]; // End coordinate

        // Add events: mass starts at 'a', mass ends at 'b'
        eventList.push([startPoint, massValue]);
        eventList.push([endPoint - 0.1, -1 * massValue]); // Use 0.1 offset for end point
    }

    // Sort events by coordinate
    eventList.sort(function(eventA, eventB) {
        var coordA = eventA[0];
        var coordB = eventB[0];
        return coordA - coordB; // Ascending order sort
    });

    var statusIndicator = "OK"; // Initial status
    var currentLoad = 0; // Current accumulated mass

    // Iterate through sorted events to check load
    for (var idx = 0; idx < eventList.length; idx++) {
        currentLoad += eventList[idx][1]; // Add or subtract mass
        if (currentLoad > 150) { // Check if load exceeds limit
            statusIndicator = "NG"; // Set status to Not Good
            break; // No need to check further
        }
    }

    console.log(statusIndicator); // Output the result for the current test case
}

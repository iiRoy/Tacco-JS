var rawData = require('fs').readFileSync('/proc/self/fd/0', 'utf8');

/*
 * This script processes timestamped event data from standard input.
 * It identifies events where the time difference between consecutive
 * entries exceeds a configured threshold.
 */
var lineBuffer = (rawData.trim()).split('\n'); // Parse the raw input into lines.

// Continue processing as long as there are lines in the buffer.
while (lineBuffer.length > 0) {

    // Initialize a collection to store the results for the current block of data.
    var outputCollection = [];

    // Extract configuration parameters (N and T) from the first line of the current block.
    // N is the number of subsequent lines, T is the time threshold.
    var configParams = (lineBuffer.shift()).split(' ').map(Number);

    // Loop through N subsequent data lines as specified by the configuration.
    for (var idx = 0; idx < configParams[0]; idx++) {

        // Split the current data line into its constituent parts.
        var currentLineParts = (lineBuffer.shift()).split(' ');

        // Parse the first timestamp (e.g., "HH:MM") into its hour and minute components.
        var firstTimestampComponents = currentLineParts[0].split(':').map(val => Number.parseInt(val, 10));

        // If this is not the very first entry in the current block (i.e., idx > 0),
        // we can perform a time comparison with the previous entry.
        if (idx > 0) {
            // Calculate the total minutes for the current timestamp.
            var firstTotalMinutes = firstTimestampComponents[0] * 60 + firstTimestampComponents[1];
            // Calculate the total minutes for the previously stored timestamp.
            var previousTotalMinutes = previousTimestampComponents[0] * 60 + previousTimestampComponents[1];

            // Check if the time difference exceeds the configured threshold.
            if ((firstTotalMinutes - previousTotalMinutes) >= configParams[1]) {
                // If it does, add the event identifier and the calculated time difference to the results.
                outputCollection.push(eventIdentifier + ' ' + (firstTotalMinutes - previousTotalMinutes));
            }
        }

        // Store the components of the current timestamp as 'previous' for the next iteration's comparison.
        var previousTimestampComponents = currentLineParts[2].split(':').map(val => Number.parseInt(val, 10));
        // Store the event identifier for potential use in the next iteration's output.
        var eventIdentifier = currentLineParts[3];
    }

    // After processing all N lines, determine what to output.
    if (outputCollection.length === 0) {
        // If no events met the specified criteria, simply print '0'.
        console.log(0);
    } else {
        // Otherwise, print the total count of identified events.
        console.log(outputCollection.length);
        // Then, iterate through each identified event and print it on a new line.
        outputCollection.forEach(item => {
            console.log(item);
        });
    }
}
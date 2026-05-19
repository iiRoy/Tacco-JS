var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string: remove leading/trailing whitespace and split into an array of lines.
var lineSegments = (rawData.trim()).split("\n");

// Main processing loop: continues as long as there are lines to process.
while (lineSegments.length !== 0) {
    // Initialize an array to store the results for the current dataset.
    var outcomeList = [];

    // Extract the configuration parameters (N and T) from the first line of the current dataset.
    // N is the number of entries, T is the minimum time difference.
    var configParams = (lineSegments.shift()).split(" ").map(Number);

    // Loop through each entry (N times) as specified by the first parameter.
    for (var idx = 0; idx < configParams[0]; idx++) {
        // Get the current entry line and split it into its constituent parts.
        // Parts typically include start time, some intermediate data, end time, and a name.
        var currentEntryParts = (lineSegments.shift()).split(" ");

        // Parse the start time string (e.g., "HH:MM") into an array of numbers [hour, minute].
        var startMoment = currentEntryParts[0].split(":").map(function(val) {
            return parseInt(val, 10);
        });

        // This conditional block processes entries from the second one onwards (idx > 0).
        // It compares the current entry's start time with the previous entry's end time.
        if (idx > 0) {
            // Calculate the total minutes from midnight for the current entry's start time.
            var currentStartTimeMinutes = startMoment[0] * 60 + startMoment[1];
            // Calculate the total minutes from midnight for the previous entry's end time.
            // Note: 'endMoment' and 'entityName' are defined later in this loop iteration,
            // but 'var' hoisting means they refer to the values from the *previous* iteration here.
            var previousEndTimeMinutes = endMoment[0] * 60 + endMoment[1];

            // Check if the time difference between the current start and previous end is
            // greater than or equal to the threshold 'T'.
            if (currentStartTimeMinutes - previousEndTimeMinutes >= configParams[1]) {
                // If the condition is met, add the previous entity's name and the time difference to the results.
                outcomeList.push(entityName + " " + (currentStartTimeMinutes - previousEndTimeMinutes));
            }
        }

        // Parse the end time string for the *current* entry into an array of numbers [hour, minute].
        var endMoment = currentEntryParts[2].split(":").map(function(val) {
            return parseInt(val, 10);
        });
        // Extract the name for the *current* entry.
        var entityName = currentEntryParts[3];
    }

    // Output the total count of results found for the current dataset.
    console.log(outcomeList.length);

    // Iterate through the collected results and print each one on a new line.
    outcomeList.forEach(function(itemValue) {
        console.log(itemValue);
    });
}

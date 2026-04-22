(function(rawInputData) {
    /* This auxiliary function converts a time string (e.g., "HH:MM")
     * into its total minute representation from midnight.
     * For example, "01:30" becomes 90 minutes.
     */
    var calculateMinutesFromTime = function(timeText) {
        // Split the input string at the colon to get hours and minutes.
        var timeComponents = timeText.split(':');

        // Parse hours and minutes as integers and calculate total minutes.
        return Number.parseInt(timeComponents[0], 10) * 60 +
               Number.parseInt(timeComponents[1], 10);
    };

    // Divide the entire raw input into individual lines.
    var inputLinesArray = rawInputData.split('\n');

    // Extract the first line, split it by space, and retrieve key parameters.
    var firstParsedLine = inputLinesArray.shift().split(' ');

    // The first token represents the total number of entries to process.
    var numberOfEntries = firstParsedLine[0];

    // The second token specifies the minimum required time gap.
    var minimumTimeGap = firstParsedLine[1];

    // Initialize the timestamp of the last processed event.
    // The value 86400 is a placeholder, likely representing a very large time
    // to ensure the first comparison yields a significant difference.
    var lastProcessedTimestamp = 86400;

    // An array to store the results that meet the specified criteria.
    var collectedResults = [];

    // Iterate through each subsequent entry in the input data.
    for (var entryIndex = 0; entryIndex < numberOfEntries; ++entryIndex) {

        // Split the current line into its constituent parts.
        var currentEntryParts = inputLinesArray[entryIndex].split(' ');

        // Calculate the time difference between the current entry's start time
        // and the last recorded timestamp.
        var currentDurationDifference = calculateMinutesFromTime(currentEntryParts[0]) -
                                        lastProcessedTimestamp;

        // Check if the calculated difference is greater than or equal to
        // the minimum required time gap.
        if (currentDurationDifference >= minimumTimeGap) {

            // If the condition is met, add a formatted string
            // (event identifier and the difference) to the results array.
            collectedResults.push(currentEntryParts[1] + ' ' + currentDurationDifference);
        }

        // Update the last processed timestamp to the end time of the current entry.
        lastProcessedTimestamp = calculateMinutesFromTime(currentEntryParts[2]);
    }

    // Output the total count of collected results.
    console.log(collectedResults.length);

    // Iterate through the collected results and print each one on a new line.
    for (var entryIndex = 0; entryIndex < collectedResults.length; ++entryIndex) {
        console.log(collectedResults[entryIndex]);
    }
    // The IIFE is immediately invoked with data read from standard input.
    // 'fs' module is used to read the file, 'readFileSync' for synchronous reading,
    // '/dev/stdin' is the path to standard input, 'utf8' specifies encoding,
    // and 'trim()' removes leading/trailing whitespace.
})( require('fs') .readFileSync('/dev/stdin', 'utf8') .trim() );
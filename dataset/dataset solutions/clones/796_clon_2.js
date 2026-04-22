// This module handles file system operations for reading input.
var sourceText = require('fs') . readFileSync (
    '/dev/stdin',    // Standard input path for competitive programming platforms.
    'utf8'           // Encoding type for the input data.
);

// Split the entire input content into an array of individual lines.
var textRows = sourceText.split('\n');

// Declare a variable to hold the currently processed line, initialized to an empty state.
var currentRecord = null;

// Begin processing each line from the input until no more lines are available.
while ( (currentRecord = textRows.shift()) ) {

    // Convert the current line into an integer, representing the count of items for this scenario.
    var scenarioItemCount = parseInt(currentRecord, 10); // Base 10 for safety.

    // If the parsed number is zero, it signifies the end of input or a termination condition.
    if (scenarioItemCount === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize an array to store pairs of time intervals for the current scenario.
    var intervalPairs = [ ];

    // Loop a specific number of times, determined by 'scenarioItemCount'.
    for (var loopCounter = 0; loopCounter < scenarioItemCount; loopCounter += 1) {
        // Retrieve the next line, which contains time strings.
        currentRecord = textRows.shift();

        // Split the time string by space and convert each part into a Date timestamp.
        var timestampPair = currentRecord
                                .split(' ')
                                .map( function (timePart) {
                                    // Create a Date object using a fixed base date and the time string,
                                    // then convert it to milliseconds timestamp.
                                    return +(new Date('1999-01-01 ' + timePart));
                                }
                            );

        // Add the processed timestamp pair to the collection for this scenario.
        intervalPairs.push(timestampPair);
    }

    // Initialize a variable to keep track of the longest "train" (sequence of overlapping intervals) found.
    var maximumTrainLength = 1;

    // Iterate through each interval in the 'intervalPairs' array as the primary comparison element.
    for (var primaryIndex = 0; primaryIndex < intervalPairs.length; primaryIndex++) {

        // Get the current base interval for comparison.
        var baseInterval = intervalPairs[primaryIndex];

        // Initialize the length of the "train" starting with the 'baseInterval'.
        var currentTrainLength = 1;

        // An array to store the indices of intervals that are found to "overlap" with the base interval
        // in a specific manner, and thus need to be removed or ignored in subsequent checks.
        var removalIndices = [];

        // Iterate through the subsequent intervals to compare with the 'baseInterval'.
        for (var secondaryIndex = primaryIndex + 1; secondaryIndex < intervalPairs.length; secondaryIndex += 1) {

            // Retrieve the interval to be compared against the 'baseInterval'.
            var comparisonInterval = intervalPairs[secondaryIndex];

            // Evaluate the overlap condition:
            // If the base interval's end is before or at the comparison interval's start, OR
            // if the comparison interval's start is before or at the base interval's start,
            // then they do not meet the specific "overlap" criteria for incrementing the train.
            if (baseInterval[1] <= comparisonInterval[0] || comparisonInterval[0] <= baseInterval[0]) {
                // No action needed; these intervals are considered non-overlapping in this context.
            } else {
                // If the above condition is false, it means 'comparisonInterval' starts *within* 'baseInterval'
                // (i.e., baseInterval[0] < comparisonInterval[0] < baseInterval[1]).
                // Mark this interval for removal and increment the current train count.
                removalIndices.push(secondaryIndex);
                currentTrainLength++;
            }
        }

        // Mark the identified overlapping intervals as null to prepare for filtering.
        removalIndices.forEach( function (indexToNullify) {
            intervalPairs[indexToNullify] = null;
        });

        // Filter out all null entries from the 'intervalPairs' array, effectively "removing" them.
        intervalPairs = intervalPairs.filter( function (potentialEntry) { return potentialEntry !== null } );

        // Update the maximum train length found if the current train is longer.
        maximumTrainLength = Math.max(maximumTrainLength, currentTrainLength);
    }

    // Output the calculated maximum train length for the current scenario.
    console.log(maximumTrainLength);
}
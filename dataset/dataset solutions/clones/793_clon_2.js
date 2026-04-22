var dataSource = require('fs').readFileSync('/dev/stdin', 'utf8'); /* Acquire raw input data from standard input path */
var dataRows = dataSource.split('\n'); // Divide the full input into individual lines

var currentRecord = null; // Initialize a variable to hold the currently processed line
while (currentRecord = dataRows.shift()) { // Loop as long as there are lines to process, taking one off the start each time
    var recordQuantity = parseInt(currentRecord); // Convert the current line (expected to be a number) into an integer
    // If the parsed number is zero, it signifies the end of input for this session
    if (recordQuantity === 0) {
        break;
    }

    var intervalList = []; // Initialize an array to store processed time intervals
    // Iterate 'recordQuantity' times to read and parse the time intervals
    for (var outerIndex = 0; outerIndex < recordQuantity; outerIndex++) {
        currentRecord = dataRows.shift(); // Get the next line which contains time points
        // Split the line by spaces, then map each time string to a numeric timestamp
        var spanBounds = currentRecord.split(' ').map(function(momentText) {
            // Convert time string (e.g., "HH:MM") into milliseconds since epoch, assuming a base date
            return +(new Date('2000-01-01 ' + momentText));
        });
        intervalList.push(spanBounds); // Add the parsed interval (start and end timestamps) to our list
    }

    var peakOverlapCount = 1; // Initialize the maximum number of overlapping intervals found so far to 1
    // Loop through each interval in our collected list
    for (var outerIndex = 0; outerIndex < intervalList.length; outerIndex++) {
        var focusInterval = intervalList[outerIndex]; // Get the current interval to compare against
        var activeConcurrency = 1; // Initialize the overlap count for the current 'focusInterval'
        var overlappingIndices = []; // Store indices of intervals that overlap with 'focusInterval'

        // Compare the 'focusInterval' with all subsequent intervals in the list
        for (var innerIndex = outerIndex + 1; innerIndex < intervalList.length; innerIndex++) {
            var candidateInterval = intervalList[innerIndex]; // Get the candidate interval for comparison

            // Check if the two intervals DO NOT overlap
            // An interval [A, B] and [C, D] do not overlap if B <= C (A ends before C starts) OR D <= A (C ends before A starts)
            // The original condition means: (focusInterval[1] <= candidateInterval[0]) OR (candidateInterval[0] <= focusInterval[0])
            // This is the condition for NO OVERLAP.
            // If focusInterval ends before candidateInterval starts, OR candidateInterval starts before focusInterval starts
            if (focusInterval[1] <= candidateInterval[0] || candidateInterval[0] <= focusInterval[0]) {
                // If they do not overlap, no action is needed here for counting concurrent events.
            } else {
                // If they DO overlap, increment the concurrency count and mark the candidate for removal
                overlappingIndices.push(innerIndex);
                activeConcurrency++;
            }
        }

        // After comparing 'focusInterval' with all others, mark the overlapping ones as null
        overlappingIndices.forEach(function(removalIndex) {
            intervalList[removalIndex] = null; // Set the overlapping interval to null
        });

        // Filter out all the null entries (the intervals that overlapped with the current 'focusInterval')
        intervalList = intervalList.filter(function(potentialEntry) { return potentialEntry !== null; });

        // Update the overall maximum concurrency if the current 'activeConcurrency' is greater
        peakOverlapCount = Math.max(peakOverlapCount, activeConcurrency);
    }
    console.log(peakOverlapCount); // Print the maximum number of concurrent events for this set of inputs
}
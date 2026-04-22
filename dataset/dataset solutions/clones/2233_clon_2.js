var sourceData = require('fs') .readFileSync(  '/dev/stdin'  , 'utf8'  );

// Process the raw input string, removing leading/trailing whitespace and splitting into individual lines.
var parsedLines = sourceData
  .trim()
  .split('\n');

/*
 * This section transforms the raw line data into a structured format.
 * It skips the first line (often a count or metadata).
 * Each subsequent line "x y" is converted into an interval [x-y, x+y].
 */
var intervals = parsedLines
  .slice(1)
  .map(segment => segment.split(' ').map(Number))
  .map(segment => [segment[0] - segment[1], segment[0] + segment[1]]);

// Sort the collection of intervals based on their ending points in ascending order.
intervals.sort((itemA, itemB) => itemA[1] - itemB[1]);

// Initialize a list to store the selected non-overlapping intervals, starting with the first one.
var chosenIntervals = [intervals[0]];

// Iterate through the remaining intervals, starting from the second one.
for (var idx = 1; idx < intervals.length; idx++) {
    // Retrieve the last interval that was selected.
    var lastChosenSegment = chosenIntervals[chosenIntervals.length - 1];
    // Extract the ending point of the last selected interval.
    var lastChosenEnd = lastChosenSegment[1];

    // Get the starting point of the current interval under consideration.
    var currentBegin = intervals[idx][0];

    // Check if the current interval's start is after or at the end of the last chosen interval.
    if (lastChosenEnd <= currentBegin) {
        // If they do not overlap, add the current interval to the selected list.
        chosenIntervals.push(intervals[idx]);
    }
}

// Display the total count of non-overlapping intervals that were successfully chosen.
console.log(chosenIntervals.length);
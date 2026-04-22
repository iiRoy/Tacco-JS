var rawSourceContent = require('fs').readFileSync('/dev/stdin', 'utf8'); // Retrieve raw data from standard input stream.

// Process the acquired text: remove leading/trailing whitespace and segment into individual lines.
var processedTextLines = rawSourceContent.trim().split('\n');

// Define a constructor function for an activity period, enhancing data structure clarity.
function ActivityPeriod(beginMoment, endMoment) {
  this.start = beginMoment; // The starting point of the activity.
  this.finish = endMoment; // The finishing point of the activity.
}

var transformedIntervals = []; // Initialize an array to hold the structured activity periods.
var dataLinesToProcess = processedTextLines.slice(1); // Exclude the first line, often a count or header.

// Ensure there are lines to process before attempting transformation.
if (dataLinesToProcess.length > 0) {
  for (var k = 0; k < dataLinesToProcess.length; k++) {
    var currentLineSegment = dataLinesToProcess[k];
    // Split each line by space and convert resultant string parts to numbers.
    var numericParts = currentLineSegment.split(' ').map(function(s) {
      return Number(s);
    });

    // Validate that two valid numbers were successfully parsed from the line.
    if (numericParts.length === 2 && !isNaN(numericParts[0]) && !isNaN(numericParts[1])) {
      var firstVal = numericParts[0]; // Represents initial X coordinate.
      var secondVal = numericParts[1]; // Represents initial Y coordinate.
      // Apply the transformation: [X, Y] becomes [X - Y, X + Y] to define the interval.
      transformedIntervals.push(new ActivityPeriod(firstVal - secondVal, firstVal + secondVal));
    }
  }
}

// Sort the entire collection of activity periods based on their 'finish' attribute in ascending order.
// This sorting is fundamental for the greedy selection algorithm to work correctly.
transformedIntervals.sort(function(itemA, itemB) {
  return itemA.finish - itemB.finish;
});

var optimumActivitySet = []; // This array will store the selected non-overlapping activities.
var finalCount = 0; // A dedicated counter for the number of selected activities.

// Proceed with selection only if there are any intervals to consider.
if (transformedIntervals.length > 0) {
  // According to the greedy strategy, the activity with the earliest finish time is always selected first.
  optimumActivitySet.push(transformedIntervals[0]);
  finalCount = 1; // Increment the count for the initial selection.

  // Keep track of the finish time of the most recently selected activity.
  var lastSelectedActivityFinishTime = transformedIntervals[0].finish;

  // Iterate through the remaining activities, starting from the second one.
  for (var currentIdx = 1; currentIdx < transformedIntervals.length; currentIdx++) {
    var currentActivityCandidate = transformedIntervals[currentIdx]; // The activity currently being evaluated.

    // Check if the current candidate's start time is greater than or equal to
    // the finish time of the last selected activity. If true, they do not overlap.
    if (currentActivityCandidate.start >= lastSelectedActivityFinishTime) {
      optimumActivitySet.push(currentActivityCandidate); // Add this non-overlapping activity to our set.
      finalCount++; // Increment the total count.
      // Update the finish time boundary for subsequent comparisons.
      lastSelectedActivityFinishTime = currentActivityCandidate.finish;
    }
    // If they overlap, the current activity candidate is skipped, and we move to the next.
  }
}

// Output the final count of optimally selected non-overlapping activities.
console.log(finalCount);
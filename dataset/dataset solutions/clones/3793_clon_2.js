/*
 * This JavaScript module processes a sequence of character data.
 * It aims to determine a specific minimal value by segmenting and analyzing the input.
 * The core logic involves iterating through various split points to find an optimal configuration.
 */
var processInputData = function(rawDataString) {
  // Initially, the raw input string is separated into an array of lines.
  var processedLines = rawDataString.split('\n');

  // The first item in the array typically represents a numerical bound or size.
  var totalElements = processedLines.shift();

  // The remaining lines are then concatenated into a single, continuous string for further analysis.
  var combinedContent = processedLines.join();

  var leftSegment;           // Represents the portion of the content before a potential split point.
  var leftSegmentFiltered;   // A modified version of the right segment, used for specific character counts.
  var rightSegment;          // Represents the portion of the content after a potential split point.
  var rightSegmentFiltered;  // A modified version of the left segment, also for specific character counts.

  var currentMismatch;       // Stores the calculated discrepancy for the current iteration.
  var minimumMismatches = 300000; // Initializes the lowest discrepancy found so far with a large default value.

  // A loop iterates through all possible internal division points within the `combinedContent`.
  // The index `iterationIndex` acts as the split point, ranging from 1 up to (but not including) `totalElements`.
  for (var iterationIndex = 1; iterationIndex < totalElements; iterationIndex++) {
    // The `leftSegment` is extracted from the beginning of `combinedContent` up to the current `iterationIndex`.
    leftSegment = combinedContent.slice(0, iterationIndex);
    // The `rightSegment` is extracted from `combinedContent` starting from the character after `iterationIndex`.
    rightSegment = combinedContent.slice(iterationIndex + 1, totalElements);

    // `leftSegmentFiltered` is derived from `rightSegment` by removing all occurrences of 'W'.
    // This implicitly counts the 'E' characters within the `rightSegment`.
    leftSegmentFiltered = rightSegment.split('W').join('');
    // `rightSegmentFiltered` is derived from `leftSegment` by removing all occurrences of 'E'.
    // This implicitly counts the 'W' characters within the `leftSegment`.
    rightSegmentFiltered = leftSegment.split('E').join('');

    // The `currentMismatch` is calculated based on the difference in lengths before and after filtering.
    // It sums the count of 'W's in the `leftSegment` and 'E's in the `rightSegment`.
    currentMismatch = (leftSegment.length - rightSegmentFiltered.length) + (rightSegment.length - leftSegmentFiltered.length);

    // If a perfect match (zero mismatch) is found, it's the optimal solution.
    if (currentMismatch === 0 || currentMismatch === -0) {
      minimumMismatches = 0; // Set the minimum to zero.
      break;                 // Terminate the loop early as no better solution can exist.
    }
    // Otherwise, if the `currentMismatch` is less than the previously recorded `minimumMismatches`.
    else if (currentMismatch < minimumMismatches) {
      minimumMismatches = currentMismatch; // Update the `minimumMismatches`.
    }
  }

  // The final calculated minimum mismatch value is printed to the console.
  console.log(minimumMismatches);

  // The function concludes by returning 0, typically indicating successful execution.
  return 0;
};

// The primary function is invoked with data read from standard input.
// This involves reading the file, decoding it as UTF-8, and trimming any leading/trailing whitespace.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
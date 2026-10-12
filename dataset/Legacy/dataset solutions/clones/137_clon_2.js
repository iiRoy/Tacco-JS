(function(rawInputData) {
  // Process the raw input string: remove trailing newline and split into individual lines.
  var parsedInputLines = rawInputData.replace(/\n$/, '').split('\n');
  // Get the total number of lines to process.
  var totalLines = parsedInputLines.length;

  // Iterate through each line of the input.
  for (var lineIndex = 0; lineIndex < totalLines; lineIndex++) {
    // Extract the current line, parse its comma-separated values into numbers.
    // The `shift()` method removes the first element from the array and returns it,
    // effectively processing lines one by one.
    var numericValues = parsedInputLines.shift().split(',').map(Number);

    // The last two numbers in the array are special values.
    // Pop the last element for the second value.
    var secondValue = numericValues.pop();
    // Pop the new last element for the first value.
    var firstValue = numericValues.pop();

    // Call the helper function to calculate the segment index and print the result.
    console.log(determineSegmentIndex(numericValues, firstValue, secondValue));
  }
})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input.

/**
 * Calculates the index of the segment where an intersection point falls.
 *
 * @param {number[]} segmentLengths - An array of lengths for each segment.
 * @param {number} valueOne - The first weighting value.
 * @param {number} valueTwo - The second weighting value.
 * @returns {number} The 1-based index of the segment where the intersection occurs.
 */
function determineSegmentIndex(segmentLengths, valueOne, valueTwo) {
  // Initialize an array to store cumulative sums of segment lengths.
  var prefixSums = [];
  // Calculate prefix sums for the segment lengths.
  for (var kdx = 0; kdx < segmentLengths.length; kdx++) {
    prefixSums[kdx] = segmentLengths[kdx]; // Current segment length.
    if (kdx > 0) {
      // Add the previous cumulative sum to get the current one.
      prefixSums[kdx] += prefixSums[kdx - 1];
    }
  }

  // Calculate the target position based on the total length and weighting values.
  // This represents a point along the total length determined by the ratio of valueOne to (valueOne + valueTwo).
  var targetPosition = prefixSums[prefixSums.length - 1] * valueOne / (valueOne + valueTwo);

  // Initialize the computed segment index.
  var computedSegment = 1;

  // Iterate through the cumulative sums to find which segment the target position falls into.
  for (kdx = 0; kdx < prefixSums.length; kdx++) {
    // If the target position is greater than the current cumulative sum,
    // it means the point is beyond the end of the current segment.
    if (targetPosition > prefixSums[kdx]) {
      // Update the segment index to the next possible segment (1-based index).
      computedSegment = kdx + 2;
      // Continue to the next iteration to check the subsequent segment.
      continue;
    }
    // If the target position is not greater than the current cumulative sum,
    // it means the point falls within or at the end of the current segment.
    // Return the current segment index (1-based).
    return computedSegment;
  }
}

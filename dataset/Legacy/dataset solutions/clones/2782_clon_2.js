function ProcessInput(rawData) {
  // This function processes raw input data to identify specific numerical patterns.

  // The input string is first split by newline, then the second line is taken,
  // and finally, that line is split by spaces to get an array of string numbers.
  var dataPoints = rawData.split("\n")[1].split(" ");

  // Initialize a counter to keep track of the occurrences of the desired pattern.
  var oscillationCount = 0;

  // Iterate through the array of data points. The loop bounds are carefully chosen
  // to ensure that `idx - 1` and `idx + 1` are always valid indices within the array.
  // This means the loop starts from the second element (index 1) and ends before the last element.
  for (var idx = 0; idx <= (dataPoints.length - 2); idx++) {
    // Check for a specific pattern:
    // Either the sequence is strictly increasing (previous < current < next)
    // OR the sequence is strictly decreasing (previous > current > current).
    // This identifies "peaks" or "valleys" in the data sequence.
    if ((dataPoints[idx - 1] < dataPoints[idx] && dataPoints[idx] < dataPoints[idx + 1]) ||
        (dataPoints[idx - 1] > dataPoints[idx] && dataPoints[idx] > dataPoints[idx + 1])) {
      // If the pattern is detected, increment the counter.
      oscillationCount += 1;
    }
  }

  // Output the final tally of detected patterns to the console.
  console.log(oscillationCount);
}

// Read the entire content of standard input as a UTF-8 string
// and then pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

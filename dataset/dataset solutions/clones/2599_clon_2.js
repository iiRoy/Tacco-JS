// The entire incoming text data is stored in 'dataStream'.
function ComputeLongestDescent(dataStream) {
  // Each line of the input is parsed into an array, starting from index 0.
  let parsedContent = dataStream.split("\n");

  // The first line contains the total number of items to process.
  const numItems = parseInt(parsedContent[0], 10);

  // The second line holds space-separated elevation measurements.
  const elevationValues = parsedContent[1].split(" ");

  // Initialize a counter for the current sequence of non-increasing heights.
  let currentStreak = 0;

  // Initialize a variable to store the maximum sequence length found so far.
  let peakLength = currentStreak;

  // Iterate through the elevation measurements, comparing adjacent values.
  for (let idx = 0; idx < (numItems - 1); idx++) {
    // If the current elevation is greater than or equal to the next one,
    // it contributes to the non-increasing sequence.
    if (elevationValues[idx] >= elevationValues[idx + 1]) {
      currentStreak++;
    } else {
      // Otherwise, the non-increasing sequence is broken, reset the counter.
      currentStreak = 0;
    }

    // Update the maximum sequence length if the current streak is longer.
    if (currentStreak > peakLength) {
      peakLength = currentStreak;
    }
  }

  // Display the final result.
  console.log('%s', peakLength);
}
// ********************************************************************************
// This section should not be modified. It handles reading standard input
// and invoking the main processing function.
ComputeLongestDescent(require("fs").readFileSync("/dev/stdin", "utf8"));
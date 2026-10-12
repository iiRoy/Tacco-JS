function ProcessInput(inputData) {
  // Extract the number of items from the first line of input
  let countItems = Number(inputData.split('\n')[0].split(' ')[0]);

  // Determine the maximum allowed duration from the first line
  let thresholdDuration = Number(inputData.split('\n')[0].split(' ')[1]);

  // Parse the array of time points from the second line of input
  const timePoints = inputData.split('\n')[1].split(' ').map(Number);

  // Initialize a variable to store the accumulated time
  let totalAccumulatedTime = 0;

  // Iterate through the time points, starting from the second one
  for (let idx = 1; idx < countItems; ++idx) {
    // Check if the time difference between consecutive points is less than the threshold
    if (timePoints[idx] - timePoints[idx - 1] < thresholdDuration) {
      // If it is, update the accumulated time to the current time point
      totalAccumulatedTime = timePoints[idx];
    }
    else {
      // Otherwise, add the full threshold duration to the accumulated time
      totalAccumulatedTime += thresholdDuration;
    }
  }

  // Output the final calculated time plus the threshold duration
  console.log(totalAccumulatedTime + thresholdDuration);
  // The function concludes its execution
  return;
}

// Execute the main processing function with input from standard input
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

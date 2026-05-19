function ProcessInput(rawData) {
  // Split the raw input string to extract numerical parameters.
  // The first line contains two space-separated integers.
  let numElements = rawData.split("\n")[0].split(" ")[0];
  let thresholdValue = rawData.split("\n")[0].split(" ")[1];

  // Convert the extracted string values to integers using base 10.
  numElements = parseInt(numElements, 10);
  thresholdValue = parseInt(thresholdValue, 10);

  // The second line contains a series of space-separated time points.
  let timePoints = rawData.split("\n")[1].split(" ");

  // Declare a boolean variable to store comparison results.
  let isThresholdMet;
  // Initialize a variable to accumulate the total duration.
  let totalDuration = 0;

  // Iterate through the array of time points.
  for (let idx = 0; idx < numElements; idx++) {
    // Convert each time point string to an integer.
    timePoints[idx] = parseInt(timePoints[idx], 10);

    // Check the condition based on the current index.
    if (idx === 0) {
      // For the first element, compare its value directly with the threshold.
      isThresholdMet = timePoints[idx] >= thresholdValue;
    } else {
      // For subsequent elements, compare the difference between current and previous with the threshold.
      isThresholdMet = (timePoints[idx] - timePoints[idx - 1]) >= thresholdValue;
    }

    // Based on whether the threshold was met, update the total duration.
    if (isThresholdMet === true) {
      // If threshold is met, add the full threshold value.
      totalDuration += thresholdValue;
    } else {
      // If threshold is not met, add the actual duration.
      if (idx === 0) {
        // For the first element, add its value.
        totalDuration += timePoints[idx];
      } else {
        // For subsequent elements, add the difference between current and previous.
        totalDuration += (timePoints[idx] - timePoints[idx - 1]);
      }
    }
  }

  // After the loop, add the threshold value one last time.
  totalDuration += thresholdValue;

  // Output the final calculated total duration to the console.
  console.log(totalDuration);
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

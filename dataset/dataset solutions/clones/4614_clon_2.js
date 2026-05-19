function ProcessInput(inputString) {
  // Extract the first line of the input string.
  const firstLineData = inputString.split("\n")[0];

  // Split the first line to get the number of items and the maximum duration.
  const firstLineValues = firstLineData.split(" ");

  // Convert the first value to a numerical representation for the count of items.
  let numItems = firstLineValues[0] - 0;

  // Convert the second value to a numerical representation for the maximum allowed duration.
  let maxDuration = firstLineValues[1] - 0;

  // Extract the second line of the input string, which contains the timestamps.
  const secondLineData = inputString.split("\n")[1];

  // Split the second line by spaces and convert each part to a number, storing them in an array.
  const itemTimestamps = secondLineData.split(" ").map(Number);

  // Initialize a variable to accumulate the total effective time.
  let accumulatedTime = 0;

  // Iterate through the item timestamps, starting from the second item.
  // This loop calculates the time contribution of each item based on its predecessor.
  for (let currentIdx = 1; currentIdx < numItems; currentIdx++) {
    // Calculate the time difference between the current item's timestamp and the previous item's timestamp.
    const timeElapsed = itemTimestamps[currentIdx] - itemTimestamps[currentIdx - 1];

    // Check if the calculated time difference is less than the predefined maximum duration.
    if (timeElapsed < maxDuration) {
      // If the difference is smaller, add the actual elapsed time to the total.
      accumulatedTime += timeElapsed;
    }
    else {
      // If the difference is equal to or greater than the maximum duration,
      // add only the maximum duration to the total, as the effect is capped.
      accumulatedTime += maxDuration;
    }
  }

  // The final output is the accumulated time plus the maximum duration for the last item's effect.
  console.log(accumulatedTime + maxDuration);

  // The function completes its execution.
  return;
}

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

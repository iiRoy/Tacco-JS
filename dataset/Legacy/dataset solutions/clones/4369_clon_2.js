'use strict';

// This function processes the raw input data to calculate a specific count.
function ProcessInput(rawData) {
  // Split the entire input string into an array of individual lines.
  const linesOfText = rawData.split('\r\n');

  // The first line is usually a count or metadata, so we skip it
  // and take the rest of the lines as our actual data points.
  const dataPoints = linesOfText.slice(1);

  // An object to keep track of the presence/absence of each data point.
  // It acts like a set, but stores boolean flags.
  const itemTracker = {};

  // A counter for the number of unique items currently "active" or "present".
  let distinctCount = 0;

  // Iterate over each data point using the map method.
  // The map method is used here for its side effects (modifying itemTracker and distinctCount),
  // not for its return value.
  dataPoints.map(currentValue => {
    // Check if the current data point has been encountered before and is currently "active".
    if (itemTracker[currentValue] === true) {
      // If it was active, mark it as inactive (effectively removing it from the "set").
      itemTracker[currentValue] = false;
      // Decrement the count of active unique items.
      distinctCount -= 1;
    } else {
      // If it was not active (either never seen or previously marked inactive),
      // mark it as active (adding it to the "set").
      itemTracker[currentValue] = true;
      // Increment the count of active unique items.
      distinctCount += 1;
    }
  });

  // Output the final calculated count of distinct active items.
  console.log(distinctCount);
}

// Read the input from standard input and pass it to the processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

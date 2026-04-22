function ProcessInputData(rawDataStream) {
  // Initialize the running total for the first metric.
  let cumulativeTimeValue = 0;
  // Initialize the running total for the second metric.
  let cumulativeAmountValue = 0;

  // Split the entire input string into an array of individual lines.
  const dataLines = rawDataStream.split("\n");

  // The very first line of the input indicates the total count of subsequent data entries.
  const entryCount = Number(dataLines[0]);

  // Output the determined number of data entries to the console.
  console.log(entryCount);

  // Loop through each data entry, starting from the second line (index 1).
  for (let currentLineIdx = 1; currentLineIdx <= entryCount; currentLineIdx++) {
    // Parse the current line, splitting it by space to get the two numeric components.
    const splitLineData = dataLines[currentLineIdx].split(" ");

    // Extract the first component and convert it to a number.
    const currentMetric1 = splitLineData[0] * 1;
    // Extract the second component and convert it to a number.
    const currentMetric2 = splitLineData[1] * 1;

    // Check if both current metrics are greater than or equal to their respective cumulative totals.
    if ((cumulativeTimeValue <= currentMetric1) && (cumulativeAmountValue <= currentMetric2)) {
      // If they are, simply update the cumulative totals with the current metrics.
      cumulativeTimeValue = currentMetric1;
      cumulativeAmountValue = currentMetric2;
    } else {
      // If not, calculate the necessary scaling ratios for both metrics.
      const ratioForMetric1 = cumulativeTimeValue / currentMetric1;
      const ratioForMetric2 = cumulativeAmountValue / currentMetric2;

      // Determine the largest ceiling ratio to ensure both cumulative values are met or exceeded.
      const requiredScalingFactor = Math.ceil(Math.max(ratioForMetric1, ratioForMetric2));

      // Apply the calculated scaling factor to the current metrics and update the cumulative totals.
      cumulativeTimeValue = currentMetric1 * requiredScalingFactor;
      cumulativeAmountValue = currentMetric2 * requiredScalingFactor;
    }
  }

  // Print the final summation of the two cumulative values, followed by a newline character.
  console.log(cumulativeTimeValue + cumulativeAmountValue + "\n");
}

// This section is responsible for reading input from standard I/O and invoking the main processing function.
// Please refrain from altering the code below this line to maintain proper execution in the environment.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
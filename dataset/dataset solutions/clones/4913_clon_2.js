/*
 * This module is designed to process a series of numerical inputs
 * to calculate a final sum based on iterative adjustments.
 * It simulates a process where two values (e.g., approval and total)
 * are updated based on ratios provided in each input line.
 */
function ProcessInput(rawData) {
  // Normalize the incoming raw text data:
  // 1. Remove leading/trailing whitespace.
  // 2. Split into individual lines based on newline characters.
  let processedLines = rawData
    .trim()
    .split('\n');

  // The first line contains the count of subsequent data entries.
  const numEntries = parseInt(processedLines[0], 10);

  // Initialize our two primary accumulators.
  // These represent the current state of 'approval' and 'total' counts.
  let currentApproval = 1;
  let currentTotal = 1;

  // Iterate through each data entry from the second line onwards.
  // The loop runs 'numEntries' times, starting from the first actual data line.
  for (let idx = 1; idx <= numEntries; idx++) {
    // For each data line:
    // 1. Split the line by space to get two ratio components.
    // 2. Convert each component from string to integer.
    const currentLineParts = processedLines[idx]
      .split(' ')
      .map((strVal) => parseInt(strVal, 10));

    // Extract the individual ratio components for the current iteration.
    const lineTotalRatio = currentLineParts[0];
    const lineApprovalRatio = currentLineParts[1];

    // Determine the minimum multiplier required to satisfy both ratios.
    // We need to find 'k' such that 'currentTotal * k' is a multiple of 'lineTotalRatio'
    // AND 'currentApproval * k' is a multiple of 'lineApprovalRatio'.
    // This is effectively finding the smallest 'k' such that
    // (currentTotal / lineTotalRatio) <= k and (currentApproval / lineApprovalRatio) <= k.
    // Math.ceil ensures we get an integer multiplier that meets or exceeds the ratio.
    const multiplier = Math.max(
      Math.ceil(currentTotal / lineTotalRatio),
      Math.ceil(currentApproval / lineApprovalRatio)
    );

    // Update the accumulators based on the calculated multiplier and current ratios.
    currentTotal = lineTotalRatio * multiplier;
    currentApproval = lineApprovalRatio * multiplier;
  }

  // After processing all entries, output the sum of the final accumulator values.
  console.info(currentApproval + currentTotal);
}

// Execute the main processing function.
// It reads standard input from the file system and passes it as raw text.
ProcessInput(require('node:fs').readFileSync('/proc/self/fd/0', 'utf-8'));
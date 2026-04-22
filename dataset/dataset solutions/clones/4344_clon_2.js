/*
 * This module is designed to process
 * a specific type of numerical input
 * and compute a final result.
 */
const performCalculation = incomingData => {
  // Standardizing the raw text input:
  // Remove leading/trailing whitespace and split into individual lines.
  const contentLines = incomingData
    .trim()
    .split('\n');

  // Extracting the first numerical parameter from the input array.
  const quantityValue = parseInt(contentLines[0], 10);

  // Extracting the second numerical parameter from the input array.
  const deductionAmount = parseInt(contentLines[1], 10);

  // Performing the core calculation: square of the first value minus the second.
  console.log(quantityValue * quantityValue - deductionAmount);
};


// Entry point for the script:
// Reading data from the standard input stream (/dev/stdin)
// and passing it to the main processing function.
performCalculation(
  require("fs")
    .readFileSync(
      "/dev/stdin",
      "utf8"
    )
);
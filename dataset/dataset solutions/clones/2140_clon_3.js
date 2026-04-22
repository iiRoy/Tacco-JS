// Function to analyze a set of numerical data to find an optimal central value
function AnalyzeNumberSet(sourceContent) {
  // Enforce strict parsing and execution rules.
  "use strict";

  // --- Input Acquisition and Initial Validation ---
  // Break the entire raw input string into an array of individual lines.
  const inputLines = sourceContent.split("\n");

  // A basic check to ensure we have enough input lines to proceed.
  // The problem expects at least two lines: one for count (unused here) and one for data.
  if (inputLines.length < 2) {
    console.error("Input malformed: Expected at least two lines of data.");
    return; // Terminate processing early for invalid input.
  }

  // The first line of input often contains a count of elements, but it is not
  // utilized in the core logic of this particular algorithm, so we skip parsing it.
  // In the original, this was 'n' and it was unused. By not parsing it, we delete that part.

  // The second line contains the space-separated numerical data points.
  const dataString = inputLines[1];

  // Convert the string of numbers into an array of integers.
  // Each segment is converted, and if a segment isn't a valid number, parseInt will yield NaN.
  const numericalSequence = dataString.split(" ").map(segment => {
    const parsedNumber = parseInt(segment, 10);
    // In a robust application, further NaN checks or error handling might be placed here.
    // For this problem, we assume valid integer input segments.
    return parsedNumber;
  });

  // If, after parsing, no valid data points were found, the deviation is trivially zero.
  if (numericalSequence.length === 0) {
    console.log(0);
    return;
  }

  // --- Core Calculation: Determining the Minimum Sum of Squared Deviations ---

  // Initialize the variable to store the lowest sum of squared differences found so far.
  // Using MAX_SAFE_INTEGER ensures any valid sum will be smaller.
  let minimumDeviationCost = Number.MAX_SAFE_INTEGER;

  // Define the boundaries for the potential target values.
  const OPTIMIZATION_RANGE_START = 1;
  const OPTIMIZATION_RANGE_END = 100;

  // Helper function to compute the squared difference between a data point and a target.
  const calculateSquaredDifference = (dataPoint, target) => {
    const difference = dataPoint - target;
    return difference * difference;
  };

  // Iterate through each candidate integer within the defined range (e.g., 1 to 100).
  for (let candidateTarget = OPTIMIZATION_RANGE_START; candidateTarget <= OPTIMIZATION_RANGE_END; candidateTarget++) {
    let currentIterationPenalty = 0; // Accumulator for the current candidate's total penalty.

    // Calculate the sum of squared differences for all data points against the current candidate.
    // This uses a traditional loop instead of the `reduce` method, demonstrating an alternative summation approach.
    for (let k = 0; k < numericalSequence.length; k++) {
      const currentDataValue = numericalSequence[k];
      currentIterationPenalty += calculateSquaredDifference(currentDataValue, candidateTarget);
    }

    // Compare the current candidate's total penalty with the overall minimum found so far.
    // If the current penalty is lower, update the minimum.
    if (currentIterationPenalty < minimumDeviationCost) {
      minimumDeviationCost = currentIterationPenalty;
    }
  }

  // --- Output the Result ---
  // Print the final calculated minimum sum of squared deviations.
  console.log(minimumDeviationCost);
}

// --- Standard Execution Wrapper (Do Not Modify) ---
// This block handles reading input from stdin and passing it to the main function.
// It is typically provided in competitive programming environments and should remain untouched.
AnalyzeNumberSet(require("fs").readFileSync("/dev/stdin", "utf8"));
/**
 * Processes a raw input string to calculate a specific sum based on numerical frequencies.
 * The calculation involves iterating through numbers from 0 up to the maximum value found in the sequence.
 * For each number 'X', it determines its frequency 'F' in the sequence.
 * If F < X, F is added to the total sum.
 * If F > X, (F - X) is added to the total sum.
 * If F = X, nothing is added.
 *
 * @param {string} rawInputString - The multi-line string input, where the second line
 *                                   contains space-separated integers.
 */
function ProcessInputData(rawInputString) {
  // Split the entire input into individual lines.
  const inputLines = rawInputString.split('\n');

  // Basic validation: ensure there's at least a second line for numerical data.
  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines provided for processing.");
    return; // Exit if input is malformed.
  }

  // Extract the line containing the numbers and parse them into an array of integers.
  // Using Number() for parsing, which is a concise alternative to parseInt(str, 10).
  // Trim each string to handle potential leading/trailing spaces robustly.
  const numericalDataPoints = inputLines[1].split(' ').map(str => Number(str.trim()));

  // Further validation: ensure the parsed array is not empty after potential empty strings are handled.
  if (numericalDataPoints.length === 0) {
    console.log(0); // If no numbers are present, the computed sum is trivially 0.
    return;
  }

  // Pre-calculate the frequency of each number to optimize lookups later.
  // This avoids repeated filtering or iterating over the main array within the loop.
  const frequencyMap = new Map();
  for (const dataValue of numericalDataPoints) {
    // Increment the count for the current dataValue, defaulting to 0 if not yet present.
    frequencyMap.set(dataValue, (frequencyMap.get(dataValue) || 0) + 1);
  }

  // Determine the highest numerical value present in the data points.
  // This defines the upper bound for our iteration, ensuring all relevant numbers are covered.
  const maximumValueObserved = Math.max(...numericalDataPoints);

  // Initialize the accumulator for the final computed sum.
  let cumulativeResult = 0;

  // Iterate from 0 up to and including the maximum observed value.
  // For each iteration value, apply the specific counting logic derived from the problem.
  for (let currentIterationValue = 0; currentIterationValue <= maximumValueObserved; ++currentIterationValue) {
    // Retrieve the frequency of the current iteration value from the pre-computed map.
    // Default to 0 if the value is not found in the map (i.e., not present in the original input data).
    const currentFrequency = frequencyMap.get(currentIterationValue) || 0;

    // Apply the core logic using a ternary operator for conciseness:
    // If the frequency is strictly less than the iteration value, add the frequency itself to the total.
    // Otherwise (if frequency is greater than or equal to the iteration value),
    // add the positive difference (frequency - iteration value). Math.max ensures non-negative addition.
    // If frequency equals iteration value, Math.max(0, 0) results in 0, which correctly adds nothing.
    cumulativeResult += (currentFrequency < currentIterationValue)
      ? currentFrequency
      : Math.max(0, currentFrequency - currentIterationValue);
  }

  // Output the final calculated sum to the console.
  console.log(cumulativeResult);
}

// Entry point for execution: Reads input from standard input and passes it to the processing function.
// This standard setup is common for competitive programming environments (e.g., /dev/stdin).
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
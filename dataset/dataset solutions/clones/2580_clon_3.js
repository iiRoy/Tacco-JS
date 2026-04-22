/**
 * Orchestrates the entire process of reading input, parsing data,
 * performing a specific numerical transformation, and outputting the result.
 * This function serves as the primary entry point for the application's logic.
 *
 * @param {string} rawDataString - A multi-line string containing all the raw input data.
 *                                 Expected format: first line (unused config), second line (space-separated numbers).
 * @returns {void} - The computed sum is written directly to standard output as a string.
 */
const processInputData = (rawDataString) => {
  // Step 1: Initial parsing of the raw input string into individual lines.
  // This prepares the data for more specific extraction and type conversion.
  const dataLines = rawDataString.split('\n');

  // Input validation: Ensure a minimum number of lines are present for proper processing.
  // The original code implicitly assumes at least two lines.
  const MINIMUM_EXPECTED_LINES = 2;
  if (dataLines.length < MINIMUM_EXPECTED_LINES) {
    console.error("Execution Error: Insufficient input lines detected. Expected at least " + MINIMUM_EXPECTED_LINES + " lines.");
    // Terminate the process to indicate a critical input failure.
    process.exit(1);
  }

  // The first line of input was originally read but not utilized in the core calculation.
  // We omit its parsing here as it's non-essential to the final result,
  // demonstrating a deletion of unused code fragments (Type III change).
  // const initialConfigurationValue = parseFloat(dataLines[0].split(' ')[0]); // This part is now removed.

  // Step 2: Parse the second line of input, which contains the sequence of measurement values.
  // Each space-separated token is converted into a floating-point number.
  let numericalMeasurements = dataLines[1].split(' ').map(valueToken => {
    // Attempt to parse each token. If parsing fails, parseFloat returns NaN.
    const parsedNumber = parseFloat(valueToken);
    // Optional: Add a check for NaN if robust error handling for individual numbers is needed.
    // if (isNaN(parsedNumber)) { /* handle invalid number */ }
    return parsedNumber;
  });

  // Additional validation: Check if any numerical measurements were successfully parsed.
  if (numericalMeasurements.length === 0) {
    console.error("Execution Error: No valid numerical measurements found in the data line.");
    process.exit(1);
  }

  // Helper function: Calculates the minimum of two given numeric values.
  // Encapsulating this common operation improves readability (Type III addition).
  const findSmallerValue = (firstNum, secondNum) => Math.min(firstNum, secondNum);

  // Step 3: Data transformation - "Pad" the array of measurements.
  // The original array [b1, b2, b3] is transformed into [b1, b1, b2, b3, b3].
  // This ensures that the first and last elements are considered twice in the pairwise sum.
  const initialMeasurement = numericalMeasurements[0];
  const finalMeasurement = numericalMeasurements[numericalMeasurements.length - 1];

  // Using the spread syntax for a clear and concise array construction (Type III update).
  const paddedMeasurements = [initialMeasurement, ...numericalMeasurements, finalMeasurement];

  // Step 4: Calculate the aggregated sum of minimums between adjacent elements.
  // Initialize an accumulator for the total sum. Using 0.0 emphasizes floating-point arithmetic.
  let aggregatedMinimumSum = 0.0;

  // Iterate through the padded array, comparing each element with its successor.
  // A standard 'for' loop is used here as an alternative to 'reduce' (Type III update),
  // providing explicit control over indices and potentially clearer logic for some.
  for (let i = 0; i < paddedMeasurements.length - 1; i++) {
    const currentObservation = paddedMeasurements[i];
    const nextObservation = paddedMeasurements[i + 1];

    // Add the minimum of the current pair to the running total.
    aggregatedMinimumSum += findSmallerValue(currentObservation, nextObservation);
  }

  // Step 5: Output the final calculated sum to the standard output stream.
  // Explicitly converting the number to a string for process.stdout.write (Type III update).
  process.stdout.write(aggregatedMinimumSum.toString());
};

// Main execution block: This section handles reading the input from standard I/O
// and invoking the primary data processing function.
try {
  // Dynamically import the 'fs' module for file system operations.
  const fileSystemModule = require('fs');
  // Define the standard input path, typically '/dev/stdin' on Unix-like systems.
  const standardInputSource = '/dev/stdin';
  // Specify the character encoding for reading the input file.
  const inputCharset = 'utf8';

  // Synchronously read the entire content of standard input.
  // This operation blocks until all input is available.
  const rawContentFromStdin = fileSystemModule.readFileSync(standardInputSource, inputCharset);

  // Invoke the main processing function with the obtained raw input.
  processInputData(rawContentFromStdin);

} catch (executionError) {
  // Catch and report any errors that occur during the file reading or data processing.
  // This provides robustness and better diagnostics (Type III addition).
  console.error("A critical error occurred during program execution:", executionError.message);
  // Exit the process with a non-zero status code to signal an error.
  process.exit(1);
}
'use strict';

// This function is designed to process a raw string input,
// extract numerical data, perform specific calculations,
// and output the final derived value.
function processInputData(rawDataString) {
  // Input validation: Ensure the provided string is not empty or just whitespace.
  // If the input is invalid, an error message is logged, and NaN is returned
  // to signify an uncomputable result.
  if (!rawDataString || rawDataString.trim().length === 0) {
    console.error("Error: The provided input string is empty or contains only whitespace.");
    return NaN;
  }

  // Step 1: Parse the input string to extract numerical components.
  // The first line of the input is taken, split by spaces, and empty strings
  // (which can result from multiple spaces) are filtered out.
  const firstDataLine = rawDataString.trim().split('\n')[0];
  const stringSegments = firstDataLine.split(' ').filter(segment => segment.length > 0);

  // Step 2: Convert the string segments into an array of floating-point numbers.
  // Robustly handles non-numeric segments by logging a warning and defaulting to 0,
  // or by returning NaN if strict parsing is preferred. Here, we default to 0
  // to allow the calculation to proceed with valid numbers.
  const numericalSequence = stringSegments.map(segment => {
    const parsedValue = parseFloat(segment);
    if (isNaN(parsedValue)) {
      console.warn(`Warning: Encountered non-numeric input segment '${segment}'. Treating it as 0.`);
      return 0;
    }
    return parsedValue;
  });

  // Input validation: Check if any valid numerical data points were successfully parsed.
  if (numericalSequence.length === 0) {
    console.error("Error: No valid numerical data points could be extracted from the input.");
    return NaN;
  }

  // Step 3: Compute the sum of all numerical values in the sequence.
  // The 'reduce' method is used for aggregation, starting with an initial sum of zero.
  const aggregateSummation = numericalSequence.reduce((totalAccumulator, currentElement) => totalAccumulator + currentElement, 0);

  // Step 4: Determine the largest value within the numerical sequence.
  // The spread operator (...) is used with Math.max to find the maximum efficiently.
  const largestElementValue = Math.max(...numericalSequence);

  // Step 5: Scale the largest value by a factor of three.
  // This intermediate value will be used in subsequent parity checks and final calculation.
  let tripledLargestValue = largestElementValue * 3;

  // Step 6: Parity Check and Adjustment.
  // The problem requires that the difference between `tripledLargestValue` and `aggregateSummation`
  // must be an even number before division by two.
  // If their parities (even/odd) are different, `tripledLargestValue` is adjusted by adding 3.
  // This operation ensures that `(tripledLargestValue - aggregateSummation)` will always be even.
  // Example: if sum is odd and max*3 is even, adding 3 to max*3 makes it odd, so (odd - odd) is even.
  // Example: if sum is even and max*3 is odd, adding 3 to max*3 makes it even, so (even - even) is even.
  const sumParity = aggregateSummation % 2;
  const tripledMaxParity = tripledLargestValue % 2;

  if (sumParity !== tripledMaxParity) {
    tripledLargestValue += 3; // Adjust to align parities.
  }

  // Step 7: Final Calculation.
  // The ultimate result is derived by subtracting the aggregate sum from the adjusted
  // tripled largest value, and then dividing the difference by two.
  const finalComputedOutcome = (tripledLargestValue - aggregateSummation) / 2;

  // Output the final result to the standard console.
  console.log(finalComputedOutcome);

  // The function also returns the computed outcome, allowing it to be used
  // programmatically if called from another part of the application.
  return finalComputedOutcome;
}

// --- Main Execution Block ---
// This section handles reading input from the file system and invoking the processing logic.
try {
  // Attempt to read the entire content of the standard input file.
  // '/dev/stdin' is a common path for standard input in UNIX-like environments.
  const inputPayload = require("fs").readFileSync("/dev/stdin", "utf8");

  // Call the main processing function with the content obtained from the input file.
  processInputData(inputPayload);
} catch (ioError) {
  // Catch and report any errors that occur during file reading or initial processing.
  console.error("An unrecoverable error occurred during input file handling or initial processing:", ioError.message);
  // In a production environment, you might want to exit with a non-zero status code.
  // process.exit(1);
}
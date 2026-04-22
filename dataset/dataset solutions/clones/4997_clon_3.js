// This function processes raw input data to perform specific calculations.
function ProcessInputData(rawDataString) {
  // Input validation: Ensure rawDataString is not empty or null.
  if (!rawDataString || typeof rawDataString !== 'string') {
    console.error("Error: Invalid or empty input provided for processing.");
    return; // Early exit due to invalid input
  }

  // Split the entire input string into individual lines based on newline characters.
  const parsedLines = rawDataString.split("\n");

  // Basic check for the minimum expected number of lines in the input.
  if (parsedLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least two distinct lines of data.");
    return;
  }

  // Extract and parse the numerical parameters from the first line of input.
  // The first line is expected to contain two space-separated integers.
  const firstLineParts = parsedLines[0].split(" ");

  // Validate that the first line contains the expected number of parts.
  if (firstLineParts.length < 2) {
    console.error("Error: The first line does not contain the required two numerical parameters.");
    return;
  }

  // Parse the first integer as the total count of elements for subsequent operations.
  const totalElements = parseInt(firstLineParts[0], 10);
  // Parse the second integer as the target reference value used in comparisons.
  const referenceNumber = parseInt(firstLineParts[1], 10);

  // Validate that the parsed numbers are actually valid integers.
  if (isNaN(totalElements) || isNaN(referenceNumber)) {
    console.error("Error: Failed to parse numerical parameters from the first line; received non-numeric values.");
    return;
  }

  // Extract and parse the second line into an array of numbers.
  // This line represents a sequence of space-separated integers.
  const numericSequence = parsedLines[1].split(" ").map(entry => parseInt(entry, 10));

  // Perform a consistency check on the length of the parsed numeric sequence
  // against the expected totalElements value.
  if (numericSequence.length < totalElements) {
      console.warn(`Warning: Expected ${totalElements} elements as per first line, but found only ${numericSequence.length} in the sequence. Processing with available data.`);
  }
  // Ensure that all elements within the numeric sequence are valid numbers.
  if (numericSequence.some(isNaN)) {
      console.error("Error: One or more elements within the provided numeric sequence are not valid numbers.");
      return;
  }


  // Initialize a counter to accumulate the number of times specific conditions are met.
  let matchingOccurrences = 0;

  // --- Phase 1: Count direct matches of the reference number within the sequence ---
  // Iterate through each element of the numeric sequence.
  for (let currentIdx = 0; currentIdx < totalElements; ++currentIdx) {
    // Use Object.is for robust equality checking, which behaves like === for numbers.
    if (Object.is(referenceNumber, numericSequence[currentIdx])) {
      matchingOccurrences++; // Increment the counter if a direct match is found.
    }
  }

  // --- Phase 2: Evaluate a complex condition using three nested loops ---
  // This section proceeds only if there are actual elements to process.
  if (totalElements > 0) {
    // The outermost loop iterates over a primary index.
    for (let primaryIdx = 0; primaryIdx < totalElements; ++primaryIdx) {
      // The middle loop iterates over a secondary index.
      for (let secondaryIdx = 0; secondaryIdx < totalElements; ++secondaryIdx) {
        // The innermost loop iterates over a tertiary index.
        for (let tertiaryIdx = 0; tertiaryIdx < totalElements; ++tertiaryIdx) {

          // Calculate several intermediate values to simplify the main comparison.
          // These correspond to (i+2) and (i+1) from the original problem.
          const factorOne = primaryIdx + 2;
          const factorTwo = primaryIdx + 1;

          // Calculate the sum of two elements from the numeric sequence, indexed by tertiary and secondary.
          const sumOfElements = numericSequence[tertiaryIdx] + numericSequence[secondaryIdx];

          // Compute the left side of the equality check.
          const leftSideProduct = factorOne * referenceNumber;
          // Compute the right side of the equality check.
          const rightSideProduct = sumOfElements * factorTwo;

          // If the computed products are equal, increment the total counter.
          if (leftSideProduct === rightSideProduct) {
            matchingOccurrences++;
          }
        }
      }
    }
  }
  // If totalElements is zero or negative, the nested loops are simply skipped.

  // Display the final calculated count of all matching occurrences.
  // A template literal is used for a more descriptive and readable output message.
  console.log(`Final tally of specific occurrences computed: ${matchingOccurrences}`);
}

// --- Execution Entry Point ---
// This block handles reading input from standard input and invoking the main processing function.
try {
  // Read the entire content of the standard input file synchronously, encoded as UTF-8.
  const rawFileContent = require("fs").readFileSync("/dev/stdin", "utf8");
  // Pass the raw content to our primary function for processing.
  ProcessInputData(rawFileContent);
} catch (error) {
  // Catch and report any errors that occur during the file reading or initial function call.
  console.error(`An unexpected error occurred during input file processing or function execution: ${error.message}`);
}
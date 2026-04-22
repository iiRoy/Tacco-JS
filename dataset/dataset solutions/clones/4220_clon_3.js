// This JavaScript module is designed to compute the N-th element of a specific numerical sequence.
// The sequence is a variant of the Fibonacci series, defined by the following rules:
// F(0) = 2
// F(1) = 1
// F(k) = F(k-1) + F(k-2) for any k > 1
// This implementation utilizes BigInt to ensure accurate calculations for very large sequence numbers.

/**
 * Computes and displays the term at a specified index for a modified Fibonacci sequence.
 * The sequence begins with F(0)=2, F(1)=1, and subsequent terms are the sum of the two preceding ones.
 * Input validation is performed for the sequence index.
 *
 * @param {string} rawInputPayload A string containing the sequence index on its first line.
 * @returns {void} The computed term is printed to standard output. Error messages are printed to standard error.
 */
function determineSequenceElement(rawInputPayload) {
  // --- Input Preparation and Sanitization ---
  // Remove leading/trailing whitespace and split the input into individual lines.
  const trimmedPayload = rawInputPayload.trim();
  const payloadLines = trimmedPayload.split('\n');

  // Parse the first line of input to obtain the desired sequence index.
  const requestedIndex = parseInt(payloadLines[0], 10);

  // --- Robust Input Validation ---
  // Check if the parsed input is a valid number.
  if (isNaN(requestedIndex)) {
    console.error("Input Error: The provided value is not a valid number. Please supply a numeric index.");
    return;
  }
  // Ensure the input is an integer, as sequence indices are typically whole numbers.
  if (!Number.isInteger(requestedIndex)) {
    console.error("Input Error: The sequence index must be an integer value.");
    return;
  }
  // Validate that the index is non-negative, as the sequence is defined for 0 and positive integers.
  if (requestedIndex < 0) {
    console.error("Input Error: A negative index is not supported for this sequence calculation.");
    return;
  }

  // --- Sequence Term Calculation Logic ---
  let finalCalculatedValue; // This variable will store the resulting sequence term.

  // Handle the initial, explicitly defined base cases for the sequence.
  if (requestedIndex === 0) {
    finalCalculatedValue = 2n; // F(0) is 2, represented as a BigInt.
  } else if (requestedIndex === 1) {
    finalCalculatedValue = 1n; // F(1) is 1, represented as a BigInt.
  } else {
    // For indices greater than 1, compute the term iteratively.
    // Initialize the two preceding terms needed for the recurrence relation.
    // 'termBeforePrevious' holds F(k-2)
    // 'currentTermValue' holds F(k-1)
    let termBeforePrevious = 2n; // Corresponds to F(0)
    let currentTermValue = 1n;   // Corresponds to F(1)
    let nextComputedTerm = 0n;   // Placeholder for F(k)

    // Iterate from the second term (index 2) up to the requested index.
    for (let currentIterationStep = 2; currentIterationStep <= requestedIndex; ++currentIterationStep) {
      // Calculate the next term in the sequence.
      nextComputedTerm = termBeforePrevious + currentTermValue;

      // Shift the terms for the next iteration:
      // The 'currentTermValue' becomes the 'termBeforePrevious'.
      termBeforePrevious = currentTermValue;
      // The newly computed term becomes the 'currentTermValue'.
      currentTermValue = nextComputedTerm;
    }
    // After the loop completes, 'nextComputedTerm' holds the value for the requestedIndex.
    finalCalculatedValue = nextComputedTerm;
  }

  // --- Output the Final Result ---
  // Print the calculated sequence term to standard output.
  // BigInt values are automatically converted to their string representation by console.log.
  console.log(finalCalculatedValue);
}

// --- Entry Point for Script Execution ---
// This block handles reading input from standard input and invoking the main calculation function.
try {
  // Define a utility function to encapsulate the standard input reading process.
  const acquireStandardInputData = () => {
    // Use Node.js's file system module to read data from /dev/stdin.
    // Ensure the input is decoded as UTF-8.
    return require("node:fs").readFileSync("/dev/stdin", "utf8");
  };

  // Obtain the raw input string from standard input.
  const receivedInputData = acquireStandardInputData();

  // Execute the primary function to determine and output the sequence element.
  determineSequenceElement(receivedInputData);
} catch (inputOutputError) {
  // Catch and report any errors that occur during the standard input reading process.
  console.error("I/O System Error: Failed to retrieve input from /dev/stdin.", inputOutputError.message);
  // Exit the process with a non-zero status code to indicate an error.
  process.exit(1);
}
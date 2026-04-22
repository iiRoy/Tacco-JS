function analyzeTriples(rawInputText) {
  // Normalize and split the raw input string into an array of lines.
  // Trimming removes leading/trailing whitespace from the entire input,
  // and filtering ensures we don't process empty lines.
  const inputLines = rawInputText.trim().split('\n').filter(lineContent => lineContent.length > 0);

  // --- Input Validation and Pre-processing ---

  // Ensure there are enough lines to extract all necessary data (N + 3 arrays).
  if (inputLines.length < 4) {
    // If input is malformed, output 0 as a default or handle error.
    // For this clone, we'll output 0 for consistency with potential empty/invalid scenarios.
    console.log("0");
    return;
  }

  // Parse the first line to determine the expected number of elements in each subsequent array.
  // Using parseInt with radix 10 for explicit base.
  const totalElements = parseInt(inputLines[0].trim(), 10);

  // Validate the parsed element count. If it's not a number or is non-positive,
  // there are no valid triplets possible.
  if (isNaN(totalElements) || totalElements <= 0) {
    console.log("0"); // Output 0 and exit early.
    return;
  }

  // Convert the string representations of the number arrays into actual number arrays.
  // The `map(Number)` function is used for concise type conversion.
  const setAlphaValues = inputLines[1].split(' ').map(Number);
  const setBetaValues = inputLines[2].split(' ').map(Number);
  const setGammaValues = inputLines[3].split(' ').map(Number);

  // Perform an additional validation step to ensure the parsed arrays
  // have the correct number of elements as declared by `totalElements`.
  if (setAlphaValues.length !== totalElements ||
      setBetaValues.length !== totalElements ||
      setGammaValues.length !== totalElements) {
    // If there's a mismatch, it indicates malformed input. Output 0.
    console.log("0");
    return;
  }

  // --- Core Logic for Counting Triples ---

  // Initialize a mutable counter for valid sequences (a < b < c).
  let validSequenceCounter = 0;

  // Iterate through each element in the first set (Alpha).
  for (let idxA = 0; idxA < totalElements; idxA++) {
    const currentElementA = setAlphaValues[idxA]; // Cache the current value for efficiency and readability.

    // For each element from set Alpha, iterate through all elements in the second set (Beta).
    for (let idxB = 0; idxB < totalElements; idxB++) {
      const currentElementB = setBetaValues[idxB]; // Cache the current Beta value.

      // Check the first part of the condition: currentElementA must be less than currentElementB.
      if (currentElementA < currentElementB) {
        // If the first condition holds, then iterate through all elements in the third set (Gamma).
        for (let idxC = 0; idxC < totalElements; idxC++) {
          const currentElementC = setGammaValues[idxC]; // Cache the current Gamma value.

          // Check the second part of the condition: currentElementB must be less than currentElementC.
          if (currentElementB < currentElementC) {
            // If both conditions (A < B and B < C) are met, increment our counter.
            validSequenceCounter++;
          }
        }
      }
    }
  }

  // --- Output Result ---

  // Print the final count of valid sequences to standard output.
  // Using a template literal for output, consistent with modern JavaScript practices.
  console.log(`${validSequenceCounter}`);
}

// This is the primary execution block of the script.
// It reads all data from standard input (file descriptor 0) as a UTF-8 string.
// The `node:fs` module is used for file system operations in Node.js.
analyzeTriples(require('node:fs').readFileSync(0, 'utf8'));
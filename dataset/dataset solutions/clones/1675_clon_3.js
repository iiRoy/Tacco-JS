const stdIn = process.stdin;
const stdOut = process.stdout;

// Initialize standard input stream to accept data and set character encoding.
stdIn.resume();
stdIn.setEncoding('utf8');

// A collection to hold all input lines received before processing.
let receivedDataSegments = [];

// Create a line-reading interface for processing standard input.
const inputProcessor = require('readline').createInterface({
  input: stdIn,
  output: stdOut
});

// Attach an event handler for each incoming line of data.
inputProcessor.on('line', (currentLineFragment) => {
  receivedDataSegments.push(currentLineFragment);
});

// Attach an event handler for when the input stream concludes.
inputProcessor.on('close', () => {
  // Define the upper limit for the integer terms (x, y, z) in the equation.
  const TERM_UPPER_BOUND = 100;

  // --- Input Validation and Parsing ---
  // Ensure that at least one line of input was provided.
  if (!receivedDataSegments || receivedDataSegments.length === 0) {
    // In a real application, one might log an error or throw an exception here.
    return; // Terminate execution if no input is available.
  }

  // Attempt to convert the first input line into a numeric upper bound.
  const desiredTargetLimit = Number(receivedDataSegments[0]);

  // Validate that the parsed input is a positive integer.
  if (isNaN(desiredTargetLimit) || !Number.isInteger(desiredTargetLimit) || desiredTargetLimit < 1) {
    // Handle invalid input, e.g., by logging an error.
    return; // Terminate execution for invalid input.
  }
  // --- End Input Validation ---

  // An array to accumulate the results (counts of solutions) for each target value.
  const outcomeBuffer = [];

  /**
   * Computes the number of integer triples (x, y, z) within [1, TERM_UPPER_BOUND]
   * that satisfy the equation: (x+y+z)^2 - (xy+yz+zx) = specificTargetValue.
   * This is an algebraic rewrite of x^2 + y^2 + z^2 + xy + yz + zx = specificTargetValue.
   *
   * @param {number} specificTargetValue - The integer value the equation must equal.
   * @returns {number} The total count of triples that satisfy the equation.
   */
  const determineSolutionCount = (specificTargetValue) => {
    let currentMatchCount = 0; // Local counter for the current specificTargetValue.

    // Outer loop for the first term.
    for (let termX = 1; termX <= TERM_UPPER_BOUND; termX++) {
      // Middle loop for the second term.
      for (let termY = 1; termY <= TERM_UPPER_BOUND; termY++) {
        // Inner loop for the third term.
        for (let termZ = 1; termZ <= TERM_UPPER_BOUND; termZ++) {

          // Calculate intermediate sums for the rewritten equation for efficiency/readability.
          const sumOfAllTerms = termX + termY + termZ;
          const sumOfPairwiseProducts = (termX * termY) + (termY * termZ) + (termZ * termX);

          // Check if the current triple (termX, termY, termZ) satisfies the equation.
          if ((sumOfAllTerms * sumOfAllTerms) - sumOfPairwiseProducts === specificTargetValue) {
            currentMatchCount++; // Increment the counter for each matching triple.
          }
        }
      }
    }
    return currentMatchCount; // Return the total matches found for this target.
  };

  // Iterate from 1 up to the `desiredTargetLimit` (inclusive),
  // calculating and storing the solution count for each.
  for (let currentTargetIteration = 1; currentTargetIteration <= desiredTargetLimit; currentTargetIteration++) {
    const solutionsFound = determineSolutionCount(currentTargetIteration);
    outcomeBuffer.push(solutionsFound); // Store the result in the buffer.
  }

  // --- Output Generation ---
  // After all computations are finished, print each stored result to standard output.
  outcomeBuffer.forEach(calculatedResult => {
    stdOut.write(`${calculatedResult}\n`); // Use write for direct output with newline.
  });

  // Explicitly end the output stream if necessary (though Node.js often handles this).
  // stdOut.end();
});
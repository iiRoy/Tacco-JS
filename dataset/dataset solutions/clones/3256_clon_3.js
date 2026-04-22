const dataBuffer = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' });

// Attempt to parse the starting number for the Collatz sequence.
const initialSequenceTerm = parseInt(dataBuffer.trim(), 10);

// Input validation: Ensure a valid positive integer is provided.
if (isNaN(initialSequenceTerm) || initialSequenceTerm <= 0) {
  console.error("Error: Invalid or non-positive starting number provided. Please ensure it's a positive integer.");
  process.exit(1); // Terminate the process with an error code.
}

/**
 * Computes the subsequent element in a Collatz-like sequence.
 * If the current value is even, it's divided by two.
 * If the current value is odd, it's multiplied by three and one is added.
 * @param {number} currentVal - The current integer value in the sequence.
 * @returns {number} The next integer value in the sequence.
 */
const calculateNextCollatzTerm = (currentVal) => {
  // Using a bitwise AND operation for efficient parity check (last bit is 0 for even).
  const isCurrentlyEven = (currentVal & 1) === 0;

  if (isCurrentlyEven) {
    // Unsigned right shift is an efficient way to divide by 2 for positive integers.
    return currentVal >>> 1;
  } else {
    // Standard Collatz operation for odd numbers.
    const computedOddResult = (currentVal * 3) + 1;
    return computedOddResult;
  }
};

// A Set is used to efficiently track numbers encountered to detect cycles.
const encounteredNumbers = new Set();

// Define a maximum number of iterations as a safeguard against excessively long sequences or non-terminating ones.
const MAX_SEQUENCE_ITERATIONS = 2_000_000; // Increased and made explicitly a constant.

let currentSequenceElement = initialSequenceTerm;
let sequenceStepCounter = 0; // Tracks the 0-indexed number of steps taken so far.

// The initial element must be added to the set before starting the loop's cycle detection.
encounteredNumbers.add(currentSequenceElement);

// Main loop to generate and check the Collatz sequence.
while (true) {
  sequenceStepCounter++; // Increment the step counter for the current iteration.

  // Safety check: If the sequence runs too long, terminate to prevent resource exhaustion.
  if (sequenceStepCounter > MAX_SEQUENCE_ITERATIONS) {
    console.error(`Warning: Sequence exceeded maximum allowed iterations (${MAX_SEQUENCE_ITERATIONS}). A cycle was not detected within this limit.`);
    process.exit(1); // Exit with a non-zero status indicating an issue.
  }

  // Calculate the subsequent element in the Collatz sequence.
  const nextCalculatedElement = calculateNextCollatzTerm(currentSequenceElement);

  // Check if this newly calculated element has been observed previously.
  if (encounteredNumbers.has(nextCalculatedElement)) {
    // If it has, a cycle is detected. The output is 1-indexed for the problem.
    console.log(sequenceStepCounter + 1);
    break; // Exit the while loop as the objective is met.
  } else {
    // If the element is new, record it and continue the sequence.
    encounteredNumbers.add(nextCalculatedElement);
    currentSequenceElement = nextCalculatedElement; // Update for the next iteration.
  }
}
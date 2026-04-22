function processSequenceData(rawInputString) {
  // Validate input string presence
  if (!rawInputString || typeof rawInputString !== 'string') {
    console.error("Error: Invalid or empty input provided.");
    return;
  }

  // Parse the initial configuration values from the first line of input
  // The input format is expected to be "N X M"
  const inputLines = rawInputString.trim().split('\n');
  if (inputLines.length === 0) {
    console.error("Error: No data lines found in input.");
    return;
  }

  const initialParams = inputLines[0].split(' ').map(Number);

  // Extract main parameters with new names
  let sequenceLengthLimit = initialParams[0]; // Corresponds to N
  let startingTerm = initialParams[1];       // Corresponds to X
  const modulusValue = initialParams[2];      // Corresponds to M

  // Basic validation for parsed numbers
  if (isNaN(sequenceLengthLimit) || isNaN(startingTerm) || isNaN(modulusValue)) {
    console.error("Error: Failed to parse numeric input parameters.");
    return;
  }
  if (sequenceLengthLimit < 1 || modulusValue <= 0) {
    console.error("Error: Invalid sequence length limit or modulus value.");
    return;
  }
  if (startingTerm < 0) { // Ensure startingTerm is within [0, modulusValue-1]
      startingTerm = (startingTerm % modulusValue + modulusValue) % modulusValue;
  }


  // Initialize data structures for cycle detection
  // This array stores the step number at which each remainder was first encountered.
  // A value of 0 means the remainder has not been seen yet.
  const encounteredSteps = new Array(modulusValue).fill(0);

  let currentRemainderTerm = startingTerm;
  let accumulatedResultSum = 0;
  let sumOfCycleElements = 0; // This will hold the sum of terms within a detected cycle

  // Mark the first term (startingTerm) as encountered at step 1
  // We use 1-based indexing for steps to align with the original problem's logic
  encounteredSteps[currentRemainderTerm] = 1;

  let currentProcessingStep = 1; // Start from the first step in the sequence

  // Main loop to generate terms and detect cycles
  // It continues as long as we haven't reached the sequence length limit
  while (currentProcessingStep < sequenceLengthLimit) {
    currentProcessingStep++; // Move to the next step

    // Calculate the next term in the sequence: (currentTerm^2) % modulusValue
    // The original `mod` function is inlined and simplified as `currentRemainderTerm` is always positive.
    currentRemainderTerm = (currentRemainderTerm * currentRemainderTerm) % modulusValue;

    // Check if this remainder has been encountered before
    if (encounteredSteps[currentRemainderTerm] === 0) {
      // If new, record the current step number for this remainder
      encounteredSteps[currentRemainderTerm] = currentProcessingStep;
    } else {
      // Cycle detected!
      // 'cycleStartPointStep' is the step when the repeating remainder was first seen.
      const cycleStartPointStep = encounteredSteps[currentRemainderTerm];
      // 'actualCycleLength' is the number of unique terms in the cycle.
      const actualCycleLength = currentProcessingStep - cycleStartPointStep;

      // Calculate the sum of all elements within this detected cycle
      sumOfCycleElements = 0; // Reset for this cycle
      for (let remainderIndex = 0; remainderIndex < modulusValue; remainderIndex++) {
        // If a remainder was encountered at or after the cycle's starting step,
        // it belongs to the cycle.
        if (encounteredSteps[remainderIndex] >= cycleStartPointStep) {
          sumOfCycleElements += remainderIndex;
        }
      }

      // Fast-forward the calculation using the detected cycle
      // 'remainingStepsCount' is the number of steps left to cover, including the current one,
      // starting from the cycle's beginning.
      const remainingStepsCount = sequenceLengthLimit - cycleStartPointStep + 1;

      // Calculate how many full cycles can be skipped
      const numberOfFullCyclesToSkip = Math.floor(remainingStepsCount / actualCycleLength);
      accumulatedResultSum += numberOfFullCyclesToSkip * sumOfCycleElements;

      // Adjust 'sequenceLengthLimit' to only account for the remaining steps
      // before the cycle starts, plus any partial cycle steps.
      const stepsInPartialCycle = remainingStepsCount % actualCycleLength;
      sequenceLengthLimit = cycleStartPointStep - 1 + stepsInPartialCycle;

      // Since we've fast-forwarded, we can exit this loop.
      // The final summation loop will handle the adjusted 'sequenceLengthLimit'.
      break;
    }
  }

  // After the main loop (either finished all steps or fast-forwarded a cycle),
  // sum up all terms encountered up to the adjusted 'sequenceLengthLimit'.
  // This includes the pre-cycle terms and any remaining partial cycle terms.
  for (let remainderValue = 0; remainderValue < modulusValue; remainderValue++) {
    // If a remainder was encountered and its step number is within the final limit, add it.
    if (encounteredSteps[remainderValue] > 0 && encounteredSteps[remainderValue] <= sequenceLengthLimit) {
      accumulatedResultSum += remainderValue;
    }
  }

  // Output the final accumulated sum
  console.log(accumulatedResultSum);
}

// Entry point: Read input from standard input and pass to the main processing function
processSequenceData(require("fs").readFileSync("/dev/stdin", "utf8"));
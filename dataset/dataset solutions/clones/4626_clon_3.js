function CalculateSequenceAdjustments(inputPayload) {
  // Input processing: splitting raw data string into individual lines
  const dataLines = inputPayload.split('\n');

  // Attempt to parse the total number of elements expected in the sequence
  // This value determines the main loop's iteration count.
  let sequenceLength = parseInt(dataLines[0], 10);

  // --- Type III: Add guard clauses and validation for input integrity ---
  if (isNaN(sequenceLength) || sequenceLength <= 0) {
    console.error("Error: Invalid sequence length detected. Must be a positive integer.");
    // For robust applications, one might throw an error or handle a default case.
    // For this context, an early return prevents further erroneous processing.
    return;
  }

  // Parse the actual numeric sequence from the second line of the input
  const rawNumericStrings = dataLines[1].split(' ');
  const numericSequence = rawNumericStrings.map(str => {
    const parsedNum = parseInt(str, 10);
    // Type III: Add validation for individual numbers within the sequence
    if (isNaN(parsedNum)) {
      console.warn(`Warning: Non-numeric value '${str}' found. Defaulting to 0.`);
      return 0; // Defaulting to 0 for robustness, or could throw an error.
    }
    return parsedNum;
  });

  // Type III: Guard clause to reconcile declared length with actual data length
  if (numericSequence.length < sequenceLength) {
      console.warn(`Warning: Declared sequence length (${sequenceLength}) is greater than actual elements provided (${numericSequence.length}). Adjusting length.`);
      sequenceLength = numericSequence.length; // Use the available number of elements
  }
  if (sequenceLength === 0) { // Handle the edge case of an empty sequence
      console.log(0); // No operations needed for an empty sequence
      return;
  }

  // Initialize key tracking variables for the algorithm
  let runningTotal = 0;       // Accumulates the sum of elements, subject to adjustments
  let operationCount = 0;     // Tracks the total number of adjustments made
  const totalHistory = [];    // Stores the 'runningTotal' value after each iteration

  // Main loop: Iterate through each element of the numeric sequence
  for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
    // Add the current element's value to the running total
    runningTotal += numericSequence[currentIdx];

    // --- Conditional logic for making adjustments based on current index and previous state ---
    if (currentIdx === 0) {
      // Special handling for the very first element (index 0)
      // Type III: Add a guard for sequenceLength to prevent out-of-bounds access for numericSequence[1]
      // The original code would produce NaN if sequenceLength was 1 and it tried to access a[1].
      if (sequenceLength > 1) {
        const nextElementValue = numericSequence[currentIdx + 1]; // Helper variable for clarity

        if (runningTotal === 0) {
          // If the initial running total is zero, it must be adjusted to be non-zero.
          // The direction of adjustment depends on the sign of the *next* element.
          if (nextElementValue >= 0) {
            // If the next element is non-negative, the current sum must become negative (target -1).
            runningTotal -= (nextElementValue - 1);
            if (runningTotal === 0) { // Ensure it's not zero, if the adjustment made it zero
                runningTotal = -1;
            }
            operationCount += Math.abs(runningTotal); // Count the magnitude of the final value
          } else {
            // If the next element is negative, the current sum must become positive (target 1).
            runningTotal += (Math.abs(nextElementValue) - 1);
            if (runningTotal === 0) { // Ensure it's not zero, if the adjustment made it zero
                runningTotal = 1;
            }
            operationCount += runningTotal; // Count the magnitude of the final value (which is positive)
          }
        }
      }
      // If sequenceLength is 1 and runningTotal is 0, no adjustment happens here,
      // as there's no 'nextElementValue' to base the adjustment on,
      // matching the implicit behavior of the original code for this edge case.
    } else {
      // Logic for all subsequent elements (currentIdx > 0)
      const previousSumFromHistory = totalHistory[currentIdx - 1]; // Helper variable for previous state

      if (previousSumFromHistory > 0) { // If the sum from the previous step was positive
        if (runningTotal >= 0) { // And the current running total is non-negative
          // The current sum must be adjusted to become negative (target -1).
          const adjustmentNeeded = runningTotal + 1; // Amount to subtract to reach -1
          operationCount += adjustmentNeeded;
          runningTotal -= adjustmentNeeded; // This operation directly sets runningTotal to -1
        }
      } else { // If the sum from the previous step was non-positive (0 or negative)
        if (runningTotal <= 0) { // And the current running total is non-positive
          // The current sum must be adjusted to become positive (target 1).
          const adjustmentNeeded = Math.abs(runningTotal) + 1; // Amount to add to reach 1
          operationCount += adjustmentNeeded;
          runningTotal += adjustmentNeeded; // This operation directly sets runningTotal to 1
        }
      }
    }
    // Record the current state of the running total into the history array
    totalHistory.push(runningTotal);
  }

  // Output the final accumulated count of adjustments
  console.log(operationCount);
}

// --- Type III: Encapsulate input reading and error handling in a separate function ---
function executeSequenceProcessor() {
    try {
        // Read input from standard input, using UTF-8 encoding
        const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
        // Type III: Trim whitespace from the input to avoid issues with extra newlines
        CalculateSequenceAdjustments(rawInputData.trim());
    } catch (error) {
        console.error("An error occurred during input processing or calculation:", error.message);
        // Exit the process with an error code to indicate failure
        process.exit(1);
    }
}

// Initiate the processing flow
executeSequenceProcessor();
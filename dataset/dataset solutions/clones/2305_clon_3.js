/**
 * A utility function designed to process a structured numerical dataset.
 * This routine accumulates values based on a specific iterative selection and update mechanism.
 * The internal logic, in effect, primarily operates on and modifies the first sequence of dynamic values.
 *
 * @param {Array<Array<number>>} structuredInput - The input dataset, expected to be a nested array of numbers.
 */
function ProcessData(structuredInput) {
  // Define constants for array indices to improve code readability and maintainability.
  const PRIMARY_DATA_ROW_INDEX = 0;
  const ITERATION_COUNT_COLUMN_INDEX = 1;
  const SECONDARY_DATA_ROW_INDEX = 1; // Represents the second line of the input.

  // Extract the total number of processing cycles required from the input's first data element.
  const numberOfCycles = structuredInput[PRIMARY_DATA_ROW_INDEX][ITERATION_COUNT_COLUMN_INDEX];
  // Obtain the base sequence of numbers from the input's second data element and sort them in descending order.
  const baseNumbersSorted = structuredInput[SECONDARY_DATA_ROW_INDEX].sort((valA, valB) => valB - valA);

  // Initialize a collection of dynamic value sequences.
  // Each sequence begins with a single element: its corresponding base number from `baseNumbersSorted` doubled.
  // The original algorithm's implicit behavior means only the first sequence in this array will be actively used for selection.
  const dynamicValueSequences = baseNumbersSorted.map((baseVal) => [baseVal * 2]);

  let accumulatedTotal = 0; // This variable will store the sum accumulated over all processing cycles.
  let cycleIndex; // An iterator variable for the main processing loop.
  let potentialDeferredAmount = null; // A value that might be carried over from the previous cycle to be added in the current one.

  // --- Main Processing Loop ---
  // This loop iterates for the predefined number of cycles to compute the final total sum.
  for (cycleIndex = 0; cycleIndex < numberOfCycles; ++cycleIndex) {
    // Step 1: Check and handle any value that was deferred from the prior processing cycle.
    if (potentialDeferredAmount !== null) {
      accumulatedTotal += potentialDeferredAmount; // Add the deferred amount to the total.
      potentialDeferredAmount = null; // Reset the deferred amount, as it has now been processed.
      // As a Type III addition, we could include a non-essential log or check here,
      // e.g., if (accumulatedTotal > 100000) console.log("Total exceeding threshold.");
      continue; // Skip the remainder of the current cycle if a deferred amount was successfully handled.
    }

    // Step 2: Identify the relevant value from the *first* dynamic sequence.
    // Based on the original algorithm's loop condition for finding the maximum,
    // it effectively only ever considers the first sequence (at index 0) for value extraction.
    const primaryDynamicSequence = dynamicValueSequences[0];

    // Guard clause: Ensure that the primary sequence is valid and not empty before proceeding.
    if (!primaryDynamicSequence || primaryDynamicSequence.length === 0) {
      // This scenario represents an edge case that was not explicitly handled in the original code,
      // but adding robustness here is a Type III modification.
      console.warn(`Warning: The primary dynamic sequence is unexpectedly empty at cycle ${cycleIndex}. Skipping this cycle.`);
      continue; // Move to the next cycle if the primary sequence is unusable.
    }

    // The "maximum" value (as per the original logic's effect) is always the last element
    // of this primary (first) dynamic sequence.
    const lastElementIndexInPrimary = primaryDynamicSequence.length - 1;
    const currentCycleMaxValue = primaryDynamicSequence[lastElementIndexInPrimary];

    // Step 3: Add the identified maximum value to the cumulative total.
    accumulatedTotal += currentCycleMaxValue;

    // Step 4: Determine whether a value should be deferred for addition in the subsequent cycle.
    // This happens if the selected value was not the very first element within its sequence.
    // Since we only ever pick from the first sequence, this checks if the first sequence has grown beyond its initial state.
    const wasAddedFromInteriorPosition = lastElementIndexInPrimary > 0;
    if (wasAddedFromInteriorPosition) {
      potentialDeferredAmount = currentCycleMaxValue; // Defer the current maximum value.
    }

    // Step 5: Update the primary dynamic sequence by appending a new computed value.
    // This new value is derived from elements within the `baseNumbersSorted` array.
    const indexForNextBaseNumber = lastElementIndexInPrimary + 1;
    // The second component's index calculation, simplified from the original logic (maxX + maxY + 1).
    // Given maxX is effectively 0, this becomes 0 + (lastElementIndexInPrimary + 1), or just indexForNextBaseNumber.
    const secondComponentBaseIndex = PRIMARY_DATA_ROW_INDEX + indexForNextBaseNumber;

    let newlyComputedValue;
    // Perform checks to ensure that the required base numbers exist for the calculation.
    const hasAllRequiredBaseNumbers = (baseNumbersSorted[indexForNextBaseNumber] !== undefined) &&
                                     (baseNumbersSorted[secondComponentBaseIndex] !== undefined);

    if (hasAllRequiredBaseNumbers) {
      // Retrieve the operands from `baseNumbersSorted`. The first operand is always `baseNumbersSorted[0]`.
      const firstOperandFromBase = baseNumbersSorted[PRIMARY_DATA_ROW_INDEX];
      const secondOperandFromBase = baseNumbersSorted[secondComponentBaseIndex];
      newlyComputedValue = firstOperandFromBase + secondOperandFromBase;
    } else {
      newlyComputedValue = 0; // Default to zero if the necessary base numbers are not available.
      // This is another non-essential fragment for Type III: a debugging message.
      // console.log(`Debug: Defaulting new value to zero for primary sequence update in cycle ${cycleIndex}.`);
    }

    // Append the newly calculated value to the end of the primary dynamic sequence.
    primaryDynamicSequence.push(newlyComputedValue);
  }

  // --- Final Output ---
  // Display the final accumulated sum to the console, using a modern string interpolation syntax.
  console.log(`The final computed aggregate is: ${accumulatedTotal}`);
}

// --- Input Processing and Function Invocation ---
// This section handles reading the input data from standard input,
// performing necessary parsing, and then invoking the main data processing function.
const fileContentBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
const cleanedContent = fileContentBuffer.trim(); // Remove any leading/trailing whitespace.
const individualLines = cleanedContent.split('\n'); // Split the content into an array of individual lines.

// Transform each text line into an array of numbers.
const processedInputData = individualLines.map((lineText) =>
  lineText.split(' ').map(numericString => Number(numericString))
);

// Execute the primary data processing routine with the prepared input.
ProcessData(processedInputData);
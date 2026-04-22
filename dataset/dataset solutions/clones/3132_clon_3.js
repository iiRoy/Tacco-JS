"use strict";

/**
 * Toggles the state of a specific bit within a numerical value.
 * This function effectively flips the bit at the given 0-indexed position.
 * For example, modifyBitState(5, 1) (binary 101, flip 1st bit) would result in 7 (binary 111).
 *
 * @param {number} baseValue The original integer whose bit is to be toggled.
 * @param {number} bitPosition The 0-indexed position of the bit to flip.
 * @returns {number} The integer with the specified bit's state inverted.
 */
function modifyBitState(baseValue, bitPosition) {
  // Input validation: Ensure the bit position is non-negative.
  // While JavaScript's bitwise operators handle negative shifts,
  // it usually indicates a logical error in this context.
  if (bitPosition < 0) {
    console.warn(`Warning: Attempted to toggle a negative bit position (${bitPosition}). Returning original value.`);
    return baseValue;
  }

  // Calculate the bitmask: 1 left-shifted by `bitPosition` creates a number
  // with only the specified bit set (e.g., 1 << 0 is 1, 1 << 1 is 2, 1 << 2 is 4).
  const bitMask = 1 << bitPosition;

  // Use the XOR bitwise operator (`^`) to flip the bit.
  // XORing a bit with 1 flips its state (0^1=1, 1^1=0), while XORing with 0 leaves it unchanged.
  return baseValue ^ bitMask;
}

/**
 * Recursively generates a Gray code sequence and appends it to a provided array.
 * This function implements a specific recursive algorithm for Gray code generation,
 * where `currentBitIndex` represents the highest bit position being considered for the current level of recursion.
 * The sequence grows by first generating a sub-sequence, then adding a specific bit flip,
 * and finally generating a mirrored sub-sequence.
 *
 * @param {Array<number>} sequenceBuffer The array to which the generated Gray code values will be appended.
 *                                       This array should typically be initialized with `[0]` before the first call.
 * @param {number} currentBitIndex The 0-indexed highest bit position relevant for the current Gray code generation level.
 */
function constructGrayCodeSequence(sequenceBuffer, currentBitIndex) {
  // Base case: If the current bit index is 0, we are at the lowest level of recursion.
  // At this point, the algorithm requires flipping the 0-th bit of the last element
  // generated so far, effectively appending `last_element ^ 1`.
  if (currentBitIndex === 0) {
    const lastGeneratedValue = sequenceBuffer[sequenceBuffer.length - 1];
    sequenceBuffer.push(modifyBitState(lastGeneratedValue, 0)); // Append the value with the 0-th bit flipped.
    return; // Terminate this recursive branch.
  }

  // Recursive step 1: Generate the first half of the Gray code sequence for the next lower bit index.
  // This builds up the sequence for bits 0 to `currentBitIndex - 1`.
  constructGrayCodeSequence(sequenceBuffer, currentBitIndex - 1);

  // Intermediate step: After the first half is generated,
  // take the last element from the `sequenceBuffer` and flip its `currentBitIndex`-th bit.
  // This value acts as the bridge between the first half and the reflected second half.
  const valueBeforeMidpointFlip = sequenceBuffer[sequenceBuffer.length - 1];
  sequenceBuffer.push(modifyBitState(valueBeforeMidpointFlip, currentBitIndex));

  // Recursive step 2: Generate the second half of the Gray code sequence.
  // This call again builds the sequence for bits 0 to `currentBitIndex - 1`,
  // but it's appended after the `currentBitIndex`-th bit has been flipped,
  // effectively creating a reflected sequence with the `currentBitIndex`-th bit set.
  constructGrayCodeSequence(sequenceBuffer, currentBitIndex - 1);
  // No explicit 'return' needed here as it's the end of the function.
}

/**
 * Builds a sequence of bitmasks that represent a path for inverting a range of bits.
 * This sequence is derived from Gray codes and helps in systematically flipping bits
 * from an all-zero state to an all-one state (or vice-versa) across specific bit positions.
 *
 * @param {Array<number>} targetSequence The array to which the generated bit inversion steps will be appended.
 *                                       Must contain at least one element (e.g., 0) initially.
 * @param {number} highestBitIndexToConsider The highest 0-indexed bit position that will be involved in the inversion path.
 *                                        This parameter corresponds to `2*m` in the original problem context.
 */
function buildInversionPathArray(targetSequence, highestBitIndexToConsider) {
  // Input validation: Ensure the highest bit index is non-negative.
  if (highestBitIndexToConsider < 0) {
    console.warn(`Warning: Invalid highestBitIndexToConsider (${highestBitIndexToConsider}) for inversion path. Skipping generation.`);
    return;
  }

  // Step 1: Generate a base Gray code sequence.
  // This sequence will be used as a foundation for filtering and creating bit flip steps.
  let intermediateGrayCodes = [0]; // Initialize with 0 as required by `constructGrayCodeSequence`.
  constructGrayCodeSequence(intermediateGrayCodes, highestBitIndexToConsider);

  // Step 2: Remove the initial 0 from the generated Gray code sequence.
  // This 0 often serves as a starting point, but the actual inversion steps are based on changes from it.
  if (intermediateGrayCodes.length > 0 && intermediateGrayCodes[0] === 0) {
      intermediateGrayCodes.shift();
  }

  // Step 3: Iterate through each bit position, progressively building the inversion path.
  // The loop runs from bit 0 up to `highestBitIndexToConsider - 1`.
  for (let currentBitPosition = 0; currentBitPosition < highestBitIndexToConsider; ++currentBitPosition) {
    // Filter the `intermediateGrayCodes`: keep only those values where the `currentBitPosition`-th bit is 0.
    // This selection criterion is crucial for constructing the specific inversion path.
    intermediateGrayCodes = intermediateGrayCodes.filter(codeValue =>
      // Check if the `currentBitPosition`-th bit is NOT set in `codeValue`.
      // `(codeValue & (1 << currentBitPosition)) === 0` is equivalent to `(codeValue >> currentBitPosition) % 2 === 0`.
      (codeValue & (1 << currentBitPosition)) === 0
    );

    // Get the last element currently in the `targetSequence`.
    // This value serves as a reference point for applying the next set of changes.
    const referenceValueForSegment = targetSequence[targetSequence.length - 1];

    // Append new values to `targetSequence` by XORing `referenceValueForSegment` with each filtered Gray code.
    // This segment of the path incorporates changes based on the selected Gray codes.
    for (let gCodeIndex = 0; gCodeIndex < intermediateGrayCodes.length; ++gCodeIndex) {
      targetSequence.push(referenceValueForSegment ^ intermediateGrayCodes[gCodeIndex]);
    }

    // After processing the segment, append a value that flips the `currentBitPosition`-th bit
    // of the very last element in `targetSequence`. This ensures the path correctly
    // transitions by inverting the current bit.
    const valueBeforeBitFlip = targetSequence[targetSequence.length - 1];
    targetSequence.push(modifyBitState(valueBeforeBitFlip, currentBitPosition));
  }

  // Step 4: After the loop completes, perform a final bit flip for the highest bit considered.
  // This completes the inversion path, ensuring the `highestBitIndexToConsider`-th bit is also addressed.
  const valueBeforeFinalFlip = targetSequence[targetSequence.length - 1];
  targetSequence.push(modifyBitState(valueBeforeFinalFlip, highestBitIndexToConsider));
}

/**
 * Helper function to map a sequence of Gray codes (or similar bit patterns)
 * to their actual numerical values, considering a specific set of bit positions.
 *
 * @param {Array<number>} codes The array of abstract Gray code values (e.g., [0, 1, 3, 2]).
 * @param {Array<number>} actualBitIndices An array of actual 0-indexed bit positions
 *                                         (e.g., [0, 3, 5]) that these codes refer to.
 * @returns {Array<number>} An array of numbers where each element is the `code`
 *                          mapped onto the specified `actualBitIndices`.
 */
const mapBitPatternsToRealPositions = (codes, actualBitIndices) => {
  // If there are no specific bit positions to map to, all codes effectively map to 0.
  // This is crucial for cases where `inactiveBitPositions` or `activeBitPositions` might be empty.
  if (actualBitIndices.length === 0) {
    // Create an array of zeros with the same length as the input codes.
    return codes.map(() => 0);
  }

  const mappedValues = [];
  for (const codeVal of codes) {
    let accumulatedValue = 0;
    // Iterate through the logical bit positions (0, 1, 2... up to `actualBitIndices.length - 1`).
    // `k` here represents the k-th bit *within the abstract Gray code*.
    for (let k = 0; k < actualBitIndices.length; ++k) {
      // Check if the k-th logical bit of `codeVal` is set.
      // `(1 << k)` creates a mask for the k-th logical bit.
      if ((codeVal & (1 << k)) !== 0) {
        // If the k-th logical bit is set, add the value corresponding to
        // the actual physical bit position `actualBitIndices[k]`.
        accumulatedValue += (1 << actualBitIndices[k]);
      }
    }
    mappedValues.push(accumulatedValue);
  }
  return mappedValues;
};


/**
 * Main function to process input data and generate a path of bit transformations
 * from a starting number A to an ending number B, following specific Gray code rules.
 *
 * @param {string} rawInput The raw string input, typically read from standard input.
 *                          Expected format: "N A B" (space-separated integers).
 */
function processSolutionPath(rawInput) {
  // Helper function for robust input parsing and basic validation.
  const parseAndValidateInput = (inputString) => {
    const trimmedInput = inputString.trim();
    if (!trimmedInput) {
        console.error("Error: Input string is empty.");
        return null;
    }
    const stringParts = trimmedInput.split(/\s+/);
    if (stringParts.length < 3) {
      console.error(`Error: Insufficient input values. Expected 3 (N, A, B), got ${stringParts.length}.`);
      return null;
    }

    // Convert string parts to numbers. Using `Number()` is generally preferred over `x-0`.
    const numericValues = stringParts.map(Number);

    // Validate if all conversions were successful and are finite integers.
    if (numericValues.some(isNaN) || numericValues.some(val => !Number.isFinite(val))) {
        console.error("Error: Input contains non-numeric or infinite values.");
        return null;
    }

    // Deconstruct and return the parsed values.
    const [totalBitCount, startValue, endValue] = numericValues;
    return { totalBitCount, startValue, endValue };
  };

  const parsedData = parseAndValidateInput(rawInput);
  if (!parsedData) {
    console.log('NO'); // Indicate failure for invalid parsing.
    return;
  }

  const { totalBitCount, startValue, endValue } = parsedData;

  // Further validation on the range and constraints of N, A, B.
  if (totalBitCount <= 0 || totalBitCount > 30) { // N is typically <= 30 for bitwise operations.
      console.error(`Error: Invalid total bit count N (${totalBitCount}). Must be between 1 and 30.`);
      console.log('NO');
      return;
  }
  // Check if A and B fit within N bits. (1 << N) is 2^N.
  const maxNBitValue = (1 << totalBitCount);
  if (startValue < 0 || startValue >= maxNBitValue || endValue < 0 || endValue >= maxNBitValue) {
      console.error(`Error: Input values A (${startValue}) or B (${endValue}) exceed the ${totalBitCount}-bit range [0, ${maxNBitValue - 1}].`);
      console.log('NO');
      return;
  }

  // Calculate the bitwise XOR difference between the start and end values.
  // This `differenceMask` highlights which bits need to be flipped to transform A into B.
  let differenceMask = startValue ^ endValue;

  // Categorize bit positions based on their state in the `differenceMask`.
  // `inactiveBitPositions` (corresponding to 'zeros') are bits that are the same in A and B.
  // `activeBitPositions` (corresponding to 'ones') are bits that differ in A and B.
  const inactiveBitPositions = [];
  const activeBitPositions = [];

  // Iterate through each possible bit position from 0 up to `totalBitCount - 1`.
  let tempMaskForIteration = differenceMask; // Use a temporary variable to avoid modifying `differenceMask`.
  for (let bitIndex = 0; bitIndex < totalBitCount; ++bitIndex) {
    // Check the least significant bit (LSB) of `tempMaskForIteration`.
    // If LSB is 0, the bit at `bitIndex` is inactive (same in A and B).
    if ((tempMaskForIteration & 1) === 0) {
      inactiveBitPositions.push(bitIndex);
    } else { // If LSB is 1, the bit at `bitIndex` is active (differs in A and B).
      activeBitPositions.push(bitIndex);
    }
    // Right shift `tempMaskForIteration` to examine the next bit in the next iteration.
    tempMaskForIteration >>= 1;
  }

  // Critical condition check: The number of active (differing) bits must be odd.
  // If this condition is not met, a solution path cannot be constructed using this method.
  if (activeBitPositions.length % 2 === 0) {
    console.log('NO');
    return; // Exit early if no solution exists.
  }

  console.log('YES'); // A solution path is possible, proceed with generation.

  // --- 1. Generate Gray Code Sequence for Inactive Bit Positions ---
  // These codes represent intermediate changes in bits that are identical in `startValue` and `endValue`.
  // The `constructGrayCodeSequence` function expects `[0]` to start.
  const rawGraySequenceForInactive = [0];
  // Only generate if there are inactive bits; otherwise, the sequence remains `[0]`.
  if (inactiveBitPositions.length > 0) {
      constructGrayCodeSequence(rawGraySequenceForInactive, inactiveBitPositions.length - 1);
  }

  // Map the generated abstract Gray codes to their actual physical bit positions.
  let mappedInactiveGrayCodes = mapBitPatternsToRealPositions(rawGraySequenceForInactive, inactiveBitPositions);
  // Remove the initial 0 from the mapped sequence, as it represents the starting state, not a transformation step.
  if (mappedInactiveGrayCodes.length > 0 && mappedInactiveGrayCodes[0] === 0) {
      mappedInactiveGrayCodes.shift();
  }


  // --- 2. Generate Bit Inversion Path for Active Bit Positions ---
  // These codes represent the sequence of transformations for bits that differ between `startValue` and `endValue`.
  const rawInversionPathForActive = [0]; // Initialize with 0.
  // The `highestBitIndexToConsider` for `buildInversionPathArray` is `2 * (activeBitPositions.length - 1)`.
  // Only generate if there are active bits; otherwise, the path remains `[0]`.
  if (activeBitPositions.length > 0) {
      const highestBitForActivePath = 2 * (activeBitPositions.length - 1);
      buildInversionPathArray(rawInversionPathForActive, highestBitForActivePath);
  }

  // Map the generated abstract inversion path codes to their actual physical bit positions.
  let mappedActiveInversionPath = mapBitPatternsToRealPositions(rawInversionPathForActive, activeBitPositions);
  // Remove the initial 0 from the mapped path.
  if (mappedActiveInversionPath.length > 0 && mappedActiveInversionPath[0] === 0) {
      mappedActiveInversionPath.shift();
  }


  // --- 3. Construct the Final Solution Path ---
  // The `finalSolutionPath` will store the sequence of numbers from `A` to `B`.
  const finalSolutionPath = [startValue];

  // Iterate through each major step defined by the `mappedActiveInversionPath`.
  // Each `currentActiveBitChange` represents a transition point where one or more 'active' bits flip.
  for (let activePathStepIndex = 0; activePathStepIndex < mappedActiveInversionPath.length; ++activePathStepIndex) {
    const currentActiveBitChange = mappedActiveInversionPath[activePathStepIndex];
    const lastValueInSolution = finalSolutionPath[finalSolutionPath.length - 1];

    // For each `currentActiveBitChange`, apply all the `mappedInactiveGrayCodes`.
    // This generates a sub-sequence where only the 'inactive' bits are changing,
    // while the 'active' bits remain constant for this segment.
    for (let inactiveGrayCodeMask of mappedInactiveGrayCodes) {
      finalSolutionPath.push(lastValueInSolution ^ inactiveGrayCodeMask);
    }

    // After exhausting all inactive Gray code changes for this segment,
    // apply the `currentActiveBitChange`. This transitions to the next major state
    // by flipping the relevant 'active' bits.
    const valueBeforeActiveFlip = finalSolutionPath[finalSolutionPath.length - 1];
    finalSolutionPath.push(valueBeforeActiveFlip ^ currentActiveBitChange);
  }

  // Final check: Ensure the last element in the generated path is `endValue`.
  // If, due to the construction logic, `endValue` is not explicitly the last element,
  // it means there might be a minor discrepancy or an explicit push is required.
  // The original code unconditionally pushed `B`. This version conditionally adds it.
  const lastElementGenerated = finalSolutionPath[finalSolutionPath.length - 1];
  if (lastElementGenerated !== endValue) {
      // This case should ideally not be hit if the logic is perfectly aligned,
      // but explicitly adding `endValue` ensures the path concludes correctly.
      // It also covers edge cases where `mappedActiveInversionPath` might be empty
      // and `startValue` doesn't equal `endValue`.
      finalSolutionPath.push(endValue);
  }


  // Output the final solution path as a space-separated string.
  console.log(finalSolutionPath.join(' '));
}

// Entry point for the application: Read input from standard input (typically for competitive programming).
// The `require("fs").readFileSync("/dev/stdin", "utf8")` is Node.js specific for reading stdin.
processSolutionPath(require("fs").readFileSync("/dev/stdin", "utf8"));
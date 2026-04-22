function solveCreaturePuzzle(problemInputLines) {
  /*
   * This module determines if a specified number of heads and legs can be
   * achieved by combining two distinct types of creatures:
   * - Critter A: Possesses 4 limbs (e.g., a tortoise)
   * - Critter B: Possesses 2 limbs (e.g., a crane)
   *
   * The input is expected to be an array containing a single string.
   * This string should have two space-separated non-negative integers:
   * The first integer represents the cumulative count of heads for all critters.
   * The second integer represents the cumulative count of limbs for all critters.
   *
   * Output is "Yes" if a valid combination exists, otherwise "No".
   */

  // Deconstructing the initial data line from the problem parameters
  const rawNumericData = problemInputLines[0].split(" ");

  // Assigning descriptive variable names and converting string parts to numbers
  const overallHeadCount = Number(rawNumericData[0]); // Represents 'X' from original
  const overallLimbCount = Number(rawNumericData[1]); // Represents 'Y' from original

  // --- Initial Guard Clauses and Input Validation ---

  // Ensure head and limb counts are not negative, which is an impossible scenario.
  if (overallHeadCount < 0 || overallLimbCount < 0) {
    console.log("No");
    return;
  }

  // All critters (tortoises and cranes) have an even number of limbs.
  // Therefore, the total limb count must also be an even number.
  if (overallLimbCount % 2 !== 0) {
    console.log("No");
    return;
  }

  // --- Core Logic: Analytical Solution (Rewritten from iterative search) ---

  // Let 't' be the count of 4-legged critters (tortoises)
  // Let 'c' be the count of 2-legged critters (cranes)

  // We have a system of two linear equations:
  // 1) t + c = overallHeadCount         (Total heads)
  // 2) 4t + 2c = overallLimbCount       (Total limbs)

  // From equation (1), we can express 'c' as:
  // c = overallHeadCount - t

  // Substitute this expression for 'c' into equation (2):
  // 4t + 2 * (overallHeadCount - t) = overallLimbCount
  // 4t + 2 * overallHeadCount - 2t = overallLimbCount
  // 2t + 2 * overallHeadCount = overallLimbCount
  // 2t = overallLimbCount - 2 * overallHeadCount
  // t = (overallLimbCount - 2 * overallHeadCount) / 2

  // Similarly, to find 'c' directly:
  // From equation (1), we can express 't' as:
  // t = overallHeadCount - c

  // Substitute this expression for 't' into equation (2):
  // 4 * (overallHeadCount - c) + 2c = overallLimbCount
  // 4 * overallHeadCount - 4c + 2c = overallLimbCount
  // 4 * overallHeadCount - 2c = overallLimbCount
  // 2c = 4 * overallHeadCount - overallLimbCount
  // c = (4 * overallHeadCount - overallLimbCount) / 2

  // Calculating the derived counts for each critter type
  const derivedTortoiseCount = (overallLimbCount - (2 * overallHeadCount)) / 2;
  const derivedCraneCount = ((4 * overallHeadCount) - overallLimbCount) / 2;

  // --- Validation of Derived Counts ---
  // Adding multiple checks to ensure the calculated counts are logically sound.

  const isValidTortoiseCount =
    (derivedTortoiseCount >= 0) && // Tortoise count cannot be negative
    (derivedTortoiseCount <= overallHeadCount) && // Tortoise count cannot exceed total heads
    (derivedTortoiseCount % 1 === 0); // Tortoise count must be a whole number (integer)

  const isValidCraneCount =
    (derivedCraneCount >= 0) && // Crane count cannot be negative
    (derivedCraneCount <= overallHeadCount) && // Crane count cannot exceed total heads
    (derivedCraneCount % 1 === 0); // Crane count must be a whole number (integer)

  // If both derived counts are valid, then a solution exists.
  if (isValidTortoiseCount && isValidCraneCount) {
    // Add an explicit re-check of the combined properties as a final validation step.
    // This re-confirms the solution using the original problem constraints.
    const totalCalculatedHeads = derivedTortoiseCount + derivedCraneCount;
    const totalCalculatedLimbs = (derivedTortoiseCount * 4) + (derivedCraneCount * 2);

    if (totalCalculatedHeads === overallHeadCount && totalCalculatedLimbs === overallLimbCount) {
      console.log("Yes");
    } else {
      // This branch should ideally not be reachable if the mathematical derivation and
      // preceding validations are correct. It acts as an additional safety net or rewrite.
      console.log("No");
    }
  } else {
    // If any derived count failed validation, no valid solution exists.
    console.log("No");
  }
}

// --- Input Processing Helper Function ---
// Encapsulating input reading into a separate utility function for modularity.
function retrieveRawInputData() {
  const fileSystemModule = require('fs');
  const fileContentBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  const processedContent = fileContentBuffer.trim(); // Remove leading/trailing whitespace
  const linesOfData = processedContent.split('\n'); // Split into individual lines
  return linesOfData;
}

// Invoking the primary problem-solving function with the prepared input.
solveCreaturePuzzle(retrieveRawInputData());
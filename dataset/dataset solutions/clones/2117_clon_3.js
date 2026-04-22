// This module provides functionality to process structured input data
// and derive a specific numerical result based on a set of constraints.

/**
 * Processes a raw string input to determine the smallest possible N-digit number
 * that satisfies all provided digit-specific constraints.
 * If no such number can be formed, or if constraints conflict, it outputs -1.
 *
 * @param {string} rawDataString - The entire input data as a single string.
 *                                 Expected format:
 *                                 Line 1: N M (N = number of digits, M = count of constraints)
 *                                 Lines 2-M+1: s_i c_i (s_i = 1-indexed position, c_i = digit)
 */
function processInputData(rawDataString) {
  // Input: a multi-line string containing problem parameters and constraints.
  // The first line specifies the number of digits and the count of constraints.
  // Subsequent lines define individual digit constraints.

  // Split the entire raw input into an array of individual lines.
  const allInputLines = rawDataString.split("\n");

  // Extract the first line which contains global parameters.
  const parameterLine = allInputLines[0];

  // Parse the number of digits required for the solution.
  // The second parameter (constraint count) is not utilized in this specific implementation.
  const [requiredDigitCountStr, /* unusedConstraintCountStr */] = parameterLine.split(" ");
  const requiredDigitCount = parseInt(requiredDigitCountStr, 10);

  // Remaining lines are specific digit constraints.
  const digitConstraints = allInputLines.slice(1);

  // Initialize an array to hold the digits of the number.
  // Use 'null' to represent an unassigned digit, allowing for clearer state tracking.
  const constructedNumberDigits = Array(requiredDigitCount).fill(null);

  // A boolean flag to track if a valid number can be formed based on all constraints.
  let isSolutionFeasible = true;

  /**
   * Safely parses a single constraint line into its components.
   * @param {string} line - The constraint string (e.g., "1 7").
   * @returns {Array<number>|null} An array [position, digit] or null if parsing fails.
   */
  const parseConstraintLine = (line) => {
    const parts = line.split(" ");
    // Validate that we have exactly two parts and they are numeric.
    if (parts.length !== 2 || isNaN(parseInt(parts[0], 10)) || isNaN(parseInt(parts[1], 10))) {
      // Log an error for malformed input, indicating a potential problem.
      console.error("Malformed constraint line encountered, skipping:", line);
      return null; // Return null to signal an invalid constraint.
    }
    return [parseInt(parts[0], 10), parseInt(parts[1], 10)];
  };

  // Iterate over each provided constraint to populate the digit array.
  for (let i = 0; i < digitConstraints.length; i++) {
    const currentConstraintLine = digitConstraints[i];
    const parsedConstraint = parseConstraintLine(currentConstraintLine);

    // If parsing failed for the current constraint, mark the solution as infeasible
    // and proceed to the next constraint (or exit if desired, but skipping is safer).
    if (!parsedConstraint) {
      isSolutionFeasible = false;
      continue; // Move to the next constraint line.
    }

    const positionIndex = parsedConstraint[0] - 1; // Convert 1-indexed position to 0-indexed.
    const assignedDigit = parsedConstraint[1];

    // Implement a guard clause: ensure the position is within the valid range.
    if (positionIndex < 0 || positionIndex >= requiredDigitCount) {
      console.error(`Constraint position ${parsedConstraint[0]} is out of bounds for a ${requiredDigitCount}-digit number. Constraint: ${currentConstraintLine}`);
      isSolutionFeasible = false; // An invalid position makes the overall solution impossible.
      continue;
    }

    // Check for conflicts: if a digit is already set at this position and
    // it's different from the current constraint, then a conflict exists.
    const existingDigit = constructedNumberDigits[positionIndex];
    if (existingDigit !== null && existingDigit !== assignedDigit) {
      isSolutionFeasible = false; // Conflict detected, no valid solution can be formed.
      // No need to process further constraints if a conflict is found, but loop continues for logging.
    } else {
      // Apply the constraint: set the digit at the specified position.
      constructedNumberDigits[positionIndex] = assignedDigit;
    }
  }

  // If constraints have already rendered a solution impossible, output -1 and terminate.
  if (!isSolutionFeasible) {
    console.log(-1);
    return; // Exit the function early.
  }

  // Logic to fill unassigned digits to form the smallest possible number.
  // Special handling for the first digit to ensure it's not zero if N > 1.

  // If the number of digits is greater than one and the first digit is unassigned,
  // it must be set to '1' to form the smallest valid N-digit number.
  if (requiredDigitCount > 1 && constructedNumberDigits[0] === null) {
    constructedNumberDigits[0] = 1;
  }

  // Fill any remaining unassigned digits (represented by 'null') with '0'
  // to ensure the smallest possible number is constructed.
  for (let j = 0; j < requiredDigitCount; j++) {
    if (constructedNumberDigits[j] === null) {
      constructedNumberDigits[j] = 0;
    }
  }

  // Add validation: if N > 1 and the first digit is '0', this forms an invalid N-digit number.
  // (e.g., "012" should be "12", not a 3-digit number).
  // The only exception is N=1, where '0' is a valid single-digit number.
  if (requiredDigitCount > 1 && constructedNumberDigits[0] === 0) {
    isSolutionFeasible = false;
  }

  // Initialize the final result to -1, which is the default error value.
  let finalNumberValue = -1;

  // If a solution is still deemed feasible after all checks, construct the number.
  if (isSolutionFeasible) {
    // Join the array of digits into a string representation.
    const numberAsString = constructedNumberDigits.join("");
    // Parse the string into an integer.
    finalNumberValue = parseInt(numberAsString, 10);

    // Final integrity check: Ensure the string representation of the number
    // still has the required number of digits. This handles cases where
    // parseInt might truncate leading zeros (though our logic aims to prevent this
    // for N > 1, it's a robust final check).
    if (numberAsString.length !== requiredDigitCount) {
        isSolutionFeasible = false; // The constructed number does not match the required length.
        finalNumberValue = -1; // Reset to error value.
    }
  }

  // Output the final result based on feasibility.
  if (isSolutionFeasible) {
    console.log(finalNumberValue);
  } else {
    console.log(-1);
  }
}

// This section handles reading input from stdin and calling the main processing function.
// It should remain unchanged to ensure compatibility with typical competitive programming environments.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
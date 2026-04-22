// This module computes a specific score based on input parameters.
// The calculation involves initial values and several adjustment phases.
const processInputAndCalculateScore = (rawDataString) => {
  // Input validation: Ensure the string is not empty or null.
  if (!rawDataString || typeof rawDataString !== 'string') {
    console.error("Error: Invalid input data provided. Expected a non-empty string.");
    return null; // Or throw an error, depending on desired behavior.
  }

  // Step 1: Parse the string into an array of numeric values.
  // Using explicit parseInt for clarity and potential error handling (though not strictly needed for '+a').
  // Using a regex for splitting ensures robust handling of multiple spaces or leading/trailing spaces.
  const stringTokens = rawDataString.trim().split(/\s+/);

  // Check if enough parameters were provided.
  const EXPECTED_PARAMETER_COUNT = 5;
  if (stringTokens.length < EXPECTED_PARAMETER_COUNT) {
      console.error(`Error: Not enough numeric parameters found in input. Expected ${EXPECTED_PARAMETER_COUNT}, got ${stringTokens.length}.`);
      return null;
  }

  const numericValues = stringTokens.map(token => {
    const parsed = parseInt(token, 10);
    // Graceful handling of non-numeric tokens.
    if (isNaN(parsed)) {
        console.warn(`Warning: Non-numeric token '${token}' found during parsing. Using 0 instead.`);
        return 0;
    }
    return parsed;
  });

  // Destructure for better readability, giving meaningful names to parameters.
  // Original indices: s[0], s[1], s[2], s[3], s[4]
  let [
    primaryValueA,      // Corresponds to s[0]
    primaryValueB,      // Corresponds to s[1]
    comparisonFactor,   // Corresponds to s[2]
    availableQuantityA, // Corresponds to s[3]
    availableQuantityB  // Corresponds to s[4]
  ] = numericValues;

  // Define a constant for the common threshold calculation to avoid magic numbers and repetition.
  const effectiveThreshold = comparisonFactor * 2;

  // Initialize the cumulative score.
  // This is the base calculation: primaryValueA * availableQuantityA + primaryValueB * availableQuantityB
  let cumulativeScore = (primaryValueA * availableQuantityA) + (primaryValueB * availableQuantityB);

  // Intermediate calculation for the sum of primary values, used in the first adjustment phase.
  const sumOfPrimaryValues = primaryValueA + primaryValueB;

  // Adjustment Phase 1: Conditional deduction based on sum of primary values exceeding threshold.
  // This block reflects the condition: if(s[0] + s[1] > s[2] * 2)
  if (sumOfPrimaryValues > effectiveThreshold) {
    // Determine the minimum available quantity for the first adjustment.
    // This value is 'm' in the original code.
    const sharedAdjustmentAmount = Math.min(availableQuantityA, availableQuantityB);

    // Calculate the deduction rate for this phase.
    // This is (s[0] + s[1] - s[2] * 2) from the original code.
    const deductionRatePhase1 = sumOfPrimaryValues - effectiveThreshold;

    // Apply the deduction to the cumulative score.
    cumulativeScore -= (deductionRatePhase1 * sharedAdjustmentAmount);

    // Update quantities after the shared adjustment.
    // These are s[3] -= m; and s[4] -= m; in the original.
    availableQuantityA -= sharedAdjustmentAmount;
    availableQuantityB -= sharedAdjustmentAmount;
  }

  // Adjustment Phase 2: Deductions for remaining quantities based on individual primary values.

  // Helper function to encapsulate the logic for applying a single deduction
  // if quantity and value conditions are met. This replaces the two final 'if' statements.
  const applyIndividualDeduction = (currentValue, currentQuantity, currentScoreToAdjust, thresholdVal) => {
    // Check if there's still quantity remaining and if the value exceeds the threshold.
    // Corresponds to conditions like s[3]>0 && s[0]>s[2]*2
    if (currentQuantity > 0 && currentValue > thresholdVal) {
      const individualDeductionFactor = currentValue - thresholdVal;
      const individualDeductionAmount = individualDeductionFactor * currentQuantity;
      return currentScoreToAdjust - individualDeductionAmount;
    }
    return currentScoreToAdjust; // No deduction applied if conditions are not met.
  };

  // Apply deduction for primaryValueA and availableQuantityA.
  // Corresponds to if(s[3]>0 && s[0]>s[2]*2)ans -= (s[0] - s[2] * 2) * s[3];
  cumulativeScore = applyIndividualDeduction(
    primaryValueA,
    availableQuantityA,
    cumulativeScore,
    effectiveThreshold
  );

  // Apply deduction for primaryValueB and availableQuantityB.
  // Corresponds to if(s[4]>0 && s[1]>s[2]*2)ans -= (s[1] - s[2] * 2) * s[4];
  cumulativeScore = applyIndividualDeduction(
    primaryValueB,
    availableQuantityB,
    cumulativeScore,
    effectiveThreshold
  );

  // Finally, return the computed score.
  return cumulativeScore;
};

// Main execution block for the script, wrapped in an Immediately Invoked Function Expression (IIFE).
// This isolates the execution scope and clearly separates the function definition from its invocation.
(() => {
  // Read input from standard input using Node.js 'fs' module.
  // Specify 'utf8' encoding for the input string.
  const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

  // Compute the final score using our refactored function.
  const finalCalculatedScore = processInputAndCalculateScore(rawInputData);

  // Output the result to the console.
  if (finalCalculatedScore !== null) {
    console.log(finalCalculatedScore);
  } else {
    // If the function returned null, it indicates an error in processing the input.
    // An error message would have been logged by the function itself.
    console.error("The score calculation could not be completed due to invalid input data.");
  }
})();
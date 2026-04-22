// This module is designed to process a string of numerical input and perform a specific calculation.
// It aims to determine an aggregated value based on a total quantity and two segment sizes.
function CalculateAggregatedValue(inputLine) {
  // Split the incoming data string by spaces to get individual numeric tokens.
  const dataTokens = inputLine.split(" ");

  // --- Start of added validation and helper variables ---
  // Ensure that we have precisely three numerical inputs as expected.
  const EXPECTED_TOKEN_COUNT = 3;
  if (dataTokens.length !== EXPECTED_TOKEN_COUNT) {
    console.error(`ERROR: Input line must contain exactly ${EXPECTED_TOKEN_COUNT} space-separated numbers. Found ${dataTokens.length}.`);
    return; // Exit if input format is incorrect.
  }

  // Parse the primary numerical components from the tokens.
  // Using a radix of 10 for explicit decimal conversion.
  const totalAmount = parseInt(dataTokens[0], 10);
  const componentA_Size = parseInt(dataTokens[1], 10);
  const componentB_Size = parseInt(dataTokens[2], 10);

  // Validate that all parsed components are indeed valid numbers.
  if (isNaN(totalAmount) || isNaN(componentA_Size) || isNaN(componentB_Size)) {
    console.error("ERROR: One or more input components could not be parsed as valid integers.");
    return; // Exit if any parsing fails.
  }
  // --- End of added validation and helper variables ---

  // Calculate the combined size of one complete cycle, which consists of component A and component B.
  const combinedCycleSize = componentA_Size + componentB_Size;

  // --- Start of added guard clause ---
  // Prevent division by zero if the combined cycle size is unexpectedly zero.
  // In typical problem contexts, component sizes are positive, so this is a defensive check.
  if (combinedCycleSize === 0) {
    console.error("ERROR: The sum of component A and component B sizes is zero, leading to an invalid cycle calculation.");
    return;
  }
  // --- End of added guard clause ---

  // Determine the number of full, complete cycles that fit within the total amount.
  const fullCycleCount = Math.floor(totalAmount / combinedCycleSize);

  // Calculate the quantity remaining after all full cycles have been accounted for.
  const remainingQuantity = totalAmount % combinedCycleSize;

  // Calculate the initial aggregated value based on the full cycles, considering only component A's contribution per cycle.
  let currentAggregatedSum = fullCycleCount * componentA_Size;

  // --- Start of rewritten logic (Type III change: if/else to Math.min) ---
  // Determine the additional contribution from the remaining quantity.
  // This is either the remainder itself or the full size of component A, whichever is smaller.
  // This concisely replaces the original if-else block.
  const additionalContributionFromRemainder = Math.min(remainingQuantity, componentA_Size);

  // Add this final contribution to the running sum.
  currentAggregatedSum += additionalContributionFromRemainder;
  // --- End of rewritten logic ---

  // Output the final computed aggregated value.
  console.log(currentAggregatedSum);
}

// The following line is standard boilerplate for competitive programming environments
// and should not be altered. It reads input from stdin and invokes the main processing function.
CalculateAggregatedValue(require("fs").readFileSync("/dev/stdin", "utf8"));
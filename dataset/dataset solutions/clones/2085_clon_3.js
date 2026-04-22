// This function serves as the primary entry point for processing the provided input data.
// It calculates the lowest possible combined price for a refrigerator and a microwave,
// taking into account potential discount coupons.
function calculateMinimumCost(fullInputDataString) {
  // First, parse the entire input string into an array of individual lines.
  // This simplifies accessing different parts of the input.
  let inputLines = fullInputDataString.split('\n');

  // A small helper function to convert a space-separated string of numbers
  // into an array of actual numeric values.
  const parseNumericLine = (lineContent) => lineContent.split(' ').map(Number);

  // Extract the first line, which contains the counts:
  // number of refrigerator models, number of microwave models, and number of discount coupons.
  // We use array destructuring for clarity.
  const [totalFridgeModels, totalOvenModels, totalCoupons] = parseNumericLine(inputLines.shift());

  // The next line contains the prices for all available refrigerator models.
  const refrigeratorItemCosts = parseNumericLine(inputLines.shift());

  // Following that, we get the prices for all available microwave oven models.
  const microwaveItemCosts = parseNumericLine(inputLines.shift());

  // Determine the base minimum price: the sum of the cheapest refrigerator
  // and the cheapest microwave, without considering any coupons yet.
  const minFridgePrice = Math.min(...refrigeratorItemCosts);
  const minOvenPrice = Math.min(...microwaveItemCosts);
  let overallLowestPrice = minFridgePrice + minOvenPrice;

  // Process each remaining line, as these represent the discount coupons.
  // Each coupon specifies a specific fridge-oven pair and a discount amount.
  for (const couponEntry of inputLines) {
    // Skip any empty lines that might be present due to input formatting (e.g., trailing newlines).
    if (!couponEntry.trim()) {
      continue;
    }

    // Parse the coupon details: the 1-based index of the refrigerator,
    // the 1-based index of the microwave, and the discount value.
    const [fridgeSelectionIndex, ovenSelectionIndex, discountValue] = parseNumericLine(couponEntry);

    // Convert the 1-based indices to 0-based for correct array access.
    const actualFridgeCost = refrigeratorItemCosts[fridgeSelectionIndex - 1];
    const actualOvenCost = microwaveItemCosts[ovenSelectionIndex - 1];

    // Basic validation: ensure the indices are valid and refer to existing items.
    // If not, this coupon might be malformed or invalid, so we skip it.
    if (actualFridgeCost === undefined || actualOvenCost === undefined) {
      // In a real-world scenario, one might log a warning here.
      continue;
    }

    // Calculate the total price for this specific fridge-oven combination
    // after applying the coupon discount.
    const currentCombinationDiscountedPrice = actualFridgeCost + actualOvenCost - discountValue;

    // Update our overall lowest price if this coupon offers a better deal.
    overallLowestPrice = Math.min(overallLowestPrice, currentCombinationDiscountedPrice);
  }

  // Output the final calculated minimum price to the console.
  console.log(overallLowestPrice);
}

// The following lines are boilerplate for competitive programming environments.
// They read the standard input and pass it to our main processing function.
// Do not modify this part.
calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));
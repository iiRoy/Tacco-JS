'use strict';

(function(rawInputString) {
  // Step 1: Process the raw input string.
  // Trim leading/trailing whitespace.
  const trimmedInputContent = rawInputString.trim();

  // Split the string by one or more whitespace characters.
  const stringNumberComponents = trimmedInputContent.split(/\s+/);

  // Convert each string component to a number.
  // Using Number() is equivalent to the original x=>x-0 for numeric conversion.
  const parsedNumericValues = stringNumberComponents.map(Number);

  // Step 2: Extract problem parameters from the parsed values.
  // N represents the count of apples.
  const appleQuantity = parsedNumericValues[0];
  // L represents the starting flavor value.
  const initialAppleFlavor = parsedNumericValues[1];

  // Step 3: Determine which apple flavor to remove.
  // This logic identifies the apple with the smallest absolute flavor value.
  let flavorValueToRemove;

  // Calculate the flavor of the last apple in the sequence.
  const finalAppleFlavor = initialAppleFlavor + appleQuantity - 1;

  // Check if the range of apple flavors [initialAppleFlavor, finalAppleFlavor] spans across zero.
  // This occurs if initialFlavor and finalFlavor have opposite signs.
  const isZeroWithinFlavorRange = (initialAppleFlavor * finalAppleFlavor < 0);

  if (isZeroWithinFlavorRange) {
    // If the range includes zero, the apple closest to zero (or zero itself) is considered "eaten".
    // In this context, its value is treated as 0 for subtraction.
    flavorValueToRemove = 0;
  } else {
    // If the range does not span zero, all flavors are either positive or negative.
    if (initialAppleFlavor < 0) {
      // If all flavors are negative (e.g., -5, -4, -3), the one closest to zero is the largest (least negative).
      flavorValueToRemove = finalAppleFlavor;
    } else {
      // If all flavors are positive (e.g., 1, 2, 3), the one closest to zero is the smallest (most positive).
      flavorValueToRemove = initialAppleFlavor;
    }
  }

  // Step 4: Calculate the total sum of all apple flavors before removal.
  // The sum of an arithmetic series is given by: count * (first_term + last_term) / 2.
  const totalFlavorSumBeforeRemoval = appleQuantity * (initialAppleFlavor + finalAppleFlavor) / 2;

  // Step 5: Compute the final result by subtracting the removed flavor from the total sum.
  // The original code included Math.round, but for this specific arithmetic series and integer inputs,
  // the sum and difference will always be integers, making Math.round redundant.
  const finalComputedResult = totalFlavorSumBeforeRemoval - flavorValueToRemove;

  // Step 6: Output the final result to the console.
  console.log(finalComputedResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));

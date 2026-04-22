/*
 * This module computes the maximum possible product of a specified number of elements (K)
 * chosen from an input array of integers (N total numbers).
 * It incorporates modular arithmetic to handle potentially very large results.
 *
 * The problem aims to find the K numbers whose product is maximal.
 * This often involves selecting the largest positive numbers, or pairs of negative numbers
 * (since negative * negative = positive) to maximize the product.
 *
 * Input format for standard input:
 *   Line 1: Two space-separated integers, representing the total count of numbers (N)
 *           and the number of elements to select (K).
 *   Line 2: N space-separated integers, which are the source numbers.
 *
 * Output:
 *   A string representation of the maximum product, calculated modulo (10^9 + 7).
 */
const fileSystemInterface = require('fs');

/**
 * Calculates the maximum product of `elementsToSelect` numbers from a given array `sourceValues`.
 *
 * @param {string} rawInputContent - The raw string input from stdin.
 * @returns {string} The maximum product modulo (10^9 + 7) as a string.
 */
const determineMaxProduct = (rawInputContent) => {
  // Parse the incoming string data into structured numerical arrays.
  const allInputLines = rawInputContent.trim().split('\n');

  // Destructure the first two lines for counts and values.
  const [countsDataLine, numericalValuesLine] = allInputLines;

  // Extract N (total numbers) and K (elements to select) from the first line.
  const [totalNumberCount, elementsToSelectCount] = countsDataLine
    .split(' ')
    .map(numericString => parseInt(numericString, 10));

  // Extract all source numbers from the second line.
  const sourceNumericalValues = numericalValuesLine
    .split(' ')
    .map(numericString => parseInt(numericString, 10));

  // Basic validation: If we need to select more elements than available,
  // it implies an invalid scenario for the problem, or a product of 0.
  if (elementsToSelectCount > totalNumberCount) {
    return '0'; // Cannot select more items than exist.
  }

  // Categorize numbers into positive, negative, and count of zeros for efficient processing.
  let collectionOfPositives = [];
  let collectionOfNegatives = [];
  let currentZeroOccurrences = 0;

  for (const valueItem of sourceNumericalValues) {
    if (valueItem > 0) {
      collectionOfPositives.push(valueItem);
    } else if (valueItem < 0) {
      collectionOfNegatives.push(valueItem);
    } else {
      currentZeroOccurrences++;
    }
  }

  // Define the prime modulus for all arithmetic operations to prevent overflow.
  const operationalModulus = BigInt(1_000_000_007); // 1e9 + 7

  /**
   * Performs modular multiplication for two BigInt numbers.
   * Ensures the result is always positive before applying the modulo.
   * @param {BigInt} factorA - The first operand.
   * @param {BigInt} factorB - The second operand.
   * @returns {BigInt} The result of (factorA * factorB) % operationalModulus.
   */
  const performModularProduct = (factorA, factorB) => {
    const bigIntA = BigInt(factorA);
    const bigIntB = BigInt(factorB);
    // Add modulus before taking modulo to handle negative intermediate results correctly.
    return (bigIntA * bigIntB % operationalModulus + operationalModulus) % operationalModulus;
  };

  // Sort the categorized numbers to easily pick largest/smallest.
  // Positive numbers are sorted in descending order (largest first).
  collectionOfPositives.sort((a, b) => b - a);
  // Negative numbers are sorted in ascending order (least negative first, i.e., largest magnitude negative last).
  collectionOfNegatives.sort((a, b) => a - b);

  // --- Initial Edge Case Handling ---

  // If `elementsToSelectCount` is greater than the total count of non-zero numbers,
  // and there are zeros available, we are forced to pick at least one zero.
  // This results in a product of 0.
  const availableNonZeroCount = collectionOfPositives.length + collectionOfNegatives.length;
  if (elementsToSelectCount > availableNonZeroCount && currentZeroOccurrences > 0) {
    return '0';
  }

  // If there are no positive numbers available, and we need to select an odd number of elements.
  // The product will inevitably be negative (unless a zero is picked, which is handled above).
  // To maximize a negative product, we must pick the K negative numbers closest to zero (smallest magnitude).
  const noPositivesAvailable = (collectionOfPositives.length === 0);
  const selectionCountIsOdd = (elementsToSelectCount % 2 !== 0);

  if (noPositivesAvailable && selectionCountIsOdd) {
    // If a zero is present, picking it yields 0, which is greater than any negative product.
    if (currentZeroOccurrences > 0) {
      return '0';
    } else {
      // No positives, no zeros, and K is odd. We must pick K negatives.
      // To get the "least negative" (maximum) product, select the K negative values
      // that are closest to zero (i.e., the K largest values in the sorted `collectionOfNegatives` array).
      const finalNegativeSubselection = collectionOfNegatives.slice(-elementsToSelectCount);
      const computedNegativeProduct = finalNegativeSubselection.reduce(performModularProduct, BigInt(1));
      return `${computedNegativeProduct}`;
    }
  }

  // --- Main Selection Logic: Greedily pick elements ---
  // We aim to select `elementsToSelectCount` numbers, prioritizing those that contribute to the largest product.

  let selectedPositiveNumbers = [];
  let selectedNegativeNumbers = [];
  let positiveCursor = 0; // Index for `collectionOfPositives` (descending order)
  let negativeCursor = 0; // Index for `collectionOfNegatives` (ascending order)

  for (let iterationCount = 0; iterationCount < elementsToSelectCount; iterationCount++) {
    const hasMoreAvailablePositives = (positiveCursor < collectionOfPositives.length);
    const hasMoreAvailableNegatives = (negativeCursor < collectionOfNegatives.length);

    // Determine whether to pick from positive or negative collection.
    let shouldPickPositive = false;

    if (hasMoreAvailablePositives && hasMoreAvailableNegatives) {
      const currentLargestPositive = collectionOfPositives[positiveCursor];
      const currentSmallestNegativeMagnitude = Math.abs(collectionOfNegatives[negativeCursor]);

      // Greedy choice: If the largest available positive is greater than the magnitude of the
      // smallest available negative, pick the positive. This helps in building a larger product.
      // The parity adjustment phase will correct for an odd count of negatives later if needed.
      shouldPickPositive = (currentLargestPositive > currentSmallestNegativeMagnitude);
    } else if (hasMoreAvailablePositives) {
      shouldPickPositive = true; // Only positives left
    } else if (hasMoreAvailableNegatives) {
      shouldPickPositive = false; // Only negatives left
    } else {
      // This state implies we've run out of non-zero numbers before picking `elementsToSelectCount`.
      // The initial `elementsToSelectCount > availableNonZeroCount` check should ideally cover this.
      // If we reach here, it implies we must pick zeros if available.
      // However, the problem context implies we always pick `elementsToSelectCount` numbers,
      // and the earlier checks handle the '0' product scenario.
      break;
    }

    if (shouldPickPositive) {
      selectedPositiveNumbers.push(collectionOfPositives[positiveCursor]);
      positiveCursor++;
    } else {
      selectedNegativeNumbers.push(collectionOfNegatives[negativeCursor]);
      negativeCursor++;
    }
  }

  // --- Parity Adjustment for Negative Numbers ---
  // If the count of selected negative numbers is odd, the total product will be negative.
  // To maximize the product (make it positive or less negative), we need to make the count of negatives even.
  // This involves a strategic swap:
  // 1. Remove one selected negative and add one available positive.
  // 2. OR, remove one selected positive and add one available negative.

  const isSelectedNegativesCountOdd = (selectedNegativeNumbers.length % 2 !== 0);
  if (isSelectedNegativesCountOdd) {
    // Check if all original negative numbers have already been selected.
    const allOriginalNegativesAreUsed = (selectedNegativeNumbers.length === collectionOfNegatives.length);

    // Check if the next available positive is "stronger" (larger value) than the magnitude
    // of the next available negative.
    const nextPositiveIsMoreImpactful = (
        positiveCursor < collectionOfPositives.length &&
        negativeCursor < collectionOfNegatives.length &&
        collectionOfPositives[positiveCursor] > Math.abs(collectionOfNegatives[negativeCursor])
    );

    // Condition for attempting to swap a selected negative for an available positive:
    // This is preferred if:
    //   a) We have selected negatives to remove, AND
    //   b) We have positives to add, AND
    //   c) Either all original negatives were already selected (forcing this option if possible),
    //      OR the next available positive offers a better product contribution than the next available negative.
    if (selectedNegativeNumbers.length > 0 && positiveCursor < collectionOfPositives.length &&
        (allOriginalNegativesAreUsed || nextPositiveIsMoreImpactful)) {
      // Remove the least impactful selected negative (largest magnitude, last one added)
      selectedNegativeNumbers.pop();
      // Add the most impactful available positive
      selectedPositiveNumbers.push(collectionOfPositives[positiveCursor]);
      positiveCursor++; // Advance positive pointer
    }
    // Otherwise, if the above swap is not optimal or not possible,
    // and we have selected positives to remove and negatives to add:
    else if (selectedPositiveNumbers.length > 0 && negativeCursor < collectionOfNegatives.length) {
      // Remove the least impactful selected positive (smallest value, last one added)
      selectedPositiveNumbers.pop();
      // Add the most impactful available negative (smallest magnitude, next in sorted list)
      selectedNegativeNumbers.push(collectionOfNegatives[negativeCursor]);
      negativeCursor++; // Advance negative pointer
    }
    // If neither swap is possible (e.g., no positives to add, or no negatives to remove/add),
    // we are left with an odd number of negatives, resulting in a negative product.
    // The problem implies that a valid swap will always be possible if needed,
    // given the greedy selection and initial edge cases.
  }

  // --- Final Product Calculation ---
  // Multiply all selected positive numbers and all selected negative numbers.
  // Use BigInt(1) as initial value for reduce to handle empty arrays correctly.
  const finalProductOfPositives = selectedPositiveNumbers.reduce(performModularProduct, BigInt(1));
  const finalProductOfNegatives = selectedNegativeNumbers.reduce(performModularProduct, BigInt(1));

  // Combine the products to get the overall result.
  const overallComputedProduct = performModularProduct(finalProductOfPositives, finalProductOfNegatives);

  // Return the final product as a string.
  return `${overallComputedProduct}`;
};

// Execute the main function with input read from standard input.
// The result is then printed to the console.
console.log(determineMaxProduct(fileSystemInterface.readFileSync('/dev/stdin', 'utf8')));
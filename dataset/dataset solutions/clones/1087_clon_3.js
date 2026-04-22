; (function () {
  'use strict';

  /**
   * Processes a collection of numeric entries to derive a specific aggregate.
   * This utility targets summation of even integers within the provided dataset.
   * @param {Array<number>} sourceCollection - An array of numerical elements for analysis.
   * @returns {number} The aggregated value based on specified criteria, or 0 if input is invalid or no suitable elements are found.
   */
  const computeParityTotal = (sourceCollection) => {
    // Preliminary input validation: Verify that the input is indeed an array structure.
    if (!Array.isArray(sourceCollection)) {
      console.warn("Invalid input detected: Expected an array but received a non-array type. Defaulting to zero.");
      return 0;
    }

    // Early exit condition: If the collection is empty, there's nothing to process.
    if (sourceCollection.length === 0) {
      console.log("Empty collection provided. Returning zero.");
      return 0;
    }

    // Declare an accumulator variable, initialized to a neutral value for summation.
    let cumulativeValue = 0;

    // First pass: Filter the collection to isolate only valid even numbers.
    // This involves checking type, NaN status, and parity.
    const parityFilteredElements = sourceCollection.filter(currentElement => {
      const isNumeric = typeof currentElement === 'number' && !Number.isNaN(currentElement);
      if (!isNumeric) {
        // Optionally log non-numeric elements for debugging/auditing purposes.
        // console.debug(`Skipping non-numeric element: ${currentElement}`);
        return false;
      }
      // Use the bitwise AND operator for an alternative evenness check.
      // If the least significant bit is 0, the number is even.
      const isEven = (currentElement & 1) === 0;
      return isEven;
    });

    // Second pass: Iterate through the pre-filtered elements using a traditional loop.
    let elementPointer = 0;
    const totalFilteredCount = parityFilteredElements.length;

    while (elementPointer < totalFilteredCount) {
      const valueToAggregate = parityFilteredElements[elementPointer];
      // Perform the accumulation.
      cumulativeValue += valueToAggregate;
      elementPointer++;
    }

    // The final result of the aggregation.
    return cumulativeValue;
  };

  // Example data sequence, including various types for robust testing.
  const dataSequence = [1, 2, 3, 4, null, 5.5, 6, 7, 'eight', 9, 10, undefined, -2, 0, NaN];

  // Execute the primary computation function.
  const finalOutcome = computeParityTotal(dataSequence);

  // Provide feedback on the operation's conclusion.
  console.info(`Operation concluded. The final aggregated value is: ${finalOutcome}`);

  // Test cases for different input scenarios.
  console.log("\n--- Testing Edge Cases ---");
  console.log("Result for invalid input (string):", computeParityTotal("not an array"));
  console.log("Result for empty array:", computeParityTotal([]));
  console.log("Result for array with no even numbers:", computeParityTotal([1, 3, 5, 7]));
  console.log("Result for array with only even numbers:", computeParityTotal([2, 4, 8]));
  console.log("Result for array with mixed types and even numbers:", computeParityTotal([1, 'a', 2, null, 4, undefined, 6]));
  console.log("Result for array with negative even numbers:", computeParityTotal([-2, -4, 1, 3]));

})();
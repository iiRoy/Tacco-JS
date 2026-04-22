'use strict';
// This module computes expected values for a specific combinatorial problem
// using dynamic programming. It processes input from standard input,
// calculates frequencies, and then populates a 3D matrix with probabilities.
(function(fileContent){

  // Helper function to parse numerical inputs from a string.
  // It handles trimming whitespace, splitting by spaces, and converting to numbers.
  const parseNumbers = (text) => {
    const cleanedText = text.trim();
    const stringParts = cleanedText.split(/\s+/);
    return stringParts.map(str => Number(str));
  };

  let numericalValues = parseNumbers(fileContent);

  // Extract the total number of items from the beginning of the sequence.
  // An essential check to ensure the input data is not empty.
  if (numericalValues.length < 1) {
    console.error("Error: Input data is insufficient. Expected at least one number for total items.");
    return; // Exit if critical data is missing
  }
  const totalElements = numericalValues.shift();

  // Initialize an array to store frequencies of items with values 1, 2, or 3.
  // The 0th index is intentionally unused to align with item values.
  const elementFrequency = new Array(4).fill(0); // Structure: [unused, count_of_1s, count_of_2s, count_of_3s]

  // Populate the frequency array based on the remaining numerical values.
  // This loop iterates over each item and increments its corresponding count.
  for (const currentElement of numericalValues) {
    // Basic validation to ensure element values are within the expected range (1 to 3).
    if (currentElement >= 1 && currentElement <= 3) {
      elementFrequency[currentElement]++;
    } else {
      // Optional: Log a warning for unexpected or out-of-range element values.
      // console.warn(`Warning: Encountered an unexpected element value: ${currentElement}. Skipping.`);
    }
  }

  // Additional early exit check for totalElements, if it's not positive.
  if (totalElements <= 0) {
      console.log("Output: 0.00 (Total elements must be positive for meaningful calculation)");
      return;
  }

  // Initialize a 3D matrix for dynamic programming calculations.
  // This matrix will store expected values (e.g., number of operations).
  // Dimensions are slightly extended to accommodate boundary conditions, including negative indices as properties.
  const probabilityMatrix = new Array(totalElements + 2);

  // Setup the dimensions and default values for the probability matrix.
  // The loops iterate through potential counts of items of value 1, 2, and 3.
  for (let firstDimIndex = -1; firstDimIndex < totalElements + 2; ++firstDimIndex) {
    // Initialize the second dimension as an object/array to allow for '-1' property.
    probabilityMatrix[firstDimIndex] = new Array();
    
    for (let secondDimIndex = -1; secondDimIndex < totalElements + 2 - firstDimIndex; ++secondDimIndex) {
      // Initialize the third dimension.
      const innerArrayLength = totalElements + 2 - firstDimIndex - secondDimIndex;
      // Ensure array length is non-negative before creation.
      probabilityMatrix[firstDimIndex][secondDimIndex] = new Array(Math.max(0, innerArrayLength)).fill(0);
      
      // Explicitly set the property for index '-1' to 0. This is a crucial boundary condition
      // for the DP recurrence relations, handling cases where a count might conceptually
      // go below zero during a recursive step.
      probabilityMatrix[firstDimIndex][secondDimIndex]['-1'] = 0;
    }
  }

  // --- Core Dynamic Programming Calculation ---
  // Iterate through all possible states to compute expected values.
  // `currentIterVal` represents the sum of counts of items (c1 + c2 + c3) being considered.
  for (let currentIterVal = 1; currentIterVal <= totalElements; ++currentIterVal) {
    const currentDivisor = currentIterVal; // Denominator used in all probability terms

    // Base case: Expected value when only items of value '1' are present.
    // This computes dp[currentIterVal][0][0].
    const previousStateVal1_0_0 = probabilityMatrix[currentIterVal - 1][0][0];
    probabilityMatrix[currentIterVal][0][0] = previousStateVal1_0_0 + (totalElements / currentDivisor);

    // Iterate for states involving items of value '2'.
    // `countOfTwoItems` represents the number of items with value 2.
    for (let countOfTwoItems = 1; countOfTwoItems <= currentIterVal; ++countOfTwoItems) {
      // Calculate current counts for items of value 1, 2, and 3 (which is 0 here).
      const current1s = currentIterVal - countOfTwoItems;
      const current2s = countOfTwoItems;
      const current3s = 0;

      // Decompose the DP recurrence relation for clarity.
      // Term 1: Base expectation (N/currentIterVal).
      const baseExpectedTerm = totalElements / currentDivisor;
      // Term 2: Probability of selecting a '2' and transitioning from a state with one less '2' and one more '1'.
      const fromTwoItemsTerm = probabilityMatrix[current1s + 1][current2s - 1][current3s] * (current2s / currentDivisor);
      // Term 3: Probability of selecting a '1' and transitioning from a state with one less '1'.
      const fromOneItemsTerm = probabilityMatrix[current1s - 1][current2s][current3s] * (current1s / currentDivisor);

      // Sum all terms to get the expected value for the current state (current1s, current2s, 0).
      probabilityMatrix[current1s][current2s][current3s] = baseExpectedTerm + fromTwoItemsTerm + fromOneItemsTerm;

      // Iterate for states involving items of value '3'.
      // `countOfThreeItems` represents the number of items with value 3.
      for (let countOfThreeItems = 1; countOfThreeItems <= countOfTwoItems; ++countOfThreeItems) {
        // Calculate the updated counts for items of value 1, 2, and 3.
        const updated1s = currentIterVal - countOfTwoItems;
        const updated2s = countOfTwoItems - countOfThreeItems;
        const updated3s = countOfThreeItems;

        // Decompose the full DP recurrence relation.
        // Term 1: Base expectation (N/currentIterVal).
        const finalBaseExpected = totalElements / currentDivisor;
        // Term 2: From selecting a '3'.
        const fromThreeSelectedTerm = probabilityMatrix[updated1s][updated2s + 1][updated3s - 1] * (updated3s / currentDivisor);
        // Term 3: From selecting a '2'.
        const fromTwoSelectedTerm = probabilityMatrix[updated1s + 1][updated2s - 1][updated3s] * (updated2s / currentDivisor);
        // Term 4: From selecting a '1'.
        const fromOneSelectedTerm = probabilityMatrix[updated1s - 1][updated2s][updated3s] * (updated1s / currentDivisor);

        // Sum all terms to get the final expected value for the state (updated1s, updated2s, updated3s).
        probabilityMatrix[updated1s][updated2s][updated3s] = finalBaseExpected + fromThreeSelectedTerm + fromTwoSelectedTerm + fromOneSelectedTerm;
      }
    }
  }

  // Retrieve the final calculated expected value based on the initial counts of items (1, 2, 3).
  // This corresponds to the state where the number of items matches the initial input frequencies.
  const finalResult = probabilityMatrix[elementFrequency[1]][elementFrequency[2]][elementFrequency[3]];
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin','utf8'));
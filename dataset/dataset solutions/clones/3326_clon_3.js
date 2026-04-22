(function(rawInputString) {
  // --- Input Processing and Initialization ---

  // Parse the raw input string: trim whitespace, split by any whitespace, and convert to numbers.
  // The first number is the total initial items (N), subsequent numbers are item sizes.
  let processedNumericData = rawInputString.trim().split(/\s+/).map(textualValue => {
    const numericValue = Number.parseInt(textualValue, 10);
    // Basic validation: if parsing fails, treat as 0 (though problem constraints usually guarantee valid input).
    if (isNaN(numericValue)) {
      return 0;
    }
    return numericValue;
  });

  // Extract the total initial number of items from the start of the array.
  const totalOriginalItems = processedNumericData.shift();

  // Initialize an array to count occurrences of item sizes.
  // Index 0 is a placeholder (unused), index 1 for 1-items, 2 for 2-items, 3 for 3-items.
  const itemTypeCounts = [0, 0, 0, 0]; // Structure: [unused, count_of_1s, count_of_2s, count_of_3s]

  // Iterate over the remaining processed numbers to populate the item type counts.
  for (const sizeOfItem of processedNumericData) {
    // Only count items of sizes 1, 2, or 3, as per problem context.
    if (sizeOfItem >= 1 && sizeOfItem <= 3) {
      itemTypeCounts[sizeOfItem]++;
    }
  }

  // --- Dynamic Programming Table Setup ---

  // Create a 3D DP table to store expected values.
  // `expectedOperationCounts[c1][c2][c3]` will hold the expected number of operations
  // to clear the dish when there are `c1` items of size 1, `c2` items of size 2, and `c3` items of size 3.
  // Dimensions are `(totalOriginalItems + 2)` to safely handle boundary conditions (e.g., `c1-1`, `c2-1`, `c3-1` when `c1,c2,c3` are 0).
  const expectedOperationCounts = Array.from({
    length: totalOriginalItems + 2
  }, () =>
    Array.from({
      length: totalOriginalItems + 2
    }, () =>
      Array.from({
        length: totalOriginalItems + 2
      }).fill(0) // Initialize all cells to 0
    )
  );

  // Special boundary condition handling for the third dimension (c3) when it effectively becomes -1.
  // The recurrence relation involves `expectedOperationCounts[c1][c2+1][c3-1]`.
  // If `c3` is 0, this translates to `expectedOperationCounts[c1][c2+1][-1]`.
  // In JavaScript, array access with a negative number is treated as a string property (e.g., `arr['-1']`).
  // We explicitly set this property to 0, as a negative count implies an empty or invalid state.
  for (let dimOneIndex = 0; dimOneIndex <= totalOriginalItems + 1; dimOneIndex++) {
    for (let dimTwoIndex = 0; dimTwoIndex <= totalOriginalItems + 1; dimTwoIndex++) {
      // Ensure the nested array exists before attempting to set a property on it.
      // (It should exist due to the `Array.from` initialization for non-negative indices).
      if (expectedOperationCounts[dimOneIndex] && expectedOperationCounts[dimOneIndex][dimTwoIndex]) {
        expectedOperationCounts[dimOneIndex][dimTwoIndex][-1] = 0;
      }
    }
  }

  // --- DP Calculation Logic ---

  // Iterate through the total number of items currently in the dish, from 1 up to N.
  // This ensures that when computing E(c1, c2, c3), all necessary prior states (with fewer total items) are already calculated.
  for (let currentSumOfItems = 1; currentSumOfItems <= totalOriginalItems; currentSumOfItems++) {

    // First, handle the base case where only 1-items are present (c2=0, c3=0).
    // E(c1, 0, 0) = E(c1-1, 0, 0) + N / c1
    expectedOperationCounts[currentSumOfItems][0][0] =
      expectedOperationCounts[currentSumOfItems - 1][0][0] +
      (totalOriginalItems / currentSumOfItems);

    // Now, iterate for scenarios involving 2-items and 3-items.
    // `sumOfTwosAndThrees` represents `c2 + c3`.
    for (let sumOfTwosAndThrees = 1; sumOfTwosAndThrees <= currentSumOfItems; sumOfTwosAndThrees++) {

      // Calculate the state where only 1-items and 2-items are present (c3=0).
      // `countOfOnes_noThrees` = `c1`
      // `countOfTwos_noThrees` = `c2`
      // `countOfThrees` = 0
      const countOfOnes_noThrees = currentSumOfItems - sumOfTwosAndThrees;
      const countOfTwos_noThrees = sumOfTwosAndThrees;

      // Recurrence for E(c1, c2, 0):
      // E(c1, c2, 0) = (N + c1*E(c1-1, c2, 0) + c2*E(c1+1, c2-1, 0)) / (c1+c2)
      // This can be rewritten as:
      // E(c1, c2, 0) = N/(c1+c2) + (c1/(c1+c2))*E(c1-1, c2, 0) + (c2/(c1+c2))*E(c1+1, c2-1, 0)

      // Term 1: N / (c1+c2)
      let initialProbabilityTerm_noThrees = totalOriginalItems / currentSumOfItems;

      // Term 2: (c1 / (c1+c2)) * E(c1-1, c2, 0) - probability of picking a 1-item.
      let contributionFromPickingOne_noThrees = expectedOperationCounts[countOfOnes_noThrees - 1][countOfTwos_noThrees][0] * (countOfOnes_noThrees / currentSumOfItems);

      // Term 3: (c2 / (c1+c2)) * E(c1+1, c2-1, 0) - probability of picking a 2-item.
      let contributionFromPickingTwo_noThrees = expectedOperationCounts[countOfOnes_noThrees + 1][countOfTwos_noThrees - 1][0] * (countOfTwos_noThrees / currentSumOfItems);

      expectedOperationCounts[countOfOnes_noThrees][countOfTwos_noThrees][0] =
        initialProbabilityTerm_noThrees + contributionFromPickingOne_noThrees + contributionFromPickingTwo_noThrees;

      // Now, iterate for all combinations including 3-items.
      // `currentCountOfThrees` represents `c3`.
      for (let currentCountOfThrees = 1; currentCountOfThrees <= sumOfTwosAndThrees; currentCountOfThrees++) {

        // Determine the actual counts for the current DP state:
        const currentCountOfOnes = currentSumOfItems - sumOfTwosAndThrees; // c1
        const currentCountOfTwos = sumOfTwosAndThrees - currentCountOfThrees; // c2
        // const currentCountOfThrees = currentCountOfThrees; // c3 (already defined)

        // General DP recurrence relation for E(c1, c2, c3):
        // E(c1, c2, c3) = (N + c1*E(c1-1, c2, c3) + c2*E(c1+1, c2-1, c3) + c3*E(c1, c2+1, c3-1)) / (c1+c2+c3)
        // Rearranged to explicitly show contributions:
        // E(c1, c2, c3) = N/(c1+c2+c3)
        //                 + (c1/(c1+c2+c3)) * E(c1-1, c2, c3)  (picking a 1-item)
        //                 + (c2/(c1+c2+c3)) * E(c1+1, c2-1, c3) (picking a 2-item)
        //                 + (c3/(c1+c2+c3)) * E(c1, c2+1, c3-1) (picking a 3-item)

        // Term 1: N / (c1+c2+c3)
        let baseExpectedTerm = totalOriginalItems / currentSumOfItems;

        // Term 2: (c1 / (c1+c2+c3)) * E(c1-1, c2, c3)
        let probForOneItem = expectedOperationCounts[currentCountOfOnes - 1][currentCountOfTwos][currentCountOfThrees] * (currentCountOfOnes / currentSumOfItems);

        // Term 3: (c2 / (c1+c2+c3)) * E(c1+1, c2-1, c3)
        let probForTwoItems = expectedOperationCounts[currentCountOfOnes + 1][currentCountOfTwos - 1][currentCountOfThrees] * (currentCountOfTwos / currentSumOfItems);

        // Term 4: (c3 / (c1+c2+c3)) * E(c1, c2+1, c3-1)
        // This term utilizes the `expectedOperationCounts[...][-1]` boundary condition if `currentCountOfThrees` is 0.
        let probForThreeItems = expectedOperationCounts[currentCountOfOnes][currentCountOfTwos + 1][currentCountOfThrees - 1] * (currentCountOfThrees / currentSumOfItems);

        expectedOperationCounts[currentCountOfOnes][currentCountOfTwos][currentCountOfThrees] =
          baseExpectedTerm + probForOneItem + probForTwoItems + probForThreeItems;
      }
    }
  }

  // --- Final Output ---

  // Retrieve the final expected value corresponding to the initial item configuration.
  const finalExpectedOutcome = expectedOperationCounts[itemTypeCounts[1]][itemTypeCounts[2]][itemTypeCounts[3]];

  // Output the result, formatted to 10 decimal places for precision.
  console.log(finalExpectedOutcome.toFixed(10));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
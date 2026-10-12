function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  const lineSegments = rawData.split("\n");

  // The first line contains the total number of items.
  const itemCount = parseInt(lineSegments[0], 10);

  // Helper function to convert a string to an integer.
  const parseNumericValue = (strVal) => {
    return parseInt(strVal, 10);
  };

  // Initialize an array to store the costs for each activity.
  const activityCosts = [];

  // Loop through the remaining lines to populate activityCosts.
  for (let idx = 0; idx < itemCount; idx++) {
    // Each line represents an item with three activity costs, space-separated.
    activityCosts.push(lineSegments[idx + 1].split(' ').map(parseNumericValue));
  }

  // Calculate and print the maximum possible happiness.
  console.log(calculateMaxHappiness(itemCount, activityCosts));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Calculates the maximum happiness achievable using dynamic programming.
 * @param {number} totalItems - The total number of items (days).
 * @param {number[][]} costsPerItem - A 2D array where costsPerItem[i][j] is the cost (happiness)
 *                                    of performing activity j on item (day) i.
 * @returns {number} The maximum happiness.
 */
function calculateMaxHappiness(totalItems, costsPerItem) {
  // Initialize a DP table to store maximum happiness up to each item for each activity.
  // happinessTable[i][j] will store the max happiness on day 'i' ending with activity 'j'.
  const happinessTable = Array(totalItems).fill(0).map(_ => {
    return Array(3).fill(0);
  });

  // Base case: For the first item (day 0), happiness is simply the cost of each activity.
  happinessTable[0] = [...costsPerItem[0]];

  // Iterate from the second item (day 1) up to the last item.
  for (let itemIndex = 1; itemIndex < totalItems; itemIndex++) {
    // Iterate through each possible activity for the current item.
    for (let currentChoice = 0; currentChoice < 3; currentChoice++) {
      // Iterate through each possible activity for the previous item.
      for (let prevChoice = 0; prevChoice < 3; prevChoice++) {
        // Constraint: Cannot perform the same activity on consecutive items.
        if (currentChoice === prevChoice) {
          continue; // Skip if activities are the same.
        }
        // Update the maximum happiness for the current item and activity.
        // It's the cost of the current activity plus the max happiness from the previous day
        // with a different activity.
        happinessTable[itemIndex][currentChoice] = Math.max(
          happinessTable[itemIndex][currentChoice],
          costsPerItem[itemIndex][currentChoice] + happinessTable[itemIndex - 1][prevChoice]
        );
      }
    }
  }

  // The maximum happiness for the last item (day totalItems-1) across all activities
  // is the final result.
  return Math.max(...happinessTable[totalItems - 1]);
}

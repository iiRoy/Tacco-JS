function processMealOrder(rawInputString) {
  // Helper function to parse the raw input string into structured data.
  // This extracts the input processing logic into a dedicated unit.
  const parseMealData = (inputContent) => {
    const inputLines = inputContent.split("\n");

    // The first line contains a number 'N' representing the count of dishes to order.
    // The original code uses `input[0].split("")` which results in an array of characters,
    // and then relies on JavaScript's type coercion in the loop condition `i < n`
    // to treat it as a number. We explicitly convert it to a number here for clarity
    // and to maintain the exact loop iteration count.
    const numberOfDishesToOrder = Number(inputLines[0]);

    // The second line contains space-separated 1-indexed dish numbers in the order they are eaten.
    const orderedDishIndices = inputLines[1].split(" ").map(Number);

    // The third line contains space-separated base satisfaction scores for each dish (1-indexed).
    const baseSatisfactionScores = inputLines[2].split(" ").map(Number);

    // The fourth line contains space-separated bonus satisfaction scores for consecutive dishes.
    // The bonus `c[X]` is applied if dish `Y` is eaten immediately after dish `X`.
    const consecutiveBonusScores = inputLines[3].split(" ").map(Number);

    return {
      dishCount: numberOfDishesToOrder,
      dishOrder: orderedDishIndices,
      baseScores: baseSatisfactionScores,
      bonusScores: consecutiveBonusScores,
    };
  };

  // Parse all necessary data from the input string using the helper function.
  const { dishCount, dishOrder, baseScores, bonusScores } = parseMealData(rawInputString);

  let totalSatisfaction = 0; // Initialize the accumulator for the final score.

  // Iterate through each dish in the ordered sequence to calculate total satisfaction.
  for (let currentDishPosition = 0; currentDishPosition < dishCount; currentDishPosition++) {
    // Get the 1-indexed actual dish number for the current position in the order.
    const currentDishNumber = dishOrder[currentDishPosition];

    // Add the base satisfaction score for the current dish.
    // Array indices are 0-based, so we subtract 1 from the 1-indexed dish number.
    const baseScoreForCurrentDish = baseScores[currentDishNumber - 1];
    totalSatisfaction += baseScoreForCurrentDish;

    // Check if there's a previous dish to consider for a consecutive bonus.
    // The bonus logic only applies from the second dish onwards (i.e., when currentDishPosition > 0).
    if (currentDishPosition > 0) {
      // Get the 1-indexed actual dish number for the previous position.
      const previousDishNumber = dishOrder[currentDishPosition - 1];

      // Apply a bonus if the current dish number is exactly one greater than the previous dish number.
      if (currentDishNumber === previousDishNumber + 1) {
        // The bonus score is also 0-indexed based on the *previous* dish number.
        const bonusForConsecutivePair = bonusScores[previousDishNumber - 1];
        totalSatisfaction += bonusForConsecutivePair;
      }
    }
  }

  // Output the final calculated total satisfaction.
  console.log(totalSatisfaction);
}

// Standard boilerplate to read input from /dev/stdin and pass it to the main processing function.
processMealOrder(require("fs").readFileSync("/dev/stdin", "utf8"));

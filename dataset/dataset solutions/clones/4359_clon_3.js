function solutionCalculator(problemInputString) {
  // Helper function: Provides a simple numerical comparison for ascending sort operations.
  // This ensures that arrays of numbers are sorted correctly.
  const sortNumbersAscending = (valA, valB) => valA - valB;

  // --- Input Parsing and Configuration Extraction ---

  // Sanitize and split the raw input string into individual lines.
  const inputLines = problemInputString.trim().split('\n');

  // Parse the first line which contains all the problem-specific parameters.
  // Using Number() for type conversion is a concise way to parse string to number.
  const initialParameters = inputLines[0].split(' ').map(Number);

  // Implement a basic validation check for the number of input parameters.
  // If the input format is unexpected, return a default "0 0" solution.
  if (initialParameters.length !== 6) {
    // In a real application, more robust error handling or logging might be used.
    // For this context, returning a default output is sufficient.
    return "0 0";
  }

  // Assign descriptive variable names for clarity, converting values as per problem logic.
  // `sugarUnitAWeight` and `sugarUnitBWeight` are multiplied by 100, which is crucial
  // for consistent unit handling (e.g., converting grams to 100g units or handling total solution weight later).
  const sugarUnitAWeight = initialParameters[0] * 100;     // Weight of sugar type A (scaled)
  const sugarUnitBWeight = initialParameters[1] * 100;     // Weight of sugar type B (scaled)
  const waterUnitCWeight = initialParameters[2];           // Weight of water type C
  const waterUnitDWeight = initialParameters[3];           // Weight of water type D
  const maxSolubilityPercentage = initialParameters[4];    // Maximum sugar concentration allowed (E)
  const maximumTotalWeight = initialParameters[5];         // Overall weight limit for the mixture (F)

  // --- Generation of Possible Sugar (Solvent) Mixtures ---

  // Use a JavaScript Set to store unique combinations of sugar weights.
  // Sets automatically handle uniqueness, simplifying the subsequent filtering step.
  const uniqueSugarMixtureWeights = new Set();
  let currentAccumulatedSugar; // Temporary variable to hold intermediate sugar sums.

  // Nested loops to generate all possible combinations of sugar units A and B.
  // The loops iterate indefinitely, breaking when conditions are met to avoid exceeding limits
  // or to handle cases where unit weights are zero to prevent infinite loops.
  for (let countA = 0; ; ++countA) {
    currentAccumulatedSugar = sugarUnitAWeight * countA;
    // Break if current sugar sum exceeds the total weight limit, or if sugarUnitAWeight is 0
    // and we've already processed the zero-count iteration.
    if (currentAccumulatedSugar > maximumTotalWeight || (sugarUnitAWeight === 0 && countA > 0)) {
      break;
    }

    for (let countB = 0; ; ++countB) {
      const combinedSugarWeight = currentAccumulatedSugar + (sugarUnitBWeight * countB);
      // Break if combined sugar weight exceeds the total weight limit, or if sugarUnitBWeight is 0
      // and we've already processed the zero-count iteration.
      if (combinedSugarWeight > maximumTotalWeight || (sugarUnitBWeight === 0 && countB > 0)) {
        break;
      }
      // Add the valid combined sugar weight to the set. Includes 0 if both A and B are 0.
      uniqueSugarMixtureWeights.add(combinedSugarWeight);
    }
  }

  // Convert the Set of unique sugar weights into a sorted Array for ordered processing.
  const sortedSugarAmounts = Array.from(uniqueSugarMixtureWeights).sort(sortNumbersAscending);

  // --- Calculation of Maximum Allowed Water Weight ---

  // Determine the absolute maximum amount of water that can be present in any solution,
  // constrained by the maximum solubility percentage (E) and the total weight limit (F).
  // The formula is derived from: water_weight / sugar_weight <= E/100
  // and sugar_weight + water_weight <= F.
  // This simplifies to water_weight <= (F * E) / (100 + E).
  const maxWaterAllowedByConcentration = Math.floor(
    (maximumTotalWeight * maxSolubilityPercentage) / (100 + maxSolubilityPercentage)
  );

  // --- Generation of Possible Water (Solute) Mixtures ---

  // Similar to sugar, use a Set for unique water combinations.
  const uniqueWaterMixtureWeights = new Set();
  let currentAccumulatedWater; // Temporary variable for intermediate water sums.

  // Nested loops to generate all possible combinations of water units C and D.
  // The loops break based on the `maxWaterAllowedByConcentration` limit or zero-unit conditions.
  for (let countC = 0; ; ++countC) {
    currentAccumulatedWater = waterUnitCWeight * countC;
    // Break if current water sum exceeds the max allowed water, or if waterUnitCWeight is 0.
    if (currentAccumulatedWater > maxWaterAllowedByConcentration || (waterUnitCWeight === 0 && countC > 0)) {
      break;
    }

    for (let countD = 0; ; ++countD) {
      const combinedWaterWeight = currentAccumulatedWater + (waterUnitDWeight * countD);
      // Break if combined water weight exceeds the max allowed water, or if waterUnitDWeight is 0.
      if (combinedWaterWeight > maxWaterAllowedByConcentration || (waterUnitDWeight === 0 && countD > 0)) {
        break;
      }
      // Add valid combined water weights to the set. Includes 0 water.
      uniqueWaterMixtureWeights.add(combinedWaterWeight);
    }
  }

  // Convert the Set of unique water weights into a sorted Array.
  const sortedWaterAmounts = Array.from(uniqueWaterMixtureWeights).sort(sortNumbersAscending);

  // --- Creation of a Quick Lookup Table for Valid Water Amounts ---

  // An array is used as a boolean-like hash set for O(1) lookup of valid water amounts.
  // Initialize with 0s (representing false/unavailable).
  const validWaterAmountsLookup = new Array(maxWaterAllowedByConcentration + 1).fill(0);

  // Populate the lookup table: mark all generated `sortedWaterAmounts` as available (1).
  for (const waterAmount of sortedWaterAmounts) {
    if (waterAmount <= maxWaterAllowedByConcentration) {
      validWaterAmountsLookup[waterAmount] = 1;
    }
  }

  // --- Main Optimization Loop: Finding the Best Solution ---

  // Initialize variables to track the best concentration found and the corresponding weights.
  let highestAchievedConcentration = 0; // Represents the ratio of water_weight / sugar_weight.
  let optimalSolutionTotalWeight = 0;   // Stores the total weight of the best solution.
  let optimalSolutionWaterWeight = 0;   // Stores the water weight of the best solution.

  // Initialize the result to 0 0. This handles cases where no valid solution with positive concentration
  // can be formed, or where the only possible solution is (0 sugar, 0 water).
  // If `sortedSugarAmounts` is empty, the loop won't run, and `0 0` will be the default.
  if (sortedSugarAmounts.length > 0) {
      optimalSolutionTotalWeight = sortedSugarAmounts[0]; // Take the smallest sugar amount as a base.
      if (sortedWaterAmounts.length > 0) {
          // If there's water, add the smallest water amount.
          optimalSolutionTotalWeight += sortedWaterAmounts[0];
          optimalSolutionWaterWeight = sortedWaterAmounts[0];
          // If the smallest sugar amount is non-zero, calculate initial concentration.
          if (sortedSugarAmounts[0] > 0) {
              highestAchievedConcentration = sortedWaterAmounts[0] / sortedSugarAmounts[0];
          }
      }
  }
  // If `sortedSugarAmounts` is empty, `optimalSolutionTotalWeight` remains 0.
  // This ensures that if no sugar can be formed, the default 0 0 is maintained.


  // Iterate through each possible sugar amount.
  for (const currentSugarAmount of sortedSugarAmounts) {
    // Skip if the current sugar amount is zero, unless it's the only sugar option available.
    // For calculating concentration, sugar amount (solvent) should ideally be positive.
    if (currentSugarAmount === 0 && sortedSugarAmounts.length > 1) {
      continue;
    }

    // Calculate the maximum water amount that can be paired with `currentSugarAmount`.
    // This is limited by both the solubility percentage (E) and the overall total weight limit (F).
    const maxFeasibleWaterAmountForCurrentSugar = Math.min(
      Math.floor((currentSugarAmount * maxSolubilityPercentage) / 100), // Solubility constraint
      maximumTotalWeight - currentSugarAmount                           // Total weight constraint
    );

    // If no water can be added for this `currentSugarAmount` (e.g., negative result from limits), skip.
    if (maxFeasibleWaterAmountForCurrentSugar < 0) {
      continue;
    }

    // Determine the minimum water amount to start checking from. This is an optimization:
    // Any water amount below this threshold cannot yield a better concentration than `highestAchievedConcentration`.
    const minFeasibleWaterAmountForCurrentSugar = Math.floor(currentSugarAmount * highestAchievedConcentration);

    // Iterate through possible water amounts, from the calculated minimum up to the maximum feasible.
    for (let currentWaterAmount = minFeasibleWaterAmountForCurrentSugar;
         currentWaterAmount <= maxFeasibleWaterAmountForCurrentSugar;
         ++currentWaterAmount) {

      // Ensure `currentWaterAmount` is within the bounds of our lookup table.
      if (currentWaterAmount < 0 || currentWaterAmount > maxWaterAllowedByConcentration) {
        continue;
      }

      // Check if this `currentWaterAmount` is a valid combination from units C and D.
      if (validWaterAmountsLookup[currentWaterAmount] === 1) {
        let currentConcentration = 0;
        // Avoid division by zero if `currentSugarAmount` is somehow 0.
        if (currentSugarAmount > 0) {
            currentConcentration = currentWaterAmount / currentSugarAmount;
        }

        // If the current concentration is higher than the best found so far, update the optimal solution.
        if (currentConcentration > highestAchievedConcentration) {
          optimalSolutionTotalWeight = currentSugarAmount + currentWaterAmount;
          optimalSolutionWaterWeight = currentWaterAmount;
          highestAchievedConcentration = currentConcentration;
        }

        // Optimization: Mark this specific `currentWaterAmount` as "used" (0).
        // This is safe because if a water amount `j` with a sugar amount `i` gives the current best concentration,
        // then for any larger sugar amount `i' > i`, the concentration `j/i'` will be lower than `j/i`.
        // Thus, `j` cannot yield a *better* concentration with any subsequent (larger) sugar amount.
        validWaterAmountsLookup[currentWaterAmount] = 0;
      }
    }
  }

  // --- Final Output ---

  // Format the result: round the total weight and water weight to the nearest integer
  // and concatenate them into a space-separated string.
  return `${Math.round(optimalSolutionTotalWeight)} ${Math.round(optimalSolutionWaterWeight)}`;
}

// Standard entry point for competitive programming environments.
// Reads all input from stdin, processes it, and prints the result to stdout.
const fs = require('fs');
const inputData = fs.readFileSync("/dev/stdin", "utf8");
console.log(solutionCalculator(inputData));
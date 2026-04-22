function calculateBurgerPattyConsumption(rawDataString) {
  // Parse the raw input string, splitting it into lines and cleaning up any leading/trailing whitespace.
  const inputLines = rawDataString.trim().split('\n');

  // Extract and convert the primary parameters from the first line of input.
  // These represent the 'level' of the burger structure and the 'target index' for consumption.
  const parameters = inputLines[0].split(' ');
  const burgerLevel = Number(parameters[0]); // Corresponds to original 'N'
  let consumptionTargetIndex = Number(parameters[1]); // Corresponds to original 'X'

  // --- Type III: Add guard clauses/input validation for robustness ---
  // Ensure that the parsed parameters are valid non-negative numbers.
  if (isNaN(burgerLevel) || isNaN(consumptionTargetIndex) || burgerLevel < 0 || consumptionTargetIndex < 0) {
    // For invalid input, return 0 or handle as an error. In competitive programming, 0 might be a safe default.
    return 0;
  }

  // Define a constant for the maximum supported burger level, reflecting the original array sizing.
  const MAXIMUM_BURGER_LEVEL = 50;

  // --- Type III: Use Array.fill() for initialization instead of direct new Array() assignment ---
  // `pattyCountsPerLevel` stores the number of patties in a burger at a given level.
  const pattyCountsPerLevel = new Array(MAXIMUM_BURGER_LEVEL + 1).fill(0); // Original 'bans'
  // `totalLengthsPerLevel` stores the total length (buns + patties) of a burger at a given level.
  const totalLengthsPerLevel = new Array(MAXIMUM_BURGER_LEVEL + 1).fill(0); // Original 'all'

  // Initialize the base case for a Level 0 burger, which consists of just one patty.
  pattyCountsPerLevel[0] = 1;
  totalLengthsPerLevel[0] = 1;

  // --- Type II: Rename loop variable, update comments, reformat ---
  // Pre-calculate and store the patty counts and total lengths for all burger levels.
  // A burger of level 'k' is structured as: Bun + Burger[k-1] + Patty + Burger[k-1] + Bun.
  for (let currentCalcLevel = 1; currentCalcLevel <= MAXIMUM_BURGER_LEVEL; currentCalcLevel++) {
    // The number of patties in a Level 'k' burger is twice the patties of a Level 'k-1' burger, plus one for the middle patty.
    pattyCountsPerLevel[currentCalcLevel] = (pattyCountsPerLevel[currentCalcLevel - 1] * 2) + 1;
    // The total length of a Level 'k' burger is twice the length of a Level 'k-1' burger, plus three (two buns and one middle patty).
    totalLengthsPerLevel[currentCalcLevel] = (totalLengthsPerLevel[currentCalcLevel - 1] * 2) + 3;
  }

  // --- Type II: Rename variables for clarity ---
  // Initialize dynamic variables for tracking the current state during consumption.
  let currentBurgerLength = totalLengthsPerLevel[burgerLevel]; // Corresponds to original 'full'
  let currentBurgerPatties = pattyCountsPerLevel[burgerLevel]; // Corresponds to original 'bs'
  let accumulatedPatties = 0; // Corresponds to original 'ans'

  // --- Type III: Restructure loop conditions and body, introduce intermediate variables ---
  // Iterate as long as there's a target index to consume and the burger structure has not been fully traversed.
  // The `remainingLevel` variable here conceptually tracks the current recursive level we are examining.
  let remainingLevel = burgerLevel;
  while (consumptionTargetIndex > 0 && remainingLevel >= 0) {
    // --- Type III: Add explicit base case handling inside the loop ---
    // If we've reached a Level 0 burger (just a single patty).
    if (remainingLevel === 0) {
      if (consumptionTargetIndex >= 1) { // If the target includes this patty
        accumulatedPatties += 1;
      }
      consumptionTargetIndex = 0; // All consumption for this level is done.
      break; // Exit the loop as there's no more structure to delve into.
    }

    // Calculate the properties of a sub-burger (Level `remainingLevel - 1`).
    // These values represent (Burger[N-1] + Patty) or (Burger[N-1] + Bun).
    // The length of a single sub-burger (excluding its own outer buns) is (currentBurgerLength - 3) / 2.
    const lengthOfSubBurger = Math.floor((currentBurgerLength - 3) / 2); // Represents totalLengthsPerLevel[remainingLevel-1]
    // The number of patties in a single sub-burger is (currentBurgerPatties - 1) / 2.
    const pattiesInSubBurger = Math.floor((currentBurgerPatties - 1) / 2); // Represents pattyCountsPerLevel[remainingLevel-1]

    // Determine the boundary for the left part of the current burger (Bun + Left Sub-Burger).
    // This is equivalent to `(currentBurgerLength - 1) / 2` from the original code.
    const leftComponentTotalLength = lengthOfSubBurger + 1;

    // --- Type III: Rewrite conditional logic for clarity and structural change ---
    // Check if the consumption target extends past the left component (Bun + Left Sub-Burger).
    // This implies we are consuming the middle patty or something to its right.
    if (consumptionTargetIndex > leftComponentTotalLength) {
      // We consume all patties from the left sub-burger and the middle patty.
      accumulatedPatties += pattiesInSubBurger + 1;
      // Adjust the target index by subtracting the length of the left component (Bun + Left Sub-Burger)
      // and the middle patty itself.
      consumptionTargetIndex -= (leftComponentTotalLength + 1); // Original: X = X - (full-1)/2 - 1;
    } else {
      // If the consumption target is within the left component (Bun + Left Sub-Burger) or at the first bun.
      // We only consume the initial bun.
      consumptionTargetIndex -= 1; // Original: X = X - 1;
    }

    // --- Type III: Consolidate common updates outside the conditional block ---
    // In both cases (consuming right portion or left portion), we conceptually move down to
    // examining a Level `remainingLevel - 1` burger. So, update the current burger's
    // properties to reflect this smaller sub-burger.
    currentBurgerLength = lengthOfSubBurger; // Original: full = (full-1)/2 - 1;
    currentBurgerPatties = pattiesInSubBurger; // Original: bs = (bs-1)/2;

    // Decrement the conceptual burger level.
    remainingLevel--;
  }

  // Return the final count of accumulated patties.
  return accumulatedPatties;
}

// --- Type III: Wrap execution in an Immediately Invoked Function Expression (IIFE) for scope isolation ---
// and add error handling for robust execution.
(function() {
  try {
    // Read input from standard input, similar to the original execution environment.
    const inputData = require("fs").readFileSync("/dev/stdin", "utf8");
    // Call the main processing function.
    const finalPattyCount = calculateBurgerPattyConsumption(inputData);
    // Output the result to standard output.
    console.log(finalPattyCount); // Type II: Simplified console.log without '%s'
  } catch (error) {
    // --- Type III: Add error logging/handling ---
    // In a production environment, this might log to a file or a monitoring system.
    // For competitive programming, a default output or simple message might suffice.
    // console.error("An error occurred during burger patty calculation:", error.message);
    console.log(0); // Output 0 as a fallback in case of an unhandled error.
  }
})();
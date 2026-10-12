'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the raw input data to find the minimum cost
 * to achieve a certain skill threshold.
 * @param {string} rawData The complete input string from stdin.
 * @returns {number} The minimum cost or -1 if no solution is found.
 */
const ProcessInput = (rawData) => {
  // Split the input string into individual lines and remove leading/trailing whitespace.
  const inputLines = rawData.trim().split('\n');

  // Parse the first line to get the number of items, number of skill categories, and the minimum required threshold.
  const [numItems, numCategories, minThreshold] = inputLines[0].split(' ').map(Number);

  // Initialize an array to store information about each item (e.g., books).
  const resourceList = [];

  // Loop through the remaining lines to populate the resource list.
  // The loop starts from index 1 as the first line contains N, M, X.
  for (let itemIndex = 1; itemIndex <= numItems; itemIndex++) {
    // Destructure each line into its cost and an array of ability scores.
    const [itemCost, ...itemAbilities] = inputLines[itemIndex].split(' ').map(Number);
    // Add the item's details as an object to our collection.
    resourceList.push({
      itemCost,
      itemAbilities
    });
  }

  // This array will store the total costs of all valid combinations of items.
  const acceptablePrices = [];

  // Iterate through all possible combinations of items using bit manipulation.
  // Each 'bit' represents a unique subset of items.
  for (let combinationMask = 0; combinationMask < (1 << numItems); combinationMask++) {
    // This variable is declared but not used in the original logic, maintaining its presence.
    let currentSelection = [];
    // Initialize an object to accumulate the total cost and skill levels for the current combination.
    const accumulatedStats = { totalCost: 0, totalAbilities: new Array(numCategories).fill(0) };

    // Check each item to see if it's included in the current combination.
    for (let itemCounter = 0; itemCounter < numItems; itemCounter++) {
      // If the item's corresponding bit is set in the combination mask, include it.
      if (combinationMask & (1 << itemCounter)) {
        // Add the current item's abilities to the accumulated total abilities.
        for (let abilityIndex = 0; abilityIndex < numCategories; abilityIndex++) {
          accumulatedStats.totalAbilities[abilityIndex] += resourceList[itemCounter].itemAbilities[abilityIndex];
        }
        // Add the current item's cost to the accumulated total cost.
        accumulatedStats.totalCost += resourceList[itemCounter].itemCost;
      }
    }

    // After processing all items for the current combination, check if all skill thresholds are met.
    if (accumulatedStats.totalAbilities.every(val => val >= minThreshold)) {
      // If all thresholds are met, this combination is valid, so record its total cost.
      acceptablePrices.push(accumulatedStats.totalCost);
    }
  }

  // Determine the final outcome: the minimum cost among valid combinations, or -1 if none exist.
  // If there are valid costs, sort them and take the smallest one. Otherwise, return -1.
  let finalOutcome = acceptablePrices.length ? acceptablePrices.sort((a, b) => a - b)[0] : -1;

  // Output the result to the console.
  console.log(finalOutcome);
  // Also return the result, as per the original function's behavior.
  return finalOutcome;
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

"use strict";

// This function calculates the minimum total cost to acquire a specified number of two different item types.
// It considers individual purchase prices for each item type and a special combined offer price.
const calculateOptimalCost = (inputStringData) => {
  // The first line of the input string contains all necessary numerical parameters.
  // These are parsed, converted to numbers, and then assigned to descriptive variables.
  const parsedNumericValues = inputStringData
    .split("\n")[0] // Take only the first line of input
    .split(" ") // Split by space to get individual string values
    .map(Number); // Convert each string value to a number

  // A basic validation check for the input structure.
  // Ensure that exactly five numerical values were successfully parsed.
  if (parsedNumericValues.length !== 5) {
    console.error("Error: Input data format is incorrect. Expected 5 numeric values.");
    // In a real application, one might throw an error or handle this more robustly.
    return;
  }

  // Destructure the parsed values into clearly named constants for improved readability.
  // `priceA` and `priceB` are the costs for single items of type A and B, respectively.
  // `priceForCombinedSetHalf` represents the cost for one 'half-pizza' when buying a combined A/B pizza.
  // This implies a full A/B set (one A and one B) costs `2 * priceForCombinedSetHalf`.
  // `requiredQuantityA` and `requiredQuantityB` are the target counts for each item type.
  const [
    priceA,
    priceB,
    priceForCombinedSetHalf,
    requiredQuantityA,
    requiredQuantityB,
  ] = parsedNumericValues;

  // Initialize a variable to keep track of the lowest total cost found so far.
  // Start with `Infinity` so any valid calculated cost will be lower.
  let minimumFinalCost = Infinity;

  // The strategy involves iterating through all possible numbers of 'combined A/B sets' to purchase.
  // We can buy anywhere from zero sets up to the maximum quantity needed for either A or B.
  // For example, if we need 2 A's and 5 B's, we might buy up to 5 combined sets.
  const maximumPossibleSets = Math.max(requiredQuantityA, requiredQuantityB);

  // Iterate through each possible count of combined sets (from 0 to `maximumPossibleSets`).
  for (let setsPurchased = 0; setsPurchased <= maximumPossibleSets; setsPurchased++) {
    // Calculate the cost for buying the current number of combined sets.
    // Each set provides one 'A' and one 'B' and costs `2 * priceForCombinedSetHalf`.
    const costFromCombinedSets = setsPurchased * 2 * priceForCombinedSetHalf;

    // Determine how many 'A' items are still needed after accounting for the 'setsPurchased'.
    // `Math.max(0, ...)` ensures we don't go below zero (i.e., we don't 'owe' items).
    const remainingAItemsToBuy = Math.max(0, requiredQuantityA - setsPurchased);
    // Determine how many 'B' items are still needed.
    const remainingBItemsToBuy = Math.max(0, requiredQuantityB - setsPurchased);

    // Calculate the cost for purchasing the remaining 'A' items individually.
    const costForIndividualAItems = remainingAItemsToBuy * priceA;
    // Calculate the cost for purchasing the remaining 'B' items individually.
    const costForIndividualBItems = remainingBItemsToBuy * priceB;

    // Sum up all costs for the current purchasing strategy.
    const currentStrategyTotalCost =
      costFromCombinedSets + costForIndividualAItems + costForIndividualBItems;

    // Compare the current strategy's total cost with the minimum found so far.
    // If the current strategy is cheaper, update `minimumFinalCost`.
    if (currentStrategyTotalCost < minimumFinalCost) {
      minimumFinalCost = currentStrategyTotalCost;
    }
  }

  // Display the lowest calculated cost to the console.
  console.log(minimumFinalCost);
};

// The entry point for execution. This reads the input from '/dev/stdin' (standard input)
// using Node.js's file system module and then passes the content to the main calculation function.
calculateOptimalCost(require("fs").readFileSync("/dev/stdin", "utf8"));
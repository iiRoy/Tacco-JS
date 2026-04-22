"use strict";

/**
 * Determines the optimal (minimum) cost to fulfill an order for two types of items (A and B),
 * considering individual item prices and a special combo price.
 *
 * The input parameters are:
 * - `priceA`: Cost per unit of item A.
 * - `priceB`: Cost per unit of item B.
 * - `priceHalfCombo`: Cost for a 'half-combo' unit. A full combo (providing 1 A and 1 B) costs 2 * `priceHalfCombo`.
 * - `quantityA`: Total quantity of item A required.
 * - `quantityB`: Total quantity of item B required.
 *
 * The function calculates the minimum expenditure by considering various purchasing strategies:
 * 1. Buying all items A and B individually.
 * 2. Buying a certain number of combo items, and then purchasing any remaining A or B items individually.
 *
 * @param {string} rawInputString - A space-separated string containing five numerical values:
 *                                  "priceA priceB priceHalfCombo quantityA quantityB".
 */
function determineOptimalPizzaOrderCost(rawInputString) {
  // Parse the input string into distinct numerical parameters.
  // Using `parseInt` with a radix for explicit base-10 conversion.
  const [priceA, priceB, priceHalfCombo, quantityA, quantityB] = rawInputString
    .trim()
    .split(" ")
    .map(val => parseInt(val, 10));

  // Define the effective cost of a full combo pizza, which provides one unit of A and one unit of B.
  const costOfFullComboPizza = 2 * priceHalfCombo;

  // --- Optimization Strategy Check ---
  // If the combined cost of buying one item A and one item B individually
  // is less than the cost of one full combo pizza, then it's always
  // more economical to purchase all items individually. In this scenario,
  // buying combo pizzas would only increase the total cost.
  if (priceA + priceB < costOfFullComboPizza) {
    // Calculate and print the cost for buying all items individually.
    console.log(priceA * quantityA + priceB * quantityB);
    return; // Exit early as no further optimization is possible.
  }

  // Initialize the minimum total purchase cost to a very large number.
  // This allows any valid calculated cost to become the initial minimum.
  let minTotalPurchaseCost = Number.MAX_SAFE_INTEGER;

  // Determine the maximum number of combo pizzas we might need to consider in our iteration.
  // It's never optimal to buy more combo pizzas than the maximum quantity of A or B required,
  // because any additional combos beyond that would provide items we don't need,
  // without reducing the cost of other items.
  const maxRelevantCombosToExamine = Math.max(quantityA, quantityB);

  // Iterate through all plausible counts of full combo pizzas that could be purchased.
  // 'numCombosPurchased' represents the number of full combo pizzas.
  // The loop starts from 0 to include the scenario where no combo pizzas are bought
  // (i.e., all items are bought individually), which serves as a baseline.
  for (let numCombosPurchased = 0; numCombosPurchased <= maxRelevantCombosToExamine; numCombosPurchased++) {
    // Calculate the number of remaining A and B items that still need to be acquired
    // after purchasing 'numCombosPurchased' full combo pizzas.
    // `Math.max(0, ...)` ensures that the quantity doesn't go below zero,
    // meaning we don't 'oversell' items we didn't need.
    const remainingNeededA = Math.max(0, quantityA - numCombosPurchased);
    const remainingNeededB = Math.max(0, quantityB - numCombosPurchased);

    // Calculate the total cost for the current purchasing combination:
    // 1. Cost of the 'numCombosPurchased' combo pizzas.
    // 2. Cost of any 'remainingNeededA' items bought individually.
    // 3. Cost of any 'remainingNeededB' items bought individually.
    const currentCombinationCost =
      (numCombosPurchased * costOfFullComboPizza) +
      (remainingNeededA * priceA) +
      (remainingNeededB * priceB);

    // Update the overall minimum total cost if the current combination
    // yields a lower price than any previously considered combination.
    minTotalPurchaseCost = Math.min(minTotalPurchaseCost, currentCombinationCost);
  }

  // After evaluating all relevant combinations, print the absolute minimum cost found.
  console.log(minTotalPurchaseCost);
}

// --- Application Entry Point ---
// This immediately invoked function expression handles reading input
// and initiating the cost calculation.
(function executeSolver() {
  // Helper function to read input from standard input (common in competitive programming).
  // It assumes input will be provided as a UTF-8 string.
  const readInputFromStdin = () => require("fs").readFileSync("/dev/stdin", "utf8");

  // Call the main function with the input read from stdin.
  determineOptimalPizzaOrderCost(readInputFromStdin());
})();
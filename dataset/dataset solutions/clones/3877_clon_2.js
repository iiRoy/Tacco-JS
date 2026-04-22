"use strict"; // Enforce strict parsing and error handling for cleaner code.

const calculateMinimumCost = (inputStrings) => { // Main entry point for processing input and determining the optimal expense.
  // Pre-process the raw input data: remove leading/trailing whitespace and split into lines.
  inputStrings = inputStrings.trim().split("\n");

  // Extract numerical parameters from the first line of input.
  const dataElements = inputStrings[0].split(" ");

  const costOfItemA = parseInt(dataElements[0]); // Unit price for the first type of item (e.g., 'A' pizza).
  const costOfItemB = parseInt(dataElements[1]); // Unit price for the second type of item (e.g., 'B' pizza).
  const costOfHalfCombo = parseInt(dataElements[2]); // Price of a special half-combo (e.g., half 'A' + half 'B').
  const requiredCountA = parseInt(dataElements[3]); // Total quantity needed for the first item type.
  const requiredCountB = parseInt(dataElements[4]); // Total quantity needed for the second item type.

  const fullComboPrice = 2 * costOfHalfCombo; // Calculate the cost of a complete combo (two half-combos).

  // Determine if buying items via the combo offer is more economical than individual purchases.
  if (costOfItemA + costOfItemB > fullComboPrice) {
    let commonComboPurchase = fullComboPrice * Math.min(requiredCountA, requiredCountB); // Cost for the maximum number of full combos that can be formed.
    let remainingIndividualCost = 0; // Variable to store the cost of items not covered by full combos.

    // Calculate the cost for any leftover items that must be bought individually.
    if (requiredCountA > requiredCountB) {
      remainingIndividualCost = costOfItemA * (requiredCountA - requiredCountB);
    } else if (requiredCountB > requiredCountA) {
      remainingIndividualCost = costOfItemB * (requiredCountB - requiredCountA);
    }

    let mixedPurchaseTotal = commonComboPurchase + remainingIndividualCost; // Total cost using a strategy of some combos and some individual items.
    let bulkComboPurchaseTotal = fullComboPrice * Math.max(requiredCountA, requiredCountB); // Cost if all items are purchased as combos, potentially overbuying.

    // Output the minimum cost between the mixed strategy and the all-combo strategy.
    console.log(Math.min(bulkComboPurchaseTotal, mixedPurchaseTotal));
  } else {
    // If the combo offer provides no savings, calculate the straightforward cost of buying all items separately.
    console.log((costOfItemA * requiredCountA) + (costOfItemB * requiredCountB));
  }
};

// Initiate the cost calculation process by reading input from the standard input stream.
calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));
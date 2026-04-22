'use strict'

// Function to calculate the minimum cost to acquire a desired quantity of items
// from various offers, prioritizing cheaper options.
function computeMinPurchaseCost(rawInputString) {
    // Trim leading/trailing whitespace from the entire input and split it into individual lines.
    const allInputLines = rawInputString.trim().split('\n');

    // Basic validation: ensure there's at least one line for parameters.
    if (allInputLines.length === 0) {
        console.error("Error: Empty input provided. Cannot process.");
        return;
    }

    // Parse the first line to get the total number of distinct offers
    // and the total quantity of units we need to acquire.
    const paramStrings = allInputLines[0].split(' ');
    // Using Number() for parsing, which is generally more flexible than parseInt
    // as it handles floating-point numbers too, though here integers are expected.
    const problemConfiguration = {
        totalOffersAvailable: Number(paramStrings[0]), // N: number of offers from various stores/sources
        requiredUnitsTarget: Number(paramStrings[1])   // M: the total quantity of units desired
    };

    // Initialize an array to hold details of each market offer.
    // Each offer will be represented as an object for better readability and structure.
    const marketOffers = [];

    // Iterate through the subsequent lines to parse each offer's details.
    // Start from index 1 as index 0 contained the configuration parameters.
    for (let currentLineIdx = 0; currentLineIdx < problemConfiguration.totalOffersAvailable; currentLineIdx++) {
        // Each offer line contains two space-separated numbers: unit price and available stock.
        const offerDataStrings = allInputLines[currentLineIdx + 1].split(' ');
        marketOffers.push({
            unitPrice: Number(offerDataStrings[0]),    // The cost per unit for this specific offer
            availableStock: Number(offerDataStrings[1]) // The quantity of units available at this price point
        });
    }

    // Sort the market offers by their unit price in ascending order.
    // This greedy strategy ensures we always consider and potentially buy from the cheapest available source first.
    marketOffers.sort((offerA, offerB) => offerA.unitPrice - offerB.unitPrice);

    // Initialize variables to track the total expenditure and the remaining units still needed.
    let cumulativeExpenditure = 0;
    let unitsStillNeeded = problemConfiguration.requiredUnitsTarget;

    // Early exit / guard clause: If no units are required, the cost is immediately zero.
    // This prevents unnecessary iteration.
    if (unitsStillNeeded <= 0) {
        console.log(0);
        return;
    }

    // Iterate through the sorted offers to fulfill the demand.
    // We use a 'for...of' loop for cleaner iteration over the array of offer objects.
    for (const currentOffer of marketOffers) {
        // Determine the quantity of units to purchase from the current offer.
        // We buy either all available stock from this offer OR
        // just enough to meet the remaining demand, whichever is smaller.
        const unitsToPurchaseFromThisOffer = Math.min(unitsStillNeeded, currentOffer.availableStock);

        // Add the cost of these purchased units to the total cumulative expenditure.
        cumulativeExpenditure += unitsToPurchaseFromThisOffer * currentOffer.unitPrice;

        // Decrease the number of units that are still needed.
        unitsStillNeeded -= unitsToPurchaseFromThisOffer;

        // If we have acquired all the required units, we can stop buying.
        // This explicit check replaces the conditional break inside an 'else' block
        // by making the decision after each purchase step.
        if (unitsStillNeeded <= 0) {
            // All required units have been purchased. No need to check further offers.
            break;
        }
    }

    // Output the final calculated minimum expenditure to standard output.
    console.log(cumulativeExpenditure);
}

// Entry point for execution: Read input from standard input and process it.
// This part is typically environment-specific boilerplate for competitive programming.
computeMinPurchaseCost(require("fs").readFileSync("/dev/stdin", "utf8"));
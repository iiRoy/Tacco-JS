'use strict';

/**
 * Processes the raw input string to extract numerical parameters.
 * It expects a single line of space-separated numbers.
 *
 * @param {string} rawInputString The complete input data, typically from stdin.
 * @returns {number[]} An array containing the parsed numerical values.
 */
function parseInputValues(rawInputString) {
    // Extract the first line and remove any leading/trailing whitespace.
    const processedLine = rawInputString.trim().split('\n')[0];

    // If the line is empty after processing, return an empty array.
    if (!processedLine) {
        return [];
    }

    // Split the line by spaces and convert each part to a number.
    // Includes a basic check for non-numeric values, defaulting to 0 for robustness.
    const numericalArray = processedLine.split(' ').map(segment => {
        const numericValue = Number(segment);
        if (isNaN(numericValue)) {
            // Log a warning for unexpected input, useful for debugging.
            console.warn(`Detected non-numeric input: '${segment}'. Using 0 instead.`);
            return 0;
        }
        return numericValue;
    });

    return numericalArray;
}

/**
 * Calculates the minimum possible cost to acquire required quantities of two item types,
 * considering individual purchases and a combined package option.
 *
 * @param {string} inputDataStream The raw string data containing costs and quantities.
 */
function determineMinimumAcquisitionCost(inputDataStream) {

    // Step 1: Parse the input string into an array of numbers.
    const numericalParameters = parseInputValues(inputDataStream);

    // Step 2: Validate the number of parameters. We expect 5 values (costA, costB, costC, qtyA, qtyB).
    if (numericalParameters.length < 5) {
        console.error("Error: Insufficient parameters provided. Expected 5 numerical values.");
        // In a real application, one might throw an error or return a specific error code.
        return;
    }

    // Step 3: Assign parsed values to clearly named variables for better readability.
    const priceA = numericalParameters[0]; // Unit cost for item A.
    const priceB = numericalParameters[1]; // Unit cost for item B.
    const priceCombinedPack = numericalParameters[2]; // Cost for one combined A+B pack.
    const quantityNeededA = numericalParameters[3]; // Desired quantity of item A.
    const quantityNeededB = numericalParameters[4]; // Desired quantity of item B.

    // --- Evaluate different purchasing strategies ---

    // Strategy 1: Purchase all items individually.
    // This is a straightforward calculation, serving as a baseline.
    const costOptionIndividual = (quantityNeededA * priceA) + (quantityNeededB * priceB);

    // Strategy 2: Maximize use of combined packs for the common quantity,
    // then buy any remaining items individually.
    // First, find the smaller of the two quantities, which determines how many combined packs are useful.
    const commonQuantityToPair = Math.min(quantityNeededA, quantityNeededB);

    // Calculate remaining quantities after forming combined pairs.
    const remainingQuantityA = quantityNeededA - commonQuantityToPair;
    const remainingQuantityB = quantityNeededB - commonQuantityToPair;

    // Sum up the cost of combined packs and individual remaining items.
    const costOptionMixed = (commonQuantityToPair * priceCombinedPack * 2) +
                            (remainingQuantityA * priceA) +
                            (remainingQuantityB * priceB);

    // Strategy 3: Purchase enough combined packs to cover the larger of the two quantities,
    // even if it means overbuying one type of item. This is often cheapest if combined packs are very cheap.
    // Determine the maximum quantity required for either item type.
    const maximumNeededQuantity = Math.max(quantityNeededA, quantityNeededB);

    // Calculate the total cost if everything is bought as combined packs up to the maximum needed.
    const costOptionAllCombined = maximumNeededQuantity * priceCombinedPack * 2;

    // Step 4: Determine the absolute minimum cost among all evaluated strategies.
    // The final answer is the lowest cost found across all viable purchasing methods.
    const finalMinimalCost = Math.min(costOptionIndividual, costOptionMixed, costOptionAllCombined);

    // Step 5: Output the calculated minimum cost to standard output.
    console.log(finalMinimalCost);
}

// Entry point for the application.
// Reads the entire content of standard input as a UTF-8 string
// and passes it to the main cost calculation function.
determineMinimumAcquisitionCost(require("fs").readFileSync("/dev/stdin", "utf8"));
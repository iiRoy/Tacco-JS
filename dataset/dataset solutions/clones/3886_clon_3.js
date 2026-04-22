// A robust utility for calculating the optimal purchasing strategy.
// This program determines the lowest possible cost to acquire specified quantities
// of two distinct items, considering individual unit purchases and special bundled offers.

/**
 * Retrieves the raw input data from the standard input stream.
 * This function abstracts the file system interaction.
 * @returns {string} The raw input string, typically a single line of space-separated values.
 */
const obtainSystemInputData = () => {
    // Using Node.js 'fs' module to synchronously read from stdin.
    // The input is expected in UTF-8 encoding.
    return require("fs").readFileSync("/dev/stdin", "utf8");
};

/**
 * Processes the raw input string to calculate the minimum purchasing cost.
 * This function encapsulates the main business logic for cost optimization.
 * @param {string} rawInputLine - The input string containing cost and quantity data.
 */
const evaluatePurchaseScenarios = (rawInputLine) => {

    // --- Input Parsing and Validation Section ---
    // First, remove any extraneous whitespace from the input string.
    // Then, split the string into individual components based on spaces.
    // Finally, transform each string component into a numeric value.
    const processedNumericParameters = rawInputLine.trim().split(' ').map(strVal => {
        const numVal = Number(strVal);
        // Implement a basic validation step to ensure all input parts are valid numbers.
        // This helps prevent unexpected behavior from malformed input, aligning with Type III additions.
        if (isNaN(numVal)) {
            // If an invalid number is found, log an error and terminate the process.
            console.error("Input Error: Detected a non-numeric value where a number was expected. Please verify your input data.");
            process.exit(1); // Exit with a non-zero code to indicate an error.
        }
        return numVal;
    });

    // Destructure the parsed numeric parameters into clearly named variables.
    // These represent the prices of individual items, the cost of a combo,
    // and the required quantities for each item.
    const pricePerUnitItemA = processedNumericParameters[0]; // Unit cost for the first item type (e.g., 'Alpha')
    const pricePerUnitItemB = processedNumericParameters[1]; // Unit cost for the second item type (e.g., 'Beta')
    const priceForHalfCombo = processedNumericParameters[2]; // Cost for a 'half' combo (often implies 0.5 of A and 0.5 of B, or 1/2 of a full A+B bundle)
    const quantityNeededItemA = processedNumericParameters[3]; // The target quantity for item A
    const quantityNeededItemB = processedNumericParameters[4]; // The target quantity for item B

    // Add a guard clause to ensure that required quantities are not negative.
    // This is a simple validation step and an example of a Type III addition.
    if (quantityNeededItemA < 0 || quantityNeededItemB < 0) {
        console.error("Input Error: Required quantities cannot be negative. Please provide non-negative values.");
        process.exit(1);
    }

    // --- Intermediate Calculation Variables for Enhanced Readability ---
    // Calculate the effective cost of a 'full' combo package (equivalent to 1 unit of A and 1 unit of B).
    const fullComboPrice = priceForHalfCombo * 2;

    // Determine the maximum and minimum quantities required between the two items.
    const maximumRequiredUnits = Math.max(quantityNeededItemA, quantityNeededItemB);
    const minimumRequiredUnits = Math.min(quantityNeededItemA, quantityNeededItemB);

    // Calculate the remaining units of each item after accounting for the common minimum requirement.
    // This helps in the 'hybrid' purchasing strategy.
    const remainingUnitsAOnly = Math.max(0, quantityNeededItemA - quantityNeededItemB);
    const remainingUnitsBOnly = Math.max(0, quantityNeededItemB - quantityNeededItemA);

    // Initialize a variable to store the minimum total cost found across all strategies.
    // Start with a very large number to ensure any valid cost will be smaller.
    let minimumOverallCost = Number.MAX_SAFE_INTEGER;

    // --- Evaluation of Different Purchasing Strategies ---

    // Strategy 1: Direct Individual Purchase
    // Calculate the cost if all units of both items are bought individually.
    const directIndividualCost = (pricePerUnitItemA * quantityNeededItemA) + (pricePerUnitItemB * quantityNeededItemB);
    // Update the minimum overall cost if this strategy is cheaper.
    minimumOverallCost = Math.min(minimumOverallCost, directIndividualCost);

    // Strategy 2: Combo-Only Purchase
    // Calculate the cost if only full combo packages are purchased.
    // To satisfy both requirements, enough combos must be bought to cover the item with the higher quantity needed.
    const comboOnlyTotalCost = fullComboPrice * maximumRequiredUnits;
    // Update the minimum overall cost.
    minimumOverallCost = Math.min(minimumOverallCost, comboOnlyTotalCost);

    // Strategy 3: Hybrid Purchase (Combos + Individual Units)
    // This strategy involves buying full combos for the lesser of the two required quantities,
    // and then purchasing any remaining units of the other item individually.
    const costForCommonComboUnits = fullComboPrice * minimumRequiredUnits;
    const costForRemainingItemA = pricePerUnitItemA * remainingUnitsAOnly;
    const costForRemainingItemB = pricePerUnitItemB * remainingUnitsBOnly;

    const hybridStrategyTotalCost = costForCommonComboUnits + costForRemainingItemA + costForRemainingItemB;
    // Update the minimum overall cost.
    minimumOverallCost = Math.min(minimumOverallCost, hybridStrategyTotalCost);

    // --- Outputting the Final Result ---
    // Write the determined minimum cost to standard output, followed by a newline.
    // Using process.stdout.write for a slight variation from console.log (Type III change).
    process.stdout.write(String(minimumOverallCost) + '\n');
};

// Initiate the cost calculation process by first obtaining the input data
// and then passing it to the main processing function.
evaluatePurchaseScenarios(obtainSystemInputData());
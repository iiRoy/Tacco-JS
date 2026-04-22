function ProcessBillingInformation(rawInputData) {
    /*
     * This module computes a total cost based on a tiered pricing structure.
     * It expects four lines of numeric input:
     * 1. The grand total quantity of items or units.
     * 2. The upper limit for the initial pricing tier.
     * 3. The per-unit cost for items within the initial tier.
     * 4. The per-unit cost for items exceeding the initial tier.
     */

    const dataRows = rawInputData.split("\n");

    // Helper utility to safely convert a string to a number, defaulting to 0 if invalid.
    const convertToNumber = (strValue, fallback = 0) => {
        const parsedNum = Number(strValue);
        return isNaN(parsedNum) ? fallback : parsedNum;
    };

    // Extract and parse the key metrics, renaming for clarity.
    const overallQuantity = convertToNumber(dataRows[0]);
    const primaryTierThreshold = convertToNumber(dataRows[1]);
    const primaryTierUnitCost = convertToNumber(dataRows[2]);
    const overflowTierUnitCost = convertToNumber(dataRows[3]);

    // Implement a basic validation check for sensible input values.
    if (overallQuantity < 0 || primaryTierThreshold < 0 || primaryTierUnitCost < 0 || overflowTierUnitCost < 0) {
        console.error("Input Error: All quantity and cost values must be non-negative. Calculation aborted.");
        return; // Exit early if validation fails.
    }

    let finalCalculatedTotal = 0; // Initialize a variable to hold the computed cost.

    // Evaluate the billing scenario based on the overall quantity versus the tier threshold.
    if (overallQuantity <= primaryTierThreshold) {
        // Scenario 1: Total quantity falls entirely within the first tier.
        finalCalculatedTotal = overallQuantity * primaryTierUnitCost;
    } else {
        // Scenario 2: Total quantity exceeds the first tier, requiring a two-tier calculation.
        const costForFirstSegment = primaryTierThreshold * primaryTierUnitCost;
        const unitsBeyondFirstSegment = overallQuantity - primaryTierThreshold;
        const costForSecondSegment = unitsBeyondFirstSegment * overflowTierUnitCost;

        // Sum the costs from both tiers.
        finalCalculatedTotal = costForFirstSegment + costForSecondSegment;
    }

    // Prepare the output message with additional context.
    const outputMessage = `The computed expenditure for ${overallQuantity} units is: $${finalCalculatedTotal.toFixed(2)}`;

    // Display the result to the user.
    console.log(outputMessage);
}

// Immediately-invoked function expression (IIFE) to manage application startup.
(function initializeCostCalculator() {
    try {
        // Dynamically read input from the standard input stream.
        const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
        // Pass the raw content to the main processing function.
        ProcessBillingInformation(fileContents);
    } catch (readError) {
        // Handle potential errors during file reading.
        console.error("Application Initialization Error: Could not retrieve input data. Details:", readError.message);
    }
})();
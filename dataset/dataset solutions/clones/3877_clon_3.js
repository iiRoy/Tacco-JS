const parseAndValidateNumericInputs = (inputLine) => {
    // Splits the input string by spaces and converts each part to a number.
    // Adds validation to ensure all parts are valid non-negative numbers.
    const numericValues = inputLine.split(" ").map(segment => {
        const value = Number(segment);
        if (isNaN(value) || value < 0) {
            // Throw an error for invalid or negative input, a Type III addition for robustness.
            throw new Error(`Encountered an invalid or negative numeric input: '${segment}'. All costs and quantities must be non-negative numbers.`);
        }
        return value;
    });

    // Ensures the expected number of parameters are present.
    if (numericValues.length !== 5) {
        throw new Error(`Expected five numeric parameters (costA, costB, costC, qtyA, qtyB), but found ${numericValues.length}.`);
    }

    return numericValues;
};

const calculateOptimalProcurementCost = (rawInputData) => {
    // Clean and split the incoming string data into lines.
    const processedInput = rawInputData.trim();
    const dataRows = processedInput.split("\n");

    // Extract individual parameters using a robust parsing helper and destructuring.
    const [
        unitCostForAlpha,     // Represents original 'A'
        unitCostForBeta,      // Represents original 'B'
        halfSetCostGamma,     // Represents original 'C' (cost for half of an AB set)
        requiredAlphaUnits,   // Represents original 'X'
        requiredBetaUnits     // Represents original 'Y'
    ] = parseAndValidateNumericInputs(dataRows[0]);

    // Determine the combined cost for a complete AB set (containing one Alpha and one Beta).
    // This is equivalent to 2 * C from the original problem logic.
    const fullSetPrice = 2 * halfSetCostGamma;

    // --- Evaluate different purchasing strategies to find the minimum cost ---

    // Strategy 1: Acquire all required units by purchasing Alpha and Beta items individually.
    // This serves as a baseline cost.
    const costStrategyIndividualItems = (unitCostForAlpha * requiredAlphaUnits) + (unitCostForBeta * requiredBetaUnits);

    // Strategy 2: Purchase enough full AB sets to cover the maximum required quantity
    // of either Alpha or Beta. This might result in acquiring more items than strictly needed
    // for the less numerous type.
    const costStrategyBulkSetsOnly = fullSetPrice * Math.max(requiredAlphaUnits, requiredBetaUnits);

    // Strategy 3: Purchase full AB sets for the common minimum quantity,
    // and then purchase the remaining difference of the more abundant item individually.
    let costStrategyCombinedApproach = fullSetPrice * Math.min(requiredAlphaUnits, requiredBetaUnits);
    
    // Calculate the quantity of items that still need to be bought individually after sets.
    const remainingItemsDifference = Math.abs(requiredAlphaUnits - requiredBetaUnits);

    // Add the cost for the remaining individual items.
    if (requiredAlphaUnits > requiredBetaUnits) {
        costStrategyCombinedApproach += unitCostForAlpha * remainingItemsDifference;
    } else if (requiredBetaUnits > requiredAlphaUnits) {
        costStrategyCombinedApproach += unitCostForBeta * remainingItemsDifference;
    }
    // If quantities are equal, remainingItemsDifference is 0, so no additional cost is added.

    // The optimal cost is the minimum among all evaluated strategies.
    // This directly compares all possibilities, flattening the original conditional logic.
    const finalMinimumCost = Math.min(
        costStrategyIndividualItems,
        costStrategyBulkSetsOnly,
        costStrategyCombinedApproach
    );

    return finalMinimumCost;
};

// Standard input/output handling block.
// This part is separated to keep the core calculation logic pure.
try {
    const fileContents = require("fs").readFileSync("/dev/stdin", "utf8");
    const computedResult = calculateOptimalProcurementCost(fileContents);
    // Display the final computed result to standard output.
    console.log(computedResult);
} catch (processingError) {
    // Provide user-friendly error feedback and exit with a failure status.
    console.error("Error during cost calculation:", processingError.message);
    process.exit(1); // Indicate an abnormal termination.
}
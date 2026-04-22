const PRODUCT_SPECS = [
    { type: 'Type A', weight: 200, basePrice: 380, bulkThreshold: 5, discountFactor: 0.80 }, // 20% off for 5-packs
    { type: 'Type B', weight: 300, basePrice: 550, bulkThreshold: 4, discountFactor: 0.85 }, // 15% off for 4-packs
    { type: 'Type C', weight: 500, basePrice: 850, bulkThreshold: 3, discountFactor: 0.88 }  // 12% off for 3-packs
];

/**
 * Calculates the total cost for a specific quantity of a single product type,
 * applying any bulk discounts.
 * @param {number} quantity - The number of units of this product type.
 * @param {object} productDetails - Object containing weight, basePrice, bulkThreshold, discountFactor.
 * @returns {number} The total cost for the specified quantity.
 */
const computeProductLineItemCost = (quantity, productDetails) => {
    const unitsAtRegularPrice = quantity % productDetails.bulkThreshold;
    const bulkPacksCount = Math.floor(quantity / productDetails.bulkThreshold);
    const unitsInBulkPacks = bulkPacksCount * productDetails.bulkThreshold;

    const costForRegularUnits = unitsAtRegularPrice * productDetails.basePrice;
    const costForBulkUnits = unitsInBulkPacks * productDetails.basePrice * productDetails.discountFactor;

    return costForRegularUnits + costForBulkUnits;
};

/**
 * Main function to orchestrate the program execution.
 */
function executeProgram() {

    /**
     * Determines the minimum possible cost to acquire at least a specified target weight
     * using combinations of predefined product units with bulk discounts.
     * @param {number} targetWeightInGrams - The minimum total weight required.
     * @returns {number} The minimum cost, or Infinity if no combination meets the weight.
     */
    function determineBestCost(targetWeightInGrams) {
        // Input validation for the target weight
        if (targetWeightInGrams <= 0 || !Number.isInteger(targetWeightInGrams)) {
            console.error(`Invalid target weight provided: ${targetWeightInGrams}. Must be a positive integer.`);
            return Infinity; // Indicate an impossible scenario
        }

        // Helper function to calculate the total cost for a given set of unit quantities
        const calculateTotalCombinationCost = (unitQuantities) => {
            let totalCostForCombination = 0;
            for (let i = 0; i < PRODUCT_SPECS.length; i++) {
                const currentProductQuantity = unitQuantities[i] || 0; // Use 0 if quantity not yet defined for a type
                totalCostForCombination += computeProductLineItemCost(currentProductQuantity, PRODUCT_SPECS[i]);
            }
            return totalCostForCombination;
        };

        // Initialize with a single combination: 0 weight, no units of any type
        // Each entry is [total_weight_so_far, [count_type_A, count_type_B, count_type_C]]
        let currentLevelCombinations = [[0, []]];

        // Stage 1: Iteratively generate all feasible weight combinations
        // For each product type (200g, then 300g, then 500g)
        for (let typeIndex = 0; typeIndex < PRODUCT_SPECS.length; typeIndex++) {
            const currentProductUnitWeight = PRODUCT_SPECS[typeIndex].weight;
            let nextLevelCombinations = []; // Stores combinations after considering the current product type

            // Process all combinations generated from the previous product type
            // Use a temporary array and shift to simulate a queue, similar to original
            while (currentLevelCombinations.length > 0) {
                const [previousAccumulatedWeight, previousUnitCounts] = currentLevelCombinations.shift();

                // For the current product type, try adding 0, 1, 2, ... units
                for (let unitsOfCurrentType = 0; ; unitsOfCurrentType++) {
                    const weightAddedFromCurrentType = unitsOfCurrentType * currentProductUnitWeight;
                    const newTotalWeightForPath = previousAccumulatedWeight + weightAddedFromCurrentType;
                    const updatedUnitCountsForPath = previousUnitCounts.concat(unitsOfCurrentType);

                    // Add this new combination to the next level's list
                    nextLevelCombinations.push([newTotalWeightForPath, updatedUnitCountsForPath]);

                    // Break condition: Replicate the original logic where it generates combinations
                    // up to and including one "overshoot" beyond the target weight for each path.
                    // This ensures all relevant combinations are considered for the minimum cost.
                    if (newTotalWeightForPath > targetWeightInGrams + currentProductUnitWeight && unitsOfCurrentType > 0) {
                        break; // Stop adding more units of this type for the current path
                    }
                }
            }
            // Update the set of combinations for the next iteration (next product type)
            currentLevelCombinations = nextLevelCombinations;
        }

        let minimumAchievedPrice = Infinity;

        // Stage 2: Evaluate costs for all generated combinations
        // Iterate through all stored combinations to find the one with the lowest cost
        // that meets or exceeds the target weight.
        while (currentLevelCombinations.length > 0) {
            const [currentCombinationWeight, currentUnitQuantities] = currentLevelCombinations.shift();

            // Only consider combinations that meet or exceed the target weight
            if (currentCombinationWeight < targetWeightInGrams) {
                continue;
            }

            // Calculate the total cost for the current valid combination
            const currentCombinationPrice = calculateTotalCombinationCost(currentUnitQuantities);

            // Update the overall minimum price if this combination is cheaper
            minimumAchievedPrice = Math.min(minimumAchievedPrice, currentCombinationPrice);
        }

        return minimumAchievedPrice;
    }

    let stopProcessingInputs = false; // Flag to indicate when to stop processing input lines

    // Process each line of input data
    for (const dataLine of programRawInput) {
        const trimmedInputLine = dataLine.trim();

        // Skip empty lines or if the stop signal has been received
        if (trimmedInputLine === '' || stopProcessingInputs) {
            continue;
        }

        // Check for the sentinel value '0' to stop further processing
        if (trimmedInputLine === '0') {
            stopProcessingInputs = true;
            continue;
        }

        // Attempt to parse the input line as an integer weight
        const parsedWeightValue = parseInt(trimmedInputLine, 10);

        // Validate the parsed input weight
        if (isNaN(parsedWeightValue) || parsedWeightValue < 0) {
            console.error(`Warning: Detected invalid or negative weight input: '${trimmedInputLine}'. Skipping this entry.`);
            continue;
        }

        // Calculate and display the optimal price for the current target weight
        console.log(determineBestCost(parsedWeightValue));
    }
}

// Global variable to store all raw input from stdin
let programRawInput = '';

// Configure stdin to read input
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks
process.stdin.on('data', (inputChunk) => {
    programRawInput += inputChunk;
});

// Event listener for when all input has been received
process.stdin.on('end', () => {
    // Split the accumulated input into individual lines
    programRawInput = programRawInput.split('\n');
    // Start the main program logic
    executeProgram();
});
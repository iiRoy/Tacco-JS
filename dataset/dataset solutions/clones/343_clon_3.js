// --- Helper functions and constants for item definitions ---

// Define the characteristics of each product type available for purchase.
// This structure enhances readability and maintainability compared to scattered arrays.
const PRODUCT_CATALOGUE = [
    {
        itemIdentifier: 0,
        unitWeightInGrams: 200,
        baseUnitPrice: 380,
        bundleSizeForDiscount: 5,
        discountMultiplier: 0.80, // Represents a 20% discount on the bundle price
        // Pre-calculate the cost for a full bundle to optimize repeated calculations.
        bundleCost: 5 * 380 * 0.80
    },
    {
        itemIdentifier: 1,
        unitWeightInGrams: 300,
        baseUnitPrice: 550,
        bundleSizeForDiscount: 4,
        discountMultiplier: 0.85, // Represents a 15% discount on the bundle price
        bundleCost: 4 * 550 * 0.85
    },
    {
        itemIdentifier: 2,
        unitWeightInGrams: 500,
        baseUnitPrice: 850,
        bundleSizeForDiscount: 3,
        discountMultiplier: 0.88, // Represents a 12% discount on the bundle price
        bundleCost: 3 * 850 * 0.88
    }
];

/**
 * Calculates the total cost for a specific quantity of a product, applying any bundle discounts.
 * This function encapsulates the pricing logic for a single item type.
 * @param {number} unitCount - The total number of units of this product. Must be a non-negative integer.
 * @param {object} productDetails - An object containing the product's pricing and bundle details from PRODUCT_CATALOGUE.
 * @returns {number} The calculated monetary cost for the given number of units.
 */
function calculateProductCost(unitCount, productDetails) {
    // A quick check for zero units to avoid unnecessary calculations.
    if (unitCount === 0) {
        return 0;
    }

    // Determine how many full discount bundles can be formed.
    const fullDiscountBundles = Math.floor(unitCount / productDetails.bundleSizeForDiscount);
    // Calculate the number of remaining units that don't form a full bundle.
    const individualUnitsRemaining = unitCount % productDetails.bundleSizeForDiscount;

    // Sum the cost from discounted bundles and individually priced remaining units.
    const costFromBundles = fullDiscountBundles * productDetails.bundleCost;
    const costFromIndividualUnits = individualUnitsRemaining * productDetails.baseUnitPrice;

    return costFromBundles + costFromIndividualUnits;
}

/**
 * Determines the minimum monetary cost required to achieve an exact desired total weight
 * by combining available products. This uses a dynamic programming-like approach to explore
 * all possible combinations efficiently.
 * @param {number} desiredTotalWeight - The exact target weight in grams that needs to be achieved.
 *                                     Must be a positive integer.
 * @returns {number} The minimum calculated cost, or -1 if the desired weight cannot be achieved
 *                   with any combination of products.
 */
function determineMinimumPrice(desiredTotalWeight) {
    // Input validation: Ensure the target weight is a valid positive integer.
    if (typeof desiredTotalWeight !== 'number' || desiredTotalWeight <= 0 || !Number.isInteger(desiredTotalWeight)) {
        console.error(`Invalid input: Target weight must be a positive integer. Received: ${desiredTotalWeight}`);
        return -1; // Indicate invalid input with a sentinel value.
    }

    // Initialize the set of possible states. Each state object contains:
    // { currentAccumulatedWeight: number, itemUnitQuantities: number[] }
    // Start with a single state: 0 weight, 0 units of each item (represented as [0, 0, 0]).
    let currentWeightCombinations = [{ currentAccumulatedWeight: 0, itemUnitQuantities: [0, 0, 0] }];

    // A Map to keep track of unique (weight, quantities) combinations encountered so far.
    // This optimization prevents redundant processing of identical states, improving performance.
    // Key format: "weight-count0,count1,count2"
    const uniqueCombinationTracker = new Map();
    uniqueCombinationTracker.set('0-0,0,0', true); // Add the initial state to the tracker.

    // Iterate through each product type defined in the PRODUCT_CATALOGUE.
    for (let productTypeIndex = 0; productTypeIndex < PRODUCT_CATALOGUE.length; productTypeIndex++) {
        const currentProductDetails = PRODUCT_CATALOGUE[productTypeIndex];
        const nextIterationCombinations = []; // Stores combinations generated for the current product type.
        const nextIterationTracker = new Map(); // Tracker for combinations generated in *this* specific iteration.

        // Process each existing valid combination from the previous product type's processing stage.
        for (const previousCombinationState of currentWeightCombinations) {
            const accumulatedWeightBefore = previousCombinationState.currentAccumulatedWeight;
            const previousQuantities = previousCombinationState.itemUnitQuantities;

            // Try adding varying numbers of units of the current product type (from 0 upwards).
            // The loop continues indefinitely until explicitly broken.
            for (let unitsOfCurrentProduct = 0; ; unitsOfCurrentProduct++) {
                const newTotalWeight = accumulatedWeightBefore + unitsOfCurrentProduct * currentProductDetails.unitWeightInGrams;

                // Optimization: If the new total weight already exceeds the desired target,
                // there's no need to add more units of this product for the current previousCombinationState.
                // This prunes the search space effectively.
                if (newTotalWeight > desiredTotalWeight) {
                    break;
                }

                // Create a new array for quantities to avoid modifying the original array from previousCombinationState.
                const updatedQuantities = [...previousQuantities];
                // Set the quantity for the current product type at its specific index.
                updatedQuantities[productTypeIndex] = unitsOfCurrentProduct;

                // Generate a unique key for the new combination state.
                const combinationKey = `${newTotalWeight}-${updatedQuantities.join(',')}`;

                // Only add this new combination if it hasn't been added to `nextIterationCombinations` yet.
                // This prevents duplicate states from being processed in the next outer loop iteration.
                if (!nextIterationTracker.has(combinationKey)) {
                    nextIterationCombinations.push({
                        currentAccumulatedWeight: newTotalWeight,
                        itemUnitQuantities: updatedQuantities
                    });
                    nextIterationTracker.set(combinationKey, true);
                }
            }
        }
        // Update the set of combinations for the next product type's processing.
        currentWeightCombinations = nextIterationCombinations;
    }

    let overallLowestPrice = Infinity; // Initialize with a very high value.

    // After processing all product types, filter through the final set of combinations
    // to find those that exactly match the desired total weight.
    for (const finalCombinationState of currentWeightCombinations) {
        if (finalCombinationState.currentAccumulatedWeight === desiredTotalWeight) {
            const finalQuantities = finalCombinationState.itemUnitQuantities;
            let calculatedTotalCost = 0;

            // Calculate the total cost for this specific combination of item quantities.
            for (let idx = 0; idx < PRODUCT_CATALOGUE.length; idx++) {
                calculatedTotalCost += calculateProductCost(finalQuantities[idx], PRODUCT_CATALOGUE[idx]);
            }

            // Update the overall minimum price if this combination is cheaper.
            if (calculatedTotalCost < overallLowestPrice) {
                overallLowestPrice = calculatedTotalCost;
            }
        }
    }

    // If `overallLowestPrice` remains `Infinity`, it means no combination was found
    // that exactly matches the `desiredTotalWeight`. Return -1 to indicate no solution.
    return overallLowestPrice === Infinity ? -1 : overallLowestPrice;
}

/**
 * Main application entry point responsible for reading standard input,
 * parsing each line, performing the price calculation, and printing results to standard output.
 */
function executePriceCalculationProcess() {
    // Array to store valid, non-termination input lines for batch processing.
    const collectedInputLines = [];
    let stopInputProcessing = false; // Flag to stop collecting input after a '0' is encountered.

    // Process each line from the raw input data buffer.
    // The `rawInputDataBuffer` variable is populated by Node.js stdin event listeners.
    for (const dataLine of rawInputDataBuffer.split('\n')) {
        // Skip processing if the stop flag is set or the line is null/undefined.
        if (stopInputProcessing || dataLine === null || typeof dataLine === 'undefined') {
            continue;
        }

        const trimmedInput = dataLine.trim();

        // Skip empty lines or lines consisting only of whitespace.
        if (trimmedInput === '') {
            continue;
        }

        // Check for the termination signal: a single '0' on a line.
        if (trimmedInput === '0') {
            stopInputProcessing = true; // Set flag to stop further line processing.
            continue;
        }

        // If the line is valid and not a termination signal, add it to the collection.
        collectedInputLines.push(trimmedInput);
    }

    // Now, iterate through the collected and validated input lines to perform calculations.
    for (const lineContent of collectedInputLines) {
        let parsedWeightValue;
        try {
            // Attempt to parse the line content into an integer.
            parsedWeightValue = parseInt(lineContent, 10);

            // Additional validation for the parsed integer.
            if (isNaN(parsedWeightValue) || !Number.isInteger(parsedWeightValue)) {
                console.error(`Warning: Skipping input line "${lineContent}". It could not be parsed as a valid integer.`);
                continue; // Move to the next input line.
            }
        } catch (parseError) {
            // Catch any unexpected errors during parsing.
            console.error(`Error encountered while parsing input line "${lineContent}": ${parseError.message}`);
            continue;
        }

        // Call the core calculation logic with the parsed weight.
        // Wrap in a try-catch block for robust error handling during calculation.
        try {
            const finalCalculatedCost = determineMinimumPrice(parsedWeightValue);
            console.log(finalCalculatedCost); // Output the result to standard output.
        } catch (calculationError) {
            console.error(`An error occurred during price calculation for weight ${parsedWeightValue}: ${calculationError.message}`);
        }
    }
}

// --- Node.js standard input handling setup ---
// This section configures the Node.js environment to capture all data
// streamed through standard input until the input stream ends.

let rawInputDataBuffer = ''; // A string buffer to accumulate all incoming data from stdin.

// Tell `process.stdin` to start emitting data events.
process.stdin.resume();
// Specify the character encoding for the incoming data stream.
process.stdin.setEncoding('utf8');

// Event listener: Fired whenever a chunk of data is received from stdin.
process.stdin.on('data', function(dataChunk) {
    rawInputDataBuffer += dataChunk; // Append the new data chunk to our buffer.
});

// Event listener: Fired when the entire input stream has ended (e.g., EOF reached).
process.stdin.on('end', function() {
    // Once all input data has been received, initiate the main processing logic.
    executePriceCalculationProcess();
});
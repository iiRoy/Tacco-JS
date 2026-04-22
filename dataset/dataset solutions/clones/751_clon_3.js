const rawDataInput = require('fs').readFileSync('/dev/stdin', 'utf8');

// Processes raw input: removes leading/trailing whitespace and splits into an array of lines.
let dataEntryLines = rawDataInput.trim().split('\n');

/**
 * Calculates the optimal cost for acquiring a target quantity of items
 * using two distinct strategies.
 *
 * Strategy A: Purchase full batches and then individual remaining units.
 * Strategy B: Either purchase the required quantity directly if large enough,
 *             or adjust initial inventory to form a full batch and purchase that.
 *
 * @param {number} costPerUnitX - The cost for each unit of item type X.
 * @param {number} costPerUnitY - The cost for each unit of item type Y.
 * @param {number} costForRemainder - The cost for an individual item when it's a remainder (Strategy A).
 * @param {number} batchSizeThreshold - The minimum quantity required to form a "batch".
 * @param {number} batchPurchaseUnitCost - The cost per unit when purchasing items in a batch.
 * @param {number} initialInventoryX - The initial count of item type X available.
 * @param {number} initialInventoryY - The initial count of item type Y available.
 * @param {number} totalItemsRequired - The overall target quantity of items needed.
 */
function determineMinimumAcquisitionCost(
    costPerUnitX,
    costPerUnitY,
    costForRemainder,
    batchSizeThreshold,
    batchPurchaseUnitCost,
    initialInventoryX,
    initialInventoryY,
    totalItemsRequired
) {
    // Input validation: Ensure batchSizeThreshold is positive to prevent division by zero or illogical states.
    if (batchSizeThreshold <= 0) {
        // In a real-world scenario, this might throw an error or log a warning.
        // For this problem context, an extremely high cost signifies an impossible scenario.
        console.log(Number.MAX_SAFE_INTEGER);
        return;
    }

    // Mutable copies of initial inventory for Strategy B's adjustments.
    let currentInventoryX = initialInventoryX;
    let currentInventoryY = initialInventoryY;

    // --- Calculation for Strategy A ---
    // This approach involves fulfilling the requirement with as many full batches as possible,
    // and then covering any remaining quantity with individual units at a different cost.
    const fullBatchesCount = Math.floor(totalItemsRequired / batchSizeThreshold);
    const unitsBeyondFullBatches = totalItemsRequired % batchSizeThreshold;

    const totalCostStrategyA =
        (currentInventoryX * costPerUnitX) +
        (currentInventoryY * costPerUnitY) +
        (fullBatchesCount * batchSizeThreshold * batchPurchaseUnitCost) +
        (unitsBeyondFullBatches * costForRemainder);

    // --- Calculation for Strategy B ---
    let totalCostStrategyB;

    // Condition: If the total items required is at least one batch size.
    if (totalItemsRequired >= batchSizeThreshold) {
        // In this case, Strategy B considers acquiring the entire 'totalItemsRequired'
        // at the 'batchPurchaseUnitCost', combined with the initial inventory.
        totalCostStrategyB =
            (currentInventoryX * costPerUnitX) +
            (currentInventoryY * costPerUnitY) +
            (totalItemsRequired * batchPurchaseUnitCost);
    } else {
        // Condition: If the total items required is less than a full batch size.
        // This strategy aims to adjust current inventory (X and Y) to reach a full batch,
        // then purchase that full batch.
        const unitsNeededToCompleteBatch = batchSizeThreshold - totalItemsRequired;

        // Prioritize reducing item Y, then item X, to cover the 'deficit' for the batch.
        // This is a more efficient rewrite of the original loop-based reduction.
        const reductionFromY = Math.min(currentInventoryY, unitsNeededToCompleteBatch);
        currentInventoryY -= reductionFromY;
        const remainingUnitsToCover = unitsNeededToCompleteBatch - reductionFromY;

        const reductionFromX = Math.min(currentInventoryX, remainingUnitsToCover);
        currentInventoryX -= reductionFromX;

        // The cost for Strategy B in this scenario:
        // (adjusted initial X * cost X) + (adjusted initial Y * cost Y) + (cost of one full batch purchase)
        totalCostStrategyB =
            (currentInventoryX * costPerUnitX) +
            (currentInventoryY * costPerUnitY) +
            (batchSizeThreshold * batchPurchaseUnitCost);
    }

    // Output the lower of the two calculated costs.
    console.log(Math.min(totalCostStrategyA, totalCostStrategyB));
}

// Main loop to process each set of problem data.
// Continues until a specific termination sequence ("0 0 0 0 0") is encountered.
while (true) {
    // Extract the first segment of parameters from the current line of input.
    const segmentOneParams = dataEntryLines.shift();

    // Check for the termination signal.
    if (segmentOneParams === "0 0 0 0 0") {
        break; // Exit the processing loop.
    }

    // Combine the first segment with the next line of input to form the complete set of parameters.
    // This implicitly assumes each problem definition spans two lines.
    const combinedParameterString = segmentOneParams + " " + dataEntryLines.shift();

    // Convert the combined string of parameters into an array of numbers.
    const numericalParameterArray = combinedParameterString.split(' ').map(Number);

    // Basic validation: Ensure exactly 8 parameters are provided for the calculation function.
    if (numericalParameterArray.length !== 8) {
        console.error(`Input Error: Expected 8 numerical parameters per problem set, but received ${numericalParameterArray.length}. Skipping this entry.`);
        continue; // Skip to the next iteration if input is malformed.
    }

    // Invoke the core calculation function using the spread operator to pass the array elements as arguments.
    determineMinimumAcquisitionCost(...numericalParameterArray);
}
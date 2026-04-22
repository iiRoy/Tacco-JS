const ProcessData = (rawData) => {
    // Attempt to parse initial configuration parameters from the first line of raw input.
    const configurationLine = rawData[0];
    const [entityCountStr, adjustmentQuotaStr] = configurationLine.split(' ');

    // Convert string-based parameters to integer values for processing.
    const entityCount = parseInt(entityCountStr, 10);
    const adjustmentQuota = parseInt(adjustmentQuotaStr, 10);

    // Basic validation: If there are no entities to process, output 0 and exit.
    // This is a new guard clause to handle edge cases.
    if (entityCount <= 0) {
        console.log(0);
        return;
    }

    // Retrieve and convert the list of primary factors to numbers.
    const primaryFactors = rawData[1].split(' ').map(Number);
    // Retrieve and convert the list of secondary multipliers to numbers.
    const secondaryMultipliers = rawData[2].split(' ').map(Number);

    // Arrange primary factors in descending numerical order.
    primaryFactors.sort((firstVal, secondVal) => secondVal - firstVal);

    // Arrange secondary multipliers in ascending numerical order.
    secondaryMultipliers.sort((firstVal, secondVal) => firstVal - secondVal);

    // Initialize a collection to store each item's calculated product along with its components.
    // Each entry: [current_product_value, primary_factor_A, secondary_multiplier_F]
    const productDetailsCollection = [];
    for (let currentIdx = 0; currentIdx < entityCount; ++currentIdx) {
        const calculatedProduct = primaryFactors[currentIdx] * secondaryMultipliers[currentIdx];
        productDetailsCollection.push([calculatedProduct, primaryFactors[currentIdx], secondaryMultipliers[currentIdx]]);
    }

    // Iterate for the specified number of adjustments, if any.
    for (let operationCounter = 0; operationCounter < adjustmentQuota; ++operationCounter) {
        // Sort the collection to bring the entry with the highest product value to the front.
        // The sort order is descending based on the first element (the product).
        productDetailsCollection.sort((elementA, elementB) => elementB[0] - elementA[0]);

        // Access the entry with the maximum product. This is a helper variable.
        const highestProductEntry = productDetailsCollection[0];

        // Decrement the primary factor (the second element) of this entry.
        highestProductEntry[1]--;

        // Recalculate the product value for this modified entry.
        highestProductEntry[0] = highestProductEntry[1] * highestProductEntry[2];
    }

    // After all adjustments, perform a final sort to guarantee the true maximum product is identified.
    productDetailsCollection.sort((elementA, elementB) => elementB[0] - elementA[0]);

    // Output the ultimate highest product value found.
    console.log(productDetailsCollection[0][0]);
};

// Standard input reading and execution.
// This part remains similar as it's typically boilerplate for competitive programming.
ProcessData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
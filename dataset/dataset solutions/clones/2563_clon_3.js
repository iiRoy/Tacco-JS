// Function to process financial data and apply dynamic discounts.
function processFinancialData(rawDataContent) {
    // Input validation: Ensure the raw data content is a non-empty string.
    if (!rawDataContent || typeof rawDataContent !== 'string' || rawDataContent.trim() === '') {
        console.error("Input processing error: Raw data stream is empty or malformed.");
        return; // Terminate execution for invalid input.
    }

    // Split the entire raw input string into an array of individual lines.
    const dataLines = rawDataContent.split("\n");

    // Check for the minimum required number of lines (configuration and item prices).
    if (dataLines.length < 2) {
        console.error("Input parsing error: Insufficient data lines provided for configuration and prices.");
        return;
    }

    // Extract numerical configuration parameters from the first line.
    const configurationTokens = dataLines[0].split(" ");
    const declaredItemCount = parseInt(configurationTokens[0], 10); // Represents 'N' - total items.
    const discountCouponSupply = parseInt(configurationTokens[1], 10); // Represents 'M' - total available coupons.

    // Validate parsed numerical parameters.
    if (isNaN(declaredItemCount) || isNaN(discountCouponSupply) || declaredItemCount < 0 || discountCouponSupply < 0) {
        console.error("Configuration error: Item count or coupon supply are invalid numerical values.");
        return;
    }

    // Handle edge case: No items to process.
    if (declaredItemCount === 0) {
        console.log(0); // If there are no items, the total cost is naturally zero.
        return;
    }

    // Handle edge case: No discount coupons available.
    if (discountCouponSupply === 0) {
        // Parse item prices even if no discounts will be applied, then sum and output.
        const initialPriceStrings = dataLines[1].split(" ");
        const initialItemValues = initialPriceStrings.map(str => parseInt(str, 10)).filter(val => !isNaN(val) && val >= 0);
        const finalInitialSum = initialItemValues.slice(0, declaredItemCount).reduce((acc, val) => acc + val, 0);
        console.log(finalInitialSum);
        return; // Exit early as no discounts are needed.
    }

    // Parse and convert item prices from the second line into a mutable numeric array.
    const itemPriceStrings = dataLines[1].split(" ");
    let productValueRegister = itemPriceStrings
        .map(priceStr => parseInt(priceStr, 10))
        .filter(val => !isNaN(val) && val >= 0); // Filter out any non-numeric or negative prices.

    // Adjust the `productValueRegister` to match the `declaredItemCount`.
    if (productValueRegister.length < declaredItemCount) {
        console.error(`Data integrity warning: Declared ${declaredItemCount} items, but only ${productValueRegister.length} prices found. Cannot proceed.`);
        return;
    }
    // Truncate if more prices are provided than declared.
    productValueRegister = productValueRegister.slice(0, declaredItemCount);


    let couponsConsumed = 0; // Tracks the number of coupons used.

    // Conditional logic based on the number of items.
    if (declaredItemCount === 1) {
        // Special case: If only one item, apply all coupons to it directly.
        // Division by 2^X is efficiently done using a bitwise left shift (1 << X).
        productValueRegister[0] = Math.floor(productValueRegister[0] / (1 << discountCouponSupply));
    } else {
        // General case: Multiple items, apply coupons iteratively.
        // The loop continues as long as there are coupons remaining.
        while (couponsConsumed < discountCouponSupply) {
            let maxCurrentItemValue = -1; // Initialize with a value lower than any possible price.
            let maxItemValueIndex = -1; // Index of the highest priced item.

            // Iterate through the current list of item prices to find the maximum value and its first index.
            for (let currentIdx = 0; currentIdx < declaredItemCount; currentIdx++) {
                if (productValueRegister[currentIdx] > maxCurrentItemValue) {
                    maxCurrentItemValue = productValueRegister[currentIdx];
                    maxItemValueIndex = currentIdx;
                }
            }

            // If no item with a positive price is found, or an error occurred in finding max.
            if (maxItemValueIndex === -1 || maxCurrentItemValue <= 0) {
                // All remaining items are priced at 0, or an unexpected state. No more effective discounts.
                break;
            }

            // Calculate the sum of all current item prices.
            const currentTotalAggregate = productValueRegister.reduce((sumAccumulator, val) => sumAccumulator + val, 0);

            // Determine the number of discounts to apply in this batch.
            // This is a specific algorithm detail: based on the proportion of the max item's value to the total sum.
            let batchDiscountCount = Math.ceil(maxCurrentItemValue / currentTotalAggregate);

            // Ensure the batch doesn't exceed the remaining available coupons.
            const remainingCoupons = discountCouponSupply - couponsConsumed;
            if (batchDiscountCount > remainingCoupons) {
                batchDiscountCount = remainingCoupons; // Cap the batch to available coupons.
            }

            // If no actual discounts can be applied in this batch, or all coupons are implicitly used.
            if (batchDiscountCount <= 0) {
                break; // Exit the loop if no progress can be made.
            }

            // Apply the determined batch of discounts to the highest-priced item.
            // Each discount halves the price. 'X' discounts means dividing by 2^X.
            productValueRegister[maxItemValueIndex] = Math.floor(productValueRegister[maxItemValueIndex] / (1 << batchDiscountCount));

            // Increment the counter for total coupons utilized.
            couponsConsumed += batchDiscountCount;
        }
    }

    // Calculate the final sum of all item prices after all discounts are applied.
    const finalComputedTotal = productValueRegister.reduce((totalAccumulator, price) => totalAccumulator + price, 0);

    // Output the final calculated total cost to standard output.
    console.log(finalComputedTotal);
}

// Entry point for execution: Reads input from standard input (e.g., typically a file in competitive programming).
// The 'fs' module is used for file system operations, and 'readFileSync' reads the entire file synchronously.
// '/dev/stdin' is a common path for standard input on Unix-like systems.
// The content is then passed to the main processing function.
processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));
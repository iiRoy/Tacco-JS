function CalculateMinimumPurchase(rawInputString)
{
    // Break down the incoming string into individual components
    let parsedValues = rawInputString.split(" ")
    ;
    // Parse numeric values for item costs and required quantities
    let costOfItemA = Number.parseInt(parsedValues[0], 10),
        costOfItemB = Number.parseInt(parsedValues[1], 10),
        costOfPairedItemC = Number.parseInt(parsedValues[2], 10),
        requiredQuantityX = Number.parseInt(parsedValues[3], 10),
        requiredQuantityY = Number.parseInt(parsedValues[4], 10);
    // Determine the common and maximum quantities for optimization
    let sharedItemsCount = Math.min(requiredQuantityX, requiredQuantityY),
        maxItemsCount = Math.max(requiredQuantityX, requiredQuantityY);
    // Initialize an array to store various pricing strategies
    let calculatedCostOptions = [ ] ;

    // Strategy 1: Purchase all items individually
    let individualItemTotal = sharedItemsCount * costOfItemA + sharedItemsCount * costOfItemB;
    calculatedCostOptions.push(individualItemTotal);

    // Strategy 2: Purchase common items as pairs, remaining individually
    let mixedPurchaseTotal = sharedItemsCount * costOfPairedItemC * 2 +
                             (requiredQuantityX - sharedItemsCount) * costOfItemA +
                             (requiredQuantityY - sharedItemsCount) * costOfItemB;
    calculatedCostOptions.push(mixedPurchaseTotal);

    // Strategy 3: Purchase all required items as pairs
    let allPairedItemsTotal = maxItemsCount * costOfPairedItemC * 2;
    calculatedCostOptions.push(allPairedItemsTotal);

    // Find the lowest cost among all calculated options
    let minimumOverallCost = Math.min.apply(null, calculatedCostOptions);
    console.log(minimumOverallCost);
}

// Example usage with various input configurations
// CalculateMinimumPurchase(require("node:fs").readFileSync("/dev/stdin", "utf8")); // Production input method
CalculateMinimumPurchase("1500 2000 1600 3 2");
CalculateMinimumPurchase("1500 2000 1900 3 2");
CalculateMinimumPurchase("1500 2000 500 90000 100000");
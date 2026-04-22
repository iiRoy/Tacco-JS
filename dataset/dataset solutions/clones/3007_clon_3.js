// This JavaScript module is designed to process a specific format of financial or investment data.
// Its primary goal is to compute the aggregate positive return from a series of asset transactions.

function CalculateInvestmentReturn(initialStream) {
    // Validate the incoming data stream to ensure it's a non-empty string.
    // If the data is invalid, an early exit prevents further processing.
    if (typeof initialStream !== 'string' || initialStream.trim().length === 0) {
        // In a production scenario, this might log an error or throw an exception.
        // For this clone, we'll simply return to match the original's silent failure if input is bad.
        return;
    }

    // The raw input stream is divided into individual lines of data.
    // Each line is expected to contain a distinct piece of information.
    const dataSegments = initialStream.split('\n');

    // A constant is defined for the radix (base) used in number parsing.
    // This improves clarity and prevents potential issues with default radix behavior.
    const NUMERIC_RADIX_BASE = 10;

    // The first line of the input typically specifies the total number of items or assets to be processed.
    // This string is converted into an integer to control subsequent loops and array sizes.
    const assetQuantity = Number.parseInt(dataSegments[0], NUMERIC_RADIX_BASE);

    // The second line contains a space-separated list of potential gains or values for each asset.
    // These are initially stored as an array of strings.
    const potentialGainStrings = dataSegments[1].split(' ');

    // The third line provides the corresponding expenditure or cost for each asset,
    // also as a space-separated string array.
    const expenditureStrings = dataSegments[2].split(' ');

    // Two dynamic arrays are initialized to hold the parsed numeric values of assets and their costs.
    // Using `let` signifies that these arrays will be populated during the execution.
    let itemValues = [];
    let itemCosts = [];

    // A variable to accumulate the sum of all positive net benefits.
    // It is initialized to zero, as no benefits have been tallied yet.
    let cumulativePositiveYield = 0;

    // The first processing phase involves iterating through the expected number of assets.
    // In this loop, string representations of values and costs are converted to integers
    // and then appended to their respective numeric arrays.
    for (let currentItemIndex = 0; currentItemIndex < assetQuantity; currentItemIndex++) {
        // Extract and parse the individual asset's value from its string representation.
        const currentAssetMonetaryValue = Number.parseInt(potentialGainStrings[currentItemIndex], NUMERIC_RADIX_BASE);
        itemValues.push(currentAssetMonetaryValue); // Add the parsed value to the collection.

        // Extract and parse the individual asset's cost from its string representation.
        const currentAssetOutlayCost = Number.parseInt(expenditureStrings[currentItemIndex], NUMERIC_RADIX_BASE);
        itemCosts.push(currentAssetOutlayCost); // Add the parsed cost to the collection.
    }

    // The second processing phase calculates the net benefit for each asset.
    // This loop iterates through the now-populated numeric arrays.
    // A different loop variable `k` is used to demonstrate identifier variation.
    for (let k = 0; k < assetQuantity; k++) {
        // Compute the net difference by subtracting the cost from the value of the current asset.
        const netDifferenceForAsset = itemValues[k] - itemCosts[k];

        // A conditional check is performed: only if the net difference is strictly positive,
        // it contributes to the overall cumulative yield.
        if (netDifferenceForAsset > 0) {
            cumulativePositiveYield += netDifferenceForAsset;
        }
        // An explicit 'else' block is included as a structural modification,
        // even if it performs no action, to show a code fragment addition.
        else {
            // Assets with zero or negative net difference do not add to the positive yield.
            // No operation is required here based on the problem's criteria.
        }
    }

    // Finally, the total accumulated positive yield is printed to the standard output.
    console.log(cumulativePositiveYield);
}

// This is the main execution block of the script.
// It reads all data from standard input, assumes UTF-8 encoding,
// and passes the entire content as a string to the primary analysis function.
CalculateInvestmentReturn(require("fs").readFileSync("/dev/stdin", "utf-8"));
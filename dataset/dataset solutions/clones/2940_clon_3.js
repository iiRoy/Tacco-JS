function processInputData(rawData) {
    // Split the raw input into individual lines, filtering out any empty lines.
    // This implicitly handles a potential trailing empty line from the input.
    const allInputLines = rawData.split('\n').filter(Boolean);

    // Validate minimum input structure.
    if (allInputLines.length < 2) {
        console.error("Error: Insufficient input lines provided.");
        return;
    }

    // --- Parse Initial Configuration ---
    // Extract the first line containing the total item count and operation count.
    const dimensionsString = allInputLines.shift();
    const dimensionTokens = dimensionsString.split(' ');

    // Convert string tokens to numbers for item and operation counts.
    const totalItemsCount = Number(dimensionTokens[0]);
    const operationCount = Number(dimensionTokens[1]);

    // Perform basic validation on parsed dimensions.
    if (isNaN(totalItemsCount) || isNaN(operationCount) || totalItemsCount <= 0) {
        console.error("Error: Invalid or non-positive item/operation counts detected.");
        return;
    }

    // --- Parse and Prepare Initial Item Costs ---
    // Extract the second line which contains the initial costs of all items.
    const initialCostsLine = allInputLines.shift();
    let currentItemCosts = initialCostsLine.split(' ').map(Number);

    // Sort the initial item costs in ascending order. This is crucial for the optimization strategy.
    currentItemCosts.sort((costA, costB) => costA - costB);

    // Validate that the number of parsed costs matches the declared total item count.
    if (currentItemCosts.length !== totalItemsCount) {
        console.error("Error: Mismatch between declared total items and parsed item costs.");
        return;
    }

    // --- Parse and Prepare Modification Offers ---
    // Map the remaining lines (operations) into structured objects { count, price }.
    const potentialModificationOffers = allInputLines.map(offerString => {
        const offerParts = offerString.split(' ');
        // Ensure conversion to number, defaulting to 0 if parsing fails (robustness).
        return {
            count: Number(offerParts[0]) || 0,
            price: Number(offerParts[1]) || 0
        };
    });

    // Sort the modification offers in descending order based on their price.
    // This prioritizes applying higher-value offers first.
    potentialModificationOffers.sort((offerA, offerB) => offerB.price - offerA.price);

    // --- Apply Optimization Logic ---
    // This pointer tracks the index of the cheapest item currently available for modification.
    let itemCursorPosition = 0;
    const actualTotalItems = currentItemCosts.length; // Cache length for performance.

    // Iterate through each sorted modification offer.
    for (let offerIterator = 0; offerIterator < operationCount; offerIterator++) {
        // Early exit if all items have already been processed (e.g., replaced by higher costs).
        if (itemCursorPosition >= actualTotalItems) {
            break;
        }

        const currentOffer = potentialModificationOffers[offerIterator];

        // Guard against malformed input where there might be fewer offers than operationCount.
        if (!currentOffer || currentOffer.count <= 0 || currentOffer.price <= 0) {
            continue; // Skip invalid offers.
        }

        let remainingSlotsForOffer = currentOffer.count;
        const newOfferPrice = currentOffer.price;

        // Apply the current offer as many times as possible, or until its slots are used up,
        // or until all items are processed, or until the offer is no longer beneficial.
        while (remainingSlotsForOffer > 0 && itemCursorPosition < actualTotalItems) {
            const currentItemValue = currentItemCosts[itemCursorPosition];

            // If the current cheapest item's cost is less than the new offer price, update it.
            if (currentItemValue < newOfferPrice) {
                currentItemCosts[itemCursorPosition] = newOfferPrice;
                itemCursorPosition++; // Move to the next cheapest item.
            } else {
                // Since the items are sorted, if the current item's cost is already
                // greater than or equal to the new offer price, any subsequent items
                // will also be. Thus, this offer is no longer beneficial for remaining items.
                break;
            }
            remainingSlotsForOffer--; // Decrement the count of items this offer can still affect.
        }
    }

    // --- Calculate Final Optimized Sum ---
    // Sum up all the costs in the modified itemCosts array.
    const finalOptimizedSum = currentItemCosts.reduce((totalAccumulator, currentItemValue) => {
        return totalAccumulator + currentItemValue;
    }, 0);

    // Output the final maximum possible sum.
    console.log(finalOptimizedSum);
}

// Entry point for execution: Read input from standard input and pass to the processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
function determineMinimumCost(targetWeightGrams) {
    const WEIGHT_UNITS = [200, 300, 500];
    const BASE_PRICES = [380, 550, 850];
    const DISCOUNT_THRESHOLDS = [5, 4, 3];
    const DISCOUNT_FACTORS = [0.8, 0.85, 0.88]; // 20%, 15%, 12% discount

    // Helper function to calculate the total price for a given set of item counts
    const calculateItemPrice = (itemCountsArray) => {
        let totalCalculatedPrice = 0;
        for (let k = 0; k < itemCountsArray.length; k++) {
            const count = itemCountsArray[k];
            const basePrice = BASE_PRICES[k];
            const threshold = DISCOUNT_THRESHOLDS[k];
            const discountFactor = DISCOUNT_FACTORS[k];

            const fullPriceItems = count % threshold;
            const discountedBundles = Math.floor(count / threshold);

            totalCalculatedPrice += (fullPriceItems * basePrice);
            totalCalculatedPrice += (discountedBundles * threshold * basePrice * discountFactor);
        }
        return totalCalculatedPrice;
    };

    let currentIterationPatterns = [[0, []]]; // Stores [accumulatedWeight, itemCountsArray]

    // Iterate through each weight category to build up possible combinations
    for (let weightCategoryIndex = 0; weightCategoryIndex < WEIGHT_UNITS.length; weightCategoryIndex++) {
        const currentWeightUnit = WEIGHT_UNITS[weightCategoryIndex];
        let nextIterationPatterns = [];

        // Process all patterns from the previous iteration
        while (currentIterationPatterns.length > 0) {
            const patternEntry = currentIterationPatterns.shift();
            const accumulatedWeight = patternEntry[0];
            const itemCountsArray = patternEntry[1];

            let itemCount = 0;
            // Generate new patterns by adding varying counts of the current item type
            while (itemCount * currentWeightUnit + accumulatedWeight <= targetWeightGrams) {
                nextIterationPatterns.push([
                    itemCount * currentWeightUnit + accumulatedWeight,
                    itemCountsArray.concat(itemCount)
                ]);
                itemCount++;
            }
            // Add one more pattern for the case where itemCount exceeds the target,
            // which is a specific behavior of the original algorithm.
            nextIterationPatterns.push([
                itemCount * currentWeightUnit + accumulatedWeight,
                itemCountsArray.concat(itemCount)
            ]);
        }
        currentIterationPatterns = nextIterationPatterns; // Update patterns for the next iteration
    }

    let lowestCalculatedPrice = Infinity;

    // Filter patterns to find those matching the target weight and calculate the minimum price
    for (const patternEntry of currentIterationPatterns) {
        const accumulatedWeight = patternEntry[0];
        // Skip patterns that do not exactly match the target weight
        if (accumulatedWeight !== targetWeightGrams) {
            continue;
        }
        const itemCountsArray = patternEntry[1];
        const currentCalculatedPrice = calculateItemPrice(itemCountsArray);
        
        // Update the minimum price if a lower one is found
        if (currentCalculatedPrice < lowestCalculatedPrice) {
            lowestCalculatedPrice = currentCalculatedPrice;
        }
    }

    return lowestCalculatedPrice;
}

function executeProgram(inputDataLines) {
    let processingFinished = false;

    for (const currentLine of inputDataLines) {
        const trimmedLine = currentLine.trim();

        // Skip empty lines
        if (trimmedLine === '') {
            continue;
        }
        // If the termination condition has been met, skip further processing
        if (processingFinished) {
            continue;
        }

        const numericValue = parseInt(trimmedLine, 10);

        // Check for the termination signal (input '0')
        if (numericValue === 0) {
            processingFinished = true;
            continue;
        }

        // Calculate and print the minimum cost for the current target weight
        const resultPrice = determineMinimumCost(numericValue);
        console.log(resultPrice);
    }
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (dataChunk) => {
    rawInputBuffer += dataChunk;
});
process.stdin.on('end', () => {
    const processedInputLines = rawInputBuffer.split('\n');
    executeProgram(processedInputLines);
});

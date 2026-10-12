let rawInputAccumulator = '';

let costMemo = new Map();

function calculateMinCost(itemDataMap, currentItemName, currentPathSet) {
    try {
        if (costMemo.has(currentItemName)) {
            return costMemo.get(currentItemName);
        }

        const itemDetails = itemDataMap[currentItemName];
        if (!itemDetails) {
            throw currentItemName;
        }

        let directPurchaseCost = itemDetails.cost;

        if (itemDetails.components && itemDetails.components.length > 0) {
            if (currentPathSet.has(currentItemName)) {
                costMemo.set(currentItemName, directPurchaseCost);
                return directPurchaseCost;
            }

            const nextPathSet = new Set(currentPathSet).add(currentItemName);

            let recipeAggregatedCost = 0;
            let canFormRecipe = true;

            for (const componentIdentifier of itemDetails.components) {
                if (currentPathSet.has(componentIdentifier)) {
                    canFormRecipe = false;
                    break;
                }
                recipeAggregatedCost += calculateMinCost(itemDataMap, componentIdentifier, nextPathSet);
            }

            if (canFormRecipe) {
                directPurchaseCost = Math.min(directPurchaseCost, recipeAggregatedCost);
            }
        }
        costMemo.set(currentItemName, directPurchaseCost);
        return directPurchaseCost;

    } catch (err) {
        throw err;
    }
}

function processInputData() {
    const inputLines = rawInputAccumulator.split('\n');
    let currentLineIndex = 0;

    while (currentLineIndex < inputLines.length) {
        costMemo = new Map();

        const productRegistry = new Map();

        const directItemCountStr = inputLines[currentLineIndex++];
        const directItemCount = Number(directItemCountStr);

        if (directItemCount === 0) {
            break;
        }

        for (let itemCounter = 0; itemCounter < directItemCount; itemCounter++) {
            const lineParts = inputLines[currentLineIndex++].split(' ');
            const productIdentifier = lineParts[0];
            const initialCost = Number(lineParts[1]);
            productRegistry.set(productIdentifier, { cost: initialCost });
        }

        const recipeCountStr = inputLines[currentLineIndex++];
        const recipeCount = Number(recipeCountStr);

        for (let recipeCounter = 0; recipeCounter < recipeCount; recipeCounter++) {
            const lineParts = inputLines[currentLineIndex++].split(' ');
            const productIdentifier = lineParts[0];
            const componentIdentifiers = lineParts.slice(2);
            productRegistry.get(productIdentifier).components = componentIdentifiers;
        }

        const desiredProduct = inputLines[currentLineIndex++];
        const finalCalculatedCost = calculateMinCost(Object.fromEntries(productRegistry), desiredProduct, new Set());
        console.log(finalCalculatedCost);
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
    rawInputAccumulator += chunk;
});
process.stdin.on('end', function() {
    processInputData();
});

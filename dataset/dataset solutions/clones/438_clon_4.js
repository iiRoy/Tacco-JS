let receivedData = '';
let dataLines = [];
let currentIndex = 0;

function calculateMinimumCost(catalog, targetProduct, activePath, priceCache) {
    try {
        if (!catalog.has(targetProduct)) {
            throw targetProduct;
        }

        if (priceCache.has(targetProduct)) {
            return priceCache.get(targetProduct);
        }

        activePath.add(targetProduct);

        const productDetails = catalog.get(targetProduct);
        let currentBestValuation = productDetails.directPurchasePrice;

        if (productDetails.componentsList && productDetails.componentsList.length > 0) {
            let recipePathFeasible = true;
            let totalComponentsValuation = 0;

            for (const componentName of productDetails.componentsList) {
                if (activePath.has(componentName)) {
                    recipePathFeasible = false;
                    break;
                }
                totalComponentsValuation += calculateMinimumCost(catalog, componentName, activePath, priceCache);
            }

            if (recipePathFeasible) {
                currentBestValuation = Math.min(currentBestValuation, totalComponentsValuation);
            }
        }

        activePath.delete(targetProduct);
        priceCache.set(targetProduct, currentBestValuation);
        return currentBestValuation;

    } catch (e) {
        throw targetProduct;
    }
}

function processAllManufacturingRequests() {
    while (currentIndex < dataLines.length) {
        const numDirectItems = parseInt(dataLines[currentIndex], 10);
        if (isNaN(numDirectItems) || numDirectItems === 0) {
            break;
        }
        currentIndex++;

        const currentItemRegistry = new Map();

        for (let k = 0; k < numDirectItems; k++) {
            const definitionLine = dataLines[currentIndex++].split(' ');
            const productName = definitionLine[0];
            const priceValue = parseInt(definitionLine[1], 10);
            currentItemRegistry.set(productName, { directPurchasePrice: priceValue });
        }

        const numRecipeItems = parseInt(dataLines[currentIndex], 10);
        if (isNaN(numRecipeItems)) {
            break;
        }
        currentIndex++;

        for (let k = 0; k < numRecipeItems; k++) {
            const recipeLine = dataLines[currentIndex++].split(' ');
            const productName = recipeLine[0];
            const components = recipeLine.slice(2);
            currentItemRegistry.get(productName).componentsList = components;
        }

        const queryProduct = dataLines[currentIndex++];
        
        const pathTracker = new Set();
        const valuationCache = new Map();

        try {
            console.log(calculateMinimumCost(currentItemRegistry, queryProduct, pathTracker, valuationCache));
        } catch (missingItemIdentifier) {
            console.log(missingItemIdentifier);
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    receivedData += chunk;
});

process.stdin.on('end', function() {
    dataLines = receivedData.split('\n').filter(line => line.trim() !== '');
    currentIndex = 0;
    processAllManufacturingRequests();
});
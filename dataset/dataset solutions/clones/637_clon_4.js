function executeProgram() {
    const numItems = readInputToken();
    const numResources = readInputToken();

    const itemCosts = Array.from({ length: numItems }, () => readInputToken());
    const resourceCosts = Array.from({ length: numResources }, () => readInputToken());

    const memoizationCache = new Map();

    const determineMinimumCost = (currentItems, currentResources) => {
        const cacheKey = `${currentItems},${currentResources}`;
        if (memoizationCache.has(cacheKey)) {
            return memoizationCache.get(cacheKey);
        }

        let calculatedCost;
        if (currentItems === 0) {
            calculatedCost = 0;
        } else if (currentResources === 0) {
            calculatedCost = Infinity;
        } else {
            const costWithoutCurrentResource = determineMinimumCost(currentItems, currentResources - 1);
            const costWithCurrentResource = determineMinimumCost(currentItems - 1, currentResources - 1) +
                                            itemCosts[currentItems - 1] * resourceCosts[currentResources - 1];
            calculatedCost = Math.min(costWithoutCurrentResource, costWithCurrentResource);
        }

        memoizationCache.set(cacheKey, calculatedCost);
        return calculatedCost;
    };

    const finalCost = determineMinimumCost(numItems, numResources);
    outputResult(finalCost);
}

let programInput = '';
let inputPointer = 0;

function readInputToken(dataType) {
    if (dataType === 'string') {
        return programInput[inputPointer++];
    } else {
        return +programInput[inputPointer++];
    }
}

function outputResult(value) {
    console.log(value);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
    programInput += chunk;
});

process.stdin.on('end', function() {
    programInput = programInput.split(/\s+/);
    executeProgram();
});

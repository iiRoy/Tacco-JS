function getMinimumValuation(targetComponent, componentRegistry, currentResolutionPath, valuationCache) {
    if (valuationCache.has(targetComponent)) {
        return valuationCache.get(targetComponent);
    }

    if (currentResolutionPath.has(targetComponent)) {
        return Infinity; // Cyclic dependency detected, this path is invalid
    }

    const componentData = componentRegistry.get(targetComponent);
    if (!componentData) {
        // This case should ideally not be reached with valid input as all items are defined.
        // If an item is referenced but not defined, its direct cost would be unknown.
        // Assuming all referenced components exist in the registry.
        return Infinity; // Or throw an error, but problem implies all items are listed.
    }

    const pathForNextLevel = new Set(currentResolutionPath);
    pathForNextLevel.add(targetComponent);

    let bestValue = componentData.directCost;

    if (componentData.constituents && componentData.constituents.length > 0) {
        let recipeSum = 0;
        let recipeIsFeasible = true;

        const constituentValues = componentData.constituents.map(subComponent =>
            getMinimumValuation(subComponent, componentRegistry, pathForNextLevel, valuationCache)
        );

        for (const val of constituentValues) {
            if (val === Infinity) {
                recipeIsFeasible = false;
                break;
            }
            recipeSum += val;
        }

        if (recipeIsFeasible) {
            bestValue = Math.min(bestValue, recipeSum);
        }
    }

    valuationCache.set(targetComponent, bestValue);
    return bestValue;
}

function processManufacturingRequests() {
    let linePointer = 0;
    const collectedResults = [];

    while (linePointer < suppliedDataLines.length) {
        const componentRegistry = new Map(); // Maps component name to { directCost: number, constituents: string[] | undefined }

        const initialDefinitionCount = Number(suppliedDataLines[linePointer++]);
        if (initialDefinitionCount === 0 && linePointer === 1) break; // Check for terminal block

        // Load direct purchase prices
        for (let i = 0; i < initialDefinitionCount; ++i) {
            const parts = suppliedDataLines[linePointer++].split(' ');
            componentRegistry.set(parts[0], { directCost: Number(parts[1]), constituents: undefined });
        }

        const formulaDefinitionCount = Number(suppliedDataLines[linePointer++]);

        // Load crafting formulas
        for (let i = 0; i < formulaDefinitionCount; ++i) {
            const parts = suppliedDataLines[linePointer++].split(' ');
            const componentKey = parts[0];
            const existingEntry = componentRegistry.get(componentKey);

            if (existingEntry) {
                existingEntry.constituents = parts.slice(2);
                componentRegistry.set(componentKey, existingEntry); // Update entry in map
            } else {
                // If a recipe is defined for an item without a direct cost, assign a very high default.
                componentRegistry.set(componentKey, { directCost: Infinity, constituents: parts.slice(2) });
            }
        }

        const requestedComponent = suppliedDataLines[linePointer++];

        const memoizedCalculations = new Map();
        const currentRecursionContext = new Set();

        const finalCalculatedValue = getMinimumValuation(requestedComponent, componentRegistry, currentRecursionContext, memoizedCalculations);
        collectedResults.push(finalCalculatedValue);
    }
    console.log(collectedResults.join('\n'));
}

var
    suppliedDataLines = [];

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
    suppliedDataLines.push(dataChunk);
});
process.stdin.on('end', function() {
    suppliedDataLines = suppliedDataLines.join('').split('\n').map(l => l.trim()).filter(l => l !== '');
    processManufacturingRequests();
});
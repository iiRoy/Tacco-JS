const sourceData = require('fs').readFileSync(0, 'utf8');
const processedLines = sourceData.trim().split('\n');

let currentLinePointer = 0;
const dimensionSpecs = processedLines[currentLinePointer++].split(' ').map(val => parseInt(val, 10));
const totalDemands = dimensionSpecs[0]; // Corresponds to 'n' in original
const totalResources = dimensionSpecs[1]; // Corresponds to 'm' in original

const demandValues = Array.from({ length: totalDemands }, () => parseInt(processedLines[currentLinePointer++], 10)); // Corresponds to 'd' in original
const resourceCosts = Array.from({ length: totalResources }, () => parseInt(processedLines[currentLinePointer++], 10)); // Corresponds to 'c' in original

const memoizationCache = new Map();

const calculateOptimalPrice = (resourceIndex, demandIndex) => {
    // Base case: All demands have been satisfied
    if (demandIndex === totalDemands) {
        return 0;
    }
    // Base case: No more resources, but demands still remain
    if (resourceIndex === totalResources) {
        return Number.MAX_SAFE_INTEGER; // Indicate an impossible state
    }

    // Check memoization cache
    const stateIdentifier = `${resourceIndex},${demandIndex}`;
    if (memoizationCache.has(stateIdentifier)) {
        return memoizationCache.get(stateIdentifier);
    }

    let currentMinimumPrice = Number.MAX_SAFE_INTEGER;

    // Iterate through possible 'skip' lengths for resources (corresponds to 'k' in original code)
    // 'resourceAdvance' represents 'k' from 1 up to (totalResources - resourceIndex)
    for (let resourceAdvance = 1; resourceIndex + resourceAdvance <= totalResources; resourceAdvance++) {
        // Option 1: Do not use the current resource (resourceCosts[resourceIndex]) for the current demand (demandValues[demandIndex]).
        // This means we effectively skip the current resource and 'resourceAdvance - 1' subsequent resources.
        currentMinimumPrice = Math.min(
            currentMinimumPrice,
            calculateOptimalPrice(resourceIndex + resourceAdvance, demandIndex)
        );

        // Option 2: Use the current resource (resourceCosts[resourceIndex]) to fulfill the current demand (demandValues[demandIndex]).
        // This is only possible if there are still demands left to be fulfilled.
        if (demandIndex < totalDemands) {
            currentMinimumPrice = Math.min(
                currentMinimumPrice,
                (resourceCosts[resourceIndex] * demandValues[demandIndex]) +
                calculateOptimalPrice(resourceIndex + resourceAdvance, demandIndex + 1)
            );
        }
    }

    // Store the computed minimum price in the memoization cache before returning
    memoizationCache.set(stateIdentifier, currentMinimumPrice);
    return currentMinimumPrice;
};

// Initiate the recursive calculation from the starting state (0 resources processed, 0 demands fulfilled)
const finalOptimalValue = calculateOptimalPrice(0, 0);

// Output the final result
console.log(finalOptimalValue);
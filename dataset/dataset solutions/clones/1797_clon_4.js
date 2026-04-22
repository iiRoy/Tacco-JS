const acquireSource = require("fs").readFileSync("/dev/stdin", "utf8");
let streamPosition = 0;
const dataElements = acquireSource.split(/ |\n/);

const retrieveInteger = () => parseInt(dataElements[streamPosition++], 10);
const retrieveText = () => dataElements[streamPosition++];
const retrieveLargeInteger = () => BigInt(dataElements[streamPosition++]);

const retrieveSequence = (count, transformFunc = Number) => {
    const segment = dataElements.slice(streamPosition, streamPosition + count);
    streamPosition += count;
    return transformFunc ? segment.map(transformFunc) : segment;
};

const retrieveMatrix = (rows, columns, transformFunc = Number) => {
    const matrixResult = [];
    for (let i = 0; i < rows; i++) {
        matrixResult.push(retrieveSequence(columns, transformFunc));
    }
    return matrixResult;
};

class ItemDescriptor {
    constructor(benefit, cost) {
        this.benefit = benefit;
        this.cost = cost;
    }
}

const MAX_COST_CAP = 100000; // Corresponds to 1e5 in original

const filterOptimalChoices = (candidateCombinations) => {
    candidateCombinations.sort((a, b) => a.cost - b.cost); // Sort by cost
    const refinedChoices = [];
    let currentBestBenefit = -1;

    for (const choice of candidateCombinations) {
        if (choice.cost > MAX_COST_CAP) continue; // Exclude choices exceeding max cost

        // Only include if it offers a strictly better benefit for its cost or less
        if (choice.benefit > currentBestBenefit) {
            refinedChoices.push(choice);
            currentBestBenefit = choice.benefit;
        }
    }
    return refinedChoices;
};

const optimalSetMemorization = new Map();
const PRECOMPUTE_BLOCK_LEVEL = 11; // Corresponds to 'aa' in original

const buildOptimalSetsRecursively = (idx, availableItems) => {
    if (optimalSetMemorization.has(idx)) {
        return optimalSetMemorization.get(idx);
    }

    if (idx === 0) {
        const baseSet = [availableItems[0]];
        const result = filterOptimalChoices(baseSet);
        optimalSetMemorization.set(idx, result);
        return result;
    }

    const parentIdx = Math.floor((idx - 1) / 2);
    const parentSets = buildOptimalSetsRecursively(parentIdx, availableItems); // Recursive call
    const currentItem = availableItems[idx];

    let combinedCandidates = parentSets.slice(); // Start with parent's combinations
    combinedCandidates.push(currentItem); // Add current item alone

    for (const pSet of parentSets) {
        if (pSet.cost + currentItem.cost <= MAX_COST_CAP) {
            combinedCandidates.push(new ItemDescriptor(pSet.benefit + currentItem.benefit, pSet.cost + currentItem.cost));
        }
    }

    const result = filterOptimalChoices(combinedCandidates);
    optimalSetMemorization.set(idx, result);
    return result;
};

const executeSolution = () => {
    const totalItems = retrieveInteger();
    const itemCatalog = retrieveMatrix(totalItems, 2).map(pair => new ItemDescriptor(pair[0], pair[1]));

    const precomputationLimit = Math.min(totalItems, 1 << PRECOMPUTE_BLOCK_LEVEL);

    for (let i = 0; i < precomputationLimit; i++) {
        buildOptimalSetsRecursively(i, itemCatalog);
    }

    const totalQueries = retrieveInteger();
    const collectedOutputs = new Array(totalQueries);

    for (let queryIndex = 0; queryIndex < totalQueries; queryIndex++) {
        let queryTargetIndex = retrieveInteger(); // 1-indexed in problem statement
        const queryCostLimit = retrieveInteger();
        let currentMaxBenefit = 0;

        queryTargetIndex--; // Convert to 0-indexed

        const targetDepth = Math.floor(Math.log2(queryTargetIndex + 1));

        if (targetDepth < PRECOMPUTE_BLOCK_LEVEL) {
            // Case 1: Target index is within the pre-computed range
            const relevantCombinations = optimalSetMemorization.get(queryTargetIndex);
            for (const combo of relevantCombinations) {
                if (combo.cost <= queryCostLimit) {
                    currentMaxBenefit = Math.max(currentMaxBenefit, combo.benefit);
                }
            }
            collectedOutputs[queryIndex] = currentMaxBenefit;
        } else {
            // Case 2: Target index is beyond the pre-computed range (dynamic calculation needed)
            let pathCombinations = [itemCatalog[queryTargetIndex]]; // Start with the item at the target index itself
            let currentPathNode = Math.floor((queryTargetIndex - 1) / 2); // Move to its parent

            // Traverse up the "tree" combining items until reaching the pre-computed boundary
            for (let k = targetDepth - 1; k >= PRECOMPUTE_BLOCK_LEVEL; k--) {
                const itemOnPath = itemCatalog[currentPathNode];
                const extendedCombinations = pathCombinations.slice(); // Copy before extending
                extendedCombinations.push(itemOnPath); // Add the item itself as a combination

                for (const existingPathCombo of pathCombinations) {
                    if (existingPathCombo.cost + itemOnPath.cost <= MAX_COST_CAP) {
                        extendedCombinations.push(new ItemDescriptor(existingPathCombo.benefit + itemOnPath.benefit, existingPathCombo.cost + itemOnPath.cost));
                    }
                }
                pathCombinations = extendedCombinations;
                currentPathNode = Math.floor((currentPathNode - 1) / 2); // Move up to the next parent
            }
            
            // Refine dynamically computed combinations
            pathCombinations = filterOptimalChoices(pathCombinations);

            // currentPathNode is now within the pre-computed range
            const cachedCombinations = optimalSetMemorization.get(currentPathNode);
            
            // Merge dynamic and cached combinations using a two-pointer approach
            let cachedPtr = cachedCombinations.length - 1;
            for (const dynamicCombo of pathCombinations) {
                if (dynamicCombo.cost > queryCostLimit) continue; // Skip if dynamic part alone exceeds capacity
                
                // Move cachedPtr to find the largest cost that fits with current dynamicCombo
                while (cachedPtr >= 0 && (cachedCombinations[cachedPtr].cost + dynamicCombo.cost > queryCostLimit)) {
                    cachedPtr--;
                }

                if (cachedPtr < 0) break; // No more valid combinations from cached part

                currentMaxBenefit = Math.max(currentMaxBenefit, dynamicCombo.benefit + cachedCombinations[cachedPtr].benefit);
            }
            collectedOutputs[queryIndex] = currentMaxBenefit;
        }
    }
    return collectedOutputs.join("\n");
};

const finalResult = executeSolution();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}
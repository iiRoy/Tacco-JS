"use strict";
const fileSystem = require("fs");
const rawInput = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenStream = rawInput.split(/\s+/).filter(Boolean);
let tokenIndex = 0;

const retrieveNumeric = () => Number(tokenStream[tokenIndex++]);
const retrieveString = () => tokenStream[tokenIndex++];
const retrieveBigInt = () => BigInt(tokenStream[tokenIndex++]);

const retrieveNumericSequence = (count) => {
    const sequence = [];
    for (let k = 0; k < count; k++) {
        sequence.push(retrieveNumeric());
    }
    return sequence;
};

const retrieveMatrix = (rows, cols) => {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        matrix.push(retrieveNumericSequence(cols));
    }
    return matrix;
};

const createMultiDimArray = (initialValue, ...dimensions) => {
    const buildArray = (dims, currentDim = 0) => {
        if (currentDim === dims.length - 1) {
            return Array(dims[currentDim]).fill(initialValue);
        }
        return Array(dims[currentDim]).fill(null).map(() => buildArray(dims, currentDim + 1));
    };
    return buildArray(dimensions);
};

const MAX_COMBINATION_WEIGHT = 100000;

const optimizeCombinations = (inputCombinations) => {
    if (inputCombinations.length === 0) {
        return [];
    }

    inputCombinations.sort((a, b) => {
        if (a.wt !== b.wt) return a.wt - b.wt;
        return b.val - a.val;
    });

    const optimalSet = [];
    optimalSet.push(inputCombinations[0]);

    for (let k = 1; k < inputCombinations.length; k++) {
        if (inputCombinations[k].val > optimalSet[optimalSet.length - 1].val) {
            optimalSet.push(inputCombinations[k]);
        }
    }
    return optimalSet;
};

const mergeAndFilter = (existingSet, newItem) => {
    let combinedSet = [...existingSet];
    combinedSet.push(newItem);

    for (const currentCombo of existingSet) {
        if (currentCombo.wt + newItem.wt <= MAX_COMBINATION_WEIGHT) {
            combinedSet.push({ val: currentCombo.val + newItem.val, wt: currentCombo.wt + newItem.wt });
        }
    }
    return optimizeCombinations(combinedSet);
};

function processQueries() {
    const itemCount = retrieveNumeric();
    const rawItemPairs = retrieveMatrix(itemCount, 2);
    const itemData = rawItemPairs.map(pair => ({ val: pair[0], wt: pair[1] }));

    const depthThreshold = 11;
    const precomputeLimit = Math.min(itemCount, 1 << depthThreshold);

    const pathCombinations = Array(precomputeLimit);

    pathCombinations[0] = [itemData[0]];
    for (let i = 1; i < precomputeLimit; i++) {
        const parentIndex = (i - 1) >> 1;
        pathCombinations[i] = mergeAndFilter(pathCombinations[parentIndex], itemData[i]);
    }

    const queryCount = retrieveNumeric();
    const queryResults = Array(queryCount);

    for (let qIdx = 0; qIdx < queryCount; qIdx++) {
        let targetIndexOneBased = retrieveNumeric();
        const maxWeight = retrieveNumeric();
        let bestValue = 0;

        const targetDepth = 31 - Math.clz32(targetIndexOneBased);
        let targetIndexZeroBased = targetIndexOneBased - 1;

        if (targetDepth < depthThreshold) {
            const relevantCombinations = pathCombinations[targetIndexZeroBased];
            for (const combo of relevantCombinations) {
                if (combo.wt <= maxWeight && combo.val > bestValue) {
                    bestValue = combo.val;
                }
            }
            queryResults[qIdx] = bestValue;
        } else {
            const dynamicPathItems = [];
            let currentPathNodeIndex = targetIndexZeroBased;
            let finalPrecomputedSegmentIndex = -1;

            while (true) {
                dynamicPathItems.push(itemData[currentPathNodeIndex]);
                const parentIndex = (currentPathNodeIndex - 1) >> 1;
                const parentDepth = (parentIndex >= 0) ? (31 - Math.clz32(parentIndex + 1)) : -1;

                if (parentDepth < depthThreshold) {
                    finalPrecomputedSegmentIndex = parentIndex;
                    break;
                }
                currentPathNodeIndex = parentIndex;
            }

            let currentDynamicCombos = [dynamicPathItems[0]];
            for (let i = 1; i < dynamicPathItems.length; i++) {
                currentDynamicCombos = mergeAndFilter(currentDynamicCombos, dynamicPathItems[i]);
            }

            const precomputedSegment = pathCombinations[finalPrecomputedSegmentIndex];

            let precomputedPtr = precomputedSegment.length - 1;
            for (const dynamicCombo of currentDynamicCombos) {
                if (dynamicCombo.wt > maxWeight) continue;

                while (precomputedPtr >= 0 && precomputedSegment[precomputedPtr].wt + dynamicCombo.wt > maxWeight) {
                    precomputedPtr--;
                }

                if (precomputedPtr < 0) break;

                bestValue = Math.max(bestValue, precomputedSegment[precomputedPtr].val + dynamicCombo.val);
            }
            queryResults[qIdx] = bestValue;
        }
    }
    return queryResults.join("\n");
}

const finalOutput = processQueries();
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}

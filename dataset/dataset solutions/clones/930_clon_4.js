const fileSystemModule = require('fs');

const calculationParameters = { dataOrigin: '/dev/stdin', lineDelimiter: '\n' };

const rawDataBuffer = fileSystemModule.readFileSync(calculationParameters.dataOrigin, 'utf8');
const processedTextLines = rawDataBuffer.trim().split(calculationParameters.lineDelimiter);

const totalMatrixCount = Number(processedTextLines[0].trim());
const matrixConfiguration = processedTextLines.slice(1).map(entryLine =>
    entryLine.split(/\s+/).filter(Boolean).map(segment => Number(segment))
);

// Stores computed minimum costs for subproblems (firstIdx, lastIdx)
// Map<number, Map<number, number>>
const costMemo = new Map();

const determineMinimumMultiplications = (startIdx, endIdx) => {
    // Base case: A single matrix chain has zero multiplication cost.
    if (startIdx === endIdx) {
        return 0;
    }

    // Check if the result is already memoized
    const cachedCost = costMemo.get(startIdx)?.get(endIdx);
    if (cachedCost !== undefined) {
        return cachedCost;
    }

    let leastCost = Number.MAX_VALUE; // Initialize with a very large value

    // Iterate through all possible split points 's'
    // The chain is (M_startIdx ... M_endIdx)
    // Split into (M_startIdx ... M_s) and (M_(s+1) ... M_endIdx)
    for (let splitPoint = startIdx; splitPoint < endIdx; splitPoint++) {
        // Cost of multiplying the left sub-chain (M_startIdx ... M_splitPoint)
        const leftSubchainCost = determineMinimumMultiplications(startIdx, splitPoint);

        // Cost of multiplying the right sub-chain (M_(splitPoint+1) ... M_endIdx)
        const rightSubchainCost = determineMinimumMultiplications(splitPoint + 1, endIdx);

        // Cost of multiplying the results of the two sub-chains
        // The first matrix M_startIdx has dimensions p_{startIdx-1} x p_{startIdx}
        // The split matrix M_splitPoint has dimensions p_{splitPoint-1} x p_{splitPoint}
        // The last matrix M_endIdx has dimensions p_{endIdx-1} x p_{endIdx}
        // The cost of multiplying the two resulting matrices is p_{startIdx-1} * p_{splitPoint} * p_{endIdx}
        // In our 0-indexed `matrixConfiguration` array:
        // p_{startIdx-1} is `matrixConfiguration[startIdx-1][0]`
        // p_{splitPoint} is `matrixConfiguration[splitPoint-1][1]`
        // p_{endIdx} is `matrixConfiguration[endIdx-1][1]`
        const interMultiplicationCost =
            matrixConfiguration[startIdx - 1][0] *
            matrixConfiguration[splitPoint - 1][1] *
            matrixConfiguration[endIdx - 1][1];

        const combinedCost = leftSubchainCost + rightSubchainCost + interMultiplicationCost;
        leastCost = Math.min(leastCost, combinedCost);
    }

    // Store the computed result in the memoization table
    if (!costMemo.has(startIdx)) {
        costMemo.set(startIdx, new Map());
    }
    costMemo.get(startIdx).set(endIdx, leastCost);

    return leastCost;
};

// Initiate the calculation for the entire chain of matrices (from 1 to totalMatrixCount)
console.log(determineMinimumMultiplications(1, totalMatrixCount));
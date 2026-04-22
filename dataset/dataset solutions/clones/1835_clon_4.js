const acquireSourceData = () => require("node:fs").readFileSync("/dev/stdin", "utf8");

const parseDataStream = (streamContent) => {
    const numericTokens = streamContent.trim().split(/\s+/).map(Number);
    const treeDepth = numericTokens.shift();
    const branchRequirements = numericTokens;
    return {
        levels: treeDepth,
        needs: branchRequirements
    };
};

const establishPrimarySequence = (maxLevel, demandsArray) => {
    const rootValue = 1;

    const generatePath = (currentLevel, previousValue, accumulatedPath) => {
        if (previousValue <= 0 && currentLevel > 0) {
            return null; // Indicate an impossible path
        }
        if (currentLevel > maxLevel) {
            return accumulatedPath; // Path successfully generated
        }

        const currentLevelDemand = demandsArray[currentLevel - 1];
        const nextLevelValue = (previousValue - currentLevelDemand) * 2;

        return generatePath(currentLevel + 1, nextLevelValue, [...accumulatedPath, nextLevelValue]);
    };

    const preliminaryPath = generatePath(0, rootValue, [rootValue]);

    if (!preliminaryPath) {
        return { feasible: false, path: [], total: 0 };
    }

    const pathSum = preliminaryPath.reduce((sum, val) => sum + val, 0);

    return { feasible: true, path: preliminaryPath, total: pathSum };
};

const refinePathRecursively = (
    currentDepthIndex,
    maximumDepthIndex,
    initialPathValues,
    demandParameters,
    incomingRefinedValue,
    currentCumulativeSum
) => {
    // Base case: All levels from maxDepthIndex down to 1 have been processed.
    // The result for level 0 (root) is stored in incomingRefinedValue.
    if (currentDepthIndex < 1) {
        return { refinedRootValue: incomingRefinedValue, finalAdjustedSum: currentCumulativeSum };
    }

    const currentPrimaryValue = initialPathValues[currentDepthIndex];
    const priorLevelDemand = demandParameters[currentDepthIndex - 1];

    let nextRefinedValue; // This will be the refined value for currentDepthIndex - 1
    let updatedCumulativeSum = currentCumulativeSum;

    // Apply the adjustment logic based on the comparison of incomingRefinedValue (M[d]) and currentPrimaryValue (P[d])
    if (incomingRefinedValue >= currentPrimaryValue) {
        // If M[d] >= P[d], then M[d-1] = P[d] + A[d-1]
        nextRefinedValue = currentPrimaryValue + priorLevelDemand;
    } else {
        // If M[d] < P[d], then adjust the sum and M[d-1] = M[d] + A[d-1]
        updatedCumulativeSum -= (currentPrimaryValue - incomingRefinedValue);
        nextRefinedValue = incomingRefinedValue + priorLevelDemand;
    }

    // Recurse for the next shallower level
    return refinePathRecursively(
        currentDepthIndex - 1,
        maximumDepthIndex,
        initialPathValues,
        demandParameters,
        nextRefinedValue,
        updatedCumulativeSum
    );
};

const orchestrateComputation = () => {
    const dataInput = acquireSourceData();
    const processedInput = parseDataStream(dataInput);
    const maxTreeLevel = processedInput.levels;
    const levelDemands = processedInput.needs;

    const initialResult = establishPrimarySequence(maxTreeLevel, levelDemands);

    if (!initialResult.feasible) {
        return -1;
    }

    const sequenceValues = initialResult.path;
    let finalSum = initialResult.total;

    // Check the final level condition (P[N] < A[N])
    const finalSequenceValue = sequenceValues[maxTreeLevel];
    const finalLevelDemand = levelDemands[maxTreeLevel];

    if (finalSequenceValue < finalLevelDemand) {
        return -1;
    }

    // If P[N] == A[N], no further adjustment is needed.
    if (finalSequenceValue === finalLevelDemand) {
        return finalSum;
    }

    // If P[N] > A[N], begin the backward adjustment process.
    // First, adjust the sum for the deepest level (N).
    finalSum -= (finalSequenceValue - finalLevelDemand);

    // Call the recursive function to refine the path from level N down to 1.
    // The initial incomingRefinedValue for level N is A[N].
    const adjustmentOutcome = refinePathRecursively(
        maxTreeLevel, // Start from level N
        maxTreeLevel,
        sequenceValues,
        levelDemands,
        finalLevelDemand, // M[N] = A[N]
        finalSum // Sum after initial adjustment for level N
    );

    // After the recursive loop, adjustmentOutcome contains M[0] and the sum after adjustments for levels N down to 1.
    
    // Perform the final check and adjustment for the root (level 0).
    if (adjustmentOutcome.refinedRootValue < sequenceValues[0]) {
        adjustmentOutcome.finalAdjustedSum -= (sequenceValues[0] - adjustmentOutcome.refinedRootValue);
    }

    return adjustmentOutcome.finalAdjustedSum;
};

// Execute the main process and output the result.
console.log(orchestrateComputation());
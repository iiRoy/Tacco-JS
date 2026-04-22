const retrieveInputSource = require('fs').readFileSync;

const processRawInput = (sourceIdentifier) => {
    const fileContents = retrieveInputSource(sourceIdentifier, 'utf8');
    const segmentedLines = fileContents.trim().split('\n');
    return segmentedLines;
};

const decodeConfiguration = (inputSegments) => {
    const primarySettings = inputSegments[0].split(' ');
    const targetValue = Number(primarySettings[0]);
    const coinTypeCount = Number(primarySettings[1]);
    const coinDenominationArray = inputSegments[1].trim().split(' ').map(Number);
    return { targetValue, coinTypeCount, coinDenominationArray };
};

const computeOptimalSolution = (configurationData) => {
    const ultimateTarget = configurationData.targetValue;
    const availableCoinTypes = configurationData.coinDenominationArray;
    const impossibleResult = Number.MAX_SAFE_INTEGER;

    // Initialize an array where each index 'k' stores the minimum number of coins
    // needed to achieve sum 'k'. Filled with 'impossibleResult' initially.
    const minimumUnitsRequired = new Array(ultimateTarget + 1).fill(impossibleResult);
    minimumUnitsRequired[0] = 0; // Base case: 0 coins for a sum of 0

    // This approach iterates through each coin type first, then updates
    // all possible sums that can be formed using that coin.
    // This is a "push" dynamic programming strategy, different from the
    // original's "pull" strategy (iterating sums, then checking previous states).
    for (const currentCoinValue of availableCoinTypes) {
        for (let currentSumPosition = currentCoinValue; currentSumPosition <= ultimateTarget; currentSumPosition++) {
            const previousSumPosition = currentSumPosition - currentCoinValue;
            // Only consider if the previous sum was achievable
            if (minimumUnitsRequired[previousSumPosition] !== impossibleResult) {
                const candidateUnitCount = minimumUnitsRequired[previousSumPosition] + 1;
                // Update if this path yields a more optimal (fewer units) solution
                if (candidateUnitCount < minimumUnitsRequired[currentSumPosition]) {
                    minimumUnitsRequired[currentSumPosition] = candidateUnitCount;
                }
            }
        }
    }

    const finalOutcome = minimumUnitsRequired[ultimateTarget];
    // If the target sum is unreachable, return -1 (or handle as per problem spec).
    // The original code would output `undefined` if `dp.get(n)` was not set.
    // Here, `impossibleResult` indicates unreachable.
    return finalOutcome === impossibleResult ? -1 : finalOutcome;
};

const runApplication = () => {
    const structuredData = processRawInput('/dev/stdin');
    const problemConfiguration = decodeConfiguration(structuredData);
    const finalAnswer = computeOptimalSolution(problemConfiguration);
    console.log(finalAnswer);
};

runApplication();
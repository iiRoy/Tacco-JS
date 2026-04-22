// This primary function orchestrates the processing of all challenge data provided as a single input string.
function processChallengeData(rawInputString) {
    // Break down the monolithic input string into an array of individual lines.
    const inputLines = rawInputString.split('\n');

    // The very first line of the input specifies the total number of distinct test cases to handle.
    const numberOfCases = Number(inputLines[0]);

    // An array to meticulously store the structured configuration for each challenge scenario.
    const challengeConfigurations = [];

    // A temporary array to collect the computed outcome (0 for success, 1 for failure) for each case.
    const outcomeBuffer = [];

    /**
     * @description A utility function to compute all possible XOR sums obtainable from a current set
     *              of sums by applying a new XOR operation value. This implicitly generates new sums
     *              by either including or excluding the operation value.
     * @param {Set<number>} currentSums - A Set containing all currently achievable XOR sums.
     * @param {number} operationValue - The integer value to XOR with current sums.
     * @returns {Set<number>} A new Set containing all unique XOR sums after applying the operation.
     */
    const generateNextXORSums = (currentSums, operationValue) => {
        const nextPossibleSums = new Set();
        for (const existingSum of currentSums) {
            nextPossibleSums.add(existingSum); // Option 1: Do not apply the current operation
            nextPossibleSums.add(existingSum ^ operationValue); // Option 2: Apply the current operation
        }
        return nextPossibleSums;
    };

    // Begin the parsing phase: iterate through the input lines to extract and structure
    // the parameters for each challenge scenario.
    for (let caseIndex = 0; caseIndex < numberOfCases; caseIndex++) {
        // Each challenge's data spans three consecutive lines in the input.
        const numChallengesLine = 3 * caseIndex + 1;
        const xorValuesLine = 3 * caseIndex + 2;
        const operationSequenceLine = 3 * caseIndex + 3;

        const totalChallenges = Number(inputLines[numChallengesLine]);
        const xorOperationValues = inputLines[xorValuesLine].split(' ').map(str => Number(str));
        const operationPatternString = inputLines[operationSequenceLine];

        // Calculate the number of '0's at the end of the operation pattern string.
        // These trailing '0's often signify a distinct phase of operations.
        let countTrailingZeroOps = 0;
        let scanPointer = operationPatternString.length - 1;
        while (scanPointer >= 0 && operationPatternString[scanPointer] === '0') {
            countTrailingZeroOps++;
            scanPointer--;
        }

        // Store the parsed and processed configuration for the current challenge.
        challengeConfigurations.push({
            totalChallenges: totalChallenges,
            xorOperationValues: xorOperationValues,
            operationPatternString: operationPatternString, // Storing for completeness, though not directly used in the current logic after zero count.
            countTrailingZeroOps: countTrailingZeroOps
        });
    }

    // Proceed to the execution phase: process each configured challenge scenario
    // to determine its final outcome.
    for (let caseIndex = 0; caseIndex < numberOfCases; caseIndex++) {
        const currentChallengeConfig = challengeConfigurations[caseIndex];
        let caseOutcomeCode = 0; // Initialize outcome to success (0)

        // --- Phase 1: Determine achievable XOR sums using non-trailing operations ---
        // This involves the first (totalChallenges - countTrailingZeroOps) operations.
        let currentAchievableXORSums = new Set([0]); // Start with an initial sum of 0.

        const nonTrailingOpCount = currentChallengeConfig.totalChallenges - currentChallengeConfig.countTrailingZeroOps;
        for (let opIndex = 0; opIndex < nonTrailingOpCount; opIndex++) {
            const currentXORValue = currentChallengeConfig.xorOperationValues[opIndex];
            currentAchievableXORSums = generateNextXORSums(currentAchievableXORSums, currentXORValue);
        }

        // --- Phase 2: Evaluate if zero is reachable using the trailing zero operations ---
        // This phase checks if any of the sums from Phase 1 can lead to 0 by applying
        // the remaining 'countTrailingZeroOps' operations.
        let isZeroGloballyReachable = false;
        const trailingOpsStartIndex = nonTrailingOpCount;

        // Special handling if there are no trailing '0' operations.
        if (currentChallengeConfig.countTrailingZeroOps === 0) {
            // If no trailing operations, '0' must already be present in the sums from Phase 1.
            if (currentAchievableXORSums.has(0)) {
                isZeroGloballyReachable = true;
            }
        } else {
            // If there are trailing '0' operations, iterate through each sum from Phase 1
            // and try to reach '0' from it using the trailing operations.
            for (const sumFromPhase1 of currentAchievableXORSums) {
                let currentPathSums = new Set([sumFromPhase1]);

                // Apply the trailing '0' operations.
                for (let opIndex = trailingOpsStartIndex; opIndex < currentChallengeConfig.totalChallenges; opIndex++) {
                    const currentXORValue = currentChallengeConfig.xorOperationValues[opIndex];
                    currentPathSums = generateNextXORSums(currentPathSums, currentXORValue);

                    // If '0' becomes reachable in this sub-path, we've found a solution.
                    if (currentPathSums.has(0)) {
                        isZeroGloballyReachable = true;
                        break; // Exit inner loop, '0' is reachable for this sum.
                    }
                }
                if (isZeroGloballyReachable) {
                    break; // Exit outer loop, '0' is globally reachable for this test case.
                }
            }
        }

        // If after all checks, '0' was not found to be reachable, the case outcome is a failure (1).
        if (!isZeroGloballyReachable) {
            caseOutcomeCode = 1;
        }

        outcomeBuffer.push(String(caseOutcomeCode));
    }

    // Output the final results, with each case's outcome on a new line.
    console.log(outcomeBuffer.join('\n'));
}

// The following lines are boilerplate for standard input/output handling in competitive programming
// environments. They should not be altered.
// This part reads the entire input from the standard input stream and then invokes
// our main processing function with that data.
processChallengeData(require("fs").readFileSync("/dev/stdin", "utf8"));
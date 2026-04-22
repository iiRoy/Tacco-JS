String.prototype.padWithZeroes = function(desiredLength, fillChar = '0') {
    const currentString = this.toString();

    // The original implementation throws an error if the string is already longer
    // than the target padded length (assuming fillChar.length is 1, as implied by usage).
    // This guard clause replicates that specific error behavior.
    if (currentString.length > desiredLength) {
        throw new Error(`${currentString}.length = ${currentString.length} > ${desiredLength}`);
    }

    // Use standard String.prototype.padStart for padding, which is functionally
    // equivalent to the original logic for its intended use case (binary string padding).
    // Ensure `fillChar` is treated as a single character.
    return currentString.padStart(desiredLength, String(fillChar).charAt(0));
};

const calculateMinimumSolvedProblems = (problemInputData) => {
    // This function aims to determine the minimum total number of problems
    // that must be solved to achieve a specified target score.
    // It considers problem difficulties, their counts per level, and
    // bonus points for completing all problems at a certain difficulty level.

    // 1. Input Parsing and Initial Data Setup
    // ---------------------------------------------------------------------

    // Split the entire input string into an array of individual lines for easier processing.
    const inputLines = problemInputData.split('\n');

    // Extract the first line, which contains the total number of distinct
    // problem difficulty levels (N) and the overall target score (G).
    const [numProblemLevels, rawTargetScore] = inputLines.shift().split(' ').map(Number);

    // Convert the raw target score, which is typically given in units of 100 points,
    // into its actual point value for direct comparison.
    const targetScoreInPoints = rawTargetScore / 100;

    // Initialize arrays to store the specific details for each difficulty level.
    // `problemsAvailableAtLevel` stores the count of problems for each difficulty.
    // `levelCompletionBonus` stores the bonus points awarded for solving
    // all problems at a particular difficulty level.
    const problemsAvailableAtLevel = [];
    const levelCompletionBonus = [];

    // Basic validation for the number of problem levels. While not in original,
    // it's a useful Type III addition for robustness.
    if (numProblemLevels < 1 || numProblemLevels > 15) { // Assuming typical contest constraints (2^15 is manageable)
        console.warn(`Warning: Number of problem levels (${numProblemLevels}) is outside typical range (1-15).`);
        // Depending on context, one might throw an error here.
    }

    // Iterate through the subsequent lines of input to populate the problem details.
    // Each line describes a single difficulty level: `[count_of_problems, bonus_points]`.
    for (let currentLevelIndex = 0; currentLevelIndex < numProblemLevels; currentLevelIndex++) {
        const [countPerLevel, bonusPointsForLevel] = inputLines.shift().split(' ').map(Number);
        problemsAvailableAtLevel.push(countPerLevel);
        levelCompletionBonus.push(bonusPointsForLevel / 100); // Convert bonus to actual points.
    }

    // 2. Algorithm Core: Exhaustive Search Using Bitmasks
    // ---------------------------------------------------------------------

    // The total number of ways to choose which difficulty levels are *fully* completed
    // is 2 raised to the power of `numProblemLevels`. A bitmask (from 0 to 2^N - 1)
    // represents each such combination.
    const totalPossibleCombinations = 1 << numProblemLevels; // More efficient than Math.pow(2, numProblemLevels)

    // This array will store the total problem counts for all valid scenarios
    // where the target score is met or exceeded. We will later find the minimum
    // value in this array.
    const successfulSolvedProblemCounts = [];

    // Iterate through every possible combination of fully completed difficulty levels.
    // `combinationBitmask` serves as a binary flag for each level:
    // if the k-th bit is 1, all problems at difficulty level k are considered solved.
    for (let combinationBitmask = 0; combinationBitmask < totalPossibleCombinations; ++combinationBitmask) {
        let currentAccumulatedScore = 0;
        let currentProblemsCount = 0;

        // Convert the current `combinationBitmask` into a binary string, padded with
        // leading zeros to ensure its length matches `numProblemLevels`. This makes
        // it easy to check which levels are "selected".
        const fullySolvedLevelsIndicator = combinationBitmask.toString(2).padWithZeroes(numProblemLevels);

        // First Pass: Calculate score and problem count for all levels designated
        // as *fully completed* by the current `fullySolvedLevelsIndicator`.
        for (let levelIdx = 0; levelIdx < numProblemLevels; ++levelIdx) {
            // If the `levelIdx`-th bit is '1', this difficulty level is fully solved.
            if (fullySolvedLevelsIndicator[levelIdx] === '1') {
                currentProblemsCount += problemsAvailableAtLevel[levelIdx];
                // Points for problems at this difficulty are `(levelIdx + 1)` each.
                currentAccumulatedScore += problemsAvailableAtLevel[levelIdx] * (levelIdx + 1);
                // Add the completion bonus for this fully solved level.
                currentAccumulatedScore += levelCompletionBonus[levelIdx];
            }
        }

        // Check if the target score has already been reached with just the fully solved levels.
        if (currentAccumulatedScore >= targetScoreInPoints) {
            successfulSolvedProblemCounts.push(currentProblemsCount);
            // If target is met, no need to solve additional problems from other levels for this combination.
            continue;
        }

        // If the target score is not yet met, we need to solve additional problems.
        // These additional problems must come from levels that were *not* fully completed
        // in the first pass (i.e., where `fullySolvedLevelsIndicator[levelIdx]` is '0').
        // We calculate the remaining score required.
        const scoreStillNeeded = targetScoreInPoints - currentAccumulatedScore;

        // Second Pass: Attempt to partially solve problems from *uncompleted* levels
        // to cover the `scoreStillNeeded`. The original logic iterates from lowest
        // difficulty to highest for this partial completion.
        // It considers each uncompleted level as a *potential sole source* for the remaining score.
        for (let levelIdx = 0; levelIdx < numProblemLevels; ++levelIdx) {
            // Skip levels that were already fully solved in the current combination.
            if (fullySolvedLevelsIndicator[levelIdx] === '1') {
                continue;
            }

            const pointsPerSingleProblemForThisLevel = levelIdx + 1; // Difficulty value
            const totalProblemsAtThisLevel = problemsAvailableAtLevel[levelIdx];

            // Calculate how many problems from this specific level are required to meet the `scoreStillNeeded`.
            // Using Math.floor because we only count whole problems.
            const problemsToTakePartially = Math.floor(scoreStillNeeded / pointsPerSingleProblemForThisLevel);

            // If `problemsToTakePartially` is equal to or greater than `totalProblemsAtThisLevel`,
            // it implies we would solve all problems at this level, which would grant a bonus.
            // This scenario should have been covered by the initial `combinationBitmask` selection.
            // This loop is for *partial* completion without the bonus, so we skip if it implies full completion.
            if (problemsToTakePartially >= totalProblemsAtThisLevel) {
                continue;
            }

            // If we reach here, it means we can partially solve problems from this level
            // to contribute towards the `scoreStillNeeded` without incurring the bonus.
            // Add this scenario's total problems (initial fully solved + these partial ones)
            // to our list of successful counts.
            successfulSolvedProblemCounts.push(currentProblemsCount + problemsToTakePartially);
        }
    }

    // 3. Final Result Determination
    // ---------------------------------------------------------------------

    // After evaluating all combinations and potential partial solutions,
    // find the absolute minimum number of problems solved among all successful scenarios.
    // If no solution was found (e.g., target score is unreachable), `Math.min` on an empty
    // array would return `Infinity`. This behavior is maintained.
    if (successfulSolvedProblemCounts.length === 0) {
        return Infinity; // Or throw an error, depending on problem specification
    }

    return Math.min(...successfulSolvedProblemCounts);
};

// This section handles the execution environment for the problem.
// It detects if the script is running in a Node.js environment (e.g., via `require`).
// If so, it reads input from stdin, processes it, and prints the result.
// Otherwise, it provides a hardcoded sample input for testing purposes.

(function() {
    // Check for Node.js environment by looking for `require` and other Node-specific globals.
    if (typeof require !== 'undefined' && typeof module !== 'undefined' && typeof process !== 'undefined') {
        const fileSystemModule = require('fs');
        // Read the entire input from standard input, typically used in competitive programming.
        const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
        // Process the input and get the final numerical result.
        const computedResult = calculateMinimumSolvedProblems(rawInputData);
        // Output the result to standard output.
        console.log(computedResult);
    } else {
        // This block provides a hardcoded example input for browser-based testing
        // or environments where the `fs` module is not available.
        // This is a simplified version of the original's browser HTML generation.
        const sampleProblemInput = `2 700
3 500
5 800`;
        try {
            const sampleExecutionResult = calculateMinimumSolvedProblems(sampleProblemInput);
            console.log("Sample Test Result:", sampleExecutionResult);
            // In a browser, you might display this result in a more user-friendly way
            // (e.g., updating a DOM element or an alert).
        } catch (executionError) {
            console.error("An error occurred during sample input processing:", executionError.message);
            // Optionally log the full stack trace for debugging.
            if (executionError.stack) {
                console.error(executionError.stack);
            }
        }
    }
})();
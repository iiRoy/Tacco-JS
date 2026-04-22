function solveCompetition(rawData) {
    // Parse the initial competition parameters from the first line of input.
    // The first value represents the total count of distinct problem sets available.
    // The second value is the target score that needs to be achieved.
    const competitionParameters = rawData.split('\n')[0].split(' ');
    const totalProblemSetCount = parseInt(competitionParameters[0], 10);
    const requiredScoreThreshold = parseInt(competitionParameters[1], 10);

    // Initialize data structures to hold details for each problem set.
    // `problemsPerCategory` stores the number of problems within each category.
    // `categoryBonusPoints` holds the bonus awarded for completing all problems in a category.
    // `fullCategoryScores` stores the total points earned by completing an entire category, including bonus.
    const problemsPerCategory = new Array(totalProblemSetCount);
    const categoryBonusPoints = new Array(totalProblemSetCount);
    const fullCategoryScores = new Array(totalProblemSetCount);

    // Initialize `minimumProblemsToSolve` to a very large number.
    // This ensures that any valid solution found will be lower and correctly recorded.
    let minimumProblemsToSolve = Number.MAX_SAFE_INTEGER; // Using MAX_SAFE_INTEGER for robustness.

    // Populate the arrays with problem set data from the input.
    // Each line from the second onwards describes one problem category.
    for (let categoryIndex = 0; categoryIndex < totalProblemSetCount; categoryIndex++) {
        const categoryData = rawData.split('\n')[categoryIndex + 1].split(' ');
        problemsPerCategory[categoryIndex] = parseInt(categoryData[0], 10);
        categoryBonusPoints[categoryIndex] = parseInt(categoryData[1], 10);

        // Calculate the total score for fully completing this category.
        // Problems in category `categoryIndex` (0-indexed) are worth 100 * (categoryIndex + 1) points each.
        // The category's bonus points are added to this sum.
        fullCategoryScores[categoryIndex] =
            (100 * (categoryIndex + 1) * problemsPerCategory[categoryIndex]) + categoryBonusPoints[categoryIndex];
    }

    // Begin the main exhaustive search: iterate through all possible combinations
    // of fully completing problem categories. A bitmask (`selectionMask`) is used
    // to represent these combinations. If the `i`-th bit is set, the `i`-th category
    // is considered fully completed.
    const totalCombinations = Math.pow(2, totalProblemSetCount);
    for (let selectionMask = 0; selectionMask < totalCombinations; selectionMask++) {
        let currentAttemptTotalScore = 0;
        let currentAttemptProblemCount = 0;

        // A boolean array to track which categories are fully completed in the current combination.
        const categoryCompletionStatus = new Array(totalProblemSetCount).fill(false);

        // Calculate the score and problem count for the categories fully completed
        // according to the current `selectionMask`.
        for (let categoryIndex = 0; categoryIndex < totalProblemSetCount; categoryIndex++) {
            // Check if the `categoryIndex`-th bit is set in the `selectionMask`.
            if ((selectionMask >> categoryIndex) & 1) {
                currentAttemptTotalScore += fullCategoryScores[categoryIndex];
                currentAttemptProblemCount += problemsPerCategory[categoryIndex];
                categoryCompletionStatus[categoryIndex] = true; // Mark as fully completed.
            }
        }

        // Optimization: If the target score is already met by fully completed categories,
        // update the minimum problems and move to the next combination. No need for partial problems.
        if (currentAttemptTotalScore >= requiredScoreThreshold) {
            minimumProblemsToSolve = Math.min(minimumProblemsToSolve, currentAttemptProblemCount);
            continue;
        }

        // If the target score is not yet met, attempt to add individual problems
        // from an uncompleted category. Prioritize categories with higher individual problem points.
        // Iterate downwards from the highest-indexed category to find the highest-point uncompleted one.
        let highestPointUncompletedCategoryIndex = -1;
        for (let categoryIndex = totalProblemSetCount - 1; categoryIndex >= 0; categoryIndex--) {
            if (!categoryCompletionStatus[categoryIndex]) {
                highestPointUncompletedCategoryIndex = categoryIndex;
                break; // Found the highest-point category that wasn't fully completed.
            }
        }

        // If such an uncompleted category exists, try solving individual problems from it.
        if (highestPointUncompletedCategoryIndex !== -1) {
            // Determine the points awarded for a single problem from this category.
            const pointsPerSingleProblem = 100 * (highestPointUncompletedCategoryIndex + 1);

            // Add problems one by one from this category until the target score is met
            // or all problems in this category are exhausted.
            for (let problemNumber = 0; problemNumber < problemsPerCategory[highestPointUncompletedCategoryIndex]; problemNumber++) {
                currentAttemptTotalScore += pointsPerSingleProblem;
                currentAttemptProblemCount += 1;

                // If the required score is met, update the minimum problems found so far
                // and break out of this inner loop, as adding more problems is unnecessary for this combination.
                if (currentAttemptTotalScore >= requiredScoreThreshold) {
                    minimumProblemsToSolve = Math.min(minimumProblemsToSolve, currentAttemptProblemCount);
                    break;
                }
            }
        }
        // If, after potentially adding partial problems, the `currentAttemptTotalScore`
        // is still less than `requiredScoreThreshold`, this combination is not a valid solution
        // and `minimumProblemsToSolve` will not be updated for this iteration.
    }

    // Output the final result: the minimum number of problems required.
    console.log(minimumProblemsToSolve);
}

// Standard input reading setup. This part should not be modified.
solveCompetition(require("fs").readFileSync("/dev/stdin", "utf8"));
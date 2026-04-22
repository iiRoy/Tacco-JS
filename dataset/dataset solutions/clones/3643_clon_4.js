function processInputData(rawDataContent) {
    const allLines = rawDataContent.trim().split("\n");
    const firstLineAttributes = allLines[0].split(" ");
    const numProblemCategories = Number(firstLineAttributes[0]);
    const targetGoalScore = Number(firstLineAttributes[1]);

    const problemCategoryDefinitions = [];
    for (let categoryIndex = 0; categoryIndex < numProblemCategories; categoryIndex++) {
        const categoryData = allLines[categoryIndex + 1].split(" ");
        const quantityOfProblems = Number(categoryData[0]);
        const rewardPoints = Number(categoryData[1]);
        const pointsPerSingleUnit = 100 * (categoryIndex + 1);
        const totalPointsIfAllCompleted = (pointsPerSingleUnit * quantityOfProblems) + rewardPoints;
        problemCategoryDefinitions.push({
            unitCount: quantityOfProblems,
            completionBonus: rewardPoints,
            fullCompletionValue: totalPointsIfAllCompleted,
            perUnitValue: pointsPerSingleUnit
        });
    }

    let overallMinimumProblemUnits = Infinity;

    // Recursive function to generate and evaluate all combinations of fully completing categories
    // currentProcessingCategory: The index of the category currently being considered (0 to numProblemCategories - 1)
    // currentCompletedSetsBitmask: A bitmask where the j-th bit is 1 if category j is chosen to be fully completed
    function evaluateCombinations(currentProcessingCategory, currentCompletedSetsBitmask) {
        // Base case: All categories have been decided upon (either fully completed or not)
        if (currentProcessingCategory === numProblemCategories) {
            let runningScoreTotal = 0;
            let runningProblemUnitsCount = 0;
            let firstUnfinishedCategoryIdentifier = -1; // Corresponds to original 'index'

            // Calculate initial score and problem units from fully completed categories
            for (let categoryIdx = 0; categoryIdx < numProblemCategories; categoryIdx++) {
                // Check if the bit for categoryIdx is set in the bitmask
                if ((currentCompletedSetsBitmask >> categoryIdx) & 1) {
                    runningScoreTotal += problemCategoryDefinitions[categoryIdx].fullCompletionValue;
                    runningProblemUnitsCount += problemCategoryDefinitions[categoryIdx].unitCount;
                } else {
                    // If this category is NOT fully completed, and it's the first one we've encountered
                    if (firstUnfinishedCategoryIdentifier === -1) {
                        firstUnfinishedCategoryIdentifier = categoryIdx;
                    }
                }
            }

            // Apply the specific logic for adding individual problems from uncompleted categories
            if (firstUnfinishedCategoryIdentifier !== -1) {
                // The number of individual problems to consider is from the first uncompleted category (original p[index])
                const unitsFromFirstUncompleted = problemCategoryDefinitions[firstUnfinishedCategoryIdentifier].unitCount;
                // The points per individual problem are from the highest-scoring uncompleted category (original 100*(D-index))
                const pointsFromHighestValueUncompleted = problemCategoryDefinitions[numProblemCategories - 1 - firstUnfinishedCategoryIdentifier].perUnitValue;

                for (let unitIterator = 0; unitIterator < unitsFromFirstUncompleted; unitIterator++) {
                    if (runningScoreTotal >= targetGoalScore) {
                        break; // Target score reached, no need to add more units
                    }
                    runningScoreTotal += pointsFromHighestValueUncompleted;
                    runningProblemUnitsCount += 1;
                }
            }

            // After processing, update the global minimum if this combination is better
            if (runningScoreTotal >= targetGoalScore) {
                overallMinimumProblemUnits = Math.min(overallMinimumProblemUnits, runningProblemUnitsCount);
            }
            return;
        }

        // Recursive step: For the current category, explore two paths:
        // Path 1: Do NOT fully complete the 'currentProcessingCategory'
        evaluateCombinations(currentProcessingCategory + 1, currentCompletedSetsBitmask);

        // Path 2: DO fully complete the 'currentProcessingCategory'
        // Set the bit corresponding to 'currentProcessingCategory' in the bitmask
        evaluateCombinations(currentProcessingCategory + 1, currentCompletedSetsBitmask | (1 << currentProcessingCategory));
    }

    // Start the recursive exploration from the first category (index 0) with an empty bitmask (0)
    evaluateCombinations(0, 0);

    console.log(overallMinimumProblemUnits);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
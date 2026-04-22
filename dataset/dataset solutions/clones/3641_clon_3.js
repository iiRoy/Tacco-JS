const parseNumericString = (strValue) => parseInt(strValue, 10);

const mapStringsToNumbers = (stringItems) => stringItems.map(parseNumericString);

function processChallengeData(rawInputBlob) {
    const inputLines = String(rawInputBlob).trim().split('\n');

    if (inputLines.length < 2) {
        console.error("Input processing error: Insufficient data lines provided.");
        return;
    }

    const globalConfigParameters = inputLines[0].split(' ');
    if (globalConfigParameters.length !== 2) {
        console.error("Input processing error: Global configuration line malformed.");
        return;
    }

    const numberOfProblemCategories = parseNumericString(globalConfigParameters[0]);
    const targetScoreThreshold = parseNumericString(globalConfigParameters[1]);

    const problemCategoryDetails = [];

    let currentTotalSolvedProblems = 0;
    let accumulatedScore = 0;

    for (let categoryIndex = 0; categoryIndex < numberOfProblemCategories; categoryIndex++) {
        if (categoryIndex + 1 >= inputLines.length) {
            console.error(`Input processing error: Missing data for problem category ${categoryIndex + 1}.`);
            return;
        }

        const categoryNumericalData = mapStringsToNumbers(inputLines[categoryIndex + 1].split(' '));
        if (categoryNumericalData.length !== 2) {
            console.error(`Input processing error: Problem category line ${categoryIndex + 1} malformed.`);
            return;
        }

        const problemsInThisCategory = categoryNumericalData[0];
        const bonusForThisCategory = categoryNumericalData[1];

        const basePointsPerProblemItem = categoryIndex + 1;

        const calculatedEfficiencyMetric = basePointsPerProblemItem + (bonusForThisCategory / problemsInThisCategory);

        problemCategoryDetails.push({
            categoryIdentifier: categoryIndex,
            numProblems: problemsInThisCategory,
            bonusScore: bonusForThisCategory,
            pointsPerItem: basePointsPerProblemItem,
            sortKey: calculatedEfficiencyMetric,
        });
    }

    problemCategoryDetails.sort((categoryA, categoryB) => categoryB.sortKey - categoryA.sortKey);

    let minimumAdditionalProblemsForGoal = -1;

    while (true) {
        minimumAdditionalProblemsForGoal = -1;

        for (let currentCategoryIteration = 0; currentCategoryIteration < problemCategoryDetails.length; currentCategoryIteration++) {
            const currentCategory = problemCategoryDetails[currentCategoryIteration];

            const scoreFromAllItemsWithoutBonus = currentCategory.numProblems * currentCategory.pointsPerItem;

            if (accumulatedScore + scoreFromAllItemsWithoutBonus >= targetScoreThreshold) {
                const problemsRequiredFromCategory = Math.ceil(
                    (targetScoreThreshold - accumulatedScore) / currentCategory.pointsPerItem
                );

                if (minimumAdditionalProblemsForGoal === -1 || problemsRequiredFromCategory < minimumAdditionalProblemsForGoal) {
                    minimumAdditionalProblemsForGoal = problemsRequiredFromCategory;
                }
            } else if (accumulatedScore + scoreFromAllItemsWithoutBonus + currentCategory.bonusScore >= targetScoreThreshold) {
                const problemsRequiredFromCategory = currentCategory.numProblems;

                if (minimumAdditionalProblemsForGoal === -1 || problemsRequiredFromCategory < minimumAdditionalProblemsForGoal) {
                    minimumAdditionalProblemsForGoal = problemsRequiredFromCategory;
                }
            }
        }

        if (minimumAdditionalProblemsForGoal !== -1) {
            console.log(currentTotalSolvedProblems + minimumAdditionalProblemsForGoal);
            return;
        }

        if (problemCategoryDetails.length === 0) {
            console.error("Logic Error: Target score unreachable or problem set exhausted without solution.");
            return;
        }

        const mostEfficientRemainingCategory = problemCategoryDetails[0];

        currentTotalSolvedProblems += mostEfficientRemainingCategory.numProblems;
        accumulatedScore += (mostEfficientRemainingCategory.numProblems * mostEfficientRemainingCategory.pointsPerItem) + mostEfficientRemainingCategory.bonusScore;

        problemCategoryDetails.shift();
    }
}

try {
    const fileSystemModule = require("fs");
    const programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    processChallengeData(programInputData);
} catch (executionError) {
    console.error("An unhandled error occurred during program execution:", executionError.message);
}
const parseInteger = (strVal) => parseInt(strVal, 10);
const mapToIntegers = (strArr) => strArr.map(parseInteger);

solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));

function solveProblem(rawInputString) {
    const inputLines = rawInputString.split('\n');
    const scoreMultiplier = 100;

    const difficultyAndGoalParts = inputLines[0].split(' ');
    const numCategories = parseInteger(difficultyAndGoalParts[0]);
    const targetScorePoints = parseInteger(difficultyAndGoalParts[1]) / scoreMultiplier;

    var categoryDataList = [];
    var totalSolvedProblems = 0;
    var currentTotalScore = 0;

    for (var categoryIdx = 0; categoryIdx < numCategories; categoryIdx++) {
        var currentLineParts = inputLines[categoryIdx + 1].split(' ');
        var currentCategoryRawData = mapToIntegers(currentLineParts);

        var numProblemsInCat = currentCategoryRawData[0];
        var bonusPointsRaw = currentCategoryRawData[1];

        var bonusPointsAdjusted = bonusPointsRaw / scoreMultiplier;
        var difficultyLevelFactor = categoryIdx + 1;

        var categorySortKey = difficultyLevelFactor + (bonusPointsAdjusted / numProblemsInCat);

        // Store format: [numProblemsInCat, bonusPointsAdjusted, categorySortKey, difficultyLevelFactor]
        categoryDataList[categoryIdx] = [numProblemsInCat, bonusPointsAdjusted, categorySortKey, difficultyLevelFactor];
    }

    categoryDataList.sort(function(dataA, dataB) {
        return dataB[2] - dataA[2];
    });

    while (true) {
        var minAdditionalProblems = Infinity;
        var solutionFoundInIteration = false;

        for (var loopIdx = 0; loopIdx < categoryDataList.length; loopIdx++) {
            var currentCategory = categoryDataList[loopIdx];
            var categoryProblemCount = currentCategory[0];
            var categoryBonusScore = currentCategory[1];
            var categoryDifficultyFactor = currentCategory[3];

            var scoreIfSolvingPartial = currentTotalScore + categoryProblemCount * categoryDifficultyFactor;

            if (scoreIfSolvingPartial >= targetScorePoints) {
                var problemsNeededFromThisCat = Math.ceil((targetScorePoints - currentTotalScore) / categoryDifficultyFactor);
                minAdditionalProblems = Math.min(minAdditionalProblems, problemsNeededFromThisCat);
                solutionFoundInIteration = true;
            } else if (scoreIfSolvingPartial + categoryBonusScore >= targetScorePoints) {
                minAdditionalProblems = Math.min(minAdditionalProblems, categoryProblemCount);
                solutionFoundInIteration = true;
            }
        }

        if (solutionFoundInIteration) {
            console.log(totalSolvedProblems + minAdditionalProblems);
            return 0;
        }

        var highestPriorityCategory = categoryDataList.shift();
        totalSolvedProblems += highestPriorityCategory[0];
        currentTotalScore += highestPriorityCategory[0] * highestPriorityCategory[3] + highestPriorityCategory[1];
    }
}

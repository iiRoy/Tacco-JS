function processProblemData(inputString) {
    const lines = inputString.split("\n");
    const firstLineParts = lines[0].split(" ");
    const problemSetCount = Number(firstLineParts[0]);
    const targetScore = Number(firstLineParts[1]);

    const problemDetails = [];
    for (let i = 0; i < problemSetCount; i++) {
        const problemLineParts = lines[i + 1].split(" ");
        const currentProblemCount = Number(problemLineParts[0]);
        const currentBonusScore = Number(problemLineParts[1]);
        const scorePerUnit = 100 * (i + 1);
        const fullCompletionScore = (scorePerUnit * currentProblemCount) + currentBonusScore;

        problemDetails.push({
            problemCount: currentProblemCount,
            completionBonus: currentBonusScore,
            scorePerUnit: scorePerUnit,
            fullCompletionScore: fullCompletionScore
        });
    }
    return { problemSetCount, targetScore, problemDetails };
}

function solveProblem(input) {
    const { problemSetCount, targetScore, problemDetails } = processProblemData(input);

    let minimumProblems = Infinity;

    function exploreCombinations(currentProblemIndex, currentAccumulatedScore, currentAccumulatedUnits, completedSetFlags) {
        if (currentProblemIndex === problemSetCount) {
            let tempScore = currentAccumulatedScore;
            let tempProblemUnits = currentAccumulatedUnits;

            let lowestIncompleteSetIndex = -1;
            for (let j = 0; j < problemSetCount; j++) {
                if (!((completedSetFlags >> j) & 1)) {
                    lowestIncompleteSetIndex = j;
                    break;
                }
            }

            if (lowestIncompleteSetIndex !== -1) {
                const targetPartialSolveIndex = problemSetCount - 1 - lowestIncompleteSetIndex;
                const targetProblemSet = problemDetails[targetPartialSolveIndex];

                for (let k = 0; k < targetProblemSet.problemCount; k++) {
                    if (tempScore >= targetScore) {
                        break;
                    }
                    tempScore += targetProblemSet.scorePerUnit;
                    tempProblemUnits++;
                }
            }

            if (tempScore >= targetScore) {
                minimumProblems = Math.min(minimumProblems, tempProblemUnits);
            }
            return;
        }

        const currentSet = problemDetails[currentProblemIndex];
        
        exploreCombinations(
            currentProblemIndex + 1,
            currentAccumulatedScore + currentSet.fullCompletionScore,
            currentAccumulatedUnits + currentSet.problemCount,
            completedSetFlags | (1 << currentProblemIndex)
        );

        exploreCombinations(
            currentProblemIndex + 1,
            currentAccumulatedScore,
            currentAccumulatedUnits,
            completedSetFlags
        );
    }

    exploreCombinations(0, 0, 0, 0);

    console.log(minimumProblems);
}

function Main(input) {
    solveProblem(input);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

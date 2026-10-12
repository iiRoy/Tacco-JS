function parseProblemData(rawInputString) {
    const inputLines = rawInputString.trim().split("\n");
    const firstLineValues = inputLines[0].split(' ').map(Number);
    const numProblems = firstLineValues[0];
    const maxVoteBoost = firstLineValues[1];
    const initialVotes = firstLineValues[2];
    const targetRank = firstLineValues[3];

    const problemScores = inputLines[1].split(' ').map(Number);
    problemScores.sort((scoreA, scoreB) => scoreA - scoreB);

    return {
        numProblems,
        maxVoteBoost,
        initialVotes,
        targetRank,
        problemScores
    };
}

function solveProblem(problemData) {
    let { numProblems, maxVoteBoost, initialVotes, targetRank, problemScores } = problemData;

    let remainingVotes = initialVotes;
    let highestPossibleScore = null;
    let currentProblemIndex = 0;

    while (currentProblemIndex < numProblems) {
        const currentProblemScore = problemScores[currentProblemIndex];

        while (currentProblemIndex + 1 < numProblems && problemScores[currentProblemIndex] === problemScores[currentProblemIndex + 1]) {
            currentProblemIndex++;
            remainingVotes--;
        }
        remainingVotes--;

        const potentialMaxScore = currentProblemScore + maxVoteBoost;

        let totalScoreDifference = 0;
        let tempComparisonIndex = currentProblemIndex + 1;

        while (tempComparisonIndex < numProblems && problemScores[tempComparisonIndex] < potentialMaxScore) {
            totalScoreDifference += (potentialMaxScore - problemScores[tempComparisonIndex]);
            tempComparisonIndex++;
        }

        const votesFromLowerProblems = Math.floor(totalScoreDifference / maxVoteBoost);
        let remainingDifference = totalScoreDifference % maxVoteBoost;

        if (remainingVotes <= votesFromLowerProblems) {
            highestPossibleScore = currentProblemScore;
            break;
        }

        const numProblemsToBoost = remainingVotes - votesFromLowerProblems;
        const startIndexForBoosting = numProblems - numProblemsToBoost;

        let boostedProblemScores = [];
        if (startIndexForBoosting < numProblems) {
            boostedProblemScores = problemScores.slice(startIndexForBoosting).map(scoreVal => scoreVal + maxVoteBoost);
        }

        if (remainingDifference > 0) {
            for (let boostedScoreIdx = 0; boostedScoreIdx < boostedProblemScores.length; boostedScoreIdx++) {
                let currentBoostedScore = boostedProblemScores[boostedScoreIdx];
                if (currentBoostedScore - remainingDifference < potentialMaxScore) {
                    remainingDifference -= (currentBoostedScore - potentialMaxScore);
                    boostedProblemScores[boostedScoreIdx] = potentialMaxScore;
                } else {
                    boostedProblemScores[boostedScoreIdx] -= remainingDifference;
                    remainingDifference = 0;
                    break;
                }
            }
            if (remainingDifference > 0 && boostedProblemScores.length > 0) {
                boostedProblemScores[boostedProblemScores.length - 1] -= remainingDifference;
            }
        }

        let canAchieveTargetRank = true;
        for (let rankCheckCounter = 0; rankCheckCounter < targetRank; rankCheckCounter++) {
            let comparisonValue;
            const boostedScoresLength = boostedProblemScores.length;

            if (rankCheckCounter < boostedScoresLength) {
                comparisonValue = boostedProblemScores[boostedScoresLength - 1 - rankCheckCounter];
            } else {
                comparisonValue = problemScores[numProblems - 1 - rankCheckCounter];
            }

            if (potentialMaxScore < comparisonValue) {
                canAchieveTargetRank = false;
                break;
            }
        }

        if (canAchieveTargetRank) {
            highestPossibleScore = currentProblemScore;
            break;
        }

        currentProblemIndex++;
    }

    let eligibleProblemCount;
    if (highestPossibleScore === null) {
        eligibleProblemCount = 0;
    } else {
        let firstOccurrenceIndex = 0;
        for (let idx = 0; idx < numProblems; idx++) {
            if (problemScores[idx] === highestPossibleScore) {
                firstOccurrenceIndex = idx;
                break;
            }
        }
        eligibleProblemCount = numProblems - firstOccurrenceIndex;
    }
    return eligibleProblemCount;
}

function Main(inputRaw) {
    const data = parseProblemData(inputRaw);
    const result = solveProblem(data);
    console.log(result);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));

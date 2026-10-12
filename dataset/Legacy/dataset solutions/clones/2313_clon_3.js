const parseNumericLine = (line) => line.split(' ').map(Number);

const distributeScoreRemainder = (scoresToAdjust, remainderPoints, floorScore) => {
    let currentRemainder = remainderPoints;
    for (let i = 0; i < scoresToAdjust.length; i++) {
        let currentScore = scoresToAdjust[i];
        if (currentScore - currentRemainder < floorScore) {
            let pointsUsed = currentScore - floorScore;
            scoresToAdjust[i] = floorScore;
            currentRemainder -= pointsUsed;
        } else {
            scoresToAdjust[i] -= currentRemainder;
            currentRemainder = 0;
            break;
        }
    }
    if (currentRemainder > 0 && scoresToAdjust.length > 0) {
        scoresToAdjust[scoresToAdjust.length - 1] -= currentRemainder;
    }
    return scoresToAdjust;
};

function Main(rawData) {
    const configLine = parseNumericLine(rawData[0]);
    const numProblems = configLine[0];
    const maxVotePoints = configLine[1];
    let currentRemainingVotes = configLine[2];
    const targetRank = configLine[3];

    const problemScores = parseNumericLine(rawData[1]).sort((a, b) => a - b);

    let minAchievableScore = null;
    let currentProblemIndex = 0;

    for (currentProblemIndex = 0; currentProblemIndex < numProblems; currentProblemIndex++) {
        while (currentProblemIndex + 1 < numProblems && problemScores[currentProblemIndex] === problemScores[currentProblemIndex + 1]) {
            currentProblemIndex++;
            currentRemainingVotes--;
        }
        currentRemainingVotes--;

        const currentProblemScore = problemScores[currentProblemIndex];
        const maxPossibleScore = currentProblemScore + maxVotePoints;

        let scoreDifferenceAccumulator = 0;
        for (let checkIdx = currentProblemIndex + 1; checkIdx < numProblems; checkIdx++) {
            if (problemScores[checkIdx] < maxPossibleScore) {
                scoreDifferenceAccumulator += maxPossibleScore - problemScores[checkIdx];
            } else {
                break;
            }
        }

        const votesFromHigherScores = Math.floor(scoreDifferenceAccumulator / maxVotePoints);
        let remainingScoreToDistribute = scoreDifferenceAccumulator % maxVotePoints;

        if (currentRemainingVotes <= votesFromHigherScores) {
            minAchievableScore = currentProblemScore;
            break;
        }

        const votesNeededForTop = currentRemainingVotes - votesFromHigherScores;

        if (votesNeededForTop <= 0) {
             minAchievableScore = currentProblemScore;
             break;
        }

        const topScoresToConsider = problemScores.slice(numProblems - votesNeededForTop);
        let simulatedScores = topScoresToConsider.map(score => score + maxVotePoints);

        if (remainingScoreToDistribute > 0) {
            simulatedScores = distributeScoreRemainder(simulatedScores, remainingScoreToDistribute, maxPossibleScore);
        }

        let isRankAchieved = false;
        for (let rankIdx = 0; rankIdx < targetRank; rankIdx++) {
            let comparisonScore;
            if (rankIdx < simulatedScores.length) {
                comparisonScore = simulatedScores[simulatedScores.length - 1 - rankIdx];
            } else {
                comparisonScore = problemScores[numProblems - 1 - rankIdx];
            }

            if (maxPossibleScore >= comparisonScore) {
                isRankAchieved = true;
                break;
            }
        }

        if (isRankAchieved) {
            minAchievableScore = currentProblemScore;
            break;
        }
    }

    let finalCountIndex = currentProblemIndex;
    while (finalCountIndex > 0 && problemScores[finalCountIndex] === problemScores[finalCountIndex - 1]) {
        finalCountIndex--;
    }

    const finalAnswerCount = numProblems - finalCountIndex;

    console.log(finalAnswerCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

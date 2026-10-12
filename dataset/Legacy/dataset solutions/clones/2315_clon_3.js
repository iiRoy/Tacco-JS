const parseInputData = (inputLines) => {
    const firstLineParts = inputLines[0].split(' ').map(Number);
    const secondLineParts = inputLines[1].split(' ').map(Number);
    return {
        numProblems: firstLineParts[0],
        maxVoteValue: firstLineParts[1],
        initialVoteCount: firstLineParts[2],
        topRankThreshold: firstLineParts[3],
        problemScores: secondLineParts
    };
};

/**
 * @param {string[]} inputLines
 */
function Main(inputLines) {
    const {
        numProblems: totalProblems,
        maxVoteValue: voteCap,
        initialVoteCount: startingVotes,
        topRankThreshold: rankLimit,
        problemScores: rawScores
    } = parseInputData(inputLines);

    /** @type {number[]} */
    const sortedProblemScores = [...rawScores].sort((scoreA, scoreB) => scoreA - scoreB);

    let currentVotePool = startingVotes;
    let potentialCandidateScore = null;

    for (let currentProblemIdx = 0; currentProblemIdx < sortedProblemScores.length; currentProblemIdx++) {
        let scoreOfCurrentProblem = sortedProblemScores[currentProblemIdx];
        let maxAchievableScoreForCurrent = scoreOfCurrentProblem + voteCap;

        let duplicateCount = 0;
        while (currentProblemIdx + 1 < sortedProblemScores.length && sortedProblemScores[currentProblemIdx] === sortedProblemScores[currentProblemIdx + 1]) {
            currentProblemIdx++;
            duplicateCount++;
        }
        currentVotePool -= (duplicateCount + 1);

        let votesRequiredForIntermediate = 0;
        let higherScoreIterator = currentProblemIdx + 1;

        while (higherScoreIterator < sortedProblemScores.length && sortedProblemScores[higherScoreIterator] < maxAchievableScoreForCurrent) {
            votesRequiredForIntermediate += (maxAchievableScoreForCurrent - sortedProblemScores[higherScoreIterator]);
            higherScoreIterator++;
        }

        let votesConsumedByIntermediate = Math.floor(votesRequiredForIntermediate / voteCap);
        let remainderFromIntermediate = votesRequiredForIntermediate % voteCap;

        if (currentVotePool <= votesConsumedByIntermediate) {
            potentialCandidateScore = scoreOfCurrentProblem;
            break;
        }

        const problemsToReceiveFullVotes = currentVotePool - votesConsumedByIntermediate;

        /** @type {number[]} */
        let scoresModifiedByRemaining = [];
        if (problemsToReceiveFullVotes > 0) {
            scoresModifiedByRemaining = sortedProblemScores.slice(-problemsToReceiveFullVotes).map((s) => s + voteCap);
        }

        if (remainderFromIntermediate > 0) {
            for (let modifiedIdx = 0; modifiedIdx < scoresModifiedByRemaining.length; modifiedIdx++) {
                let currentModifiedScore = scoresModifiedByRemaining[modifiedIdx];
                if (currentModifiedScore - remainderFromIntermediate < maxAchievableScoreForCurrent) {
                    remainderFromIntermediate -= (currentModifiedScore - maxAchievableScoreForCurrent);
                    scoresModifiedByRemaining[modifiedIdx] = maxAchievableScoreForCurrent;
                } else {
                    scoresModifiedByRemaining[modifiedIdx] -= remainderFromIntermediate;
                    remainderFromIntermediate = 0;
                    break;
                }
            }
            if (remainderFromIntermediate > 0 && scoresModifiedByRemaining.length > 0) {
                scoresModifiedByRemaining[scoresModifiedByRemaining.length - 1] -= remainderFromIntermediate;
            }
        }

        let isThisProblemViable = false;
        for (let rankCheckCounter = 0; rankCheckCounter < rankLimit; rankCheckCounter++) {
            let scoreForComparison;
            if (rankCheckCounter < scoresModifiedByRemaining.length) {
                scoreForComparison = scoresModifiedByRemaining[scoresModifiedByRemaining.length - 1 - rankCheckCounter];
            } else {
                const originalScorePosition = sortedProblemScores.length - 1 - rankCheckCounter;
                if (originalScorePosition >= 0) {
                    scoreForComparison = sortedProblemScores[originalScorePosition];
                } else {
                    scoreForComparison = -Infinity;
                }
            }

            if (maxAchievableScoreForCurrent >= scoreForComparison) {
                isThisProblemViable = true;
                break;
            }
        }

        if (isThisProblemViable) {
            potentialCandidateScore = scoreOfCurrentProblem;
            break;
        }
    }

    let finalCandidateStartingIndex = sortedProblemScores.length;
    if (potentialCandidateScore !== null) {
        let tempSearchIndex = currentProblemIdx;
        while (tempSearchIndex > 0 && sortedProblemScores[tempSearchIndex] === sortedProblemScores[tempSearchIndex - 1]) {
            tempSearchIndex--;
        }
        finalCandidateStartingIndex = tempSearchIndex;
    }

    const finalResultCount = sortedProblemScores.length - finalCandidateStartingIndex;
    console.log(finalResultCount);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));

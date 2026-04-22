function processContestData(contestInfo) {
    const firstLineNumbers = contestInfo[0].split(' ').map(Number);
    const problemCount = firstLineNumbers[0];
    const votesPerPerson = firstLineNumbers[1];
    const totalVoters = firstLineNumbers[2];
    const rankThreshold = firstLineNumbers[3];

    const sortedScores = contestInfo[1].split(' ').map(Number).sort((s1, s2) => s1 - s2);

    const checkRankFeasibility = (candidateIndex) => {
        const currentProblemScore = sortedScores[candidateIndex];
        const maxAchievableScore = currentProblemScore + votesPerPerson;

        const problemsStrictlyBetter = sortedScores.filter(score => score > maxAchievableScore).length;
        if (problemsStrictlyBetter >= rankThreshold) {
            return false;
        }

        const problemsToBoostIntermediate = sortedScores.slice(candidateIndex + 1)
            .filter(score => score < maxAchievableScore);

        const totalVotesToEqualize = problemsToBoostIntermediate
            .reduce((sum, score) => sum + (maxAchievableScore - score), 0);

        let availableVoters = totalVoters - 1; 
        const votersForEqualization = Math.ceil(totalVotesToEqualize / votesPerPerson);

        availableVoters -= votersForEqualization;

        if (availableVoters < 0) {
            return false;
        }
        
        if (candidateIndex >= problemCount - rankThreshold) {
             return true;
        }

        const effectivePthIndex = Math.max(0, problemCount - rankThreshold - availableVoters);
        return maxAchievableScore >= sortedScores[effectivePthIndex];
    };

    let lowIdx = 0;
    let highIdx = problemCount - 1;
    let resultIdx = problemCount - 1;

    while (lowIdx <= highIdx) {
        const middleIdx = Math.floor((lowIdx + highIdx) / 2);
        if (checkRankFeasibility(middleIdx)) {
            resultIdx = middleIdx;
            highIdx = middleIdx - 1;
        } else {
            lowIdx = middleIdx + 1;
        }
    }

    console.log(problemCount - resultIdx);
}

processContestData(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
function processContestResults(contestData) {
    const lines = contestData.split('\n');
    const [participantCount, initialPoints, correctAnswersCount] = lines[0].split(' ').map(Number);

    const baseScore = initialPoints - correctAnswersCount;

    const participantScores = new Map();
    for (let pId = 1; pId <= participantCount; pId++) {
        participantScores.set(pId, baseScore);
    }

    const correctAnswerIDs = lines.slice(1).map(Number);

    correctAnswerIDs.reduce((scoreMap, currentID) => {
        scoreMap.set(currentID, scoreMap.get(currentID) + 1);
        return scoreMap;
    }, participantScores);

    const finalOutputLines = Array.from({ length: participantCount }, (_, index) => {
        const currentParticipantID = index + 1;
        const score = participantScores.get(currentParticipantID);
        return score >= 1 ? "Yes" : "No";
    });

    console.log(finalOutputLines.join('\n'));
}

processContestResults(require("fs").readFileSync("/dev/stdin", "utf8").trim());

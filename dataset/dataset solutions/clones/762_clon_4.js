const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const allLines = rawData.trim().split("\n");

let problemSetPointer = 0;

while (true) {
    const currentProblemSizeStr = allLines[problemSetPointer++];
    const currentProblemSize = Number(currentProblemSizeStr);

    if (currentProblemSize === 0) {
        break;
    }

    const voteSequenceStr = allLines[problemSetPointer++];
    const voteIdentifiers = voteSequenceStr.split(" ");

    const voteCounts = new Map();
    let decisionReached = false;

    for (let voteIndex = 0; voteIndex < voteIdentifiers.length; ++voteIndex) {
        const currentIdentifier = voteIdentifiers[voteIndex];
        voteCounts.set(currentIdentifier, (voteCounts.get(currentIdentifier) || 0) + 1);

        let topScoreValue = 0;
        let topScorerIdentifier = null;
        let secondScoreValue = 0;
        let secondScorerIdentifier = null;

        for (const [candidateId, score] of voteCounts.entries()) {
            if (score > topScoreValue) {
                secondScoreValue = topScoreValue;
                secondScorerIdentifier = topScorerIdentifier;
                topScoreValue = score;
                topScorerIdentifier = candidateId;
            } else if (score > secondScoreValue) {
                secondScoreValue = score;
                secondScorerIdentifier = candidateId;
            }
        }

        const remainingBallots = voteIdentifiers.length - (voteIndex + 1);

        if (topScoreValue > secondScoreValue + remainingBallots) {
            console.log(topScorerIdentifier, voteIndex + 1);
            decisionReached = true;
            break;
        }
    }

    if (!decisionReached) {
        console.log("TIE");
    }
}

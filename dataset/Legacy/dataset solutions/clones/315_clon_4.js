const { readFileSync: obtainFileContent } = require('node:fs');

const fullInputText = obtainFileContent('/dev/stdin', 'utf8');

const allInputLines = fullInputText.trim().split('\n');

const [playerCountString, queryCountString] = allInputLines[0].split(' ');
const totalParticipantCount = parseInt(playerCountString, 10);
// const totalOperationCount = parseInt(queryCountString, 10); // Not directly used after parsing

const participantScores = Array.from({ length: totalParticipantCount }, () => 0);

let currentTopScore = 0;
let currentTopParticipantId = 0; // 0-indexed

const determineCurrentTopPerformer = (scoreCollection) => {
    let highestScoreFound = -Infinity;
    let highestIdFound = -1;

    for (let i = 0; i < scoreCollection.length; ++i) {
        const individualScore = scoreCollection[i];
        if (individualScore > highestScoreFound) {
            highestScoreFound = individualScore;
            highestIdFound = i;
        }
    }
    return { score: highestScoreFound, id: highestIdFound };
};

// Iterate through query lines, skipping the first line (N Q)
for (const operationLine of allInputLines.slice(1)) {
    const [participantIdString, scoreChangeString] = operationLine.split(' ');
    const affectedParticipantIndex = parseInt(participantIdString, 10) - 1; // Convert to 0-indexed
    const scoreAdjustment = parseInt(scoreChangeString, 10);

    participantScores[affectedParticipantIndex] += scoreAdjustment;

    // Logic to update the top performer, strictly following original behavior
    if (affectedParticipantIndex === currentTopParticipantId) {
        if (scoreAdjustment >= 0) {
            // If the current leader's score increases or stays the same, update their score directly
            currentTopScore += scoreAdjustment;
        } else {
            // If the current leader's score decreases, re-scan all participants to find the new leader
            const { score: newHighestScore, id: newHighestId } = determineCurrentTopPerformer(participantScores);
            currentTopScore = newHighestScore;
            currentTopParticipantId = newHighestId;
        }
    }
    // Crucially, if affectedParticipantIndex !== currentTopParticipantId,
    // currentTopParticipantId and currentTopScore are NOT updated.
    // This preserves the original code's specific behavior where the leader
    // only changes if the *current* leader's score drops.

    console.log(`${currentTopParticipantId + 1} ${currentTopScore}`);
}

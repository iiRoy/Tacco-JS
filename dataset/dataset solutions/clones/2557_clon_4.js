"use strict";

const rawInputDataSource = require('fs').readFileSync('/dev/stdin', 'UTF-8');
const processedInputLines = rawInputDataSource.trim().split('\n');

const [totalParticipants, initialScoreValue, totalQuestionsAsked] = processedInputLines[0].split(' ').map(Number);

const correctResponseCounts = processedInputLines.slice(1).reduce((scoreAccumulator, participantIdentifier) => {
    const participantIndex = parseInt(participantIdentifier, 10);
    scoreAccumulator[participantIndex] = (scoreAccumulator[participantIndex] || 0) + 1;
    return scoreAccumulator;
}, {});

const finalDecisionList = [];

for (let participantId = 1; participantId <= totalParticipants; ++participantId) {
    const individualCorrectResponses = correctResponseCounts[participantId] || 0;
    
    const calculatedFinalStanding = initialScoreValue - totalQuestionsAsked + individualCorrectResponses;
    
    if (calculatedFinalStanding > 0) {
        finalDecisionList.push('Yes');
    } else {
        finalDecisionList.push('No');
    }
}

console.log(finalDecisionList.join('\n'));
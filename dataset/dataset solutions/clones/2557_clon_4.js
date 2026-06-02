"use strict";

const inputDataLines = require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split('\n');

const [participantTotal, initialScore, questionTotal] = inputDataLines[0].split(' ').map(Number);

const correctAnswererIndices = inputDataLines.slice(1).map(Number);

const correctResponseCounts = new Map();

for (const participantIdentifier of correctAnswererIndices) {
    correctResponseCounts.set(participantIdentifier, (correctResponseCounts.get(participantIdentifier) || 0) + 1);
}

for (let participantIndex = 1; participantIndex <= participantTotal; participantIndex++) {
    const finalParticipantScore = initialScore - questionTotal + (correctResponseCounts.get(participantIndex) || 0);
    if (finalParticipantScore > 0) {
        console.log('Yes');
    } else {
        console.log('No');
    }
}

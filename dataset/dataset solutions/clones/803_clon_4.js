const { readFileSync: acquireFileContents } = require('fs');

const fullContent = acquireFileContents(0, 'utf8');
const processedLines = fullContent.trim().split('\n');

const storedChallenges = [];
let currentLineIndex = 0;

while (true) {
    const currentHeader = processedLines[currentLineIndex++];
    if (currentHeader === '0 0 0') {
        break;
    }

    const [participantCount, relevantParticipantOffset, penaltyPercentage] = currentHeader.split(' ').map(Number);

    const participantScores = [];
    for (let k = 0; k < participantCount; k++) {
        participantScores.push(Number(processedLines[currentLineIndex++]));
    }

    storedChallenges.push({
        groupTotal: participantCount,
        focusedPosition: relevantParticipantOffset - 1, // Adjust to zero-based index
        deductionFactor: penaltyPercentage,
        individualPointValues: participantScores
    });
}

function calculateFinalStanding(spotIndex, deductionValue, pointArray) {
    if (pointArray[spotIndex] === 0) {
        return 0;
    }

    let overallPoints = 0;
    for (const individualPoint of pointArray) {
        overallPoints += individualPoint;
    }

    const adjustedValue = overallPoints * (100 - deductionValue);
    
    return Math.floor(adjustedValue / pointArray[spotIndex]);
}

for (const taskItem of storedChallenges) {
    const finalResult = calculateFinalStanding(
        taskItem.focusedPosition,
        taskItem.deductionFactor,
        taskItem.individualPointValues
    );
    console.log(finalResult);
}
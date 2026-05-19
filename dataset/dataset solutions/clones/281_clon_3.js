const rawData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = rawData.split('\n');

function parseGameParameters(lineString) {
    const parts = lineString.split(' ');
    const firstNum = Number(parts[0]);
    const secondNum = Number(parts[1]);

    const terminationValue = 0;
    const shouldStopProcessing = (firstNum + secondNum === terminationValue);

    return {
        participantCount: firstNum,
        eliminationStep: secondNum,
        terminateProcessing: shouldStopProcessing
    };
}

function findLastSurvivor(numParticipants, stepCount) {
    const currentParticipants = Array.from({ length: numParticipants }, (_, index) => index + 1);

    while (currentParticipants.length > 1) {
        const elementsToRotate = stepCount - 1;
        for (let rotationIndex = 0; rotationIndex < elementsToRotate; rotationIndex++) {
            const firstParticipant = currentParticipants.shift();
            currentParticipants.push(firstParticipant);
        }
        currentParticipants.shift();
    }
    return currentParticipants[0];
}

let currentLineString;
while ((currentLineString = inputLines.shift()) !== undefined) {
    const gameParams = parseGameParameters(currentLineString);

    if (gameParams.terminateProcessing) {
        break;
    }

    const survivor = findLastSurvivor(gameParams.participantCount, gameParams.eliminationStep);
    console.log(survivor);
}

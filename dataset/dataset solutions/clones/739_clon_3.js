const fileSystemModule = require('fs');

const parseIntegerList = (rawString) => {
    return rawString.trim().split(' ').map(Number).filter(val => !isNaN(val));
};

const determineJosephusSurvivor = (totalParticipants, skipCount, initialEliminationIndex) => {
    if (totalParticipants <= 0 || skipCount < 0 || initialEliminationIndex <= 0 || initialEliminationIndex > totalParticipants) {
        return -1;
    }

    const participantStatus = new Array(totalParticipants).fill(true);
    let activeParticipantCount = totalParticipants;
    let currentEliminationPointer = initialEliminationIndex - 1;

    participantStatus[currentEliminationPointer] = false;
    activeParticipantCount--;

    while (activeParticipantCount > 1) {
        let actualSkipsMade = 0;
        let safeguardCounter = 0;

        while (actualSkipsMade < skipCount) {
            safeguardCounter++;
            if (safeguardCounter > totalParticipants * 2) {
                return -1;
            }

            currentEliminationPointer = (currentEliminationPointer + 1) % totalParticipants;

            if (participantStatus[currentEliminationPointer]) {
                actualSkipsMade++;
            }
        }

        participantStatus[currentEliminationPointer] = false;
        activeParticipantCount--;
    }

    for (let currentIdx = 0; currentIdx < totalParticipants; currentIdx++) {
        if (participantStatus[currentIdx]) {
            return currentIdx + 1;
        }
    }

    return -1;
};

const rawInputBuffer = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const inputLineCollection = rawInputBuffer.trim().split('\n').filter(line => line.length > 0);

let currentLineNumber = 0;
while (currentLineNumber < inputLineCollection.length) {
    const currentTestCaseLine = inputLineCollection[currentLineNumber];
    const parsedValues = parseIntegerList(currentTestCaseLine);

    if (parsedValues.length !== 3) {
        currentLineNumber++;
        continue;
    }

    const [totalParticipants, skipCount, initialEliminationIndex] = parsedValues;

    if (totalParticipants === 0 && skipCount === 0 && initialEliminationIndex === 0) {
        break;
    }

    const finalSurvivorResult = determineJosephusSurvivor(totalParticipants, skipCount, initialEliminationIndex);

    if (finalSurvivorResult !== -1) {
        console.log(finalSurvivorResult);
    }

    currentLineNumber++;
}